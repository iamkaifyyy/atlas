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
  Sparkles,
  BarChart3,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useBackpackTicker } from '../hooks/useBackpackTicker';

export default function HomePage() {
  const { address, balance, isConnected, isConnecting, connect, connectDemoWallet, disconnect } = useWallet();
  const backpack = useBackpackTicker('ETH_USDC');

  return (
    <div className="py-6 space-y-16 max-w-6xl mx-auto">
      {/* HERO POSTER SECTION (Framer Design System: Bold Display + Tight Negative Tracking) */}
      <div className="text-center space-y-6 pt-8 pb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface-1 border border-hairline text-ink-muted text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Decentralized Execution • EVM Hard Escrow • Backpack Orderbook</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-[-0.04em] text-white leading-[0.95] max-w-4xl mx-auto">
          The Autonomous Crypto Platform <br />
          <span className="text-ink-muted">With On-Chain Hard Limits.</span>
        </h1>

        <p className="text-base sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-normal">
          Program algorithmic execution rules, stream institutional liquidity from Backpack Exchange, and enforce non-custodial spend ceilings in EVM smart contracts.
        </p>

        {/* Action CTAs: White Pill + Charcoal Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/terminal"
            className="framer-btn-primary"
          >
            <LineChart className="w-4 h-4" />
            <span>Launch Trade Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/markets"
            className="framer-btn-secondary"
          >
            <BarChart3 className="w-4 h-4 text-ink-muted" />
            <span>Explore Markets</span>
          </Link>

          <Link
            href="/vault"
            className="framer-btn-secondary"
          >
            <Lock className="w-4 h-4 text-ink-muted" />
            <span>Escrow Vault</span>
          </Link>
        </div>
      </div>

      {/* LIVE MARKET STATS TICKER STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="framer-card p-4 space-y-1">
          <div className="text-[11px] font-mono text-ink-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
            <span>BACKPACK ETH / USDC</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ${backpack.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-semantic-success flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {backpack.priceChangePercent.toFixed(2)}% (24h)
          </div>
        </div>

        <div className="framer-card p-4 space-y-1">
          <div className="text-[11px] font-mono text-ink-muted">ESCROW COLLATERAL</div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            0.20 ETH
          </div>
          <div className="text-[11px] font-mono text-ink-muted">
            5.00 ETH Programmatic Cap
          </div>
        </div>

        <div className="framer-card p-4 space-y-1">
          <div className="text-[11px] font-mono text-ink-muted">24H DEX VOLUME</div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            ${(backpack.quoteVolume24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] font-mono text-ink-muted">
            {backpack.volume24h.toFixed(1)} ETH Executed
          </div>
        </div>

        <div className="framer-card p-4 space-y-1">
          <div className="text-[11px] font-mono text-ink-muted">MATCHING ENGINE</div>
          <div className="text-2xl font-bold font-mono text-semantic-success tracking-tight">
            &lt; 1.2 ms
          </div>
          <div className="text-[11px] font-mono text-ink-muted">
            Price-Time Priority
          </div>
        </div>
      </div>

      {/* SIGNATURE GRADIENT SPOTLIGHT CARDS (from DESIGN.md) */}
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-widest text-ink-muted font-mono font-semibold">
          Platform Architecture & Living Tiles
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tile 1: Violet Spotlight Card */}
          <div className="framer-spotlight-violet p-7 flex flex-col justify-between space-y-8 group transition duration-300 hover:border-gradient-violet">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Backpack DEX Liquidity
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed font-normal">
                Direct WebSocket & REST pipeline to Backpack Exchange with Level 2 orderbook depth, historical candlestick klines, and sub-second price updates.
              </p>
            </div>
            <Link
              href="/terminal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition"
            >
              <span>Explore Trading Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tile 2: Magenta Spotlight Card */}
          <div className="framer-spotlight-magenta p-7 flex flex-col justify-between space-y-8 group transition duration-300 hover:border-gradient-magenta">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                On-Chain Risk Caps
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed font-normal">
                Smart contract escrow limits enforcing single-trade caps, lifetime spending limits, and emergency 1-click refund kill switches on EVM.
              </p>
            </div>
            <Link
              href="/vault"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition"
            >
              <span>Inspect Escrow Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tile 3: Orange Spotlight Card */}
          <div className="framer-spotlight-orange p-7 flex flex-col justify-between space-y-8 group transition duration-300 hover:border-gradient-orange">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Autonomous Algo Studio
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed font-normal">
                Assemble automated trading triggers with 3 visual primitives: Price Triggers, Spend Ceilings, and Human-in-the-loop Approval Thresholds.
              </p>
            </div>
            <Link
              href="/automation"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition"
            >
              <span>Configure Algo Bots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAST ONBOARDING WALLET CARD */}
      <div className="max-w-xl mx-auto framer-card p-6 space-y-5 border border-hairline">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-sm font-bold text-white">Instant Account & Collateral</h3>
              <p className="text-xs text-ink-muted">Connect your web3 wallet or launch with pre-funded demo assets</p>
            </div>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs text-semantic-success font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
              Ready
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-surface-2 rounded-lg p-3 border border-hairline space-y-1">
              <div className="text-[11px] text-ink-muted">Account Address</div>
              <div className="text-white truncate font-medium">{address}</div>
              <div className="text-[11px] text-ink-muted pt-1">
                Collateral Balance: <strong className="text-semantic-success">{balance} ETH</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/terminal"
                className="framer-btn-primary !w-full justify-center text-xs"
              >
                Go to Terminal
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={disconnect}
                className="framer-btn-secondary !w-full justify-center text-xs"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={connectDemoWallet}
              className="w-full framer-btn-primary justify-center text-xs"
            >
              <Zap className="w-4 h-4 text-black" />
              <span>Launch with Pre-Funded Demo Account (100 ETH)</span>
            </button>

            <button
              type="button"
              onClick={connect}
              disabled={isConnecting}
              className="w-full framer-btn-secondary justify-center text-xs disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask / Browser Wallet'}</span>
            </button>
          </div>
        )}
      </div>

      {/* EXECUTION LIFECYCLE GRID */}
      <div className="framer-card p-7 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Guarded Execution Lifecycle
          </h3>
          <p className="text-xs text-ink-muted">
            How Atlas processes signals from Backpack DEX through EVM escrow into the matching engine
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-surface-2 p-4 rounded-lg border border-hairline space-y-1.5">
            <div className="text-white font-bold">01. TRIGGER</div>
            <div className="text-ink text-[11px]">Backpack DEX Feed</div>
            <p className="text-[10px] text-ink-muted">
              Evaluates live ETH/USDC price conditions against bot strategy rules.
            </p>
          </div>

          <div className="bg-surface-2 p-4 rounded-lg border border-hairline space-y-1.5">
            <div className="text-semantic-success font-bold">02. CAP CHECK</div>
            <div className="text-ink text-[11px]">Smart Contract Escrow</div>
            <p className="text-[10px] text-ink-muted">
              Verifies order does not breach per-trade ceiling or total spend limit.
            </p>
          </div>

          <div className="bg-surface-2 p-4 rounded-lg border border-hairline space-y-1.5">
            <div className="text-accent-amber font-bold">03. APPROVAL</div>
            <div className="text-ink text-[11px]">Human Confirmation</div>
            <p className="text-[10px] text-ink-muted">
              High-value trades (&gt; 0.5 ETH) pause for cryptographic signature.
            </p>
          </div>

          <div className="bg-surface-2 p-4 rounded-lg border border-hairline space-y-1.5">
            <div className="text-white font-bold">04. SETTLEMENT</div>
            <div className="text-ink text-[11px]">Matching Engine</div>
            <p className="text-[10px] text-ink-muted">
              Atomic fill on orderbook with verified on-chain event emission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
