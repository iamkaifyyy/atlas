'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ConditionalFooter: React.FC = () => {
  const pathname = usePathname();

  // Hide giant multi-column footer on focused single-screen app routes like /terminal, /automation, /builder
  if (pathname === '/terminal' || pathname === '/automation' || pathname === '/builder') {
    return null;
  }

  return (
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
  );
};
