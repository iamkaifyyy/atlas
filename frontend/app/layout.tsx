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
import { WalletProvider } from '../context/WalletContext';
import { LiveTickerBar } from '../components/LiveTickerBar';
import { ConditionalFooter } from '../components/ConditionalFooter';

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
      <body className="bg-[#0b0c0e] min-h-screen text-[#f3f4f6] flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-400 relative overflow-x-hidden">
        <WalletProvider>

        {/* Top live dynamic ticker marquee bar */}
        <LiveTickerBar />

        {/* Expo Header Navbar */}
        <header className="sticky top-0 z-40 bg-[#0b0c0e]/85 backdrop-blur-xl border-b border-[#23252c] transition-colors duration-200">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-lg bg-white text-[#0b0c0e] flex items-center justify-center font-bold text-sm tracking-tighter transition group-hover:scale-105 shadow-md">
                  ▲
                </div>
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

            {/* Expo Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 font-sans text-sm font-medium text-zinc-400">
              <Link href="/terminal" className="hover:text-white transition">Terminal</Link>
              <Link href="/markets" className="hover:text-white transition">Markets</Link>
              <Link href="/automation" className="hover:text-white transition">Strategy Studio</Link>
              <Link href="/vault" className="hover:text-white transition">Escrow Vault</Link>
            </nav>

            {/* Right Controls: EVM Live Status + Connect Wallet */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 px-3 py-1.5 rounded-full bg-[#121316] border border-[#23252c] font-mono">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>EVM Live</span>
              </div>

              {/* Connect Wallet */}
              <ConnectWalletButton />
            </div>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 relative z-10">
          {children}
        </main>

        {/* Conditional Footer (Hidden on /terminal, /automation, /builder) */}
        <ConditionalFooter />
        </WalletProvider>
      </body>
    </html>
  );
}
