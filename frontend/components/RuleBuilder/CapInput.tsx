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
    <div className="framer-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-white font-bold text-xs border border-hairline">
            2
          </span>
          <h3 className="font-semibold text-white text-sm">Spending Limits</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Shield className="w-3.5 h-3.5" />
          On-chain enforced
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ink-muted mb-1.5 font-medium">
            Max Total Budget
          </label>
          <div className="relative rounded-xl">
            <input
              type="number"
              step="0.1"
              value={value.maxTotalSpend || ''}
              onChange={handleMaxTotalChange}
              placeholder="5.0"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-surface-2 border border-hairline rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">Cumulative ceiling for the agent</p>
        </div>

        <div>
          <label className="block text-xs text-ink-muted mb-1.5 font-medium">
            Max Per-Trade Size
          </label>
          <div className="relative rounded-xl">
            <input
              type="number"
              step="0.1"
              value={value.maxPerTradeSpend || ''}
              onChange={handleMaxPerTradeChange}
              placeholder="1.5"
              className="block w-full pl-3.5 pr-12 py-2.5 bg-surface-2 border border-hairline rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
            />
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-muted text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-muted">Hard limit on single transactions</p>
        </div>
      </div>
    </div>
  );
};
