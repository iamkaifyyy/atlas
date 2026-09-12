'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const PriceChart = dynamic(
  () => import('../../components/Chart/PriceChart').then((mod) => mod.PriceChart),
  {
    ssr: false,
    loading: () => (
      <div className="bg-surface rounded-xl border border-border/80 p-5 h-[410px] flex items-center justify-center text-xs text-slate-500 font-mono">
        Loading chart...
      </div>
    )
  }
);
import { OrderBookTable } from '../../components/OrderBook/OrderBookTable';
import { ApprovalModal } from '../../components/ApprovalModal';
import { KillSwitchButton } from '../../components/KillSwitchButton';
import { useContractEvents } from '../../hooks/useContractEvents';
import { useOrderBook } from '../../hooks/useOrderBook';
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Zap,
  ShieldAlert,
  Sliders
} from 'lucide-react';

export default function DashboardPage() {
  const {
    events,
    pendingTrades,
    currentPrice,
    priceSource,
    isConnected,
    agentConfig,
    approveTrade,
    rejectTrade,
    triggerKillSwitch,
    nudgePrice,
    simulateTrade
  } = useContractEvents();

  const orderBook = useOrderBook();
  const [isKilled, setIsKilled] = useState(false);

  const handleKill = async () => {
    const ok = await triggerKillSwitch();
    if (ok) setIsKilled(true);
    return ok;
  };

  const executedTrades = events.filter((e) => e.status === 'EXECUTED' || e.status === 'APPROVED');
  const totalVolume = executedTrades.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface rounded-xl p-4 border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                {agentConfig?.name || 'ETH Momentum Guard'}
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {agentConfig?.assetPair || 'ETH/USDC'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Target: {agentConfig?.trigger.type === 'PRICE_BELOW' ? '<' : '>'} ${agentConfig?.trigger.targetPrice || 3050}
              {' '}| Cap: {agentConfig?.spendingCap.maxTotalSpend || 5} ETH
              {' '}| Gated above: {agentConfig?.approvalThreshold.thresholdAmount || 0.5} ETH
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/builder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-300 text-xs border border-border transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            Config
          </Link>
          <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
        </div>
      </div>

      {/* Main Grid: Chart & Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <PriceChart currentPrice={currentPrice} events={events} />
        </div>
        <div className="lg:col-span-4">
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

      {/* Demo Controls */}
      <div className="bg-surface rounded-xl border border-border/80 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Interactive Test Actions
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Feed: {priceSource}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => nudgePrice(-25)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-xs text-emerald-400 border border-border transition"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Drop Price -$25
          </button>

          <button
            type="button"
            onClick={() => nudgePrice(+25)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-surface-elevated hover:bg-slate-800 text-xs text-rose-400 border border-border transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Raise Price +$25
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
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-xs text-blue-300 border border-blue-500/20 transition"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            Small Trade (0.4 ETH)
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
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-xs text-amber-300 border border-amber-500/20 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Large Trade (0.8 ETH)
          </button>

          <button
            type="button"
            onClick={() =>
              simulateTrade({
                amount: 3.5,
                price: currentPrice,
                status: 'REJECTED',
                reason: 'Exceeds max per-trade spend cap (1.5 ETH)'
              })
            }
            className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-xs text-rose-300 border border-rose-500/20 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Over-Cap (3.5 ETH)
          </button>
        </div>
      </div>

      {/* Trade History */}
      <div className="bg-surface rounded-xl border border-border/80 p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <h3 className="text-xs font-semibold text-slate-300">
            Execution Log
          </h3>
          <div className="text-xs text-slate-400 font-mono">
            Total Spent: <span className="text-emerald-400 font-medium">{totalVolume.toFixed(2)} ETH</span>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No trades executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-border/60 font-mono text-[11px]">
                <tr>
                  <th className="pb-2 font-normal">Time</th>
                  <th className="pb-2 font-normal">ID</th>
                  <th className="pb-2 font-normal">Side</th>
                  <th className="pb-2 font-normal">Size</th>
                  <th className="pb-2 font-normal">Price</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 font-normal">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {events.map((e, idx) => (
                  <tr key={`${e.tradeId}-${idx}`} className="hover:bg-surface-elevated/30 transition">
                    <td className="py-2 text-slate-400">
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 text-slate-300">#{e.tradeId}</td>
                    <td className="py-2 text-emerald-400">{e.action}</td>
                    <td className="py-2 text-white">{e.amount} ETH</td>
                    <td className="py-2 text-slate-300">${e.price.toFixed(2)}</td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          e.status === 'EXECUTED' || e.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : e.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : e.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400 text-[11px] truncate max-w-xs">
                      {e.reason || (e.txHash ? `${e.txHash.slice(0, 8)}...${e.txHash.slice(-6)}` : 'On-chain verified')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApprovalModal
        pendingTrades={pendingTrades}
        onApprove={approveTrade}
        onReject={rejectTrade}
      />
    </div>
  );
}
