'use client';

import React from 'react';
import { RuleBuilder } from '../../components/RuleBuilder';
import { useContractEvents } from '../../hooks/useContractEvents';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export default function AutomationPage() {
  const { currentPrice, agentConfig } = useContractEvents();

  return (
    <div className="py-2 space-y-6 max-w-6xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="cohere-card-console p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="cohere-chip-coral">
              POLICY COMPILATION ENGINE
            </span>
            <span className="font-mono text-[11px] text-muted hidden sm:inline">
              // NO-CODE RULE BUILDER
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Autonomous Agent Strategy Studio
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            Visually configure algorithmic execution logic, programmatic spending ceilings, single-trade caps, and human-in-the-loop approval thresholds enforced on EVM.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted bg-console-elevated px-3.5 py-2 rounded-lg border border-console-border self-start sm:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-coral" />
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
