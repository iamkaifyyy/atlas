import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, LineChart, SlidersHorizontal, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Atlas | Guarded Trading Agent',
  description: 'Autonomous trading agent with on-chain caps, approval thresholds, and emergency refund',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background min-h-screen text-slate-100 flex flex-col font-sans">
        <header className="border-b border-border/70 bg-surface/90 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-tight text-base">
                    Atlas
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20">
                    V1 TERMINAL
                  </span>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-surface-elevated transition"
                >
                  <LineChart className="w-3.5 h-3.5 text-blue-400" />
                  <span>Terminal</span>
                </Link>
                <Link
                  href="/builder"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-surface-elevated transition"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strategy Builder</span>
                </Link>
              </nav>
            </div>

            {/* Network & Protocol Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 px-3 py-1 rounded-lg bg-surface-elevated/80 border border-border/60 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Anvil Localnet (31337)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-mono">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium">Caps Active</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
          {children}
        </main>

        <footer className="border-t border-border/40 py-3.5 text-center text-xs text-slate-500 font-mono bg-surface/50">
          Atlas Protocol • EVM Escrow Escort • On-Chain Cap Enforcement • In-Memory Order Book Engine
        </footer>
      </body>
    </html>
  );
}
