'use client';

import React, { useState } from 'react';
import { Power, AlertTriangle } from 'lucide-react';

interface KillSwitchButtonProps {
  onTrigger: () => Promise<boolean>;
  isKilled?: boolean;
}

export const KillSwitchButton: React.FC<KillSwitchButtonProps> = ({ onTrigger, isKilled }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isHalting, setIsHalting] = useState(false);

  const handleConfirmKill = async () => {
    setIsHalting(true);
    await onTrigger();
    setIsHalting(false);
    setShowConfirm(false);
  };

  if (isKilled) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Vault Terminated</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-semibold border border-rose-500/20 transition"
      >
        <Power className="w-3.5 h-3.5" />
        <span>Kill Switch</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="framer-card border border-rose-500/50 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Emergency Stop</h3>
                <p className="text-xs text-rose-400">Irreversible on-chain call</p>
              </div>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Halts all agent executions and refunds the remaining escrow balance directly to your account.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="py-2.5 px-3 rounded-full bg-surface-2 hover:bg-zinc-800 text-ink-muted hover:text-white text-xs border border-hairline transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmKill}
                disabled={isHalting}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {isHalting ? 'Halting...' : 'Confirm Stop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
