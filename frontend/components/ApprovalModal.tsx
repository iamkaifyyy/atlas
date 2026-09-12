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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="framer-card border border-amber-500/40 p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Trade Approval Required
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              This order exceeds your manual approval threshold.
            </p>
          </div>
        </div>

        <div className="bg-surface-2 rounded-xl p-3.5 border border-hairline space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-ink-muted">Pair</span>
            <span className="font-mono text-white">ETH/USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Amount</span>
            <span className="font-mono font-medium text-white">{currentTrade.amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Trigger Price</span>
            <span className="font-mono text-white">${currentTrade.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-hairline pt-2">
            <span className="text-ink-muted">Total</span>
            <span className="font-mono font-semibold text-emerald-400">
              ${(currentTrade.amount * currentTrade.price).toFixed(2)} USDC
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleReject}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-surface-2 hover:bg-zinc-800 text-ink-muted hover:text-white text-xs border border-hairline transition disabled:opacity-50 font-medium"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Reject
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!!processingId}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-white hover:bg-zinc-200 text-canvas font-semibold text-xs transition disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {processingId === currentTrade.tradeId ? 'Signing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};
