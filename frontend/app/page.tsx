'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart,
  SlidersHorizontal,
  Lock,
  ArrowRight,
  TrendingUp,
  Wallet,
  Zap,
  BarChart3,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Terminal,
  Activity,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';
import { WatermarkShape } from '../components/WatermarkShape';

export default function HomePage() {
  const { address, balance, isConnected, isConnecting, connect, connectDemoWallet, disconnect } = useWallet();
  const backpack = useBackpackTicker('ETH_USDC');

  return (
    <div className="relative pt-1 pb-8 space-y-20 max-w-6xl mx-auto">
      {/* 
        1. Stretched Background Hero Canvas: 
        Extends to the very top behind the navbar with animated ambient gradients & cybernetic grid
      */}
      <div className="fixed inset-x-0 top-0 h-[920px] pointer-events-none overflow-hidden -z-20">
        {/* Glowing radial gradient orbs */}
        <div className="absolute -top-[140px] left-1/2 -translate-x-1/2 w-[1300px] h-[720px] bg-gradient-to-b from-coral/20 via-emerald-500/10 to-transparent blur-[140px] opacity-75 animate-pulse-glow" />
        <div className="absolute top-[60px] -left-[240px] w-[650px] h-[650px] bg-action-blue/20 blur-[150px] rounded-full animate-float" />
        <div className="absolute top-[40px] -right-[240px] w-[650px] h-[650px] bg-coral/15 blur-[150px] rounded-full animate-float animation-delay-200" />
        
        {/* Cybernetic High-Tech Dot Matrix Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a351f_1px,transparent_1px),linear-gradient(to_bottom,#2a2a351f_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* 2. Hero section with Watermark Graphic Shape behind text */}
      <section className="relative text-center space-y-5 pt-1 sm:pt-2 pb-6">
        {/* Holographic Watermark Graphic Shape centered behind the hero title */}
        <WatermarkShape className="opacity-90" />

        <div className="inline-flex items-center gap-2 animate-fade-in-up">
          <span className="cohere-chip-coral shadow-lg shadow-coral/10 backdrop-blur-md">
            QUANTITATIVE AI PROTOCOL 2026
          </span>
          <span className="font-mono text-[11px] text-muted hidden sm:inline">
            // CONTROLLED ENTERPRISE EXECUTION
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-[-0.04em] text-white leading-[0.98] max-w-5xl mx-auto animate-fade-in-up animation-delay-100">
          Autonomous Crypto Intelligence. <br />
          <span className="text-zinc-400">Bounded by Smart Contracts.</span>
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal animate-fade-in-up animation-delay-200">
          Direct Level 2 orderbook feeds from Backpack Exchange, sub-millisecond execution, and non-custodial EVM escrow limits that no algorithm can bypass.
        </p>

        {/* Primary and secondary actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 animate-fade-in-up animation-delay-300">
          <Link
            href="/terminal"
            className="cohere-btn-primary shadow-xl hover:shadow-white/20 hover:scale-105 transition-all duration-200"
          >
            <LineChart className="w-4 h-4" />
            <span>Launch Trading Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/markets"
            className="cohere-btn-outline hover:scale-105 transition-all duration-200 backdrop-blur-md"
          >
            <BarChart3 className="w-4 h-4 text-muted" />
            <span>Live Asset Screener</span>
          </Link>

          <Link
            href="/vault"
            className="cohere-btn-secondary hover:scale-105 transition-all duration-200"
          >
            <span>Inspect Escrow Architecture</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Protocol infrastructure strip (Animated) */}
      <div className="text-center space-y-4 py-6 border-y border-console-border/40 relative backdrop-blur-sm animate-fade-in-up animation-delay-400">
        <div className="font-mono text-[11px] uppercase tracking-[0.28px] text-muted flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-coral animate-pulse" />
          <span>INTEGRATED PROTOCOL STANDARDS & INFRASTRUCTURE</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-80 hover:opacity-100 transition-opacity font-mono text-xs text-white">
          <span className="flex items-center gap-2 hover:text-emerald-400 transition cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            BACKPACK L2 API
          </span>
          <span className="hover:text-action-blue transition cursor-default">ETHEREUM EVM</span>
          <span className="hover:text-emerald-400 transition cursor-default">ANVIL LOCALNET 31337</span>
          <span className="hover:text-coral transition cursor-default">NON-CUSTODIAL ESCROW</span>
          <span className="hover:text-zinc-200 transition cursor-default">LIGHTWEIGHT CHARTS PRO</span>
        </div>
      </div>

      {/* 4. Live market metrics (Animated Hover Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="cohere-card-console p-5 space-y-1.5 hover:-translate-y-1.5 hover:border-coral/40 transition-all duration-300 shadow-md hover:shadow-coral/10 group">
          <div className="text-[11px] text-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ETH / USDC (BACKPACK)
            </span>
            <span className="text-coral text-[10px] font-bold">LIVE</span>
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            ${backpack.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-400 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +{backpack.priceChangePercent.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5 hover:-translate-y-1.5 hover:border-emerald-500/40 transition-all duration-300 shadow-md hover:shadow-emerald-500/10 group">
          <div className="text-[11px] text-muted">COLLATERAL ESCROW</div>
          <div className="text-3xl font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            0.20 ETH
          </div>
          <div className="text-xs text-muted">
            5.00 ETH Hard Cap
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5 hover:-translate-y-1.5 hover:border-action-blue/40 transition-all duration-300 shadow-md hover:shadow-action-blue/10 group">
          <div className="text-[11px] text-muted">24H BACKPACK VOLUME</div>
          <div className="text-3xl font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors">
            ${(backpack.quoteVolume24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-muted">
            {backpack.volume24h.toFixed(1)} ETH Volume
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5 hover:-translate-y-1.5 hover:border-emerald-400/40 transition-all duration-300 shadow-md hover:shadow-emerald-400/10 group">
          <div className="text-[11px] text-muted">MATCHING LATENCY</div>
          <div className="text-3xl font-semibold text-emerald-400 tracking-tight">
            &lt; 1.2 ms
          </div>
          <div className="text-xs text-muted">
            In-Memory FIFO Engine
          </div>
        </div>
      </div>

      {/* 5. Feature Focus Bands (Animated Hover) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liquidity feed band */}
        <div className="cohere-band-green p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-emerald-950/40">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="cohere-chip-coral !bg-white/10 !text-white !border-white/20">
                LIQUIDITY PIPELINE
              </span>
            </div>
            <h3 className="text-3xl font-normal tracking-[-0.03em] text-white">
              Backpack Exchange High-Frequency Feed
            </h3>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-normal">
              Direct Level 2 orderbook depth, historical candlestick klines, and sub-second price streaming integrated with a full TradingView-style studio and technical indicators.
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-400/20 flex items-center justify-between">
            <Link
              href="/terminal"
              className="cohere-btn-primary !bg-white !text-[#003c33] hover:scale-105 transition-transform"
            >
              <span>Open Pro Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-emerald-200">REST & WS v1</span>
          </div>
        </div>

        {/* Security vault band */}
        <div className="cohere-band-navy p-8 sm:p-10 flex flex-col justify-between space-y-8 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-slate-950/40">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="cohere-chip-coral !bg-white/10 !text-white !border-white/20">
                PROGRAMMATIC RISK
              </span>
            </div>
            <h3 className="text-3xl font-normal tracking-[-0.03em] text-white">
              Smart Contract Escrow & Safety Ceilings
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              EVM-enforced spending limits, single-order size constraints, and human-in-the-loop approval thresholds for high-volume transactions with emergency on-chain refund switch.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <Link
              href="/vault"
              className="cohere-btn-primary !bg-white !text-[#071829] hover:scale-105 transition-transform"
            >
              <span>Inspect Security Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-slate-300">EVM Anvil Verified</span>
          </div>
        </div>
      </div>

      {/* 6. Account Onboarding Card (Animated) */}
      <div className="max-w-2xl mx-auto cohere-card-console p-8 space-y-6 hover:border-console-border/80 transition-colors shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-console-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-console-elevated flex items-center justify-center text-white border border-console-border">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Collateral & Account Access</h3>
              <p className="text-xs text-muted">Connect browser Web3 wallet or instant pre-funded sandbox</p>
            </div>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-console-elevated rounded-xl p-4 border border-console-border space-y-1.5">
              <div className="text-muted text-[11px]">Authorized Signer Account</div>
              <div className="text-white truncate font-medium">{address}</div>
              <div className="text-muted text-[11px] pt-1">
                Vault Collateral: <strong className="text-emerald-400">{balance} ETH</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                href="/terminal"
                className="cohere-btn-primary !w-full justify-center text-xs hover:scale-[1.02] transition-transform"
              >
                Launch Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={disconnect}
                className="cohere-btn-outline !w-full justify-center text-xs hover:border-rose-500/50 hover:text-rose-400 transition"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={connectDemoWallet}
              className="w-full cohere-btn-primary justify-center text-xs !py-3 hover:scale-[1.02] transition-transform shadow-lg"
            >
              <Zap className="w-4 h-4 text-console-surface" />
              <span>Launch with Pre-Funded Demo Account (100 ETH)</span>
            </button>

            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="w-full cohere-btn-outline justify-center text-xs !py-3 disabled:opacity-50 hover:scale-[1.02] transition-transform"
            >
              <Wallet className="w-4 h-4 text-muted" />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask / Hardware Wallet'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 7. Execution Pipeline (4-Stage Animated Architecture Cards) */}
      <div className="cohere-card-console p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-console-border">
          <div>
            <h3 className="text-lg font-normal text-white tracking-tight">
              Guarded Execution Pipeline
            </h3>
            <p className="text-xs text-muted">
              Atomic verification flow from Backpack market feeds to EVM smart contract settlement
            </p>
          </div>
          <span className="cohere-chip-coral self-start sm:self-auto text-[10px]">
            EVM VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2 hover:-translate-y-1 hover:border-coral/40 transition-all duration-300">
            <div className="text-coral font-semibold">01. INGESTION</div>
            <div className="text-white text-sm font-medium">Backpack L2 Feed</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Real-time tick data streaming over low-latency WebSockets.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2 hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-300">
            <div className="text-emerald-400 font-semibold">02. VERIFICATION</div>
            <div className="text-white text-sm font-medium">Escrow Caps</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Verifies order does not breach per-trade ceiling or total spend limit.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2 hover:-translate-y-1 hover:border-amber-400/40 transition-all duration-300">
            <div className="text-amber-400 font-semibold">03. HUMAN GATE</div>
            <div className="text-white text-sm font-medium">Approval Check</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Trades exceeding 0.5 ETH pause for cryptographic owner sign-off.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2 hover:-translate-y-1 hover:border-white/40 transition-all duration-300">
            <div className="text-white font-semibold">04. SETTLEMENT</div>
            <div className="text-white text-sm font-medium">Matching Engine</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Atomic fill on orderbook with verified on-chain event emission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
