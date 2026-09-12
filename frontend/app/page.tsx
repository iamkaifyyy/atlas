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
  ShieldAlert
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';

export default function HomePage() {
  const { address, balance, isConnected, isConnecting, connect, connectDemoWallet, disconnect } = useWallet();
  const backpack = useBackpackTicker('ETH_USDC');

  return (
    <div className="py-8 space-y-20 max-w-6xl mx-auto">
      {/* 1. MONUMENTAL HERO DISPLAY (Cohere Editorial Style) */}
      <div className="text-center space-y-6 pt-10 pb-6">
        <div className="inline-flex items-center gap-2">
          <span className="cohere-chip-coral">
            QUANTITATIVE AI PROTOCOL 2026
          </span>
          <span className="font-mono text-[11px] text-muted hidden sm:inline">
            // CONTROLLED ENTERPRISE EXECUTION
          </span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-[-0.04em] text-white leading-[0.98] max-w-5xl mx-auto">
          Autonomous Crypto Intelligence. <br />
          <span className="text-muted">Bounded by Smart Contracts.</span>
        </h1>

        <p className="text-base sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed font-normal">
          Direct Level 2 orderbook feeds from Backpack Exchange, sub-millisecond execution, and non-custodial EVM escrow limits that no algorithm can bypass.
        </p>

        {/* Action CTAs: Cohere Primary Pill + Secondary Underline Link */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
          <Link
            href="/terminal"
            className="cohere-btn-primary"
          >
            <LineChart className="w-4 h-4" />
            <span>Launch Trading Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/markets"
            className="cohere-btn-outline"
          >
            <BarChart3 className="w-4 h-4 text-muted" />
            <span>Live Asset Screener</span>
          </Link>

          <Link
            href="/vault"
            className="cohere-btn-secondary"
          >
            <span>Inspect Escrow Architecture</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. TRUST-LOGO STRIP (Cohere Monochrome Trust Strip) */}
      <div className="text-center space-y-4 py-4 border-y border-console-border">
        <div className="font-mono text-xs uppercase tracking-[0.28px] text-muted">
          INTEGRATED PROTOCOL STANDARDS & INFRASTRUCTURE
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-75 grayscale hover:grayscale-0 transition font-mono text-xs text-white">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            BACKPACK L2 API
          </span>
          <span>ETHEREUM EVM</span>
          <span>ANVIL LOCALNET 31337</span>
          <span>NON-CUSTODIAL ESCROW</span>
          <span>LIGHTWEIGHT CHARTS PRO</span>
        </div>
      </div>

      {/* 3. LIVE MARKET METRICS STRIP (Cohere Dark Console Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="cohere-card-console p-5 space-y-1.5">
          <div className="text-[11px] text-muted flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ETH / USDC (BACKPACK)
            </span>
            <span className="text-coral text-[10px]">LIVE</span>
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            ${backpack.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-400 flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +{backpack.priceChangePercent.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5">
          <div className="text-[11px] text-muted">COLLATERAL ESCROW</div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            0.20 ETH
          </div>
          <div className="text-xs text-muted">
            5.00 ETH Hard Cap
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5">
          <div className="text-[11px] text-muted">24H BACKPACK VOLUME</div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            ${(backpack.quoteVolume24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-muted">
            {backpack.volume24h.toFixed(1)} ETH Volume
          </div>
        </div>

        <div className="cohere-card-console p-5 space-y-1.5">
          <div className="text-[11px] text-muted">MATCHING LATENCY</div>
          <div className="text-3xl font-semibold text-emerald-400 tracking-tight">
            &lt; 1.2 ms
          </div>
          <div className="text-xs text-muted">
            In-Memory FIFO Engine
          </div>
        </div>
      </div>

      {/* 4. DUAL ENTERPRISE FEATURE BANDS (Cohere Deep Green #003c33 & Dark Navy #071829) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Band 1: Deep Enterprise Green (#003c33) */}
        <div className="cohere-band-green p-8 sm:p-10 flex flex-col justify-between space-y-8">
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
              className="cohere-btn-primary !bg-white !text-[#003c33]"
            >
              <span>Open Pro Desk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-emerald-200">REST & WS v1</span>
          </div>
        </div>

        {/* Band 2: Dark Navy (#071829) */}
        <div className="cohere-band-navy p-8 sm:p-10 flex flex-col justify-between space-y-8">
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
              className="cohere-btn-primary !bg-white !text-[#071829]"
            >
              <span>Inspect Security Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="font-mono text-xs text-slate-300">EVM Anvil Verified</span>
          </div>
        </div>
      </div>

      {/* 5. FAST ONBOARDING WALLET CARD (Cohere Soft Stone or Console) */}
      <div className="max-w-2xl mx-auto cohere-card-console p-8 space-y-6">
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
                className="cohere-btn-primary !w-full justify-center text-xs"
              >
                Launch Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={disconnect}
                className="cohere-btn-outline !w-full justify-center text-xs"
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
              className="w-full cohere-btn-primary justify-center text-xs !py-3"
            >
              <Zap className="w-4 h-4 text-console-surface" />
              <span>Launch with Pre-Funded Demo Account (100 ETH)</span>
            </button>

            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="w-full cohere-btn-outline justify-center text-xs !py-3 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4 text-muted" />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask / Hardware Wallet'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. COHERE PUBLICATION-STYLE RESEARCH LIST (Execution Lifecycle) */}
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
          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2">
            <div className="text-coral font-semibold">01. INGESTION</div>
            <div className="text-white text-sm">Backpack L2 Feed</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Real-time tick data streaming over low-latency WebSockets.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2">
            <div className="text-emerald-400 font-semibold">02. VERIFICATION</div>
            <div className="text-white text-sm">Escrow Caps</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Verifies order does not breach per-trade ceiling or total spend limit.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2">
            <div className="text-amber-400 font-semibold">03. HUMAN GATE</div>
            <div className="text-white text-sm">Approval Check</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Trades exceeding 0.5 ETH pause for cryptographic owner sign-off.
            </p>
          </div>

          <div className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2">
            <div className="text-white font-semibold">04. SETTLEMENT</div>
            <div className="text-white text-sm">Matching Engine</div>
            <p className="text-muted text-[11px] leading-relaxed">
              Atomic fill on orderbook with verified on-chain event emission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
