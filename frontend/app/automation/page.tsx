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
      <div className="glass-panel rounded-xl p-5 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            <span>No-Code Strategy Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Autonomous Agent Automation
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Visually assemble trading rules with smart contract spending ceilings, single-trade caps, and human-in-the-loop approval thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-surface-elevated/70 px-3 py-2 rounded-lg border border-border/50">
          <SlidersHorizontal className="w-4 h-4 text-zinc-300" />
          <span>Active Asset: ETH / USDC</span>
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
