import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LineChart,
  SlidersHorizontal,
  Lock,
  Home,
  BarChart3,
  ArrowUpRight,
  Terminal,
  Activity,
  ShieldCheck,
  Globe
} from 'lucide-react';

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
      <body className="bg-console-bg min-h-screen text-white flex flex-col font-sans selection:bg-coral/20 selection:text-coral">
        {/* Top live ticker bar */}
        <div className="cohere-announcement-bar">
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

        {/* Command header */}
        <header className="border-b border-console-border bg-console-surface/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white text-console-surface flex items-center justify-center font-bold text-sm tracking-tighter transition group-hover:scale-105 shadow-sm">
                  ▲
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white tracking-[-0.03em] text-lg">
                    Atlas
                  </span>
                  <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.28px] px-2 py-0.5 rounded border border-console-border text-muted bg-console-elevated">
                    Enterprise AI
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-console-border font-sans">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white hover:bg-console-elevated transition"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/terminal"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white hover:bg-console-elevated transition"
                >
                  <LineChart className="w-3.5 h-3.5" />
                  <span>Trade Terminal</span>
                </Link>
                <Link
                  href="/markets"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white hover:bg-console-elevated transition"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Markets</span>
                </Link>
                <Link
                  href="/automation"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white hover:bg-console-elevated transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Strategy Studio</span>
                </Link>
                <Link
                  href="/vault"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted hover:text-white hover:bg-console-elevated transition"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Escrow Guard</span>
                </Link>
              </nav>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted px-3 py-1.5 rounded-full bg-console-surface border border-console-border font-mono">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Anvil Localhost 31337</span>
              </div>

              <Link
                href="/terminal"
                className="cohere-btn-primary text-xs !py-2 !px-4"
              >
                <span>Launch Console</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Workspace Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Cohere Enterprise Footer */}
        <footer className="border-t border-console-border py-12 bg-console-surface text-muted text-xs font-sans mt-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-white text-console-surface flex items-center justify-center font-bold text-xs">
                    ▲
                  </div>
                  <span className="font-semibold text-white text-sm tracking-tight">Atlas Enterprise</span>
                </div>
                <p className="text-xs text-muted leading-relaxed max-w-sm">
                  Controlled quantitative AI trading infrastructure with on-chain hard caps, live Backpack Exchange liquidity, and non-custodial EVM escrow.
                </p>
                <div className="pt-1">
                  <span className="cohere-chip-coral text-[10px]">
                    AI MOVES FAST. PROTOCOLS REQUIRE ESCROW.
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.28px] text-white font-semibold mb-3">Protocol Desks</h4>
                <ul className="space-y-2 font-mono text-xs">
                  <li><Link href="/terminal" className="hover:text-white transition">High-Frequency Terminal</Link></li>
                  <li><Link href="/markets" className="hover:text-white transition">Crypto Asset Screener</Link></li>
                  <li><Link href="/automation" className="hover:text-white transition">No-Code Policy Engine</Link></li>
                  <li><Link href="/vault" className="hover:text-white transition">On-Chain Escrow Vault</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.28px] text-white font-semibold mb-3">Infrastructure</h4>
                <ul className="space-y-2 font-mono text-xs">
                  <li><span className="hover:text-white transition cursor-pointer">Backpack Exchange API v1</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">EVM Smart Contract Escrow</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">In-Memory Matching Engine</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Localnet Chain 31337</span></li>
                </ul>
              </div>

              <div>
                <h4 className="font-mono text-xs uppercase tracking-[0.28px] text-white font-semibold mb-3">Security & Compliance</h4>
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-console-elevated border border-console-border space-y-1">
                    <div className="flex items-center gap-1.5 text-white font-medium text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Programmatic Risk Ceiling</span>
                    </div>
                    <p className="text-[10px] text-muted leading-relaxed">
                      All agent trade actions are bounded by immutable EVM smart contract logic.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-console-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
              <div>
                <span>© 2026 Atlas Protocol Inc. Powered by Cohere Design Framework.</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  All Systems Operational
                </span>
                <span>Latency: &lt; 1.2ms</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
