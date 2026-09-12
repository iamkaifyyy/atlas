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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-surface border border-amber-500/60 rounded-xl p-5 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Trade Approval Required
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This order exceeds your manual approval threshold.
            </p>
          </div>
        </div>

        <div className="bg-surface-elevated rounded-lg p-3 border border-border/70 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Pair</span>
            <span className="font-mono text-slate-200">ETH/USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Amount</span>
            <span className="font-mono font-medium text-white">{currentTrade.amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Trigger Price</span>
            <span className="font-mono text-slate-200">${currentTrade.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-border/50 pt-1.5">
            <span className="text-slate-400">Total</span>
            <span className="font-mono font-semibold text-blue-400">
              ${(currentTrade.amount * currentTrade.price).toFixed(2)} USDC
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleReject}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-elevated hover:bg-slate-800 text-slate-300 text-xs border border-border transition disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Reject
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {processingId === currentTrade.tradeId ? 'Signing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};
