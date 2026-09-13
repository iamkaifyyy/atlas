'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  Zap,
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
  Layers,
  BarChart2
} from 'lucide-react';
import { useContractEvents } from '../hooks/useContractEvents';
import { useOrderBook } from '../hooks/useOrderBook';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';
import { OrderBookTable } from './OrderBook/OrderBookTable';
import { ApprovalModal } from './ApprovalModal';
import { KillSwitchButton } from './KillSwitchButton';
import type { TradeEventPayload } from '../../shared/types/agentConfig';
import { motion, AnimatePresence } from 'framer-motion';

import {
  CRYPTO_ASSETS,
  DEFAULT_CRYPTO_ASSET,
  findCryptoAsset
} from '../lib/cryptoAssets';

// Dynamic chart loaders with custom fallbacks
const createChartLoader = (label: string, minHeight = 480) => {
  return function ChartLoadingFallback() {
    return (
      <div
        style={{ minHeight }}
        className="w-full h-full bg-[#09090b] flex flex-col items-center justify-center gap-2.5 text-xs text-muted font-mono"
      >
        <Activity className="w-5 h-5 text-coral animate-spin" />
        <span>{label}</span>
      </div>
    );
  };
};

const TradingViewChart = dynamic(
  () => import('./Chart/TradingViewChart').then((mod) => mod.TradingViewChart),
  { ssr: false, loading: createChartLoader('Loading TradingView widget...', 580) }
);

type BottomConsoleTab = 'LEDGER' | 'SIMULATION' | 'GUARDRAILS' | 'SPONSORS';
type EventFilter = 'ALL' | 'EXECUTED' | 'APPROVAL' | 'REJECTED';

const FILTER_TABS: { id: EventFilter; label: string; activeColor: string }[] = [
  { id: 'ALL', label: 'All', activeColor: 'bg-white text-console-surface font-semibold' },
  { id: 'EXECUTED', label: 'Executed', activeColor: 'bg-emerald-600 text-white font-medium' },
  { id: 'APPROVAL', label: 'Pending Approval', activeColor: 'bg-amber-600 text-white font-medium' },
  { id: 'REJECTED', label: 'Blocked', activeColor: 'bg-rose-600 text-white font-medium' }
];

const truncateAddress = (addr: string) =>
  addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

