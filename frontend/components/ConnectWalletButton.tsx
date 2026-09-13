'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Check, Copy, LogOut, ChevronDown, Activity, ShieldCheck } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const ConnectWalletButton: React.FC = () => {
  const {
    address,
    balance,
    isConnected,
    isConnecting,
    walletType,
    openWalletModal,
    disconnect
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const truncate = (addr: string) =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openWalletModal}
          disabled={isConnecting}
          className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-[#0d74ce] transition-all duration-300 shadow-lg backdrop-blur-md"
        >
          {isConnecting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wallet className="w-3.5 h-3.5 text-[#0d74ce] group-hover:scale-110 transition-transform" />
          )}
          <span>{isConnecting ? 'Authorizing...' : 'Connect Wallet'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-emerald-500/50 transition-all duration-200 shadow-md backdrop-blur-md"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-white font-medium">{truncate(address || '')}</span>
        <span className="text-emerald-400 font-semibold pl-1.5 border-l border-zinc-700">
          {balance} ETH
        </span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#121316] border border-[#23252c] shadow-2xl p-3 z-50 text-xs font-mono backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#23252c] text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 capitalize">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0d74ce]" />
              <span>{walletType || 'Web3 Wallet'}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
              Authorized
            </span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans">Account Address</div>
            <div className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-[#23252c]">
              <span className="text-zinc-200 truncate pr-2 text-[11px]">{address}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/10 transition shrink-0"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#23252c] flex items-center justify-between font-sans">
            <span className="text-[11px] text-zinc-400">Balance: <strong className="text-white font-mono">{balance} ETH</strong></span>
            <button
              type="button"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition"
            >
              <LogOut className="w-3 h-3" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
