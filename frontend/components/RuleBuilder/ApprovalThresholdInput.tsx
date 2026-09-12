'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import type { ApprovalThreshold } from '../../../shared/types/agentConfig';

interface ApprovalThresholdInputProps {
  value: ApprovalThreshold;
  onChange: (value: ApprovalThreshold) => void;
  tradeAmount: number;
  onTradeAmountChange: (amount: number) => void;
}

export const ApprovalThresholdInput: React.FC<ApprovalThresholdInputProps> = ({
  value,
  onChange,
  tradeAmount,
  onTradeAmountChange
}) => {
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thresholdAmount = Number.parseFloat(e.target.value) || 0;
    onChange({ thresholdAmount });
  };

  const willRequireApproval = tradeAmount > value.thresholdAmount;

  return (
    <div className="cohere-card-console p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-console-elevated text-amber-400 font-bold text-xs border border-console-border font-mono">
            3
          </span>
          <h3 className="font-medium text-white text-sm">Human Approval Threshold</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium font-mono">
          <UserCheck className="w-3.5 h-3.5" />
          Safety Gate
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-[0.28px]">
            Order Size per Trigger
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={tradeAmount || ''}
              onChange={(e) => onTradeAmountChange(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.4"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-coral transition"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted font-sans">Amount bought when trigger fires</p>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-[0.28px]">
            Require Approval Over
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.thresholdAmount || ''}
              onChange={handleThresholdChange}
              placeholder="0.5"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-coral transition"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted font-sans">Pauses for owner sign-off</p>
        </div>
      </div>

      {willRequireApproval && (
        <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2.5 font-mono">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          <span>
            Order size ({tradeAmount} ETH) is above threshold ({value.thresholdAmount} ETH) — will pause for owner approval.
          </span>
        </div>
      )}
    </div>
  );
};
