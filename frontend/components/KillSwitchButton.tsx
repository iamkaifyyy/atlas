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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
        <span className="tracking-wide">TERMINATED</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-medium border border-rose-800/50 transition tracking-wide"
      >
        <Power className="w-3.5 h-3.5 text-rose-400" />
        <span>KILL SWITCH</span>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="cohere-card-console border border-rose-900/60 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">EMERGENCY HALT</h3>
                <p className="text-[11px] text-rose-400 font-mono uppercase tracking-wider">Irreversible On-chain Call</p>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed font-sans">
              Immediately terminates active agent execution authority, revokes policy loops, and refunds unspent vault collateral back to the governance owner address.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="py-2.5 px-4 rounded-full bg-console-elevated hover:bg-surface-elevated text-text-secondary hover:text-white text-xs border border-console-border transition font-mono tracking-wide"
              >
                DISMISS
              </button>
              <button
                type="button"
                onClick={handleConfirmKill}
                disabled={isHalting}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold font-mono tracking-wide transition disabled:opacity-50"
              >
                {isHalting ? 'HALTING...' : 'CONFIRM STOP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
