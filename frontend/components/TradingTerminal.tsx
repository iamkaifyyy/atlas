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
  Radio
} from 'lucide-react';
import { useContractEvents } from '../hooks/useContractEvents';
import { useOrderBook } from '../hooks/useOrderBook';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';
import { OrderBookTable } from './OrderBook/OrderBookTable';
import { ApprovalModal } from './ApprovalModal';
import { KillSwitchButton } from './KillSwitchButton';
import type { TradeEventPayload } from '../../shared/types/agentConfig';

// Dynamic chart loaders with custom fallbacks
const createChartLoader = (label: string, minHeight = 480) => {
  return function ChartLoadingFallback() {
    return (
      <div
        style={{ minHeight }}
        className="bg-console-surface rounded-xl border border-console-border flex flex-col items-center justify-center gap-2.5 text-xs text-muted font-mono"
      >
        <Activity className="w-5 h-5 text-coral animate-spin" />
        <span>{label}</span>
      </div>
    );
  };
};

const PriceChart = dynamic(
  () => import('./Chart/PriceChart').then((mod) => mod.PriceChart),
  { ssr: false, loading: createChartLoader('Connecting price feed...', 370) }
);

const TradingViewChart = dynamic(
  () => import('./Chart/TradingViewChart').then((mod) => mod.TradingViewChart),
  { ssr: false, loading: createChartLoader('Loading TradingView feed...', 480) }
);

const BackpackChart = dynamic(
  () => import('./Chart/BackpackChart').then((mod) => mod.BackpackChart),
  { ssr: false, loading: createChartLoader('Streaming Backpack order flow...', 480) }
);

const TradingViewStyleUI = dynamic(
  () => import('./Chart/TradingViewStyleUI'),
  { ssr: false, loading: createChartLoader('Initializing candlestick studio...', 520) }
);

type ChartTab = 'STUDIO' | 'BACKPACK' | 'TRADINGVIEW' | 'AGENT_VAULT';
type EventFilter = 'ALL' | 'EXECUTED' | 'APPROVAL' | 'REJECTED';

const CHART_TABS: { id: ChartTab; label: string }[] = [
  { id: 'TRADINGVIEW', label: 'TradingView Stock Widget' },
  { id: 'STUDIO', label: 'Studio Pro (Backpack)' },
  { id: 'BACKPACK', label: 'Backpack Feed' },
  { id: 'AGENT_VAULT', label: 'Agent Vault Flow' }
];

const FILTER_TABS: { id: EventFilter; label: string; activeColor: string }[] = [
  { id: 'ALL', label: 'All', activeColor: 'bg-white text-console-surface font-semibold' },
  { id: 'EXECUTED', label: 'Executed', activeColor: 'bg-emerald-600 text-white font-medium' },
  { id: 'APPROVAL', label: 'Pending Approval', activeColor: 'bg-amber-600 text-white font-medium' },
  { id: 'REJECTED', label: 'Blocked', activeColor: 'bg-rose-600 text-white font-medium' }
];

