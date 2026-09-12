'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Coins,
  ShieldCheck,
  Activity,
  AlertTriangle
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
    <div className="py-2 space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header Band: Cohere Dark Navy (#071829) */}
      <div className="cohere-band-navy p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="cohere-chip-coral !bg-white/10 !text-white !border-white/20">
              SMART CONTRACT ESCROW
            </span>
            <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">
              // ON-CHAIN VERIFIED
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            AgentVault Guard & Safety Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Non-custodial smart contract escrow on EVM enforcing hard programmatic limits that neither AI agents nor the backend can bypass.
          </p>
        </div>

        <KillSwitchButton onTrigger={handleKill} isKilled={isKilled} />
      </div>

      {/* Grid of Key Risk Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        {/* Total Spend Cap */}
        <div className="cohere-card-console p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Coins className="w-4 h-4 text-coral" />
              Lifetime Cap
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              {currentSpent} / {totalCap} ETH
            </span>
          </div>

          <div className="w-full bg-console-elevated rounded-full h-2 overflow-hidden border border-console-border">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                capPercent > 90 ? 'bg-rose-500' : capPercent > 75 ? 'bg-amber-500' : 'bg-white'
              }`}
              style={{ width: `${capPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-muted">
            <span>Utilization: {capPercent}%</span>
            <span>Remaining: {(totalCap - currentSpent).toFixed(2)} ETH</span>
          </div>
          <p className="text-xs text-muted leading-relaxed font-sans">
            Reverts transactions on-chain once cumulative agent spending reaches the {totalCap} ETH ceiling.
          </p>
        </div>

        {/* Per-Trade Cap */}
        <div className="cohere-card-console p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Shield className="w-4 h-4 text-emerald-400" />
              Single Trade Ceiling
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ENFORCED
            </span>
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            {perTradeCap} ETH
          </div>
          <p className="text-xs text-muted leading-relaxed font-sans">
            Restricts the maximum single order size. Any trade instruction larger than {perTradeCap} ETH is rejected instantly at the EVM contract level.
          </p>
        </div>

        {/* Human Approval Gate */}
        <div className="cohere-card-console p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Approval Threshold
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              GATED
            </span>
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            &gt; {threshold} ETH
          </div>
          <p className="text-xs text-muted leading-relaxed font-sans">
            Trades exceeding {threshold} ETH are held in an on-chain pending state until the wallet owner signs explicit approval.
          </p>
        </div>
      </div>

      {/* Contract Architecture Details */}
      <div className="cohere-card-console p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-console-border">
          <h3 className="text-sm font-semibold text-white uppercase tracking-[0.28px]">
            On-Chain Deployment Parameters
          </h3>
          <span className="cohere-chip-coral text-[10px]">
            CHAIN 31337
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1">
            <div className="text-muted text-[11px] uppercase tracking-[0.28px]">Contract Address</div>
            <div className="flex items-center justify-between text-white">
              <span className="truncate">{vaultAddress}</span>
              <button
                type="button"
                onClick={copyAddress}
                className="text-muted hover:text-white transition ml-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1">
            <div className="text-muted text-[11px] uppercase tracking-[0.28px]">Network & Chain ID</div>
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Anvil Localhost (Chain 31337)
            </div>
          </div>

          <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1">
            <div className="text-muted text-[11px] uppercase tracking-[0.28px]">Authorized Agent Signer</div>
            <div className="text-white truncate">
              0x70997970C51812dc3A010C7d01b50e0d17dc79C8
            </div>
          </div>

          <div className="bg-console-elevated p-3.5 rounded-lg border border-console-border space-y-1">
            <div className="text-muted text-[11px] uppercase tracking-[0.28px]">Contract Owner (Admin)</div>
            <div className="text-white truncate">
              0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <Link
            href="/terminal"
            className="cohere-btn-primary py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Launch Watch Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/automation"
            className="cohere-btn-outline py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <span>Configure No-Code Rules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
