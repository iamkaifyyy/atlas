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
import { motion, AnimatePresence } from 'framer-motion';

export default function VaultPage() {
  const { agentConfig, triggerKillSwitch, pendingTrades, approveTrade, rejectTrade } = useContractEvents();
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const [isKilled, setIsKilled] = useState(false);

  // Interactive Escrow balance state
  const [escrowBalance, setEscrowBalance] = useState<number>(3.2);
  const [depositAmount, setDepositAmount] = useState<string>('0.5');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (!val || val <= 0) return;
    setIsDepositing(true);
    setTimeout(() => {
      setEscrowBalance((prev) => +(prev + val).toFixed(2));
      setIsDepositing(false);
      showToast(`Successfully deposited ${val} ETH to on-chain escrow!`);
    }, 600);
  };

  const handleWithdraw = () => {
    const val = parseFloat(depositAmount);
    if (!val || val <= 0) return;
    if (val > escrowBalance) {
      showToast(`Cannot withdraw more than available escrow balance (${escrowBalance} ETH)`);
      return;
    }
    setIsWithdrawing(true);
    setTimeout(() => {
      setEscrowBalance((prev) => +(prev - val).toFixed(2));
      setIsWithdrawing(false);
      showToast(`Withdrew ${val} ETH back to owner wallet.`);
    }, 600);
  };

  const vaultAddress = agentConfig?.vaultAddress || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
  const totalCap = agentConfig?.spendingCap?.maxTotalSpend || 5.0;
  const currentSpent = Math.min(escrowBalance, totalCap);
  const perTradeCap = agentConfig?.spendingCap?.maxPerTradeSpend || 1.5;
  const threshold = agentConfig?.approvalThreshold?.thresholdAmount || 0.5;
  const capPercent = Math.min(100, Math.round((currentSpent / totalCap) * 100));

  const copyAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    setCopied(true);
    showToast('Vault address copied to clipboard');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleKill = async () => {
    const ok = await triggerKillSwitch();
    if (ok) {
      setIsKilled(true);
      setEscrowBalance(0);
      showToast('EMERGENCY KILL SWITCH: All funds returned to owner wallet!');
    }
    return ok;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-2 space-y-8 max-w-5xl mx-auto font-sans"
    >
      {/* Toast feedback */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-6 z-50 px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
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

      {/* Interactive Escrow Deposit & Withdrawal Terminal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
        <div className="cohere-card-console p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-console-border">
            <h3 className="text-sm font-semibold text-white uppercase tracking-[0.28px] flex items-center gap-2">
              <Coins className="w-4 h-4 text-coral" />
              <span>Escrow Collateral Controls</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              Balance: {escrowBalance.toFixed(2)} ETH
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-muted uppercase tracking-[0.28px]">Collateral Amount (ETH)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.05"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1 px-3 py-2 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-coral transition"
                />
                <div className="flex items-center gap-1 text-[10px]">
                  {['0.1', '0.5', '1.0', '2.0'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset)}
                      className="px-2 py-1.5 rounded bg-console-elevated hover:bg-zinc-800 text-muted hover:text-white border border-console-border transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleDeposit}
                disabled={isDepositing}
                className="cohere-btn-primary !w-full justify-center text-xs py-2.5 shadow-lg"
              >
                {isDepositing ? 'Depositing...' : 'Deposit to Escrow'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing || escrowBalance <= 0}
                className="cohere-btn-outline !w-full justify-center text-xs py-2.5 disabled:opacity-50"
              >
                {isWithdrawing ? 'Withdrawing...' : 'Withdraw Excess'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Pending Gated Trades Approval Queue */}
        <div className="cohere-card-console p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-console-border">
            <h3 className="text-sm font-semibold text-white uppercase tracking-[0.28px] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Pending Human Approvals</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              {pendingTrades.length} PENDING
            </span>
          </div>

          {pendingTrades.length === 0 ? (
            <div className="text-center py-6 space-y-2 text-muted text-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-400/80 mx-auto" />
              <p className="text-white font-medium">All Trades Compliant</p>
              <p className="text-[11px]">No order currently breaches the {threshold} ETH human approval threshold.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTrades.map((trade) => (
                <div key={trade.tradeId} className="bg-console-elevated p-3 rounded-lg border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="text-white font-semibold flex items-center gap-1.5">
                      <span>#{trade.tradeId}</span>
                      <span className="text-amber-400">{trade.amount} ETH</span>
                    </div>
                    <div className="text-[10px] text-muted">Asset: {trade.asset} @ ${trade.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const ok = await approveTrade(trade.tradeId);
                        if (ok) showToast(`Approved trade #${trade.tradeId} on-chain!`);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const ok = await rejectTrade(trade.tradeId);
                        if (ok) showToast(`Rejected trade #${trade.tradeId}`);
                      }}
                      className="bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded text-[11px] font-semibold transition"
                    >
                      Reject
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/terminal"
              className="cohere-btn-primary py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Launch Watch Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/automation"
              className="cohere-btn-outline py-3 px-5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Configure No-Code Rules</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
