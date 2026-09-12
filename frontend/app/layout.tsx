import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { ConnectWalletButton } from '../components/ConnectWalletButton';

export const metadata: Metadata = {
  title: 'Atlas | Enterprise Quantitative Crypto Protocol & Guarded Escrow',
  description: 'Controlled enterprise AI trading infrastructure with on-chain hard caps, live Backpack Exchange orderbook, and non-custodial EVM escrow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-console-bg min-h-screen text-white flex flex-col font-sans selection:bg-coral/20 selection:text-coral relative overflow-x-hidden">
        {/* Top live ticker announcement bar (translucent, borderless) */}
        <div className="cohere-announcement-bar relative z-50">
          <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4 font-mono text-[11px]">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
              <span className="cohere-chip-coral !py-0.5 !px-2 !text-[10px]">
                BACKPACK L2 LIVE
              </span>
              <div className="flex items-center gap-4 text-muted">
                <span className="text-white font-medium">ETH/USDC: <span className="text-emerald-400 font-mono">$2,525.40</span> (+1.24%)</span>
                <span className="hidden sm:inline text-white font-medium">BTC/USDC: <span className="text-emerald-400 font-mono">$77,148.00</span> (+0.82%)</span>
                <span className="hidden md:inline text-white font-medium">SOL/USDC: <span className="text-emerald-400 font-mono">$101.95</span> (+2.45%)</span>
                <span className="hidden lg:inline text-white font-medium">RENDER/USDC: <span className="text-rose-400 font-mono">$1.40</span> (-0.35%)</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-muted shrink-0 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Matching Engine: <strong className="text-white">&lt; 1.2 ms</strong></span>
              </span>
              <span>•</span>
              <span>EVM Escrow: <strong className="text-white">Active</strong></span>
            </div>
          </div>
        </div>

        {/* Command header: Seamless, borderless, no navigation buttons, Connect Wallet at top right */}
        <header className="sticky top-0 z-40 bg-console-bg/30 backdrop-blur-md transition-colors duration-200">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white text-console-surface flex items-center justify-center font-bold text-sm tracking-tighter transition group-hover:scale-105 shadow-md">
                  ▲
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white tracking-[-0.03em] text-lg">
                    Atlas
                  </span>
                  <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.28px] px-2 py-0.5 rounded border border-console-border text-muted bg-console-elevated/70">
                    Enterprise AI
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Action Controls: Connect Wallet using viem + Launch Console shortcut */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-muted px-3 py-1.5 rounded-full bg-console-surface/60 border border-console-border/60 font-mono backdrop-blur-md">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Anvil Localnet 31337</span>
              </div>

              {/* Connect Wallet using viem */}
              <ConnectWalletButton />

              <Link
                href="/terminal"
                className="cohere-btn-primary text-xs !py-2 !px-4 shadow-lg hover:shadow-white/10"
              >
                <span>Launch Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-3 pb-8 relative z-10">
          {children}
        </main>

        {/* Streamlined Minimal Institutional Footer: Only necessary links and info */}
        <footer className="border-t border-console-border/40 py-8 bg-console-surface/40 backdrop-blur-md text-muted text-xs font-sans mt-16 relative z-10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Brand info */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-white text-console-surface flex items-center justify-center font-bold text-xs">
                ▲
              </div>
              <span className="font-semibold text-white text-sm tracking-tight">Atlas Enterprise Protocol</span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-zinc-400 text-xs hidden sm:inline">Non-custodial EVM Escrow & Quantitative AI</span>
            </div>

            {/* Center: Only Necessary Navigation Links */}
            <div className="flex items-center gap-6 font-mono text-xs text-zinc-400">
              <Link href="/terminal" className="hover:text-white transition">Trade Terminal</Link>
              <Link href="/markets" className="hover:text-white transition">Markets</Link>
              <Link href="/automation" className="hover:text-white transition">Strategy Studio</Link>
              <Link href="/vault" className="hover:text-white transition">Escrow Vault</Link>
            </div>

            {/* Right: Telemetry & Copyright */}
            <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-500">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Backpack L2 Live
              </span>
              <span>•</span>
              <span>© 2026 Atlas Protocol</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
