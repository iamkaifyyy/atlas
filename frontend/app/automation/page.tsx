'use client';

import React from 'react';
import { RuleBuilder } from '../../components/RuleBuilder';
import { useContractEvents } from '../../hooks/useContractEvents';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export default function AutomationPage() {
  const { currentPrice, agentConfig } = useContractEvents();

  return (
    <div className="py-2 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="framer-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 text-ink-muted text-xs font-mono border border-hairline">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>No-Code Strategy Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.04em] text-white">
            Autonomous Agent Automation
          </h1>
          <p className="text-sm text-ink-muted max-w-xl leading-relaxed">
            Visually assemble trading rules with smart contract spending ceilings, single-trade caps, and human-in-the-loop approval thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-ink-muted bg-surface-2 px-3.5 py-2 rounded-full border border-hairline self-start sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-white" />
          <span className="text-white">Active Asset: ETH / USDC</span>
        </div>
      </div>

      {/* Main Studio */}
      <RuleBuilder
        currentPrice={currentPrice}
        initialConfig={agentConfig || undefined}
      />
    </div>
  );
}
