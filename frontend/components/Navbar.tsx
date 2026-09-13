'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Activity } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0b0c0e]/30 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/globe.svg"
              alt="Atlas Protocol Logo"
              className="w-7 h-7 object-contain transition group-hover:scale-110"
            />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-[-0.03em] text-base">
                Atlas
              </span>
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.28px] px-2 py-0.5 rounded border border-[#23252c] text-zinc-400 bg-[#121316]">
                Protocol
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 font-sans text-sm font-medium text-zinc-400">
          <Link href="/terminal" className="hover:text-white transition">Terminal</Link>
          <Link href="/markets" className="hover:text-white transition">Markets</Link>
          <Link href="/automation" className="hover:text-white transition">Strategy Studio</Link>
          <Link href="/vault" className="hover:text-white transition">Escrow Vault</Link>
        </nav>

        {/* Right Controls: EVM Live Status + Connect Wallet + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 px-3 py-1.5 rounded-full bg-[#121316] border border-[#23252c] font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>EVM Live</span>
          </div>

          {/* Connect Wallet */}
          <ConnectWalletButton />

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg bg-[#121316] border border-[#23252c] transition"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0d0e12] border-b border-[#23252c] px-4 py-4 space-y-3 font-sans animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2.5 text-sm font-medium text-zinc-300">
            <Link
              href="/terminal"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-[#1a1b20] hover:text-white transition flex items-center justify-between"
            >
              <span>Terminal</span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE</span>
            </Link>
            <Link
              href="/markets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-[#1a1b20] hover:text-white transition"
            >
              Markets Screener
            </Link>
            <Link
              href="/automation"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-[#1a1b20] hover:text-white transition"
            >
              Strategy Studio
            </Link>
            <Link
              href="/vault"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2.5 rounded-lg hover:bg-[#1a1b20] hover:text-white transition"
            >
              Escrow Vault
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
