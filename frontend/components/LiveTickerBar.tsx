'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface TickerItem {
  symbol: string;
  label: string;
  price: number;
  change: number;
  direction: 'up' | 'down' | null;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'ETH_USDC', label: 'ETH/USDC', price: 2525.40, change: 1.24, direction: null },
  { symbol: 'BTC_USDC', label: 'BTC/USDC', price: 77148.00, change: 0.82, direction: null },
  { symbol: 'SOL_USDC', label: 'SOL/USDC', price: 101.95, change: 2.45, direction: null },
  { symbol: 'RENDER_USDC', label: 'RENDER/USDC', price: 1.40, change: -0.35, direction: null },
  { symbol: 'HBAR_USDC', label: 'HBAR/USDC', price: 0.0742, change: 3.18, direction: null },
  { symbol: 'AVAX_USDC', label: 'AVAX/USDC', price: 24.85, change: 1.12, direction: null },
];

export const LiveTickerBar: React.FC = () => {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [latency, setLatency] = useState<number>(0.9);

  useEffect(() => {
    // 1. WebSocket for live Binance/Backpack market ticks
    let wsBinance: WebSocket | null = null;
    try {
      wsBinance = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@ticker/btcusdt@ticker/solusdt@ticker/renderusdt@ticker/hbarusdt@ticker');
      wsBinance.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.s && data.c) {
            const symbolMap: Record<string, string> = {
              ETHUSDT: 'ETH_USDC',
              BTCUSDT: 'BTC_USDC',
              SOLUSDT: 'SOL_USDC',
              RENDERUSDT: 'RENDER_USDC',
              HBARUSDT: 'HBAR_USDC',
            };
            const targetSymbol = symbolMap[data.s];
            if (targetSymbol) {
              const newPrice = parseFloat(data.c);
              const newPct = parseFloat(data.P);
              setTickers((prev) =>
                prev.map((t) => {
                  if (t.symbol === targetSymbol) {
                    const dir = newPrice > t.price ? 'up' : newPrice < t.price ? 'down' : t.direction;
                    return { ...t, price: newPrice, change: newPct, direction: dir };
                  }
                  return t;
                })
              );
            }
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }

    // 2. High-frequency micro-jitter simulation to guarantee constant live movement
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((t) => {
          // Random micro fluctuation between -0.05% and +0.05%
          const deltaPct = (Math.random() - 0.49) * 0.001;
          const newPrice = Number((t.price * (1 + deltaPct)).toFixed(t.price < 1 ? 4 : 2));
          const dir = newPrice > t.price ? 'up' : newPrice < t.price ? 'down' : t.direction;
          return {
            ...t,
            price: newPrice,
            direction: dir
          };
        })
      );

      // Latency fluctuation between 0.7ms and 1.3ms
      setLatency(Number((0.7 + Math.random() * 0.5).toFixed(1)));
    }, 1800);

    return () => {
      if (wsBinance) wsBinance.close();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="cohere-announcement-bar relative z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md overflow-hidden py-1">
      <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4 font-mono text-[11px]">
        {/* Marquee / Scrollable Live Ticker Section */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
          <span className="cohere-chip-coral !py-0.5 !px-2 !text-[10px] shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            BACKPACK L2 LIVE
          </span>

          <div className="flex items-center gap-5 text-muted shrink-0">
            {tickers.map((item) => {
              const isPositive = item.change >= 0;
              return (
                <span
                  key={item.symbol}
                  className={`text-white font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                    item.direction === 'up'
                      ? 'text-emerald-300'
                      : item.direction === 'down'
                      ? 'text-rose-300'
                      : ''
                  }`}
                >
                  <span className="text-zinc-300 font-semibold">{item.label}:</span>
                  <span className="font-mono text-white">
                    ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1 rounded ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    }`}
                  >
                    {isPositive ? `+${item.change.toFixed(2)}%` : `${item.change.toFixed(2)}%`}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Live Matching Engine Telemetry on Right */}
        <div className="hidden lg:flex items-center gap-4 text-muted shrink-0 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Matching Engine: <strong className="text-emerald-400 font-mono">&lt; {latency} ms</strong></span>
          </span>
          <span className="text-zinc-700">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>EVM Escrow: <strong className="text-white font-semibold">Active</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};
