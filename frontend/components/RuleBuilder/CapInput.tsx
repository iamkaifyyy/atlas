'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import type { SpendingCap } from '../../../shared/types/agentConfig';

interface CapInputProps {
  value: SpendingCap;
  onChange: (value: SpendingCap) => void;
}

export const CapInput: React.FC<CapInputProps> = ({ value, onChange }) => {
  const handleMaxTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxTotalSpend = Number.parseFloat(e.target.value) || 0;
    onChange({ ...value, maxTotalSpend });
  };

  const handleMaxPerTradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxPerTradeSpend = Number.parseFloat(e.target.value) || 0;
    onChange({ ...value, maxPerTradeSpend });
  };

  return (
    <div className="cohere-card-console p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-console-elevated text-emerald-400 font-bold text-xs border border-console-border font-mono">
            2
          </span>
          <h3 className="font-medium text-white text-sm">Spending Limits</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium font-mono">
          <Shield className="w-3.5 h-3.5" />
          On-chain enforced
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-[0.28px]">
            Max Total Budget
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.maxTotalSpend || ''}
              onChange={handleMaxTotalChange}
              placeholder="5.0"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-coral transition"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted font-sans">Cumulative ceiling for the agent</p>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5 uppercase tracking-[0.28px]">
            Max Per-Trade Size
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.maxPerTradeSpend || ''}
              onChange={handleMaxPerTradeChange}
              placeholder="1.5"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-sm focus:outline-none focus:border-coral transition"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted font-sans">Hard limit on single transactions</p>
        </div>
      </div>
    </div>
  );
};
