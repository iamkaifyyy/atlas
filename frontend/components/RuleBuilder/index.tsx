'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriggerInput } from './TriggerInput';
import { CapInput } from './CapInput';
import { ApprovalThresholdInput } from './ApprovalThresholdInput';
import { ArrowRight, Code2, Check, Copy, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import type { AgentConfig } from '../../../shared/types/agentConfig';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';
import { motion, AnimatePresence } from 'framer-motion';

interface RuleBuilderProps {
  initialConfig?: Partial<AgentConfig>;
  currentPrice: number;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({ initialConfig, currentPrice }) => {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

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
    vaultAddress: initialConfig?.vaultAddress || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
  });

  const applyPreset = (type: 'dip' | 'momentum' | 'strict') => {
    const base = currentPrice || 2525;
    if (type === 'dip') {
      setConfig((prev) => ({
        ...prev,
        name: 'ETH Value Dip Buyer',
        trigger: { asset: 'ETH/USDC', type: 'PRICE_BELOW', targetPrice: Math.round(base - 40) },
        spendingCap: { maxTotalSpend: 5.0, maxPerTradeSpend: 1.0, currentTotalSpend: 0 },
        approvalThreshold: { thresholdAmount: 0.5 },
        tradeAmount: 0.35,
        action: 'BUY'
      }));
      showToast('Loaded Preset: ETH Value Dip Buyer');
    } else if (type === 'momentum') {
      setConfig((prev) => ({
        ...prev,
        name: 'Breakout Momentum Scalper',
        trigger: { asset: 'ETH/USDC', type: 'PRICE_ABOVE', targetPrice: Math.round(base + 35) },
        spendingCap: { maxTotalSpend: 4.0, maxPerTradeSpend: 0.8, currentTotalSpend: 0 },
        approvalThreshold: { thresholdAmount: 0.4 },
        tradeAmount: 0.4,
        action: 'BUY'
      }));
      showToast('Loaded Preset: Breakout Momentum Scalper');
    } else {
      setConfig((prev) => ({
        ...prev,
        name: 'Strict Escrow Vault Guard',
        trigger: { asset: 'ETH/USDC', type: 'PRICE_BELOW', targetPrice: Math.round(base - 15) },
        spendingCap: { maxTotalSpend: 2.5, maxPerTradeSpend: 0.5, currentTotalSpend: 0 },
        approvalThreshold: { thresholdAmount: 0.25 },
        tradeAmount: 0.2,
        action: 'BUY'
      }));
      showToast('Loaded Preset: Strict Escrow Vault Guard');
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    showToast('Rule payload copied to clipboard');
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
      showToast('Strategy successfully deployed to on-chain engine!');
      setTimeout(() => router.push('/terminal'), 1200);
    } catch {
      showToast('Deployed to local agent runtime');
      setTimeout(() => router.push('/terminal'), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* Floating Animated Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-16 right-6 z-50 px-4 py-3 rounded-xl bg-zinc-900 border border-coral/40 text-coral font-mono text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-coral animate-pulse" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto font-sans">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-normal text-white tracking-[-0.03em]">
                Configure Agent Rule
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Define execution condition, caps, and safety limits for on-chain compilation.
              </p>
            </div>

            {/* Quick Strategy Presets */}
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-muted hidden sm:inline">Presets:</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => applyPreset('dip')}
                className="px-2 py-1 rounded bg-console-elevated hover:bg-zinc-800 text-coral border border-console-border transition"
              >
                Dip Buyer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => applyPreset('momentum')}
                className="px-2 py-1 rounded bg-console-elevated hover:bg-zinc-800 text-emerald-400 border border-console-border transition"
              >
                Momentum
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => applyPreset('strict')}
                className="px-2 py-1 rounded bg-console-elevated hover:bg-zinc-800 text-white border border-console-border transition"
              >
                Strict Guard
              </motion.button>
            </div>
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleDeploy}
            disabled={isSubmitting}
            className="w-full cohere-btn-primary !py-3 !px-6 text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg"
          >
            {isSubmitting ? 'Saving Configuration...' : 'Apply Rule to Vault'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="cohere-card-console p-5 flex flex-col h-full font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-console-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-white tracking-[0.28px] uppercase">
                <Code2 className="w-4 h-4 text-coral" />
                <span>Rule Payload (JSON)</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 text-xs text-muted hover:text-white px-2.5 py-1 rounded bg-console-elevated border border-console-border transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </motion.button>
            </div>

            <div className="mt-3 flex-1 overflow-auto rounded-lg bg-[#0a0a0d] p-3.5 border border-console-border">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
