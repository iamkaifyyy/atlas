import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { WalletProvider } from '../context/WalletContext';
import { LiveTickerBar } from '../components/LiveTickerBar';
import { ConditionalFooter } from '../components/ConditionalFooter';
import { ConditionalNavbar } from '../components/ConditionalNavbar';

export const metadata: Metadata = {
  title: 'Atlas | Enterprise Quantitative Crypto Protocol & Guarded Escrow',
  description: 'Controlled enterprise AI trading infrastructure with on-chain hard caps, live Backpack Exchange orderbook, and non-custodial EVM escrow.',
  icons: {
    icon: '/globe.svg',
    shortcut: '/globe.svg',
    apple: '/globe.svg',
  },
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

        {/* Conditional Navbar (Shown ONLY on homepage http://localhost:3000/) */}
        <ConditionalNavbar />

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
