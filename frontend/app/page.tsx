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
import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center space-y-5 pt-1 sm:pt-2 pb-6"
      >
        {/* Holographic Watermark Graphic Shape centered behind the hero title */}
        <WatermarkShape className="opacity-90" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2"
        >
          <span className="cohere-chip-coral shadow-lg shadow-coral/10 backdrop-blur-md">
            QUANTITATIVE AI PROTOCOL 2026
          </span>
          <span className="font-mono text-[11px] text-muted hidden sm:inline">
            // CONTROLLED ENTERPRISE EXECUTION
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl lg:text-8xl font-normal tracking-[-0.04em] text-white leading-[0.98] max-w-5xl mx-auto"
        >
          Autonomous Crypto Intelligence. <br />
          <span className="text-zinc-400">Bounded by Smart Contracts.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Direct Level 2 orderbook feeds from Backpack Exchange, sub-millisecond execution, and non-custodial EVM escrow limits that no algorithm can bypass.
        </motion.p>

        {/* Primary and secondary actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/terminal"
              className="cohere-btn-primary shadow-xl hover:shadow-white/20 transition-all duration-200"
            >
              <LineChart className="w-4 h-4" />
              <span>Launch Trading Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/markets"
              className="cohere-btn-outline transition-all duration-200 backdrop-blur-md"
            >
              <BarChart3 className="w-4 h-4 text-muted" />
              <span>Live Asset Screener</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/vault"
              className="cohere-btn-secondary transition-all duration-200"
            >
              <span>Inspect Escrow Architecture</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 3. Protocol infrastructure strip (Animated) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.6 }}
        className="text-center space-y-4 py-6 border-y border-console-border/40 relative backdrop-blur-sm"
      >
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
      </motion.div>

      {/* 4. Live market metrics (Framer Motion Staggered Hover Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <motion.div
          whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(255, 119, 89, 0.5)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="cohere-card-console p-5 space-y-1.5 shadow-md group cursor-pointer"
        >
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
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.5)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="cohere-card-console p-5 space-y-1.5 shadow-md group cursor-pointer"
        >
          <div className="text-[11px] text-muted">COLLATERAL ESCROW</div>
          <div className="text-3xl font-semibold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
            0.20 ETH
          </div>
          <div className="text-xs text-muted">
            5.00 ETH Hard Cap
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(24, 99, 220, 0.5)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="cohere-card-console p-5 space-y-1.5 shadow-md group cursor-pointer"
        >
          <div className="text-[11px] text-muted">24H BACKPACK VOLUME</div>
          <div className="text-3xl font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors">
            ${(backpack.quoteVolume24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-muted">
            {backpack.volume24h.toFixed(1)} ETH Volume
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -6, scale: 1.02, borderColor: 'rgba(52, 211, 153, 0.5)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="cohere-card-console p-5 space-y-1.5 shadow-md group cursor-pointer"
        >
          <div className="text-[11px] text-muted">MATCHING LATENCY</div>
          <div className="text-3xl font-semibold text-emerald-400 tracking-tight">
            &lt; 1.2 ms
          </div>
          <div className="text-xs text-muted">
            In-Memory FIFO Engine
          </div>
        </motion.div>
      </div>

      {/* 5. Feature Focus Bands (Framer Motion Animated Hover) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liquidity feed band */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="cohere-band-green p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xl"
        >
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/terminal"
                className="cohere-btn-primary !bg-white !text-[#003c33] transition-transform"
              >
                <span>Open Pro Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <span className="font-mono text-xs text-emerald-200">REST & WS v1</span>
          </div>
        </motion.div>

        {/* Security vault band */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="cohere-band-navy p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xl"
        >
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/vault"
                className="cohere-btn-primary !bg-white !text-[#071829] transition-transform"
              >
                <span>Inspect Security Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <span className="font-mono text-xs text-slate-300">EVM Anvil Verified</span>
          </div>
        </motion.div>
      </div>

      {/* 6. Account Onboarding Card (Framer Motion Animated) */}
      <motion.div
        layout
        className="max-w-2xl mx-auto cohere-card-console p-8 space-y-6 shadow-2xl border border-console-border"
      >
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
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </motion.span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isConnected ? (
            <motion.div
              key="connected-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 font-mono text-xs"
            >
              <div className="bg-console-elevated rounded-xl p-4 border border-console-border space-y-1.5">
                <div className="text-muted text-[11px]">Authorized Signer Account</div>
                <div className="text-white truncate font-medium">{address}</div>
                <div className="text-muted text-[11px] pt-1">
                  Vault Collateral: <strong className="text-emerald-400">{balance} ETH</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/terminal"
                    className="cohere-btn-primary !w-full justify-center text-xs shadow-lg"
                  >
                    Launch Terminal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={disconnect}
                  className="cohere-btn-outline !w-full justify-center text-xs hover:border-rose-500/50 hover:text-rose-400 transition"
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="disconnected-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={connectDemoWallet}
                className="w-full cohere-btn-primary justify-center text-xs !py-3 shadow-lg"
              >
                <Zap className="w-4 h-4 text-console-surface" />
                <span>Launch with Pre-Funded Demo Account (100 ETH)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={connect}
                disabled={isConnecting}
                className="w-full cohere-btn-outline justify-center text-xs !py-3 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 text-muted" />
                <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask / Hardware Wallet'}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

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
          {[
            {
              num: '01. INGESTION',
              title: 'Backpack L2 Feed',
              desc: 'Real-time tick data streaming over low-latency WebSockets.',
              accent: 'text-coral',
              borderHover: 'rgba(255, 119, 89, 0.4)'
            },
            {
              num: '02. VERIFICATION',
              title: 'Escrow Caps',
              desc: 'Verifies order does not breach per-trade ceiling or total spend limit.',
              accent: 'text-emerald-400',
              borderHover: 'rgba(16, 185, 129, 0.4)'
            },
            {
              num: '03. HUMAN GATE',
              title: 'Approval Check',
              desc: 'Trades exceeding 0.5 ETH pause for cryptographic owner sign-off.',
              accent: 'text-amber-400',
              borderHover: 'rgba(245, 158, 11, 0.4)'
            },
            {
              num: '04. SETTLEMENT',
              title: 'Matching Engine',
              desc: 'Atomic fill on orderbook with verified on-chain event emission.',
              accent: 'text-white',
              borderHover: 'rgba(255, 255, 255, 0.4)'
            }
          ].map((stage, idx) => (
            <motion.div
              key={stage.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, borderColor: stage.borderHover }}
              className="bg-console-elevated p-5 rounded-xl border border-console-border space-y-2 cursor-pointer transition-colors"
            >
              <div className={`${stage.accent} font-semibold`}>{stage.num}</div>
              <div className="text-white text-sm font-medium">{stage.title}</div>
              <p className="text-muted text-[11px] leading-relaxed">
                {stage.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
