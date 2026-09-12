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
      router.push('/terminal');
    } catch {
      router.push('/terminal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto font-sans">
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h2 className="text-xl font-normal text-white tracking-[-0.03em]">
            Configure Agent Rule
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Define execution condition, caps, and safety limits for on-chain compilation.
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
          className="w-full cohere-btn-primary !py-3 !px-6 text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Configuration...' : 'Apply Rule to Vault'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="lg:col-span-5 space-y-3">
        <div className="cohere-card-console p-5 flex flex-col h-full font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-console-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-white tracking-[0.28px] uppercase">
              <Code2 className="w-4 h-4 text-coral" />
              <span>Rule Payload (JSON)</span>
            </div>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-white px-2.5 py-1 rounded bg-console-elevated border border-console-border transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="mt-3 flex-1 overflow-auto rounded-lg bg-[#0a0a0d] p-3.5 border border-console-border">
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
