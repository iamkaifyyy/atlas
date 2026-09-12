'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Filter, Sparkles, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackpackTicker } from '../../hooks/useBackpackTicker';

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

  // Fetch real-time live tickers for prime pairs
  const ethTicker = useBackpackTicker('ETH_USDC');
  const btcTicker = useBackpackTicker('BTC_USDC');
  const solTicker = useBackpackTicker('SOL_USDC');

  const dynamicMarkets = useMemo(() => {
    return MARKETS_DATA.map((m) => {
      if (m.ticker === 'ETH' && ethTicker.lastPrice > 0) {
        return {
          ...m,
          price: ethTicker.lastPrice,
          change24h: ethTicker.priceChangePercent,
          high24h: ethTicker.high24h,
          low24h: ethTicker.low24h,
          volume24h: ethTicker.volume24h,
          trades24h: ethTicker.trades
        };
      }
      if (m.ticker === 'BTC' && btcTicker.lastPrice > 0) {
        return {
          ...m,
          price: btcTicker.lastPrice,
          change24h: btcTicker.priceChangePercent,
          high24h: btcTicker.high24h,
          low24h: btcTicker.low24h,
          volume24h: btcTicker.volume24h,
          trades24h: btcTicker.trades
        };
      }
      if (m.ticker === 'SOL' && solTicker.lastPrice > 0) {
        return {
          ...m,
          price: solTicker.lastPrice,
          change24h: solTicker.priceChangePercent,
          high24h: solTicker.high24h,
          low24h: solTicker.low24h,
          volume24h: solTicker.volume24h,
          trades24h: solTicker.trades
        };
      }
      return m;
    });
  }, [ethTicker, btcTicker, solTicker]);

  const filteredMarkets = dynamicMarkets.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-4 space-y-8 max-w-6xl mx-auto"
    >
      {/* Header Banner */}
      <div className="cohere-card-console p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <span className="cohere-chip-coral">
              BACKPACK LIQUIDITY DIRECTORY
            </span>
            <span className="font-mono text-[11px] text-muted hidden sm:inline flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              // REAL-TIME LEVEL 2 STREAMS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
            Crypto Spot & Liquidity Screener
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
            Publication directory of live digital assets streaming real-time Level 2 orderbook depth directly from Backpack Exchange API.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/terminal"
              className="cohere-btn-primary text-xs shadow-lg"
            >
              <span>Open High-Frequency Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Cohere Taxonomy Filter Chips & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        {/* Coral Taxonomy Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'L1', 'DeFi', 'AI', 'Solana'].map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg transition text-xs font-mono tracking-[0.28px] uppercase ${
                selectedCategory === cat
                  ? 'cohere-chip-coral-active shadow-md shadow-coral/20'
                  : 'cohere-chip-coral'
              }`}
            >
              {cat === 'ALL' ? 'All Assets' : cat}
            </motion.button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter market or symbol..."
            className="w-full pl-9 pr-3.5 py-2 bg-console-surface border border-console-border rounded-lg text-white font-mono text-xs outline-none focus:border-coral transition placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Cohere Research Table with Animated Rows */}
      <div className="cohere-card-console overflow-hidden shadow-2xl border border-console-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-console-elevated border-b border-console-border text-muted text-[11px] uppercase tracking-[0.28px]">
              <tr>
                <th className="py-4 px-5 font-normal">Asset / Token</th>
                <th className="py-4 px-5 font-normal">Price (USDC)</th>
                <th className="py-4 px-5 font-normal">24h Change</th>
                <th className="py-4 px-5 font-normal hidden md:table-cell">24h Low / High Range</th>
                <th className="py-4 px-5 font-normal hidden sm:table-cell">24h Volume</th>
                <th className="py-4 px-5 font-normal hidden lg:table-cell">Trades</th>
                <th className="py-4 px-5 font-normal text-right">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-console-border">
              <AnimatePresence>
                {filteredMarkets.map((m, idx) => {
                  const isPositive = m.change24h >= 0;
                  return (
                    <motion.tr
                      key={m.ticker}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                      className="transition group cursor-pointer"
                    >
                      {/* Asset & Ticker */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-console-elevated border border-console-border flex items-center justify-center font-bold text-white text-xs">
                            {m.ticker.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-semibold text-white tracking-tight flex items-center gap-1.5">
                              <span>{m.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-console-elevated text-muted border border-console-border">
                                {m.ticker}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted">{m.category}</div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-5 font-semibold text-white text-sm">
                        ${m.price < 1 ? m.price.toFixed(4) : m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* 24h Change */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-0.5 font-medium text-xs ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPositive ? '+' : ''}{m.change24h.toFixed(2)}%
                        </span>
                      </td>

                      {/* 24h Range Bar */}
                      <td className="py-4 px-5 hidden md:table-cell">
                        <div className="space-y-1.5 w-44">
                          <div className="flex justify-between text-[10px] text-muted">
                            <span>${m.low24h.toFixed(1)}</span>
                            <span>${m.high24h.toFixed(1)}</span>
                          </div>
                          <div className="w-full bg-console-elevated h-1.5 rounded-full overflow-hidden border border-console-border">
                            <div
                              className="h-full bg-white rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(10, ((m.price - m.low24h) / Math.max(0.01, m.high24h - m.low24h)) * 100))}%`
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-4 px-5 hidden sm:table-cell text-white font-medium">
                        ${m.volume24h > 1000 ? `${(m.volume24h / 1000).toFixed(1)}k` : m.volume24h.toFixed(1)}M
                      </td>

                      {/* Trades */}
                      <td className="py-4 px-5 hidden lg:table-cell text-muted">
                        {m.trades24h.toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className="inline-block">
                          <Link
                            href="/terminal"
                            className="cohere-btn-outline !py-1.5 !px-3 text-xs"
                          >
                            <span>Trade</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </motion.div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
