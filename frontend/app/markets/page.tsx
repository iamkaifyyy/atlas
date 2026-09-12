'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Filter, Sparkles } from 'lucide-react';

interface CryptoMarket {
  ticker: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  trades24h: number;
  category: 'L1' | 'DeFi' | 'AI' | 'Solana';
}

const MARKETS_DATA: CryptoMarket[] = [
  {
    ticker: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH_USDC',
    price: 2525.40,
    change24h: 1.24,
    high24h: 2548.80,
    low24h: 2470.20,
    volume24h: 18.4,
    trades24h: 14820,
    category: 'L1'
  },
  {
    ticker: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC_USDC',
    price: 77148.00,
    change24h: 0.82,
    high24h: 77890.00,
    low24h: 76450.00,
    volume24h: 64.8,
    trades24h: 29400,
    category: 'L1'
  },
  {
    ticker: 'SOL',
    name: 'Solana',
    symbol: 'SOL_USDC',
    price: 101.95,
    change24h: 2.45,
    high24h: 104.20,
    low24h: 98.80,
    volume24h: 28.2,
    trades24h: 18950,
    category: 'Solana'
  },
  {
    ticker: 'RENDER',
    name: 'Render Network',
    symbol: 'RENDER_USDC',
    price: 1.40,
    change24h: -0.35,
    high24h: 1.48,
    low24h: 1.36,
    volume24h: 4.6,
    trades24h: 3200,
    category: 'AI'
  },
  {
    ticker: 'JUP',
    name: 'Jupiter',
    symbol: 'JUP_USDC',
    price: 0.246,
    change24h: 3.10,
    high24h: 0.260,
    low24h: 0.235,
    volume24h: 6.2,
    trades24h: 5800,
    category: 'DeFi'
  },
  {
    ticker: 'AVAX',
    name: 'Avalanche',
    symbol: 'AVAX_USDC',
    price: 24.80,
    change24h: -1.15,
    high24h: 25.60,
    low24h: 24.10,
    volume24h: 5.8,
    trades24h: 4100,
    category: 'L1'
  },
  {
    ticker: 'SUI',
    name: 'Sui Network',
    symbol: 'SUI_USDC',
    price: 1.82,
    change24h: 4.80,
    high24h: 1.90,
    low24h: 1.71,
    volume24h: 12.3,
    trades24h: 11400,
    category: 'L1'
  }
];

export default function MarketsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredMarkets = MARKETS_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="py-4 space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="framer-card p-6 border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-2 text-ink-muted text-xs font-mono border border-hairline">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Institutional Crypto Directory</span>
          </div>
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-white">
            Crypto Spot & DEX Markets
          </h1>
          <p className="text-xs text-ink-muted max-w-xl">
            Stream real-time Level 2 liquidity and trade across leading cryptocurrency markets powered by Backpack Exchange API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/terminal"
            className="framer-btn-primary text-xs"
          >
            <span>Open Terminal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 bg-surface-1 p-1 rounded-pill border border-hairline overflow-x-auto w-full sm:w-auto">
          {['ALL', 'L1', 'DeFi', 'AI', 'Solana'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-pill transition text-xs ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'text-ink-muted hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Markets' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search market or ticker..."
            className="w-full pl-9 pr-3 py-2 bg-surface-1 border border-hairline rounded-pill text-white text-xs outline-none focus:border-white transition"
          />
        </div>
      </div>

      {/* Markets Table */}
      <div className="framer-card overflow-hidden border border-hairline shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-surface-2 border-b border-hairline text-ink-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-normal">Asset</th>
                <th className="py-3.5 px-4 font-normal">Price (USDC)</th>
                <th className="py-3.5 px-4 font-normal">24h Change</th>
                <th className="py-3.5 px-4 font-normal hidden md:table-cell">24h Range (Low - High)</th>
                <th className="py-3.5 px-4 font-normal hidden sm:table-cell">24h Volume</th>
                <th className="py-3.5 px-4 font-normal hidden lg:table-cell">24h Trades</th>
                <th className="py-3.5 px-4 font-normal text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredMarkets.map((m) => {
                const isPositive = m.change24h >= 0;
                return (
                  <tr key={m.ticker} className="hover:bg-surface-2/60 transition group">
                    {/* Asset & Ticker */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-2 border border-hairline flex items-center justify-center font-bold text-white text-xs">
                          {m.ticker.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white tracking-tight flex items-center gap-1.5">
                            <span>{m.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-2 text-ink-muted border border-hairline">
                              {m.ticker}
                            </span>
                          </div>
                          <div className="text-[10px] text-ink-muted">{m.category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      ${m.price < 1 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* 24h Change */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-0.5 font-semibold text-xs ${isPositive ? 'text-semantic-success' : 'text-accent-red'}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{m.change24h.toFixed(2)}%
                      </span>
                    </td>

                    {/* 24h Range Bar */}
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="space-y-1 w-44">
                        <div className="flex justify-between text-[10px] text-ink-muted">
                          <span>${m.low24h.toFixed(1)}</span>
                          <span>${m.high24h.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden border border-hairline">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(10, ((m.price - m.low24h) / (m.high24h - m.low24h)) * 100))}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Volume */}
                    <td className="py-4 px-4 hidden sm:table-cell text-white font-medium">
                      ${m.volume24h.toFixed(1)}M
                    </td>

                    {/* Trades */}
                    <td className="py-4 px-4 hidden lg:table-cell text-ink-muted">
                      {m.trades24h.toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/terminal`}
                        className="framer-btn-primary !py-1.5 !px-3 text-xs"
                      >
                        <span>Trade</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
