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
    <div className="bg-surface rounded-xl p-5 border border-border/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
            2
          </span>
          <h3 className="font-medium text-white text-sm">Spending Limits</h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
          <Shield className="w-3 h-3" />
          On-chain enforced
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Max Total Budget
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.maxTotalSpend || ''}
              onChange={handleMaxTotalChange}
              placeholder="5.0"
              className="block w-full pl-3 pr-12 py-2 bg-surface-elevated border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Cumulative ceiling for the agent</p>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Max Per-Trade Size
          </label>
          <div className="relative rounded-lg">
            <input
              type="number"
              step="0.1"
              value={value.maxPerTradeSpend || ''}
              onChange={handleMaxPerTradeChange}
              placeholder="1.5"
              className="block w-full pl-3 pr-12 py-2 bg-surface-elevated border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
              ETH
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Hard limit on single transactions</p>
        </div>
      </div>
    </div>
  );
};
