'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  LineChart,
  Lock,
  Wallet,
  Coins,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  Code2
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';

export default function HomePage() {
  const { address, balance, isConnected, isConnecting, connect, connectDemoWallet, disconnect } = useWallet();
  const backpack = useBackpackTicker('ETH_USDC');

  return (
    <div className="py-6 space-y-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-5 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autonomous AI Agents • EVM Hard Caps • Backpack DEX</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Program Autonomous Trading Rules <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-emerald-300 to-zinc-400">
            With Hard On-Chain Safety Limits
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Set conditional triggers, enforce programmatic spend ceilings in smart contract escrow, and stream real-time liquidity from Backpack Exchange.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/terminal"
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition shadow-lg shadow-white/5"
          >
            <LineChart className="w-4 h-4 text-zinc-900" />
            <span>Launch Watch Terminal</span>
            <ArrowRight className="w-4 h-4 text-zinc-900" />
          </Link>
          <Link
            href="/automation"
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-surface-elevated hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-border transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>No-Code Automation</span>
          </Link>
          <Link
            href="/vault"
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-surface-elevated hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-border transition"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Escrow Vault</span>
          </Link>
        </div>
      </div>

      {/* Live Market & Protocol Ticker Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>BACKPACK ETH/USDC</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ${backpack.lastPrice.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {backpack.priceChangePercent.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400">ON-CHAIN ESCROW</div>
          <div className="text-xl font-bold font-mono text-white">
            0.20 ETH
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            5.00 ETH Hard Cap Ceil
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400">24H DEX VOLUME</div>
          <div className="text-xl font-bold font-mono text-white">
            ${(backpack.quoteVolume24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            {backpack.volume24h.toFixed(1)} ETH Traded
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-border/70 space-y-1">
          <div className="text-[11px] font-mono text-zinc-400">MATCHING ENGINE</div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            &lt; 1.2 ms
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            In-Memory Price-Time Priority
          </div>
        </div>
      </div>

      {/* Navigation Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Card 1: Watch Terminal */}
        <Link
          href="/terminal"
          className="group glass-panel rounded-2xl p-6 border border-border/80 hover:border-zinc-500/60 transition duration-300 space-y-4 hover:shadow-xl hover:shadow-white/5 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 group-hover:scale-105 transition">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-zinc-200 transition">
              Watch Terminal
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live trading desk featuring real-time Backpack Exchange candlestick charts, L2 Order Book depth, on-chain execution telemetry, and interactive simulation.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-white pt-2">
            <span>Enter Terminal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Card 2: No-Code Automation */}
        <Link
          href="/automation"
          className="group glass-panel rounded-2xl p-6 border border-border/80 hover:border-emerald-500/60 transition duration-300 space-y-4 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
              No-Code Automation
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Visually assemble autonomous rules with 3 simple primitives: Price Trigger, Spending & Risk Caps, and Human Approval Threshold with live JSON payload preview.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 pt-2">
            <span>Build Strategy</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Card 3: Escrow Vault */}
        <Link
          href="/vault"
          className="group glass-panel rounded-2xl p-6 border border-border/80 hover:border-amber-500/60 transition duration-300 space-y-4 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              Escrow Vault & Kill Switch
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Smart contract escrow running on EVM. Audit hard spending limits, verify on-chain balances, and access the emergency kill-switch to refund collateral.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 pt-2">
            <span>Inspect Vault</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>
      </div>

      {/* Wallet Connection Card */}
      <div className="max-w-md mx-auto glass-panel rounded-xl p-5 border border-border/80 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-zinc-300" />
            <h3 className="text-sm font-semibold text-white">Wallet Connection</h3>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Connected
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="bg-surface-elevated/70 rounded-lg p-3 border border-border/60 space-y-1 font-mono text-xs">
              <div className="text-[11px] text-zinc-400">Account</div>
              <div className="text-white truncate">{address}</div>
              <div className="text-[11px] text-zinc-400 pt-1">
                Balance: <span className="text-emerald-400 font-medium">{balance} ETH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/terminal"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition"
              >
                Go to Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={disconnect}
                className="py-2 px-3 rounded-lg bg-surface-elevated hover:bg-zinc-800 text-zinc-300 text-xs border border-border transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Metamask Wallet'}
            </button>

            <button
              type="button"
              onClick={connectDemoWallet}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-elevated hover:bg-zinc-800 text-zinc-300 text-xs border border-border transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Use Pre-Funded Demo Account (100 ETH)
            </button>
          </div>
        )}
      </div>

      {/* Protocol Architecture Workflow */}
      <div className="glass-panel rounded-2xl p-6 border border-border/70 space-y-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-center">
          Guarded Execution Lifecycle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-surface-elevated/70 p-4 rounded-xl border border-border/50 space-y-1.5 text-center">
            <div className="text-zinc-300 font-bold">01. TRIGGER</div>
            <div className="text-zinc-300 text-[11px]">Backpack DEX Feed</div>
            <p className="text-[10px] text-zinc-500">
              Evaluates ETH/USDC price condition (e.g. &lt; $3,050).
            </p>
          </div>

          <div className="bg-surface-elevated/70 p-4 rounded-xl border border-border/50 space-y-1.5 text-center">
            <div className="text-emerald-400 font-bold">02. CAP CHECK</div>
            <div className="text-zinc-300 text-[11px]">Smart Contract Escrow</div>
            <p className="text-[10px] text-zinc-500">
              Verifies order does not exceed single (1.5 ETH) or total spend limits.
            </p>
          </div>

          <div className="bg-surface-elevated/70 p-4 rounded-xl border border-border/50 space-y-1.5 text-center">
            <div className="text-amber-400 font-bold">03. APPROVAL</div>
            <div className="text-zinc-300 text-[11px]">Human-in-the-Loop</div>
            <p className="text-[10px] text-zinc-500">
              High-value trades (&gt; 0.5 ETH) pause for wallet confirmation.
            </p>
          </div>

          <div className="bg-surface-elevated/70 p-4 rounded-xl border border-border/50 space-y-1.5 text-center">
            <div className="text-zinc-400 font-bold">04. SETTLEMENT</div>
            <div className="text-zinc-300 text-[11px]">Matching Engine</div>
            <p className="text-[10px] text-zinc-500">
              Atomic fill on orderbook and on-chain event emission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
