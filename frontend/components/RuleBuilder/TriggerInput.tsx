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
    <div className="framer-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-white font-bold text-xs border border-hairline">
            1
          </span>
          <h3 className="font-semibold text-white text-sm">Trigger Condition</h3>
        </div>
        <div className="text-xs text-ink-muted font-mono">
          ETH: <span className="text-white font-semibold">${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleTypeChange('PRICE_BELOW')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition text-xs font-semibold ${
            value.type === 'PRICE_BELOW'
              ? 'bg-surface-2 border-hairline text-white shadow-sm'
              : 'bg-transparent border-hairline/60 text-ink-muted hover:text-white hover:border-hairline'
          }`}
        >
          <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
          Price drops below
        </button>

        <button
          type="button"
          onClick={() => handleTypeChange('PRICE_ABOVE')}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition text-xs font-semibold ${
            value.type === 'PRICE_ABOVE'
              ? 'bg-surface-2 border-hairline text-white shadow-sm'
              : 'bg-transparent border-hairline/60 text-ink-muted hover:text-white hover:border-hairline'
          }`}
        >
          <ArrowUpCircle className="w-3.5 h-3.5 text-rose-400" />
          Price rises above
        </button>
      </div>

      <div>
        <label className="block text-xs text-ink-muted mb-1.5 font-medium">
          Target Price
        </label>
        <div className="relative rounded-xl">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-muted font-mono text-xs">
            $
          </span>
          <input
            type="number"
            value={value.targetPrice || ''}
            onChange={handlePriceChange}
            placeholder="3050"
            className="block w-full pl-8 pr-16 py-2.5 bg-surface-2 border border-hairline rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-zinc-600"
          />
          <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-muted text-xs font-mono">
            USDC
          </span>
        </div>
      </div>
    </div>
  );
};
