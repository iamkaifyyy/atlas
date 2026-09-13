'use client';

import React from 'react';
import { X, ExternalLink, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  isInstalled: boolean;
  chainType: 'EVM' | 'Solana' | 'Multi-chain';
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletOption[];
  onSelectWallet: (walletId: string) => Promise<boolean | void> | void;
  isConnecting: boolean;
  connectingWalletId: string | null;
  error: string | null;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  isConnecting,
  connectingWalletId,
  error
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#121316] border border-[#23252c] rounded-2xl p-6 shadow-2xl z-10 overflow-hidden text-white font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#23252c]">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0d74ce]" />
                Connect Wallet
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Select your installed Web3 wallet to authorize Atlas.
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <p className="font-semibold">Connection Failed</p>
                <p className="mt-0.5 text-[11px] opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Wallet List */}
          <div className="mt-4 space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {wallets.map((wallet) => {
              const isSelected = connectingWalletId === wallet.id && isConnecting;

              return (
                <div
                  key={wallet.id}
                  className={`group relative flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                    wallet.isInstalled
                      ? 'bg-white/[0.03] hover:bg-white/[0.07] border-[#23252c] hover:border-[#0d74ce]/50 cursor-pointer'
                      : 'bg-white/[0.01] border-white/5 opacity-70'
                  }`}
                  onClick={() => {
                    if (wallet.isInstalled && !isConnecting) {
                      onSelectWallet(wallet.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* SVG/Emoji Icon Container */}
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
                      {wallet.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white group-hover:text-[#0d74ce] transition-colors">
                          {wallet.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-muted">
                          {wallet.chainType}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">{wallet.description}</p>
                    </div>
                  </div>

                  {/* Right Status / Action Button */}
                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d74ce]/20 text-[#0d74ce] text-xs font-medium">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Prompting...</span>
                      </div>
                    ) : wallet.isInstalled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Installed
                      </span>
                    ) : (
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-muted hover:text-white transition"
                      >
                        <span>Install</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Safety Info */}
          <div className="mt-5 pt-4 border-t border-[#23252c] text-center text-[11px] text-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Non-custodial connection. Atlas never accesses your private keys.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
