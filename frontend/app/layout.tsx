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

        {/* Expo Flagship Multi-Column Footer */}
        <footer className="border-t border-[#23252c] bg-[#0b0c0e] text-zinc-400 text-xs font-sans mt-20 relative z-10 pt-12 pb-8">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#23252c]">
              <div className="col-span-2 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-white text-[#0b0c0e] flex items-center justify-center font-bold text-xs">
                    ▲
                  </div>
                  <span className="font-semibold text-white text-base tracking-tight">Atlas Enterprise</span>
                </div>
                <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
                  Autonomous quantitative trading protocol with non-custodial EVM escrow smart contracts, real-time Backpack L2 orderbooks, and Hedera HCS audit logging.
                </p>
              </div>

              <div>
                <div className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Products</div>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/terminal" className="hover:text-white transition">Trading Terminal</Link></li>
                  <li><Link href="/automation" className="hover:text-white transition">No-Code Rule Builder</Link></li>
                  <li><Link href="/markets" className="hover:text-white transition">Market Screener</Link></li>
                  <li><Link href="/vault" className="hover:text-white transition">Escrow Vault</Link></li>
                </ul>
              </div>

              <div>
                <div className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Protocol</div>
                <ul className="space-y-2 text-zinc-400">
                  <li><span className="hover:text-white transition cursor-pointer">AgentVault.sol</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Hedera HCS Topic</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">ENSv2 Client</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">x402 AI Inference</span></li>
                </ul>
              </div>

              <div>
                <div className="font-semibold text-white text-xs mb-3 font-mono uppercase tracking-wider">Ecosystem</div>
                <ul className="space-y-2 text-zinc-400">
                  <li><span className="hover:text-white transition cursor-pointer">Backpack L2</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">1inch Aqua</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">The Graph Subgraph</span></li>
                  <li><span className="hover:text-white transition cursor-pointer">Foundry Suite</span></li>
                </ul>
              </div>
            </div>

            <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[11px] text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All Protocol Systems Operational
                </span>
                <span>•</span>
                <span>© 2026 Atlas Protocol</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
                <span className="hover:text-white cursor-pointer transition">Security Audit</span>
              </div>
            </div>
          </div>
        </footer>
        </WalletProvider>
      </body>
    </html>
  );
}
