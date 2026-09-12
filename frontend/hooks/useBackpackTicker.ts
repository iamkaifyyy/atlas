'use client';

import { useState, useEffect } from 'react';
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
}

export function useBackpackTicker(symbol: string = 'ETH_USDC'): BackpackTickerData {
  const [data, setData] = useState<BackpackTickerData>({
    symbol,
    lastPrice: 2525.0,
    high24h: 2565.0,
    low24h: 2505.0,
    volume24h: 550.0,
    quoteVolume24h: 1400000.0,
    priceChange: 0,
    priceChangePercent: 0,
    trades: 4000,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchTicker() {
      try {
        let res = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${symbol}`);
        if (!res.ok) {
          res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/ticker?symbol=${symbol}`);
        }

        if (res.ok) {
          const json = await res.json();
          if (json && isMounted) {
            setData({
              symbol: json.symbol || symbol,
              lastPrice: parseFloat(json.lastPrice) || 2525.0,
              high24h: parseFloat(json.high) || 2565.0,
              low24h: parseFloat(json.low) || 2505.0,
              volume24h: parseFloat(json.volume) || 0,
              quoteVolume24h: parseFloat(json.quoteVolume) || 0,
              priceChange: parseFloat(json.priceChange) || 0,
              priceChangePercent: parseFloat(json.priceChangePercent) * 100 || 0,
              trades: parseInt(json.trades, 10) || 0,
              isLoading: false
            });
          }
        }
      } catch {
        // Fallback
      }
    }

    fetchTicker();
    const interval = setInterval(fetchTicker, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return data;
}
