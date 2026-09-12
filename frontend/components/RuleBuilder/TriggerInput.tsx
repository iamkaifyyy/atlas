'use client';

import React from 'react';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { TriggerCondition, TriggerType } from '../../../shared/types/agentConfig';

interface TriggerInputProps {
  value: TriggerCondition;
  onChange: (value: TriggerCondition) => void;
  currentPrice: number;
}

export const TriggerInput: React.FC<TriggerInputProps> = ({ value, onChange, currentPrice }) => {
  const handleTypeChange = (type: TriggerType) => {
    onChange({ ...value, type });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetPrice = Number.parseFloat(e.target.value) || 0;
    onChange({ ...value, targetPrice });
  };

  return (
    <div className="bg-surface rounded-xl p-5 border border-border/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/20">
            1
          </span>
          <h3 className="font-medium text-white text-sm">Trigger Condition</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          ETH: <span className="text-emerald-400 font-semibold">${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleTypeChange('PRICE_BELOW')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition text-xs font-medium ${
            value.type === 'PRICE_BELOW'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-surface-elevated/40 border-border/50 text-slate-400 hover:border-slate-600'
          }`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
          Price drops below
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('PRICE_ABOVE')}
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition text-xs font-medium ${
            value.type === 'PRICE_ABOVE'
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-surface-elevated/40 border-border/50 text-slate-400 hover:border-slate-600'
          }`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-rose-400" />
          Price rises above
        </button>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1">
          Target Price
        </label>
        <div className="relative rounded-lg">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
            $
          </span>
          <input
            type="number"
            value={value.targetPrice || ''}
            onChange={handlePriceChange}
            placeholder="3050"
            className="block w-full pl-7 pr-16 py-2 bg-surface-elevated border border-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono">
            USDC
          </span>
        </div>
      </div>
    </div>
  );
};
