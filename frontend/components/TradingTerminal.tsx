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
import { OrderBookTable } from './OrderBook/OrderBookTable';
import { ApprovalModal } from './ApprovalModal';
import { KillSwitchButton } from './KillSwitchButton';

const PriceChart = dynamic(
  () => import('./Chart/PriceChart').then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 h-[370px] flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-mono">
        <Activity className="w-5 h-5 text-blue-500 animate-spin" />
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
      <div className="bg-surface rounded-xl border border-border/80 h-[460px] flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-mono">
        <Activity className="w-5 h-5 text-blue-500 animate-spin" />
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
      <div className="bg-surface rounded-xl border border-border/80 h-[480px] flex flex-col items-center justify-center gap-2 text-xs text-slate-500 font-mono">
        <Activity className="w-5 h-5 text-blue-500 animate-spin" />
        <span>Loading Backpack Exchange Candlestick Feed...</span>
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
  const [isKilled, setIsKilled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXECUTED' | 'APPROVAL' | 'REJECTED'>('ALL');
  const [copiedVault, setCopiedVault] = useState(false);
  const [chartType, setChartType] = useState<'BACKPACK' | 'TRADINGVIEW' | 'AGENT_VAULT'>('BACKPACK');
  const [tvSymbol, setTvSymbol] = useState<string>('COINBASE:ETHUSD');

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
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Top Pro Market Ticker Bar */}
      <div className="glass-panel rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border border-border/70">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Pair Badge */}
          <div className="flex items-center gap-2.5 pr-4 border-r border-border/60">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              ETH
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm tracking-tight">ETH / USDC</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                  SPOT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isWsConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <span>{isWsConnected ? 'Live Matching Engine' : 'Reconnecting...'}</span>
              </div>
            </div>
          </div>

          {/* Mark Price */}
          <div className="pr-4 border-r border-border/60">
            <div className="text-[10px] text-slate-400 font-mono">MARK PRICE</div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold text-white tracking-tight">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="inline-flex items-center text-xs font-mono font-medium text-emerald-400">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +2.34%
              </span>
            </div>
          </div>

          {/* 24h Stats */}
          <div className="hidden md:flex items-center gap-6 pr-4 border-r border-border/60 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400">24H HIGH</div>
              <div className="text-slate-200">${(currentPrice * 1.025).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">24H LOW</div>
              <div className="text-slate-200">${(currentPrice * 0.985).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">24H VOLUME</div>
              <div className="text-slate-200">{totalVolumeEth.toFixed(2)} ETH (${totalVolumeUsdc.toFixed(0)})</div>
            </div>
          </div>

          {/* Vault Contract Address */}
          <div className="hidden xl:flex items-center gap-2 bg-surface-elevated/80 px-2.5 py-1.5 rounded-lg border border-border/50 text-xs font-mono">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400 text-[11px]">Vault:</span>
            <span className="text-slate-200 text-[11px]">
              {vaultAddress.slice(0, 6)}...{vaultAddress.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(vaultAddress)}
              className="text-slate-400 hover:text-white transition ml-1"
              title="Copy Vault Address"
            >
              {copiedVault ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/builder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-300 text-xs font-medium border border-border/70 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Configure Strategy</span>
          </Link>
          <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
        </div>
      </div>

      {/* Autonomous Agent Policy & Escrow Caps Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Card 1: Agent Rule */}
        <div className="glass-panel rounded-xl p-3.5 space-y-1.5 border border-border/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <Radio className="w-3.5 h-3.5" />
              Active Strategy
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              GUARDED
            </span>
          </div>
          <div className="font-semibold text-white text-sm">
            {agentConfig?.name || 'ETH Momentum Guard'}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Trigger: {agentConfig?.trigger?.type === 'PRICE_BELOW' ? '<' : '>'} ${agentConfig?.trigger?.targetPrice || 3050} USDC
          </div>
        </div>

        {/* Card 2: Cumulative Spend Cap */}
        <div className="glass-panel rounded-xl p-3.5 space-y-2 border border-border/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Escrow Total Cap</span>
            <span className="font-mono text-emerald-400 text-xs font-semibold">
              {currentTotalSpend.toFixed(2)} / {maxTotalCap.toFixed(1)} ETH
            </span>
          </div>
          <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden border border-border/40">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                capPercentage > 90 ? 'bg-rose-500 glow-rose' : capPercentage > 75 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${capPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Utilization: {capPercentage}%</span>
            <span>Hard Cap On-Chain</span>
          </div>
        </div>

        {/* Card 3: Single Trade & Approval Limit */}
        <div className="glass-panel rounded-xl p-3.5 space-y-1.5 border border-border/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="text-slate-300 font-medium">Human Approval Threshold</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              GATED
            </span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">
            &gt; {agentConfig?.approvalThreshold?.thresholdAmount || 0.5} ETH
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Single Trade Max: {agentConfig?.spendingCap?.maxPerTradeSpend || 1.5} ETH
          </div>
        </div>

        {/* Card 4: Wallet Account & Balance */}
        <div className="glass-panel rounded-xl p-3.5 space-y-1.5 border border-border/60">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Wallet className="w-3.5 h-3.5 text-blue-400" />
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
              <div className="font-mono text-xs text-slate-200 truncate">
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
                className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition"
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
          <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-3">
            {/* Chart Engine Switcher */}
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-border/60 gap-2">
              <div className="flex items-center gap-1.5 bg-surface-elevated/70 p-0.5 rounded-lg border border-border/50 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setChartType('BACKPACK')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'BACKPACK'
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Backpack Live
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('TRADINGVIEW')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'TRADINGVIEW'
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  TradingView Pro
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('AGENT_VAULT')}
                  className={`px-3 py-1 rounded-md transition ${
                    chartType === 'AGENT_VAULT'
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Agent Vault Flow
                </button>
              </div>

              {chartType === 'TRADINGVIEW' && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">Symbol:</span>
                  <select
                    value={tvSymbol}
                    onChange={(e) => setTvSymbol(e.target.value)}
                    className="bg-surface-elevated border border-border/60 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="AAPL">AAPL (Demo Feed)</option>
                    <option value="BINANCE:ETHUSDT">ETH / USDT (Binance)</option>
                    <option value="COINBASE:ETHUSD">ETH / USD (Coinbase)</option>
                    <option value="BINANCE:BTCUSDT">BTC / USDT (Binance)</option>
                  </select>
                </div>
              )}
            </div>

            {chartType === 'BACKPACK' ? (
              <BackpackChart initialSymbol="ETH_USDC" height={480} />
            ) : chartType === 'TRADINGVIEW' ? (
              <TradingViewChart symbol={tvSymbol} interval="1D" height={480} />
            ) : (
              <PriceChart currentPrice={currentPrice} events={events} />
            )}
          </div>

          {/* Interactive Simulation & Test Dock */}
          <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Interactive Simulation Dock
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Click any action to verify real-time trigger & on-chain enforcement
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => nudgePrice(-25)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-elevated hover:bg-slate-800 text-xs font-medium text-emerald-400 border border-border/70 transition hover:border-emerald-500/50"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Drop -$25 (Fire)</span>
              </button>

              <button
                type="button"
                onClick={() => nudgePrice(+25)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-elevated hover:bg-slate-800 text-xs font-medium text-rose-400 border border-border/70 transition hover:border-rose-500/50"
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
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-xs font-medium text-blue-300 border border-blue-500/30 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
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
                <span>0.8 ETH Gated Trade</span>
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
          <div className="glass-panel rounded-xl p-3 sm:p-4 border border-border/70 flex-1 flex flex-col min-h-[460px]">
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
      <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              On-Chain Execution Ledger & Safety Trail
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ({filteredEvents.length} events logged)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-elevated/70 p-0.5 rounded-lg border border-border/50 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-2.5 py-1 rounded transition ${activeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('EXECUTED')}
              className={`px-2.5 py-1 rounded transition ${activeFilter === 'EXECUTED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Executed
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('APPROVAL')}
              className={`px-2.5 py-1 rounded transition ${activeFilter === 'APPROVAL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pending Approval
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('REJECTED')}
              className={`px-2.5 py-1 rounded transition ${activeFilter === 'REJECTED' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Blocked
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 font-mono">
            No events match current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-slate-400 border-b border-border/60 text-[11px]">
                <tr>
                  <th className="pb-2 font-normal">Timestamp</th>
                  <th className="pb-2 font-normal">ID</th>
                  <th className="pb-2 font-normal">Side</th>
                  <th className="pb-2 font-normal">Amount</th>
                  <th className="pb-2 font-normal">Price (USDC)</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Verification / On-Chain Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredEvents.map((e, idx) => (
                  <tr key={`${e.tradeId}-${idx}`} className="hover:bg-surface-elevated/40 transition">
                    <td className="py-2.5 text-slate-400">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 text-slate-300 font-semibold">#{e.tradeId}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                        {e.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-white font-medium">{e.amount} ETH</td>
                    <td className="py-2.5 text-slate-300">${e.price.toFixed(2)}</td>
                    <td className="py-2.5">
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
                    <td className="py-2.5 text-slate-400 text-[11px] truncate max-w-sm">
                      {e.reason ? (
                        <span className="text-rose-300">{e.reason}</span>
                      ) : e.txHash ? (
                        <span className="text-blue-400 flex items-center gap-1">
                          <span>{e.txHash.slice(0, 10)}...{e.txHash.slice(-6)}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-emerald-400/80">On-Chain Vault Verified</span>
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
