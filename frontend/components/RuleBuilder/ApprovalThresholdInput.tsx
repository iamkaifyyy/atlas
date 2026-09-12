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
    <div className="bg-surface rounded-xl p-5 border border-border/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
            3
          </span>
          <h3 className="font-medium text-white text-sm">Human Approval Threshold</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-400">
          <UserCheck className="w-3 h-3" />
          Safety gate
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Order Size per Trigger
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={tradeAmount || ''}
              onChange={(e) => onTradeAmountChange(Number.parseFloat(e.target.value) || 0)}
              placeholder="0.4"
              className="block w-full pl-3 pr-12 py-2 bg-surface-elevated border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Amount bought when trigger fires</p>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Require Approval Over
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.thresholdAmount || ''}
              onChange={handleThresholdChange}
              placeholder="0.5"
              className="block w-full pl-3 pr-12 py-2 bg-surface-elevated border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Pauses for owner sign-off</p>
        </div>
      </div>

      {willRequireApproval && (
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
          <span>
            Order size ({tradeAmount} ETH) is above threshold ({value.thresholdAmount} ETH) — will wait for manual approval.
          </span>
        </div>
      )}
    </div>
  );
};
