'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { TradeEventPayload } from '../../shared/types/agentConfig';

interface ApprovalModalProps {
  pendingTrades: TradeEventPayload[];
  onApprove: (tradeId: string) => Promise<boolean>;
  onReject: (tradeId: string) => Promise<boolean>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  pendingTrades,
  onApprove,
  onReject
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!pendingTrades || pendingTrades.length === 0) return null;

  const currentTrade = pendingTrades[0];

  const handleApprove = async () => {
    setProcessingId(currentTrade.tradeId);
    await onApprove(currentTrade.tradeId);
    setProcessingId(null);
  };

  const handleReject = async () => {
    setProcessingId(currentTrade.tradeId);
    await onReject(currentTrade.tradeId);
    setProcessingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="cohere-card-console border border-cohere-coral/40 p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cohere-coral/10 text-cohere-coral border border-cohere-coral/30">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="cohere-chip-coral text-[10px]">ESCROW VERIFICATION</span>
            </div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Trade Approval Required
            </h3>
            <p className="text-xs text-text-muted mt-0.5 font-sans">
              This order exceeds your manual approval cap.
            </p>
          </div>
        </div>

        <div className="bg-console-elevated rounded-xl p-3.5 border border-console-border space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted font-mono uppercase text-[11px]">Asset Pair</span>
            <span className="font-mono text-white">ETH/USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted font-mono uppercase text-[11px]">Requested Size</span>
            <span className="font-mono font-medium text-white">{currentTrade.amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted font-mono uppercase text-[11px]">Execution Price</span>
            <span className="font-mono text-white">${currentTrade.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-console-border pt-2">
            <span className="text-text-muted font-mono uppercase text-[11px]">Escrow Value</span>
            <span className="font-mono font-semibold text-emerald-400">
              ${(currentTrade.amount * currentTrade.price).toFixed(2)} USDC
            </span>
          </div>
        </div>

        <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-500/30 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            HUMAN SUPERVISION REQUIRED
          </div>
          <p className="text-[11px] text-zinc-300">
            Biometric verification credential required to release escrow capital for trades &gt; 0.5 ETH.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleReject}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-console-elevated hover:bg-surface-elevated text-text-secondary hover:text-white text-xs border border-console-border transition disabled:opacity-50 font-mono tracking-wide"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            REJECT
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono tracking-wide transition disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle className="w-3.5 h-3.5 text-black" />
            {processingId === currentTrade.tradeId ? 'VERIFYING...' : 'BIOMETRIC VERIFY'}
          </button>
        </div>
      </div>
    </div>
  );
};