const TV_SYMBOLS = [
  { value: 'NASDAQ:AAPL', label: 'AAPL (NASDAQ:AAPL)' },
  { value: 'COINBASE:ETHUSD', label: 'ETH / USD (Coinbase)' },
  { value: 'BINANCE:BTCUSDT', label: 'BTC / USDT (Binance)' },
  { value: 'BINANCE:SOLUSDT', label: 'SOL / USDT (Binance)' },
  { value: 'BINANCE:ETHUSDT', label: 'ETH / USDT (Binance)' }
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
  const [copiedVault, setCopiedVault] = useState(false);
  const [chartType, setChartType] = useState<ChartTab>('TRADINGVIEW');
  const [tvSymbol, setTvSymbol] = useState('NASDAQ:AAPL');

  // Dynamically map selected chart symbol to Backpack pair
  const selectedBpSymbol = useMemo(() => {
    if (tvSymbol.includes('BTC')) return 'BTC_USDC';
    if (tvSymbol.includes('SOL')) return 'SOL_USDC';
    return 'ETH_USDC';
  }, [tvSymbol]);

  const backpack = useBackpackTicker(selectedBpSymbol);

  // Price & stats calculations
  const displayPrice = backpack.isLoading ? currentPrice : backpack.lastPrice;
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
    if (ok) setIsKilled(true);
    return ok;
  };

  const handleCopyVault = () => {
    navigator.clipboard.writeText(vaultAddress);
    setCopiedVault(true);
    setTimeout(() => setCopiedVault(false), 1500);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto font-sans">
      {/* 1. Header Ticker Bar */}
      <header className="cohere-card-console p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair Identity */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-console-border">
            <div className="w-8 h-8 rounded-lg bg-console-elevated border border-console-border flex items-center justify-center text-white font-bold text-xs font-mono">
              {selectedBpSymbol.split('_')[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm tracking-tight">{selectedBpSymbol.replace('_', ' / ')}</span>
                <span className="cohere-chip-coral !py-0.5 !px-2 !text-[10px]">
                  BACKPACK LIVE
                </span>
              </div>
              <div className="text-[11px] text-muted font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>api.backpack.exchange ({selectedBpSymbol})</span>
              </div>
            </div>
          </div>

          {/* Mark Price & Trend */}
          <div className="pr-4 border-r border-console-border">
            <div className="text-[10px] text-muted font-mono uppercase tracking-[0.28px]">Mark Price (USDC)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-white tracking-tight">
                {formatUsd(displayPrice)}
              </span>
              <span
                className={`inline-flex items-center text-xs font-mono font-semibold ${
                  isPricePositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                <TrendIcon className="w-3 h-3 mr-0.5" />
                {isPricePositive ? '+' : ''}{backpack.priceChangePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h Stats */}
          <div className="hidden md:flex items-center gap-6 pr-4 border-r border-console-border text-xs font-mono">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H High</div>
              <div className="text-white font-medium">{formatUsd(backpack.high24h)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H Low</div>
              <div className="text-white font-medium">{formatUsd(backpack.low24h)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted uppercase tracking-[0.28px]">24H Volume</div>
              <div className="text-white font-medium">
                {backpack.volume24h.toFixed(1)} {selectedBpSymbol.split('_')[0]} (${(backpack.quoteVolume24h / 1e6).toFixed(2)}M)
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
            <span className="text-white text-[11px]">{truncateAddress(vaultAddress)}</span>
            <button
              type="button"
              onClick={handleCopyVault}
              className="text-muted hover:text-white transition ml-1"
              title="Copy Vault Address"
            >
              {copiedVault ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Global Strategy Actions */}
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
      </header>

      {/* 2. Key Guardrail Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Active Strategy */}
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
            Trigger: {agentConfig?.trigger?.type === 'PRICE_BELOW' ? '<' : '>'} ${agentConfig?.trigger?.targetPrice ?? 3050} USDC
          </div>
        </div>

        {/* Escrow Cap */}
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

        {/* Approval Threshold */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="text-white font-medium">Approval Threshold</span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
              GATED
            </span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            &gt; {agentConfig?.approvalThreshold?.thresholdAmount ?? 0.5} ETH
          </div>
          <div className="text-xs text-muted font-mono">
            Single Trade Max: {agentConfig?.spendingCap?.maxPerTradeSpend ?? 1.5} ETH
          </div>
        </div>

        {/* Connected Wallet */}
        <div className="cohere-card-console p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Wallet className="w-3.5 h-3.5 text-muted" />
              Connected Wallet
            </span>
            {wallet.isConnected && (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            )}
          </div>
          {wallet.isConnected ? (
            <div>
              <div className="font-mono text-xs text-white truncate" title={wallet.address ?? undefined}>
                {wallet.address}
              </div>
              <div className="text-xs text-emerald-400 font-mono font-medium pt-0.5">
                Balance: {wallet.balance} ETH
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={wallet.connectDemoWallet}
              className="w-full cohere-btn-primary !py-1.5 text-xs font-bold mt-1"
            >
              Connect Demo Account
            </button>
          )}
        </div>
      </section>

      {/* 3. Main Workspace: Charts & Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Charts & Simulation */}
        <div className="lg:col-span-8 space-y-4">
          <div className="cohere-card-console p-4 space-y-3">
            {/* Chart Engine Switcher */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-console-border gap-2">
              <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-xs font-mono">
                {CHART_TABS.map((tab) => {
                  const isActive = chartType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChartType(tab.id)}
                      className={`px-3 py-1 rounded-md transition ${
                        isActive
                          ? 'bg-white text-console-surface font-bold shadow-sm'
                          : 'text-muted hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {chartType === 'TRADINGVIEW' && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-muted text-[11px]">Symbol:</span>
                  <select
                    value={tvSymbol}
                    onChange={(e) => setTvSymbol(e.target.value)}
                    className="bg-console-elevated border border-console-border rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-coral"
                  >
                    {TV_SYMBOLS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Selected Chart Component */}
            {chartType === 'STUDIO' && <TradingViewStyleUI initialSymbol="ETH_USDC" />}
            {chartType === 'BACKPACK' && <BackpackChart initialSymbol="ETH_USDC" height={480} />}
            {chartType === 'TRADINGVIEW' && (
              <TradingViewChart
                symbol={tvSymbol}
                interval="1D"
                range="12m"
                theme="Dark"
                height={520}
                onSymbolChange={(s) => setTvSymbol(s)}
              />
            )}
            {chartType === 'AGENT_VAULT' && (
              <PriceChart currentPrice={currentPrice} events={events} />
            )}
          </div>

          {/* Interactive Simulation Dock */}
          <div className="cohere-card-console p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-coral" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-[0.28px]">
                  Interactive Simulation Dock
                </h3>
              </div>
              <span className="text-[11px] text-muted font-mono">
                Simulate market triggers & on-chain cap enforcement
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
              <button
                type="button"
                onClick={() => nudgePrice(-25)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-console-elevated hover:bg-zinc-800 text-xs font-medium text-emerald-400 border border-console-border transition"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Drop -$25</span>
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
                <span>0.4 ETH Safe</span>
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

        {/* Right: Live Order Book Depth */}
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

      {/* 4. On-Chain Execution Ledger */}
      <section className="cohere-card-console p-5 space-y-4">
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-console-elevated p-1 rounded-lg border border-console-border text-[11px] font-mono">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1 rounded transition ${
                    isActive ? tab.activeColor : 'text-muted hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
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
                    <td className="py-3 text-muted">{formatUsd(e.price)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wide ${getStatusBadgeClass(
                          e.status
                        )}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted text-[11px] truncate max-w-sm">
                      {e.reason ? (
                        <span className="text-rose-300">{e.reason}</span>
                      ) : e.txHash ? (
                        <span className="text-white hover:underline flex items-center gap-1">
                          <span>{truncateAddress(e.txHash)}</span>
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