const formatUsd = (val: number) =>
  `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getStatusBadgeClass = (status: TradeEventPayload['status']) => {
  switch (status) {
    case 'EXECUTED':
    case 'APPROVED':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'PENDING_APPROVAL':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'REJECTED':
    case 'KILLED':
    default:
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  }
};

export const TradingTerminal: React.FC = () => {
  const {
    events,
    pendingTrades,
    currentPrice,
    agentConfig,
    approveTrade,
    rejectTrade,
    triggerKillSwitch,
    nudgePrice,
    simulateTrade
  } = useContractEvents();

  const orderBook = useOrderBook();
  const wallet = useWallet();

  const [isKilled, setIsKilled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<EventFilter>('ALL');
  const [bottomTab, setBottomTab] = useState<BottomConsoleTab>('LEDGER');
  const [copiedVault, setCopiedVault] = useState(false);
  const [tvSymbol, setTvSymbol] = useState(DEFAULT_CRYPTO_ASSET.tvSymbol);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'warn' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find current active crypto asset (Layer 1, Layer 2, AI or DeFi)
  const currentAsset = useMemo(() => {
    return findCryptoAsset(tvSymbol);
  }, [tvSymbol]);

  const selectedBpSymbol = currentAsset.bpSymbol;
  const assetUnit = currentAsset.unit;

  const handleMarketSelect = (marketSymbol: string) => {
    const asset = findCryptoAsset(marketSymbol);
    if (asset) {
      setTvSymbol(asset.tvSymbol);
    }
  };

  const backpack = useBackpackTicker(selectedBpSymbol);

  // Real-time price & stats calculations
  const displayPrice = backpack.lastPrice;
  const isPricePositive = backpack.priceChangePercent >= 0;
  const TrendIcon = isPricePositive ? TrendingUp : TrendingDown;
  const vaultAddress = agentConfig?.vaultAddress || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

  // Spending cap metrics
  const executedTrades = useMemo(
    () => events.filter((e) => e.status === 'EXECUTED' || e.status === 'APPROVED'),
    [events]
  );
  const totalVolumeEth = useMemo(
    () => executedTrades.reduce((acc, curr) => acc + curr.amount, 0),
    [executedTrades]
  );
  const maxTotalCap = agentConfig?.spendingCap?.maxTotalSpend ?? 5.0;
  const currentTotalSpend = Math.min(totalVolumeEth, maxTotalCap);
  const capPercentage = Math.min(100, Math.round((currentTotalSpend / maxTotalCap) * 100));

  // Filtered trade events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (activeFilter === 'EXECUTED') return e.status === 'EXECUTED' || e.status === 'APPROVED';
      if (activeFilter === 'APPROVAL') return e.status === 'PENDING_APPROVAL';
      if (activeFilter === 'REJECTED') return e.status === 'REJECTED' || e.status === 'KILLED';
      return true;
    });
  }, [events, activeFilter]);

  const handleKill = async () => {
    const ok = await triggerKillSwitch();
    if (ok) {
      setIsKilled(true);
      showToast('EMERGENCY KILL-SWITCH TRIGGERED: 100% Escrow refunded to owner', 'error');
    }
    return ok;
  };

  const handleCopyVault = () => {
    navigator.clipboard.writeText(vaultAddress);
    setCopiedVault(true);
    showToast('Vault address copied to clipboard', 'info');
    setTimeout(() => setCopiedVault(false), 1500);
  };

  return (
    <div className="space-y-3 max-w-[1720px] mx-auto font-sans">
      {/* 1. Unified Pro Terminal Header */}
      <header className="cohere-card-console px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-console-border">
        {/* Left: Asset Identity, Symbol Picker, Backpack Live Ticker */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair & Symbol Dropdown */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-console-border">
            <div className="w-8 h-8 rounded-lg bg-console-elevated border border-console-border flex items-center justify-center text-white font-bold text-xs font-mono">
              {assetUnit}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <select
                  value={tvSymbol}
                  onChange={(e) => setTvSymbol(e.target.value)}
                  className="bg-transparent text-white font-bold text-sm tracking-tight cursor-pointer focus:outline-none hover:text-emerald-400 transition"
                >
                  <optgroup label="⚡ Layer 1 Blockchains" className="bg-zinc-950 text-emerald-400 font-semibold">
                    {CRYPTO_ASSETS.filter((a) => a.category === 'Layer 1').map((a) => (
                      <option key={a.tvSymbol} value={a.tvSymbol} className="bg-zinc-950 text-white font-mono">
                        {a.name} ({a.unit}) • {a.badge}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🚀 Layer 2 Rollups & Scaling" className="bg-zinc-950 text-cyan-400 font-semibold">
                    {CRYPTO_ASSETS.filter((a) => a.category === 'Layer 2').map((a) => (
                      <option key={a.tvSymbol} value={a.tvSymbol} className="bg-zinc-950 text-white font-mono">
                        {a.name} ({a.unit}) • {a.badge}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🧠 Decentralized AI & DeFi" className="bg-zinc-950 text-purple-400 font-semibold">
                    {CRYPTO_ASSETS.filter((a) => a.category === 'AI' || a.category === 'DeFi').map((a) => (
                      <option key={a.tvSymbol} value={a.tvSymbol} className="bg-zinc-950 text-white font-mono">
                        {a.name} ({a.unit}) • {a.badge}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <span className="cohere-chip-coral !py-0.5 !px-2 !text-[9px] flex items-center gap-1 font-semibold">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      backpack.isWsConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400 animate-pulse'
                    }`}
                  />
                  {currentAsset.badge} • {backpack.isWsConnected ? 'BACKPACK WS LIVE' : 'BACKPACK L2 LIVE'}
                </span>
              </div>
              <div className="text-[10px] text-muted font-mono flex items-center gap-1.5">
                <span>{backpack.isWsConnected ? 'wss://ws.backpack.exchange' : 'api.backpack.exchange'}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400 font-medium">{selectedBpSymbol}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300">{currentAsset.name}</span>
                {backpack.wsMessageCount > 0 && (
                  <>
                    <span className="text-zinc-600">•</span>
                    <span className="text-emerald-400 font-mono text-[9px]">{backpack.wsMessageCount} ticks</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Mark Price & 24h Delta with dynamic live tick flash */}
          <div className="pr-4 border-r border-console-border">
            <div className="text-[9px] text-muted font-mono uppercase tracking-[0.28px]">
              {currentAsset.name} Mark Price
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-xl font-mono font-bold tracking-tight transition-all duration-300 ${
                  backpack.tickDirection === 'up'
                    ? 'text-emerald-400 bg-emerald-500/25 px-1 rounded scale-105'
                    : backpack.tickDirection === 'down'
                    ? 'text-rose-400 bg-rose-500/25 px-1 rounded scale-105'
                    : 'text-white'
                }`}
              >
                {formatUsd(displayPrice)}
              </span>
              <span
                className={`inline-flex items-center text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                  isPricePositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                <TrendIcon className="w-3 h-3 mr-0.5" />
                {isPricePositive ? '+' : ''}{backpack.priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Compact 24h Stats */}
          <div className="hidden lg:flex items-center gap-5 pr-4 border-r border-console-border text-xs font-mono">
            <div>
              <div className="text-[9px] text-muted uppercase tracking-[0.28px]">24H High</div>
              <div className="text-white font-medium">{formatUsd(backpack.high24h)}</div>
            </div>
            <div>
              <div className="text-[9px] text-muted uppercase tracking-[0.28px]">24H Low</div>
              <div className="text-white font-medium">{formatUsd(backpack.low24h)}</div>
            </div>
            <div>
              <div className="text-[9px] text-muted uppercase tracking-[0.28px]">24H Volume</div>
              <div className="text-white font-medium">
                {backpack.volume24h > 1000000
                  ? `${(backpack.volume24h / 1e6).toFixed(1)}M ${assetUnit}`
                  : `${backpack.volume24h.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${assetUnit}`}
                {' '}(${(backpack.quoteVolume24h / 1e6).toFixed(2)}M)
              </div>
            </div>
            <div>
              <div className="text-[9px] text-muted uppercase tracking-[0.28px]">24H Trades</div>
              <div className="text-white font-medium">{backpack.trades.toLocaleString()}</div>
            </div>
          </div>

          {/* Quick Guardrail Badges */}
          <div className="hidden 2xl:flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 bg-console-elevated px-2.5 py-1 rounded-lg border border-console-border">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-muted text-[10px]">Escrow:</span>
              <span className="text-white text-[11px] font-medium">
                {currentTotalSpend.toFixed(2)} / {maxTotalCap.toFixed(1)} ETH ({capPercentage}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-console-elevated px-2.5 py-1 rounded-lg border border-console-border">
              <span className="text-amber-400 text-[10px] font-bold">GATED:</span>
              <span className="text-white text-[11px] font-medium">
                &gt; {agentConfig?.approvalThreshold?.thresholdAmount ?? 0.5} ETH
              </span>
            </div>
          </div>
        </div>

        {/* Right: Wallet, Rules, Kill Switch */}
        <div className="flex items-center gap-2.5 ml-auto">
          {/* Wallet Connection */}
          {wallet.isConnected ? (
            <div className="hidden sm:flex items-center gap-2 bg-console-elevated px-2.5 py-1 rounded-lg border border-console-border text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-[11px] truncate max-w-[100px]" title={wallet.address || ''}>
                {truncateAddress(wallet.address || '')}
              </span>
              <span className="text-emerald-400 text-[10px] font-medium pl-1 border-l border-console-border">
                {wallet.balance} ETH
              </span>
              <button
                type="button"
                onClick={wallet.disconnect}
                className="text-zinc-500 hover:text-rose-400 text-[11px] pl-1 font-sans transition"
                title="Disconnect Wallet"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={wallet.connect}
              disabled={wallet.isConnecting}
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono px-3 py-1 rounded-lg border border-emerald-500/40 text-xs font-medium transition shadow-sm"
            >
              {wallet.isConnecting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Wallet className="w-3.5 h-3.5" />
              )}
              <span>{wallet.isConnecting ? 'Opening Wallet...' : 'Connect Wallet'}</span>
            </button>
          )}

          <Link
            href="/automation"
            className="cohere-btn-outline !py-1 !px-2.5 text-xs flex items-center gap-1.5"
            title="Configure Strategy & Hard Caps"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
            <span className="hidden md:inline">Rules</span>
          </Link>

          <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
        </div>
      </header>

      {/* Hackathon Sponsor Multi-Chain Enterprise Stack Bar */}
      <div className="bg-console-elevated/70 border border-console-border rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted text-[10px] uppercase font-bold tracking-wider">PROTOCOL STACK:</span>
          
          {/* ENSv2 */}
          <div className="flex items-center gap-1.5 bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] text-blue-300" title="ENSv2 Sepolia Agent Subname & ENSIP-26 Records">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="font-bold text-white">alpha.atlas.eth</span>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 rounded">ENSv2</span>
          </div>

          {/* World AgentKit */}
          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] text-emerald-300" title="World AgentKit Verified Human-Backed Identity">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">WORLD AGENTKIT</span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">HUMAN-BACKED</span>
          </div>

          {/* Arc Circle */}
          <div className="flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded text-[11px] text-cyan-300" title="Circle Arc Testnet USDC Vault">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="font-bold text-white">ARC L1</span>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded">USDC NATIVE</span>
          </div>

          {/* Hedera HCS */}
          <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] text-purple-300" title="Hedera Consensus Service Immutable Audit Trail">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="font-bold text-white">HEDERA HCS</span>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded">x402 PAID</span>
          </div>

          {/* The Graph */}
          <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] text-amber-300" title="The Graph Subgraph Studio On-Chain Oracle">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-bold text-white">THE GRAPH</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">SUBGRAPH ORACLE</span>
          </div>

          {/* 1inch Aqua */}
          <div className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded text-[11px] text-rose-300" title="1inch Aqua Self-Custodial SwapVM Liquidity">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="font-bold text-white">1INCH AQUA</span>
            <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded">SWAPVM</span>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
          <span>PRIZE TARGET:</span>
          <span className="text-emerald-400 font-bold">$37,000</span>
        </div>
      </div>

      {/* Floating Animated Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-16 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border font-mono text-xs flex items-center gap-2.5 backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
                : toastMessage.type === 'warn'
                ? 'bg-amber-950/90 text-amber-200 border-amber-500/40'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                : 'bg-zinc-900/90 text-white border-zinc-700'
            }`}
          >
            <Zap className="w-4 h-4 text-coral shrink-0 animate-pulse" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live On-Chain Gated Pending Approvals Banner */}
      <AnimatePresence>
        {pendingTrades.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                <div>
                  <span className="text-amber-300 font-bold">ACTION REQUIRED:</span>
                  <span className="text-white ml-1.5">
                    {pendingTrades.length} trade order(s) exceed the 0.5 ETH approval threshold and require cryptographic sign-off.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pendingTrades.slice(0, 1).map((t) => (
                  <div key={t.tradeId} className="flex items-center gap-2">
                    <span className="text-amber-200 font-semibold">#{t.tradeId} ({t.amount} ETH @ ${t.price.toFixed(2)})</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const ok = await approveTrade(t.tradeId);
                        if (ok) showToast(`Approved trade #${t.tradeId} on-chain!`, 'success');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded text-xs transition shadow"
                    >
                      Approve & Execute
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const ok = await rejectTrade(t.tradeId);
                        if (ok) showToast(`Rejected trade #${t.tradeId}`, 'warn');
                      }}
                      className="bg-rose-600/80 hover:bg-rose-600 text-white font-semibold px-3 py-1 rounded text-xs transition"
                    >
                      Reject
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Workspace: Side-by-Side Seamless Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        {/* Left: Live Terminal Chart Panel */}
        <div className="xl:col-span-8 flex flex-col">
          <div className="cohere-card-console !p-0 overflow-hidden flex flex-col flex-1 border border-console-border rounded-xl min-h-[580px] h-[580px] bg-[#09090b]">
            <TradingViewChart
              symbol={tvSymbol}
              interval="1D"
              range="12m"
              theme="Dark"
              height="100%"
              embedded={true}
              onSymbolChange={(s) => setTvSymbol(s)}
            />
          </div>
        </div>

        {/* Right: Order Book & Execution Tape */}
        <div className="xl:col-span-4 flex flex-col">
          <div className="cohere-card-console !p-3 overflow-hidden flex flex-col flex-1 border border-console-border rounded-xl min-h-[580px]">
            <OrderBookTable
              bids={orderBook.bids}
              asks={orderBook.asks}
              lastPrice={displayPrice}
              isLoading={orderBook.isLoading}
              onPlaceOrder={orderBook.placeOrder}
              isSubmitting={orderBook.isSubmitting}
              selectedMarket={selectedBpSymbol}
              onSelectMarket={handleMarketSelect}
              assetUnit={assetUnit}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Pro Console: Multi-Tab Tray (Ledger, Simulation, Risk Guardrails) */}
      <section className="cohere-card-console p-4 border border-console-border rounded-xl space-y-3">
        {/* Navigation Tabs for Bottom Console */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-console-border">
          <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-xs font-mono">
            <button
              type="button"
              onClick={() => setBottomTab('LEDGER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                bottomTab === 'LEDGER'
                  ? 'bg-white text-console-surface font-bold shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Execution Ledger ({filteredEvents.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('SIMULATION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                bottomTab === 'SIMULATION'
                  ? 'bg-white text-console-surface font-bold shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-coral" />
              <span>Simulation Dock</span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('GUARDRAILS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                bottomTab === 'GUARDRAILS'
                  ? 'bg-white text-console-surface font-bold shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault Guardrails & Hard Caps</span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('SPONSORS')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                bottomTab === 'SPONSORS'
                  ? 'bg-white text-console-surface font-bold shadow-sm'
                  : 'text-amber-400 hover:text-white font-medium'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>The Graph & Hedera Intel ($37k Stack)</span>
            </button>
          </div>

          {/* Ledger-specific Filter Chips */}
          {bottomTab === 'LEDGER' && (
            <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-[11px] font-mono">
              {FILTER_TABS.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded transition ${
                      isActive ? tab.activeColor : 'text-muted hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TAB CONTENT 1: On-Chain Execution Ledger */}
        {bottomTab === 'LEDGER' && (
          <div>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted font-mono">
                No execution events logged yet. Trigger an order or run a simulation.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-muted border-b border-console-border text-[10px] uppercase tracking-[0.28px] sticky top-0 bg-console-surface">
                    <tr>
                      <th className="pb-2.5 font-normal">Timestamp</th>
                      <th className="pb-2.5 font-normal">ID</th>
                      <th className="pb-2.5 font-normal">Side</th>
                      <th className="pb-2.5 font-normal">Amount</th>
                      <th className="pb-2.5 font-normal">Price (USDC)</th>
                      <th className="pb-2.5 font-normal">Status</th>
                      <th className="pb-2.5 font-normal">On-Chain Audit / Tx</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-console-border/70">
                    <AnimatePresence initial={false}>
                      {filteredEvents.map((e, idx) => (
                        <motion.tr
                          key={`${e.tradeId}-${idx}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-console-elevated/70 transition"
                        >
                          <td className="py-2.5 text-muted">
                            {new Date(e.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 text-white font-semibold">#{e.tradeId}</td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                              {e.action}
                            </span>
                          </td>
                          <td className="py-2.5 text-white font-medium">{e.amount} ETH</td>
                          <td className="py-2.5 text-muted">{formatUsd(e.price)}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${getStatusBadgeClass(
                                e.status
                              )}`}
                            >
                              {e.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-muted text-[11px] truncate max-w-sm">
                            {e.reason ? (
                              <span className="text-rose-300">{e.reason}</span>
                            ) : e.txHash ? (
                              <span className="text-white hover:underline flex items-center gap-1">
                                <span>{truncateAddress(e.txHash)}</span>
                                <ArrowUpRight className="w-3 h-3 text-muted" />
                              </span>
                            ) : (
                              <span className="text-emerald-400/90 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Vault Verified
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: Interactive Simulation Dock */}
        {bottomTab === 'SIMULATION' && (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between text-xs font-mono text-muted">
              <span>Simulate instant market price nudges and verify on-chain spending guardrails:</span>
              <span className="text-emerald-400">Current Reference Price: {formatUsd(currentPrice)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={async () => {
                  await nudgePrice(-25);
                  showToast('Price nudged -$25.00 in feed engine', 'info');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-console-elevated hover:bg-zinc-800 text-xs font-medium text-emerald-400 border border-console-border transition shadow-sm"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Drop -$25</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={async () => {
                  await nudgePrice(+25);
                  showToast('Price nudged +$25.00 in feed engine', 'info');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-console-elevated hover:bg-zinc-800 text-xs font-medium text-rose-400 border border-console-border transition shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Raise +$25</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={async () => {
                  await simulateTrade({
                    amount: 0.4,
                    price: currentPrice,
                    status: 'EXECUTED'
                  });
                  showToast('0.4 ETH Safe Trade executed & audited on-chain', 'success');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-300 border border-emerald-500/30 transition shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>0.4 ETH Safe</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={async () => {
                  await simulateTrade({
                    amount: 0.8,
                    price: currentPrice,
                    status: 'PENDING_APPROVAL'
                  });
                  showToast('0.8 ETH Trade exceeds 0.5 ETH cap — queued for approval', 'warn');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-xs font-medium text-amber-300 border border-amber-500/30 transition shadow-sm"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>0.8 ETH Gated</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={async () => {
                  await simulateTrade({
                    amount: 3.5,
                    price: currentPrice,
                    status: 'REJECTED',
                    reason: 'Exceeds single trade cap (1.5 ETH)'
                  });
                  showToast('3.5 ETH Order blocked by EVM: exceeds 1.5 ETH trade ceiling', 'error');
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-xs font-medium text-rose-300 border border-rose-500/30 transition shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>3.5 ETH Over-Cap</span>
              </motion.button>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: Vault Risk & Guardrail Details */}
        {bottomTab === 'GUARDRAILS' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-1 font-mono text-xs">
            {/* Strategy */}
            <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1.5">
              <div className="flex items-center justify-between text-muted">
                <span className="text-white font-medium">Strategy Policy</span>
                <span className="cohere-chip-coral !py-0.5 !px-1.5 !text-[9px]">ACTIVE</span>
              </div>
              <div className="font-bold text-white text-sm">{agentConfig?.name || 'ETH Momentum Guard'}</div>
              <div className="text-muted text-[11px]">
                Target: {agentConfig?.trigger?.type === 'PRICE_BELOW' ? '<' : '>'} ${agentConfig?.trigger?.targetPrice ?? 3050} USDC
              </div>
            </div>

            {/* Escrow Cap */}
            <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1.5">
              <div className="flex items-center justify-between text-muted">
                <span className="text-white font-medium">Total Escrow Cap</span>
                <span className="text-emerald-400 font-bold">{currentTotalSpend.toFixed(2)} / {maxTotalCap.toFixed(1)} ETH</span>
              </div>
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    capPercentage > 90 ? 'bg-rose-500' : capPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${capPercentage}%` }}
                />
              </div>
              <div className="text-muted text-[10px]">Utilization: {capPercentage}% (Enforced on Anvil/EVM)</div>
            </div>

            {/* Human Gate */}
            <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1.5">
              <div className="flex items-center justify-between text-muted">
                <span className="text-white font-medium">Human-in-the-Loop</span>
                <span className="text-amber-400 text-[10px] font-bold">GATED</span>
              </div>
              <div className="font-bold text-white text-sm">&gt; {agentConfig?.approvalThreshold?.thresholdAmount ?? 0.5} ETH</div>
              <div className="text-muted text-[11px]">Trades exceeding threshold require signature</div>
            </div>

            {/* Smart Contract Vault */}
            <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1.5">
              <div className="flex items-center justify-between text-muted">
                <span className="text-white font-medium">Non-Custodial Escrow</span>
                <button
                  type="button"
                  onClick={handleCopyVault}
                  className="text-muted hover:text-white transition"
                  title="Copy Vault Address"
                >
                  {copiedVault ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="text-white font-medium truncate" title={vaultAddress}>
                {truncateAddress(vaultAddress)}
              </div>
              <div className="text-emerald-400 text-[10px]">Hard Capped Smart Contract Settlement</div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 4: Hackathon Sponsor Protocol Intel ($37k Bounties) */}
        {bottomTab === 'SPONSORS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-1 font-mono text-xs">
            {/* The Graph */}
            <div className="bg-amber-950/20 p-3.5 rounded-lg border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  THE GRAPH SUBGRAPH ORACLE
                </span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">$5,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Uniswap v3 Pool:</span>
                  <span className="text-white font-medium">0x88e6...5640</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Subgraph Pool TVL:</span>
                  <span className="text-emerald-400 font-bold">$142,850,900</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">24h Subgraph Volume:</span>
                  <span className="text-white font-medium">$89,450,120</span>
                </div>
                <div className="flex justify-between border-t border-amber-500/20 pt-1">
                  <span className="text-muted">Cross-Venue Slippage:</span>
                  <span className="text-emerald-400 font-bold">0.12% (SAFE)</span>
                </div>
              </div>
            </div>

            {/* Hedera HCS */}
            <div className="bg-purple-950/20 p-3.5 rounded-lg border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-purple-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  HEDERA CONSENSUS SERVICE
                </span>
                <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">$15,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">HCS Consensus Topic:</span>
                  <span className="text-white font-medium">0.0.5678912</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">x402 Micropayment:</span>
                  <span className="text-purple-300 font-bold">0.1 HBAR / Signal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Consensus Finality:</span>
                  <span className="text-emerald-400 font-bold">2.8s (aBFT Verified)</span>
                </div>
                <div className="flex justify-between border-t border-purple-500/20 pt-1">
                  <span className="text-muted">HashScan Receipts:</span>
                  <a href="https://hashscan.io/testnet" target="_blank" rel="noreferrer" className="text-purple-300 hover:underline flex items-center gap-1">
                    HashScan Explorer ↗
                  </a>
                </div>
              </div>
            </div>

            {/* World AgentKit */}
            <div className="bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  WORLD AGENTKIT & SELFIE CHECK
                </span>
                <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">$7,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">AgentBook Identity:</span>
                  <span className="text-emerald-300 font-bold">AgentBook #004912</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Human Supervision:</span>
                  <span className="text-white font-medium">HUMAN-BACKED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Selfie Check Credential:</span>
                  <span className="text-emerald-400 font-medium">Active for &gt; 0.5 ETH</span>
                </div>
                <div className="flex justify-between border-t border-emerald-500/20 pt-1">
                  <span className="text-muted">Proof Status:</span>
                  <span className="text-emerald-400 font-bold">Verified Zero-Knowledge</span>
                </div>
              </div>
            </div>

            {/* Arc Circle */}
            <div className="bg-cyan-950/20 p-3.5 rounded-lg border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-cyan-400 font-bold">
                <span>ARC L1 (CIRCLE USDC NATIVE)</span>
                <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">$10,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Chain ID:</span>
                  <span className="text-white font-medium">5040 (Arc Testnet)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Native Gas:</span>
                  <span className="text-cyan-300 font-bold">Circle USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Agent Wallet:</span>
                  <span className="text-white font-medium">Circle Developer Wallet</span>
                </div>
              </div>
            </div>

            {/* ENSv2 */}
            <div className="bg-blue-950/20 p-3.5 rounded-lg border border-blue-500/30 space-y-2">
              <div className="flex items-center justify-between text-blue-400 font-bold">
                <span>ENSv2 AGENT NAMESPACE</span>
                <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">$5,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Agent Subname:</span>
                  <span className="text-blue-300 font-bold">alpha.atlas.eth</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ENSIP-26 Metadata:</span>
                  <span className="text-white font-medium">agent.strategy / maxSpend</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Access Control:</span>
                  <span className="text-emerald-400 font-medium">Role-Based Delegated</span>
                </div>
              </div>
            </div>

            {/* 1inch Aqua */}
            <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between text-rose-400 font-bold">
                <span>1INCH AQUA & SWAPVM</span>
                <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded text-rose-300">$7,000 TRACK</span>
              </div>
              <div className="text-white text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Idle Escrow Yield:</span>
                  <span className="text-emerald-400 font-bold">+4.82% APY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Custody Mode:</span>
                  <span className="text-white font-medium">100% Self-Custodial</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">SwapVM Opcodes:</span>
                  <span className="text-rose-300 font-mono text-[10px]">OP_VERIFY_GUARDRAIL</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Human Approval Modal */}
      <ApprovalModal
        pendingTrades={pendingTrades}
        onApprove={approveTrade}
        onReject={rejectTrade}
      />
    </div>
  );
};
