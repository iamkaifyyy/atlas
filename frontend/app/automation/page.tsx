'use client';

import React from 'react';
import { RuleBuilder } from '../../components/RuleBuilder';
import { useContractEvents } from '../../hooks/useContractEvents';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export default function AutomationPage() {
  const { currentPrice, agentConfig } = useContractEvents();

  return (
    <div className="space-y-4 max-w-6xl mx-auto font-sans">
      {/* Streamlined Expo Header Banner */}
      <div className="bg-[#121316] border border-[#23252c] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] uppercase font-bold tracking-wider">
              POLICY COMPILATION ENGINE
            </span>
            <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">
              // NO-CODE RULE BUILDER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">
            Autonomous Agent Strategy Studio
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
            Visually configure algorithmic execution logic, programmatic spending ceilings, single-trade caps, and human-in-the-loop approval thresholds enforced on EVM.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300 bg-[#1a1b20] px-3.5 py-2 rounded-xl border border-[#23252c] self-start sm:self-auto shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
          <span>Active Asset: <strong className="text-white">ETH / USDC</strong></span>
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
