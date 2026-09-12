'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriggerInput } from './TriggerInput';
import { CapInput } from './CapInput';
import { ApprovalThresholdInput } from './ApprovalThresholdInput';
import { ArrowRight, Code2, Check, Copy } from 'lucide-react';
import type { AgentConfig } from '../../../shared/types/agentConfig';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

interface RuleBuilderProps {
  initialConfig?: Partial<AgentConfig>;
  currentPrice: number;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ initialConfig, currentPrice }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [config, setConfig] = useState<AgentConfig>({
    id: initialConfig?.id || `agent-${Date.now()}`,
    name: initialConfig?.name || 'ETH Momentum Guard',
    assetPair: 'ETH/USDC',
    trigger: initialConfig?.trigger || {
      asset: 'ETH/USDC',
      type: 'PRICE_BELOW',
      targetPrice: Math.round(currentPrice ? currentPrice - 20 : 3030)
    },
    spendingCap: initialConfig?.spendingCap || {
      maxTotalSpend: 5.0,
      maxPerTradeSpend: 1.5,
      currentTotalSpend: 0
    },
    approvalThreshold: initialConfig?.approvalThreshold || {
      thresholdAmount: 0.5
    },
    action: 'BUY',
    tradeAmount: initialConfig?.tradeAmount || 0.4,
    active: true,
    vaultAddress: initialConfig?.vaultAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDeploy = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`${BACKEND_HTTP_URL}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Configure Agent Rule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Define execution condition, caps, and safety limits.
          </p>
        </div>

        <TriggerInput
          value={config.trigger}
          onChange={(trigger) => setConfig((prev) => ({ ...prev, trigger }))}
          currentPrice={currentPrice}
        />

        <CapInput
          value={config.spendingCap}
          onChange={(spendingCap) => setConfig((prev) => ({ ...prev, spendingCap }))}
        />

        <ApprovalThresholdInput
          value={config.approvalThreshold}
          onChange={(approvalThreshold) => setConfig((prev) => ({ ...prev, approvalThreshold }))}
          tradeAmount={config.tradeAmount}
          onTradeAmountChange={(tradeAmount) => setConfig((prev) => ({ ...prev, tradeAmount }))}
        />

        <button
          type="button"
          onClick={handleDeploy}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Configuration...' : 'Apply Rule to Vault'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="lg:col-span-5 space-y-3">
        <div className="bg-surface rounded-xl p-4 border border-border/80 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Rule Payload (JSON)</span>
            </div>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-surface-elevated border border-border/50 transition"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-3 flex-1 overflow-auto rounded-lg bg-black/40 p-3 border border-slate-800">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
