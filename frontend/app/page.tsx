'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Zap, Skull, Sliders, Wallet } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export default function LandingPage() {
  const { address, balance, isConnected, isConnecting, connect, connectDemoWallet, disconnect } = useWallet();

  return (
    <div className="space-y-12 py-8 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <span>ETH/USDC Automated Vault</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
          Program trading rules with <br className="hidden sm:inline" />
          hard on-chain safety limits
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Set your price trigger, cap total exposure in smart contract escrow, and gate high-value trades behind a human approval click.
        </p>
      </div>

      {/* Wallet Card */}
      <div className="max-w-md mx-auto bg-surface rounded-xl border border-border/80 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Wallet</h3>
          </div>
          {isConnected && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Connected
            </span>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="bg-surface-elevated/70 rounded-lg p-3 border border-border/60 space-y-1">
              <div className="text-[11px] text-slate-400">Account</div>
              <div className="font-mono text-xs text-white truncate">{address}</div>
              <div className="text-[11px] text-slate-400 pt-1">
                Balance: <span className="font-mono text-emerald-400 font-medium">{balance} ETH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/builder"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition"
              >
                Configure Rule
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={disconnect}
                className="py-2 px-3 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-300 text-xs border border-border transition"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>

            <button
              type="button"
              onClick={connectDemoWallet}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-300 text-xs border border-border transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Use Pre-Funded Demo Account
            </button>
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-surface rounded-xl border border-border/80 p-4 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Simple Rules</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Specify price condition, trade size, and thresholds. Generates clean, predictable JSON configs.
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border/80 p-4 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Escrow Caps</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Funds live in AgentVault. The agent cannot exceed your total spend ceiling or per-trade limits.
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border/80 p-4 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Skull className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-white">Kill Switch</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hit the emergency stop to immediately revoke agent permissions and return all escrowed funds to your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
