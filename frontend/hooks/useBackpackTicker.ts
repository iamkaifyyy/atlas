'use client';

import { useState, useEffect, useRef } from 'react';
import { BACKEND_HTTP_URL } from '../lib/contractAddress';

export interface BackpackTickerData {
  symbol: string;
  lastPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  priceChange: number;
  priceChangePercent: number;
  trades: number;
  isLoading: boolean;
  tickDirection: 'up' | 'down' | null;
}

export function useBackpackTicker(symbol: string = 'ETH_USDC'): BackpackTickerData {
  const getBaseline = (sym: string) => {
    if (sym.includes('AAPL')) {
      return { price: 224.23, high: 226.50, low: 222.10, vol: 48250000, qVol: 10817650000, trades: 382450 };
    }
    if (sym.includes('BTC')) {
      return { price: 77206.0, high: 77900.0, low: 76500.0, vol: 1840.0, qVol: 142000000, trades: 12500 };
    }
    if (sym.includes('SOL')) {
      return { price: 101.55, high: 103.50, low: 99.80, vol: 12500.0, qVol: 1269000, trades: 4200 };
    }
    return { price: 2526.20, high: 2544.28, low: 2506.93, vol: 780.0, qVol: 1970000, trades: 4500 };
  };

  const initial = getBaseline(symbol);

  const [data, setData] = useState<BackpackTickerData>({
    symbol,
    lastPrice: initial.price,
    high24h: initial.high,
    low24h: initial.low,
    volume24h: initial.vol,
    quoteVolume24h: initial.qVol,
    priceChange: 0,
    priceChangePercent: 0,
    trades: initial.trades,
    isLoading: true,
    tickDirection: null
  });

  const prevPriceRef = useRef<number>(initial.price);

  useEffect(() => {
    let isMounted = true;
    const base = getBaseline(symbol);
    prevPriceRef.current = base.price;

    setData((prev) => ({
      ...prev,
      symbol,
      lastPrice: base.price,
      high24h: base.high,
      low24h: base.low,
      volume24h: base.vol,
      quoteVolume24h: base.qVol,
      isLoading: true,
      tickDirection: null
    }));

    async function fetchTicker() {
      try {
        let res: Response | null = null;

        // 1. Next.js internal API route proxy (same-origin, zero CORS issues)
        try {
          res = await fetch(`/api/backpack/ticker?symbol=${encodeURIComponent(symbol)}`, {
            cache: 'no-store'
          });
        } catch {
          res = null;
        }

        // 2. Fallback to local agent-runner proxy on port 3001
        if (!res || !res.ok) {
          try {
            res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/ticker?symbol=${encodeURIComponent(symbol)}`, {
              cache: 'no-store'
            });
          } catch {
            res = null;
          }
        }

        // 3. Fallback direct to Backpack exchange API
        if (!res || !res.ok) {
          try {
            res = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${encodeURIComponent(symbol)}`);
          } catch {
            res = null;
          }
        }

        if (res && res.ok) {
          const json = await res.json();
          if (json && isMounted) {
            const nextPrice = parseFloat(json.lastPrice) || base.price;
            let dir: 'up' | 'down' | null = null;
            if (prevPriceRef.current && nextPrice !== prevPriceRef.current) {
              dir = nextPrice > prevPriceRef.current ? 'up' : 'down';
            }
            prevPriceRef.current = nextPrice;

            const rawPct = parseFloat(json.priceChangePercent) || 0;
            const pct = Math.abs(rawPct) < 1 ? rawPct * 100 : rawPct;

            setData({
              symbol: json.symbol || symbol,
              lastPrice: nextPrice,
              high24h: parseFloat(json.high) || base.high,
              low24h: parseFloat(json.low) || base.low,
              volume24h: parseFloat(json.volume) || base.vol,
              quoteVolume24h: parseFloat(json.quoteVolume) || base.qVol,
              priceChange: parseFloat(json.priceChange) || 0,
              priceChangePercent: pct,
              trades: parseInt(json.trades, 10) || base.trades,
              isLoading: false,
              tickDirection: dir
            });
          }
        }
      } catch {
        // Handled silently
      }
    }

    fetchTicker();
    // Fast real-time polling interval: updates every 1.5 seconds
    const interval = setInterval(fetchTicker, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return data;
}
