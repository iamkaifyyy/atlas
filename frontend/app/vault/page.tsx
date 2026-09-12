'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Wallet,
  Coins,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useContractEvents } from '../../hooks/useContractEvents';
import { useWallet } from '../../hooks/useWallet';
import { KillSwitchButton } from '../../components/KillSwitchButton';

export default function VaultPage() {
  const { agentConfig, triggerKillSwitch } = useContractEvents();
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const [isKilled, setIsKilled] = useState(false);

  const vaultAddress = agentConfig?.vaultAddress || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
  const totalCap = agentConfig?.spendingCap?.maxTotalSpend || 5.0;
  const currentSpent = 4.8;
  const perTradeCap = agentConfig?.spendingCap?.maxPerTradeSpend || 1.5;
  const threshold = agentConfig?.approvalThreshold?.thresholdAmount || 0.5;
  const capPercent = Math.min(100, Math.round((currentSpent / totalCap) * 100));

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleKill = async () => {
    const ok = await triggerKillSwitch();
    if (ok) setIsKilled(true);
    return ok;
  };

  return (
    <div className="py-2 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-xl p-6 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-mono border border-blue-500/20">
            <Lock className="w-3 h-3" />
            <span>Smart Contract Escrow</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AgentVault Guard & Safety Controls
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Non-custodial smart contract escrow on EVM enforcing hard programmatic limits that no AI agent or backend can bypass.
          </p>
        </div>

        <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
      </div>

      {/* Grid of Key Risk Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spend Cap */}
        <div className="glass-panel rounded-xl p-5 border border-border/70 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Coins className="w-4 h-4 text-blue-400" />
              Cumulative Lifetime Cap
            </span>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              {currentSpent} / {totalCap} ETH
            </span>
          </div>

          <div className="w-full bg-surface-elevated rounded-full h-2.5 overflow-hidden border border-border/50">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                capPercent > 90 ? 'bg-rose-500 glow-rose' : capPercent > 75 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${capPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Utilization: {capPercent}%</span>
            <span>Remaining: {(totalCap - currentSpent).toFixed(2)} ETH</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Reverts transactions on-chain once cumulative agent spending reaches the {totalCap} ETH ceiling.
          </p>
        </div>

        {/* Per-Trade Cap */}
        <div className="glass-panel rounded-xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Shield className="w-4 h-4 text-emerald-400" />
              Single Trade Ceiling
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ENFORCED
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {perTradeCap} ETH
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Restricts the maximum single order size. Any trade instruction larger than {perTradeCap} ETH is rejected instantly at the EVM contract level.
          </p>
        </div>

        {/* Human Approval Gate */}
        <div className="glass-panel rounded-xl p-5 border border-border/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Human Approval Threshold
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              GATED
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            &gt; {threshold} ETH
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Trades exceeding {threshold} ETH are held in an on-chain pending state until the wallet owner signs explicit approval.
          </p>
        </div>
      </div>

      {/* Contract Architecture Details */}
      <div className="glass-panel rounded-xl p-5 border border-border/70 space-y-4">
        <h3 className="text-sm font-semibold text-white">On-Chain Deployment Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-surface-elevated/70 p-3 rounded-lg border border-border/50 space-y-1">
            <div className="text-slate-400 text-[11px]">Contract Address</div>
            <div className="flex items-center justify-between text-slate-200">
              <span className="truncate">{vaultAddress}</span>
              <button
                type="button"
                onClick={copyAddress}
                className="text-slate-400 hover:text-white transition ml-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-surface-elevated/70 p-3 rounded-lg border border-border/50 space-y-1">
            <div className="text-slate-400 text-[11px]">Network & Chain ID</div>
            <div className="text-emerald-400 font-semibold">
              Anvil Localhost (Chain 31337)
            </div>
          </div>

          <div className="bg-surface-elevated/70 p-3 rounded-lg border border-border/50 space-y-1">
            <div className="text-slate-400 text-[11px]">Authorized Agent Signer</div>
            <div className="text-slate-200 truncate">
              0x70997970C51812dc3A010C7d01b50e0d17dc79C8
            </div>
          </div>

          <div className="bg-surface-elevated/70 p-3 rounded-lg border border-border/50 space-y-1">
            <div className="text-slate-400 text-[11px]">Contract Owner (Admin)</div>
            <div className="text-slate-200 truncate">
              0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/terminal"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            <span>Launch Watch Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/automation"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-elevated hover:bg-slate-800 text-slate-300 font-medium text-xs border border-border transition"
          >
            <span>Configure No-Code Rules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
