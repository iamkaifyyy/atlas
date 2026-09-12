import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, LineChart, SlidersHorizontal, Shield, Lock, Home, BarChart3, ArrowUpRight, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atlas | Institutional Crypto Exchange & Guarded Trading Protocol',
  description: 'Autonomous trading agent with on-chain hard caps, live Backpack Exchange orderbook, and non-custodial EVM escrow.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas min-h-screen text-ink flex flex-col font-sans selection:bg-surface-2 selection:text-white">
        {/* Top Crypto Live Ticker Tape Marquee */}
        <div className="bg-canvas border-b border-hairline-soft py-1 px-4 overflow-x-auto text-[11px] font-mono text-ink-muted flex items-center justify-between gap-6 shrink-0 scrollbar-none">
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
              <span className="text-ink font-semibold tracking-tight">BACKPACK DEX FEED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink">ETH/USDC</span>
              <span className="text-white font-medium">$2,525.40</span>
              <span className="text-semantic-success">+1.24%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink">BTC/USDC</span>
              <span className="text-white font-medium">$77,148.00</span>
              <span className="text-semantic-success">+0.82%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink">SOL/USDC</span>
              <span className="text-white font-medium">$101.95</span>
              <span className="text-semantic-success">+2.45%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink">RENDER/USDC</span>
              <span className="text-white font-medium">$1.40</span>
              <span className="text-accent-red">-0.35%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ink">JUP/USDC</span>
              <span className="text-white font-medium">$0.246</span>
              <span className="text-semantic-success">+3.10%</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-ink-muted">
            <span>Matching Engine: <strong className="text-semantic-success font-medium">&lt; 1.2 ms</strong></span>
            <span>Network: <strong className="text-ink">EVM Localnet</strong></span>
          </div>
        </div>

        {/* Sticky Primary Header */}
        <header className="border-b border-hairline bg-canvas/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-sm transition group-hover:scale-105">
                  ▲
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-base">
                    Atlas
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-2 text-ink-muted font-mono border border-hairline font-semibold">
                    DEX PROTOCOL
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-hairline">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-white hover:bg-surface-1 transition"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/terminal"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-white hover:bg-surface-1 transition"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Trade Terminal</span>
                </Link>
                <Link
                  href="/markets"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-white hover:bg-surface-1 transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Markets</span>
                </Link>
                <Link
                  href="/automation"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-white hover:bg-surface-1 transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Algo Bots</span>
                </Link>
                <Link
                  href="/vault"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-muted hover:text-white hover:bg-surface-1 transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Escrow Vault</span>
                </Link>
              </nav>
            </div>

            {/* Actions & Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-ink-muted px-3 py-1 rounded-full bg-surface-1 border border-hairline font-mono">
                <span className="w-2 h-2 rounded-full bg-semantic-success animate-pulse" />
                <span>Anvil Localnet</span>
              </div>

              <Link
                href="/terminal"
                className="framer-btn-primary text-xs !py-1.5 !px-3.5"
              >
                <span>Launch App</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-hairline py-8 bg-canvas text-xs text-ink-muted font-mono">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight">Atlas Protocol</span>
              <span>• Non-Custodial EVM Escrow • In-Memory Matching Engine • Backpack DEX Streaming</span>
            </div>
            <div className="flex items-center gap-4 text-ink-muted">
              <Link href="/terminal" className="hover:text-white transition">Terminal</Link>
              <Link href="/markets" className="hover:text-white transition">Markets</Link>
              <Link href="/automation" className="hover:text-white transition">Automation</Link>
              <Link href="/vault" className="hover:text-white transition">Vault</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
