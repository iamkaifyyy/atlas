'use client';

import React from 'react';
import Link from 'next/link';
import {
  LineChart,
  ArrowRight,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  Lock,
  Cpu,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { useBackpackTicker } from '../hooks/useBackpackTicker';
import { motion } from 'framer-motion';

export default function HomePage() {
  const backpack = useBackpackTicker('ETH_USDC');

  return (
    <div className="relative space-y-20 max-w-6xl mx-auto font-sans pt-4 pb-16">
      {/* 
        1. Expo.dev Soft Sky Atmospheric Wash (No pulsing glowing balls or fake dot matrix)
      */}
      <div className="absolute inset-x-0 top-0 h-[600px] pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(13,116,206,0.18),rgba(11,12,14,0))]" />

      {/* 2. Expo Hero Section */}
      <section className="text-center space-y-6 pt-6 sm:pt-10 pb-4">
        {/* Soft Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16171b] border border-[#23252c] text-xs font-mono text-zinc-300"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>ON-CHAIN QUANTITATIVE TRADING PROTOCOL</span>
        </motion.div>

        {/* Display Headline (Expo Display Mega style: Inter 600, tight tracking) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-white leading-[1.08] max-w-4xl mx-auto"
        >
          Build automated trading rules. <br />
          <span className="text-zinc-400">Enforce caps on-chain.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Real-time Level 2 orderbooks from Backpack Exchange, non-custodial EVM spending caps, and immutable Hedera HCS audit logging in a 60-second No-Code studio.
        </motion.p>

        {/* Expo Dual Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            href="/terminal"
            className="px-6 py-3 rounded-full bg-white text-[#0b0c0e] font-medium text-sm hover:bg-zinc-200 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <span>Launch Trading Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/automation"
            className="px-6 py-3 rounded-full bg-[#121316] border border-[#23252c] text-white font-medium text-sm hover:bg-[#1a1b20] hover:border-zinc-700 transition-all duration-200 flex items-center gap-2"
          >
            <span>Open Strategy Studio</span>
          </Link>

          <Link
            href="/vault"
            className="text-[#0d74ce] hover:underline font-medium text-sm flex items-center gap-1 px-3 py-2 transition"
          >
            <span>Inspect Escrow Architecture</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* 3. Expo Centered Terminal Composite Device Mockup */}
      <motion.section
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative"
      >
        <div className="bg-[#121316] border border-[#23252c] rounded-2xl shadow-2xl overflow-hidden p-1 sm:p-2">
          {/* Top Window Bar */}
          <div className="bg-[#0b0c0e] px-4 py-2.5 rounded-t-xl border-b border-[#23252c] flex items-center justify-between font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="pl-3 text-zinc-400 font-medium">atlas-terminal // eth_usdc.backpack</span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Backpack WS Live
              </span>
              <span>•</span>
              <span>Matching Engine: &lt; 0.9 ms</span>
            </div>
          </div>

          {/* Embedded Terminal Screen Preview */}
          <div className="bg-[#0b0c0e] p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-[#121316] p-4 rounded-xl border border-[#23252c]">
                <div className="text-zinc-500 text-[10px] uppercase">ETH/USDC Mark Price</div>
                <div className="text-2xl font-bold text-white mt-1">
                  ${backpack.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-emerald-400 text-xs mt-0.5">+{backpack.priceChangePercent.toFixed(2)}% (24h)</div>
              </div>

              <div className="bg-[#121316] p-4 rounded-xl border border-[#23252c]">
                <div className="text-zinc-500 text-[10px] uppercase">EVM Escrow Collateral</div>
                <div className="text-2xl font-bold text-white mt-1">0.20 ETH</div>
                <div className="text-zinc-400 text-xs mt-0.5">5.00 ETH Budget Ceiling</div>
              </div>

              <div className="bg-[#121316] p-4 rounded-xl border border-[#23252c]">
                <div className="text-zinc-500 text-[10px] uppercase">24h Backpack Volume</div>
                <div className="text-2xl font-bold text-white mt-1">
                  ${(backpack.quoteVolume24h / 1e6).toFixed(2)}M
                </div>
                <div className="text-zinc-400 text-xs mt-0.5">{backpack.volume24h.toFixed(1)} ETH</div>
              </div>

              <div className="bg-[#121316] p-4 rounded-xl border border-[#23252c]">
                <div className="text-zinc-500 text-[10px] uppercase">Hedera HCS Audit Log</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">Topic #0.0.48912</div>
                <div className="text-zinc-400 text-xs mt-0.5">100% Immutable Trail</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#121316] border border-[#23252c] font-mono text-xs">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-zinc-300">Active Rule: <strong className="text-white">ETH Momentum Guard (Dip Buyer)</strong></span>
              </div>
              <Link href="/terminal" className="text-blue-400 hover:underline flex items-center gap-1 font-sans">
                <span>View Full Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. Protocol Ecosystem Banner */}
      <section className="border-y border-[#23252c] py-6 text-center space-y-3 font-mono text-xs text-zinc-400">
        <div className="uppercase text-[10px] tracking-wider text-zinc-500">INTEGRATED PROTOCOL STANDARDS</div>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 font-medium text-white">
          <span className="hover:text-blue-400 transition cursor-default">BACKPACK L2</span>
          <span className="hover:text-blue-400 transition cursor-default">ETHEREUM EVM</span>
          <span className="hover:text-emerald-400 transition cursor-default">HEDERA HCS</span>
          <span className="hover:text-blue-400 transition cursor-default">1INCH AQUA</span>
          <span className="hover:text-blue-400 transition cursor-default">THE GRAPH</span>
          <span className="hover:text-blue-400 transition cursor-default">ENSv2 RESOLUTION</span>
        </div>
      </section>

      {/* 5. Expo Bento Feature Grid (Clean, Flat, Hairline Borders) */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold text-white tracking-tight">
            Institutional Infrastructure for Autonomous Agents
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Combining visual rule compilation with hard EVM smart contract guardrails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121316] border border-[#23252c] hover:border-zinc-700 rounded-2xl p-6 space-y-3 transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">TradingView Pro UI</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Real-time candlestick charts with custom drawing tools palette, technical indicators, and execution markers.
            </p>
          </div>

          <div className="bg-[#121316] border border-[#23252c] hover:border-zinc-700 rounded-2xl p-6 space-y-3 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Guarded EVM Escrow</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              On-chain spending ceilings (`AgentVault.sol`), single-trade caps, human-in-the-loop gating, and 1-click refund kill-switch.
            </p>
          </div>

          <div className="bg-[#121316] border border-[#23252c] hover:border-zinc-700 rounded-2xl p-6 space-y-3 transition-all">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white">Hedera HCS Audit Trail</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every trade signal, guardrail block, and emergency kill-switch event is logged immutably onto Hedera Consensus Service.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
