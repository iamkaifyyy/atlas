'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  Zap,
  Layers,
  SlidersHorizontal,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Copy,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import { useContractEvents } from '../hooks/useContractEvents';
import { useOrderBook } from '../hooks/useOrderBook';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';
import { OrderBookTable } from './OrderBook/OrderBookTable';
import { ApprovalModal } from './ApprovalModal';
import { KillSwitchButton } from './KillSwitchButton';

const PriceChart = dynamic(
  () => import('./Chart/PriceChart').then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 h-[370px] flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
        <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Initializing High-Frequency Price Feed...</span>
      </div>
    )
  }
);

const TradingViewChart = dynamic(
  () => import('./Chart/TradingViewChart').then((mod) => mod.TradingViewChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 h-[460px] flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
        <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Loading TradingView Pro Chart...</span>
      </div>
    )
  }
);

const BackpackChart = dynamic(
  () => import('./Chart/BackpackChart').then((mod) => mod.BackpackChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 h-[480px] flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
        <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Loading Backpack Exchange Candlestick Feed...</span>
      </div>
    )
  }
);

const TradingViewStyleUI = dynamic(
  () => import('./Chart/TradingViewStyleUI'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 h-[520px] flex flex-col items-center justify-center gap-2 text-xs text-zinc-500 font-mono">
        <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Loading Backpack Pro Candlestick Studio...</span>
      </div>
    )
  }
);

