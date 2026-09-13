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
    <footer className="border-t border-[#23252c] bg-[#0b0c0e] text-zinc-400 text-sm font-sans mt-24 relative z-10 pt-16 pb-0 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-16">
          {/* Brand & Copyright Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/globe.svg"
                alt="Atlas Protocol"
                className="w-6 h-6 object-contain"
              />
              <span className="font-semibold text-white text-lg tracking-tight">
                Atlas
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              © copyright Atlas Protocol 2026. All rights reserved.
            </p>
          </div>

          {/* Pages Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-tight">
              Pages
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/terminal" className="hover:text-white transition">
                  Trading Terminal
                </Link>
              </li>
              <li>
                <Link href="/automation" className="hover:text-white transition">
                  Strategy Studio
                </Link>
              </li>
              <li>
                <Link href="/markets" className="hover:text-white transition">
                  Market Screener
                </Link>
              </li>
              <li>
                <Link href="/vault" className="hover:text-white transition">
                  Escrow Vault
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Protocol Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-tight">
              Socials
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/iamkaifyyy/atlas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-tight">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Security Audit
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Cookie Policy
                </span>
              </li>
            </ul>
          </div>

          {/* Protocol Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm tracking-tight">
              Protocol
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Backpack L2 Feed
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  AgentVault.sol
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Hedera HCS Logger
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Documentation
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Giant Watermark Text Background at Footer Bottom */}
      <div className="w-full text-center overflow-hidden pt-4 pb-2 pointer-events-none select-none leading-none">
        <span className="text-[15vw] sm:text-[210px] font-extrabold tracking-tighter text-white/[0.04] uppercase block leading-none transition-all">
          Atlas
        </span>
      </div>
    </footer>
  );
};
