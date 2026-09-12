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
      <body className="bg-background min-h-screen text-slate-100 flex flex-col">
        <header className="border-b border-border/70 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight text-sm">
                  Atlas
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  / agent-vault
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                href="/builder"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-elevated transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
                <span>Builder</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-surface-elevated transition"
              >
                <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dashboard</span>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-md bg-surface-elevated/70 border border-border/50">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[11px]">Vault Online</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <footer className="border-t border-border/40 py-3 text-center text-[11px] text-slate-500 font-mono">
          Atlas Protocol • EVM Escrow & Cap Enforcement • ETH/USDC
        </footer>
      </body>
    </html>
  );
}
