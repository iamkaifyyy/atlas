import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { MatchingEngine } from './orderbook/matchingEngine.js';
import { PriceFeedService, type PriceTick } from './priceFeed.js';
import { ContractClient } from './contractClient.js';
import { RuleEngine } from './ruleEngine.js';
import { EventListenerService } from './eventListener.js';
import { backpackClient } from './backpackClient.js';
import type { AgentConfig } from '../../shared/types/agentConfig.js';

dotenv.config({ path: '../.env' });
dotenv.config();

const PORT = Number(process.env.AGENT_RUNNER_PORT || 3001);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const defaultConfig: AgentConfig = {
  id: 'eth-momentum-guard-1',
  name: 'ETH Momentum Guard',
  assetPair: 'ETH/USDC',
  trigger: {
    asset: 'ETH/USDC',
    type: 'PRICE_BELOW',
    targetPrice: 3050.0
  },
  spendingCap: {
    maxTotalSpend: 5.0,
    maxPerTradeSpend: 1.5,
    currentTotalSpend: 0
  },
  approvalThreshold: {
    thresholdAmount: 0.5
  },
  action: 'BUY',
  tradeAmount: 0.4,
  active: true,
  vaultAddress: process.env.VAULT_ADDRESS || ''
};

// 1. Initialize TypeScript Order Book Matching Engine
const matchingEngine = new MatchingEngine('ETH/USDC', 3045.0);

// 2. Initialize Core Services
const priceFeed = new PriceFeedService(matchingEngine);
const contractClient = new ContractClient(defaultConfig.vaultAddress);
const ruleEngine = new RuleEngine(defaultConfig, contractClient, matchingEngine);
const eventListener = new EventListenerService(contractClient);

eventListener.attachWebSocketServer(wss);

// 3. Connect matching engine events to WebSocket broadcast
matchingEngine.on('depth', (depth) => {
  eventListener.broadcast('ORDERBOOK_UPDATE', depth);
});

matchingEngine.on('trades', (fills) => {
  eventListener.broadcast('TRADE_FILLS', fills);
});

priceFeed.on('price', async (tick: PriceTick) => {
  eventListener.broadcast('PRICE_TICK', tick);

  const result = await ruleEngine.evaluate(tick);
  if (result.triggered) {
    eventListener.broadcast('RULE_TRIGGERED', result);
  }
});

// --- REST API Endpoints ---

// Status & Health
app.get('/api/status', async (_req, res) => {
  const vaultState = await contractClient.getVaultState();
  res.json({
    status: 'online',
    currentPrice: priceFeed.getCurrentPrice(),
    config: ruleEngine.getConfig(),
    vault: vaultState,
    vaultAddress: contractClient.vaultAddress
  });
});

// Update Rule Configuration
app.post('/api/config', (req, res) => {
  try {
    const updated = ruleEngine.updateConfig(req.body);
    eventListener.startContractWatcher();
    eventListener.broadcast('CONFIG_UPDATED', updated);
    res.json({ success: true, config: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Price Nudge & Reset
app.post('/api/price/nudge', (req, res) => {
  const delta = Number(req.body.delta) || -20;
  priceFeed.nudgePrice(delta);
  res.json({ success: true, currentPrice: priceFeed.getCurrentPrice() });
});

app.post('/api/price/set', (req, res) => {
  const price = Number(req.body.price);
  if (!price || isNaN(price)) {
    return res.status(400).json({ error: 'Valid price required' });
  }
  priceFeed.setPrice(price);
  res.json({ success: true, currentPrice: priceFeed.getCurrentPrice() });
});

app.post('/api/price/reset', (_req, res) => {
  priceFeed.resetToLive();
  res.json({ success: true, mode: 'orderbook' });
});

// Recent Contract Events
app.get('/api/events', (_req, res) => {
  res.json({ events: eventListener.getRecentEvents() });
});

// --- Backpack Exchange Endpoints ---
app.get('/api/backpack/ticker', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'ETH_USDC';
    const ticker = await backpackClient.getTicker(symbol);
    res.json(ticker);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/backpack/depth', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'ETH_USDC';
    const depth = await backpackClient.getDepth(symbol);
    res.json(depth);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/backpack/klines', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'ETH_USDC';
    const interval = (req.query.interval as string) || '1h';
    const startTime = req.query.startTime ? Number(req.query.startTime) : undefined;
    const endTime = req.query.endTime ? Number(req.query.endTime) : undefined;
    const klines = await backpackClient.getKlines(symbol, interval, startTime, endTime);
    res.json(klines);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get('/api/backpack/trades', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'ETH_USDC';
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const trades = await backpackClient.getTrades(symbol, limit);
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/backpack/sync', async (_req, res) => {
  try {
    const price = await priceFeed.syncWithBackpack();
    res.json({ success: true, price });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- Order Book Endpoints ---

// Get Order Book Depth
app.get('/api/orderbook', (_req, res) => {
  const depth = matchingEngine.getDepth(10);
  res.json(depth);
});

// Place Limit or Market Order directly into the engine
app.post('/api/orderbook/order', (req, res) => {
  try {
    const { side, type, price, quantity, userId } = req.body;
    const result = matchingEngine.createOrder({
      userId: userId || 'web-user',
      side,
      type: type || 'LIMIT',
      price: price ? Number(price) : undefined,
      quantity: Number(quantity)
    });
    res.json({
      success: true,
      order: result.order,
      fills: result.fills,
      depth: matchingEngine.getDepth(10)
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Cancel Order
app.post('/api/orderbook/cancel', (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: 'orderId required' });
  }
  const cancelled = matchingEngine.cancelOrder(orderId);
  res.json({ success: cancelled });
});

// On-Chain Trade Approval (Human in the Loop)
app.post('/api/trade/approve', async (req, res) => {
  try {
    const { tradeId } = req.body;
    if (!tradeId) {
      return res.status(400).json({ error: 'tradeId required' });
    }
    const result = await contractClient.approveTrade(tradeId);
    res.json({ success: true, txHash: result.hash });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Emergency Kill Switch
app.post('/api/kill-switch', async (_req, res) => {
  try {
    const result = await contractClient.killSwitch();
    res.json({ success: true, txHash: result.hash });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Simulate on-chain trade trigger
app.post('/api/simulate-trade', (req, res) => {
  const { amount, price, status, reason } = req.body;
  const simulated = {
    tradeId: `SIM-${Date.now().toString().slice(-4)}`,
    timestamp: Date.now(),
    status: status || 'EXECUTED',
    asset: 'ETH/USDC',
    action: (req.body.action || 'BUY') as 'BUY' | 'SELL',
    amount: Number(amount) || 0.4,
    price: Number(price) || priceFeed.getCurrentPrice(),
    txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    reason
  };
  eventListener.pushEvent(simulated);
  res.json({ success: true, event: simulated });
});

server.listen(PORT, () => {
  console.log(`Agent runner + Matching Engine listening on port ${PORT} (ws enabled)`);
  priceFeed.start(3000);
  eventListener.startContractWatcher();
});