export const TradingTerminal: React.FC = () => {
  const {
    events,
    pendingTrades,
    currentPrice,
    priceSource,
    isConnected: isWsConnected,
    agentConfig,
    approveTrade,
    rejectTrade,
    triggerKillSwitch,
    nudgePrice,
    simulateTrade
  } = useContractEvents();

  const orderBook = useOrderBook();
  const wallet = useWallet();
  const backpack = useBackpackTicker('ETH_USDC');
  const [isKilled, setIsKilled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXECUTED' | 'APPROVAL' | 'REJECTED'>('ALL');
  const [copiedVault, setCopiedVault] = useState(false);
  const [chartType, setChartType] = useState<'STUDIO' | 'BACKPACK' | 'TRADINGVIEW' | 'AGENT_VAULT'>('STUDIO');
  const [tvSymbol, setTvSymbol] = useState<string>('COINBASE:ETHUSD');

  const displayPrice = backpack.isLoading ? currentPrice : backpack.lastPrice;
  const isPricePositive = backpack.priceChangePercent >= 0;

  const vaultAddress = agentConfig?.vaultAddress || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

  const handleKill = async () => {
    const ok = await triggerKillSwitch();
    if (ok) setIsKilled(true);
    return ok;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVault(true);
    setTimeout(() => setCopiedVault(false), 1500);
  };

  const executedTrades = events.filter((e) => e.status === 'EXECUTED' || e.status === 'APPROVED');
  const totalVolumeEth = executedTrades.reduce((acc, curr) => acc + curr.amount, 0);
  const totalVolumeUsdc = executedTrades.reduce((acc, curr) => acc + curr.amount * curr.price, 0);

  const maxTotalCap = agentConfig?.spendingCap?.maxTotalSpend || 5.0;
  const currentTotalSpend = Math.min(totalVolumeEth, maxTotalCap);
  const capPercentage = Math.min(100, Math.round((currentTotalSpend / maxTotalCap) * 100));

  const filteredEvents = events.filter((e) => {
    if (activeFilter === 'EXECUTED') return e.status === 'EXECUTED' || e.status === 'APPROVED';
    if (activeFilter === 'APPROVAL') return e.status === 'PENDING_APPROVAL';
    if (activeFilter === 'REJECTED') return e.status === 'REJECTED' || e.status === 'KILLED';
    return true;
  });

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto font-sans">
      {/* Top Pro Market Ticker Bar */}
      <div className="cohere-card-console p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair Badge */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-console-border">
            <div className="w-8 h-8 rounded-lg bg-console-elevated border border-console-border flex items-center justify-center text-white font-bold text-xs font-mono">
              ETH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm tracking-tight">ETH / USDC</span>
                <span className="cohere-chip-coral !py-0.5 !px-2 !text-[10px]">
                  BACKPACK LIVE
                </span>
              </div>
              <div className="text-[11px] text-muted font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>api.backpack.exchange</span>
              </div>
            </div>
          </div>

          {/* Mark Price */}
          <div className="pr-4 border-r border-console-border">
            <div className="text-[10px] text-muted font-mono uppercase tracking-[0.28px]">Mark Price (USDC)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-white tracking-tight">
                ${displayPrice.toFixed(2)}
              </span>
              <span
                className={`inline-flex items-center text-xs font-mono font-semibold ${
                  isPricePositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPricePositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {isPricePositive ? '+' : ''}
                {backpack.priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h Stats */}
          <div className="hidden md:flex items-center gap-6 pr-4 border-r border-console-border text-xs font-mono">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H High</div>
              <div className="text-white font-medium">${backpack.high24h.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H Low</div>
              <div className="text-white font-medium">${backpack.low24h.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H Volume</div>
              <div className="text-white font-medium">
                {backpack.volume24h.toFixed(1)} ETH (${(backpack.quoteVolume24h / 1000000).toFixed(2)}M)
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H Trades</div>
              <div className="text-white font-medium">{backpack.trades.toLocaleString()}</div>
            </div>
          </div>

          {/* Vault Contract Address */}
          <div className="hidden xl:flex items-center gap-2 bg-console-elevated px-3 py-1.5 rounded-lg border border-console-border text-xs font-mono">
            <Shield className="w-3.5 h-3.5 text-muted" />
            <span className="text-muted text-[11px]">Vault:</span>
            <span className="text-white text-[11px]">
              {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(vaultAddress)}
              className="text-muted hover:text-white transition ml-1"
              title="Copy Vault Address"
            >
              {copiedVault ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/automation"
            className="cohere-btn-outline !py-1.5 !px-3 text-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
            <span>Configure Strategy</span>
          </Link>
          <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
        </div>
      </div>

      {/* Autonomous Agent Policy & Escrow Caps Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 1: Agent Rule */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Active Strategy
            </span>
            <span className="cohere-chip-coral !py-0.5 !px-2 !text-[9px]">
              GUARDED
            </span>
          </div>
          <div className="font-semibold text-white text-sm">
            {agentConfig?.name || 'ETH Momentum Guard'}
          </div>
          <div className="text-xs text-muted font-mono">
            Trigger: {agentConfig?.trigger?.type === 'PRICE_BELOW' ? '<' : '>'} ${agentConfig?.trigger?.targetPrice || 3050} USDC
          </div>
        </div>

        {/* Card 2: Cumulative Spend Cap */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="text-white font-medium">Escrow Total Cap</span>
            <span className="font-mono text-emerald-400 text-xs font-semibold">
              {currentTotalSpend.toFixed(2)} / {maxTotalCap.toFixed(1)} ETH
            </span>
          </div>
          <div className="w-full bg-console-elevated rounded-full h-2 overflow-hidden border border-console-border">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                capPercentage > 90 ? 'bg-rose-500' : capPercentage > 75 ? 'bg-amber-500' : 'bg-white'
              }`}
              style={{ width: `${capPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted font-mono">
            <span>Utilization: {capPercentage}%</span>
            <span>Hard Cap On-Chain</span>
          </div>
        </div>

        {/* Card 3: Single Trade & Approval Limit */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="text-white font-medium">Approval Threshold</span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
              GATED
            </span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            &gt; {agentConfig?.approvalThreshold?.thresholdAmount || 0.5} ETH
          </div>
          <div className="text-xs text-muted font-mono">
            Single Trade Max: {agentConfig?.spendingCap?.maxPerTradeSpend || 1.5} ETH
          </div>
        </div>

        {/* Card 4: Wallet Account & Balance */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Wallet className="w-3.5 h-3.5 text-muted" />
              Connected Wallet
            </span>
            {wallet.isConnected && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active
              </span>
            )}
          </div>
          {wallet.isConnected ? (
            <div>
              <div className="font-mono text-xs text-white truncate">
                {wallet.address}
              </div>
              <div className="text-xs text-emerald-400 font-mono font-medium pt-0.5">
                Balance: {wallet.balance} ETH
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={wallet.connectDemoWallet}
                className="w-full cohere-btn-primary !py-1.5 text-xs font-bold"
              >
                Connect Demo Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Chart (8 Cols) & Order Book (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Interactive Trading Chart & Safety Pipeline */}
        <div className="lg:col-span-8 space-y-4">
          <div className="cohere-card-console p-4 space-y-3">
            {/* Chart Engine Switcher */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-console-border gap-2">
              <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setChartType('STUDIO')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'STUDIO'
                      ? 'bg-white text-console-surface font-bold shadow-sm'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Studio Pro (Backpack)
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('BACKPACK')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'BACKPACK'
                      ? 'bg-white text-console-surface font-bold shadow-sm'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Backpack Feed
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('TRADINGVIEW')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'TRADINGVIEW'
                      ? 'bg-white text-console-surface font-bold shadow-sm'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  TradingView
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('AGENT_VAULT')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'AGENT_VAULT'
                      ? 'bg-white text-console-surface font-bold shadow-sm'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Agent Vault Flow
                </button>
              </div>

              {chartType === 'TRADINGVIEW' && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted text-[11px]">Symbol:</span>
                  <select
                    value={tvSymbol}
                    onChange={(e) => setTvSymbol(e.target.value)}
                    className="bg-console-elevated border border-console-border rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-coral"
                  >
                    <option value="AAPL">AAPL (Demo Feed)</option>
                    <option value="BINANCE:ETHUSDT">ETH / USDT (Binance)</option>
                    <option value="COINBASE:ETHUSD">ETH / USD (Coinbase)</option>
                    <option value="BINANCE:BTCUSDT">BTC / USDT (Binance)</option>
                  </select>
                </div>
              )}
            </div>

            {chartType === 'STUDIO' ? (
              <TradingViewStyleUI initialSymbol="ETH_USDC" />
            ) : chartType === 'BACKPACK' ? (
              <BackpackChart initialSymbol="ETH_USDC" height={480} />
            ) : chartType === 'TRADINGVIEW' ? (
              <TradingViewChart symbol={tvSymbol} interval="1D" height={480} />
            ) : (
              <PriceChart currentPrice={currentPrice} events={events} />
            )}
          </div>

          {/* Interactive Simulation & Test Dock */}
          <div className="cohere-card-console p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-coral" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-[0.28px]">
                  Interactive Simulation Dock
                </h3>
              </div>
              <span className="text-[11px] text-muted font-mono">
                Real-time trigger simulation & on-chain cap enforcement
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
              <button
                type="button"
                onClick={() => nudgePrice(-25)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-console-elevated hover:bg-zinc-800 text-xs font-medium text-emerald-400 border border-console-border transition"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Drop -$25 (Fire)</span>
              </button>

              <button
                type="button"
                onClick={() => nudgePrice(+25)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-console-elevated hover:bg-zinc-800 text-xs font-medium text-rose-400 border border-console-border transition"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Raise +$25</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  simulateTrade({
                    amount: 0.4,
                    price: currentPrice,
                    status: 'EXECUTED'
                  })
                }
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 border border-emerald-500/30 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.4 ETH Safe Buy</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  simulateTrade({
                    amount: 0.8,
                    price: currentPrice,
                    status: 'PENDING_APPROVAL'
                  })
                }
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-xs font-medium text-amber-300 border border-amber-500/30 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>0.8 ETH Gated</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  simulateTrade({
                    amount: 3.5,
                    price: currentPrice,
                    status: 'REJECTED',
                    reason: 'Exceeds single trade cap (1.5 ETH)'
                  })
                }
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-xs font-medium text-rose-300 border border-rose-500/30 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>3.5 ETH Over-Cap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Book & Placement */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="cohere-card-console p-3 sm:p-4 flex-1 flex flex-col min-h-[460px]">
            <OrderBookTable
              bids={orderBook.bids}
              asks={orderBook.asks}
              lastPrice={currentPrice}
              isLoading={orderBook.isLoading}
              onPlaceOrder={orderBook.placeOrder}
              isSubmitting={orderBook.isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Bottom Pro Audit Trail & Trade History */}
      <div className="cohere-card-console p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-console-border">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.28px] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-coral" />
              On-Chain Execution Ledger & Safety Trail
            </h3>
            <span className="text-[11px] font-mono text-muted">
              ({filteredEvents.length} events logged)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded transition ${activeFilter === 'ALL' ? 'bg-white text-console-surface font-semibold' : 'text-muted hover:text-white'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('EXECUTED')}
              className={`px-3 py-1 rounded transition ${activeFilter === 'EXECUTED' ? 'bg-emerald-600 text-white font-medium' : 'text-muted hover:text-white'}`}
            >
              Executed
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('APPROVAL')}
              className={`px-3 py-1 rounded transition ${activeFilter === 'APPROVAL' ? 'bg-amber-600 text-white font-medium' : 'text-muted hover:text-white'}`}
            >
              Pending Approval
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('REJECTED')}
              className={`px-3 py-1 rounded transition ${activeFilter === 'REJECTED' ? 'bg-rose-600 text-white font-medium' : 'text-muted hover:text-white'}`}
            >
              Blocked
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted font-mono">
            No events match current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-muted border-b border-console-border text-[11px] uppercase tracking-[0.28px]">
                <tr>
                  <th className="pb-3 font-normal">Timestamp</th>
                  <th className="pb-3 font-normal">ID</th>
                  <th className="pb-3 font-normal">Side</th>
                  <th className="pb-3 font-normal">Amount</th>
                  <th className="pb-3 font-normal">Price (USDC)</th>
                  <th className="pb-3 font-normal">Status</th>
                  <th className="pb-3 font-normal">Verification / On-Chain Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-console-border">
                {filteredEvents.map((e, idx) => (
                  <tr key={`${e.tradeId}-${idx}`} className="hover:bg-console-elevated/70 transition">
                    <td className="py-3 text-muted">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-white font-semibold">#{e.tradeId}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        {e.action}
                      </span>
                    </td>
                    <td className="py-3 text-white font-medium">{e.amount} ETH</td>
                    <td className="py-3 text-muted">${e.price.toFixed(2)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                          e.status === 'EXECUTED' || e.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : e.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted text-[11px] truncate max-w-sm">
                      {e.reason ? (
                        <span className="text-rose-300">{e.reason}</span>
                      ) : e.txHash ? (
                        <span className="text-white hover:underline flex items-center gap-1">
                          <span>{e.txHash.slice(0, 10)}...{e.txHash.slice(-6)}</span>
                          <ArrowUpRight className="w-3 h-3 text-muted" />
                        </span>
                      ) : (
                        <span className="text-emerald-400/90">On-Chain Vault Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Human Approval Modal */}
      <ApprovalModal
        pendingTrades={pendingTrades}
        onApprove={approveTrade}
        onReject={rejectTrade}
      />
    </div>
  );
};


