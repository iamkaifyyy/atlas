'use client';

import { useState, useEffect, useRef } from 'react';
import { findCryptoAsset } from '../lib/cryptoAssets';

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
  isWsConnected: boolean;
  wsMessageCount: number;
}

export function useBackpackTicker(symbol: string = 'ETH_USDC'): BackpackTickerData {
  const asset = findCryptoAsset(symbol);
  const prevPriceRef = useRef<number>(asset.defaultPrice);

  const [data, setData] = useState<BackpackTickerData>({
    symbol: asset.bpSymbol,
    lastPrice: asset.defaultPrice,
    high24h: asset.defaultPrice * 1.02,
    low24h: asset.defaultPrice * 0.98,
    volume24h: 150000,
    quoteVolume24h: 150000 * asset.defaultPrice,
    priceChange: 0,
    priceChangePercent: 0,
    trades: 8500,
    isLoading: true,
    tickDirection: null,
    isWsConnected: false,
    wsMessageCount: 0
  });

  useEffect(() => {
    let isMounted = true;
    let wsBackpack: WebSocket | null = null;
    let wsBinance: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    const currentAsset = findCryptoAsset(symbol);
    prevPriceRef.current = currentAsset.defaultPrice;

    // Fast initial HTTP fetch to guarantee instantaneous initial render
    async function fetchInitial() {
      try {
        const res = await fetch(`/api/backpack/ticker?symbol=${encodeURIComponent(currentAsset.bpSymbol)}`, {
          cache: 'no-store'
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          const nextPrice = parseFloat(json.lastPrice) || currentAsset.defaultPrice;
          const rawPct = parseFloat(json.priceChangePercent) || 0;
          const pct = Math.abs(rawPct) < 1 ? rawPct * 100 : rawPct;

          setData((prev) => ({
            ...prev,
            symbol: json.symbol || currentAsset.bpSymbol,
            lastPrice: nextPrice,
            high24h: parseFloat(json.high) || nextPrice * 1.02,
            low24h: parseFloat(json.low) || nextPrice * 0.98,
            volume24h: parseFloat(json.volume) || prev.volume24h,
            quoteVolume24h: parseFloat(json.quoteVolume) || prev.quoteVolume24h,
            priceChange: parseFloat(json.priceChange) || 0,
            priceChangePercent: pct,
            trades: parseInt(json.trades, 10) || prev.trades,
            isLoading: false
          }));
          prevPriceRef.current = nextPrice;
        }
      } catch {
        // Handled silently
      }
    }
    fetchInitial();

    // 1. Establish Backpack Exchange WebSocket connection
    try {
      wsBackpack = new WebSocket('wss://ws.backpack.exchange');

      wsBackpack.onopen = () => {
        if (!isMounted) return;
        setData((prev) => ({ ...prev, isWsConnected: true, isLoading: false }));

        // Subscribe to real-time ticker and bookTicker
        wsBackpack?.send(
          JSON.stringify({
            method: 'SUBSCRIBE',
            params: [
              `ticker.${currentAsset.bpSymbol}`,
              `bookTicker.${currentAsset.bpSymbol}`
            ]
          })
        );
      };

      wsBackpack.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);

          // Handle 24h ticker updates
          if (msg.stream === `ticker.${currentAsset.bpSymbol}` && msg.data) {
            const d = msg.data;
            const nextPrice = parseFloat(d.c);
            if (!isNaN(nextPrice) && nextPrice > 0) {
              let dir: 'up' | 'down' | null = null;
              if (prevPriceRef.current && nextPrice !== prevPriceRef.current) {
                dir = nextPrice > prevPriceRef.current ? 'up' : 'down';
              }
              prevPriceRef.current = nextPrice;

              const open = parseFloat(d.o) || nextPrice;
              const pct = open > 0 ? ((nextPrice - open) / open) * 100 : 0;

              setData((prev) => ({
                ...prev,
                symbol: currentAsset.bpSymbol,
                lastPrice: nextPrice,
                high24h: parseFloat(d.h) || prev.high24h,
                low24h: parseFloat(d.l) || prev.low24h,
                volume24h: parseFloat(d.v) || prev.volume24h,
                quoteVolume24h: parseFloat(d.V) || prev.quoteVolume24h,
                priceChange: nextPrice - open,
                priceChangePercent: pct,
                trades: parseInt(d.n, 10) || prev.trades,
                isLoading: false,
                tickDirection: dir,
                isWsConnected: true,
                wsMessageCount: prev.wsMessageCount + 1
              }));
            }
          }

          // Handle bookTicker sub-second top of book ticks
          if (msg.stream === `bookTicker.${currentAsset.bpSymbol}` && msg.data) {
            const d = msg.data;
            const ask = parseFloat(d.a);
            const bid = parseFloat(d.b);
            if (!isNaN(ask) && !isNaN(bid) && ask > 0 && bid > 0) {
              const midPrice = (ask + bid) / 2;
              let dir: 'up' | 'down' | null = null;
              if (prevPriceRef.current && midPrice !== prevPriceRef.current) {
                dir = midPrice > prevPriceRef.current ? 'up' : 'down';
              }
              prevPriceRef.current = midPrice;

              setData((prev) => ({
                ...prev,
                lastPrice: midPrice,
                tickDirection: dir,
                isWsConnected: true,
                wsMessageCount: prev.wsMessageCount + 1
              }));
            }
          }
        } catch {
          // Handled silently
        }
      };

      wsBackpack.onclose = () => {
        if (isMounted) {
          setData((prev) => ({ ...prev, isWsConnected: false }));
        }
      };
    } catch {
      // Browser WS error
    }

    // 2. Fallback Stream: Binance Public WebSocket for Layer 2 rollups (ARB, OP, STRK, POL, etc.)
    try {
      const binancePair = `${currentAsset.unit.toLowerCase()}usdt`;
      wsBinance = new WebSocket(`wss://stream.binance.com:9443/ws/${binancePair}@ticker`);

      wsBinance.onopen = () => {
        if (!isMounted) return;
        setData((prev) => ({ ...prev, isWsConnected: true, isLoading: false }));
      };

      wsBinance.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const d = JSON.parse(event.data);
          if (d && d.c) {
            const nextPrice = parseFloat(d.c);
            let dir: 'up' | 'down' | null = null;
            if (prevPriceRef.current && nextPrice !== prevPriceRef.current) {
              dir = nextPrice > prevPriceRef.current ? 'up' : 'down';
            }
            prevPriceRef.current = nextPrice;

            const pct = parseFloat(d.P) || 0;

            setData((prev) => ({
              ...prev,
              symbol: currentAsset.bpSymbol,
              lastPrice: nextPrice,
              high24h: parseFloat(d.h) || prev.high24h,
              low24h: parseFloat(d.l) || prev.low24h,
              volume24h: parseFloat(d.v) || prev.volume24h,
              quoteVolume24h: parseFloat(d.q) || prev.quoteVolume24h,
              priceChange: parseFloat(d.p) || 0,
              priceChangePercent: pct,
              trades: parseInt(d.n, 10) || prev.trades,
              isLoading: false,
              tickDirection: dir,
              isWsConnected: true,
              wsMessageCount: prev.wsMessageCount + 1
            }));
          }
        } catch {
          // Handled silently
        }
      };
    } catch {
      // Handled silently
    }

    // 3. Fallback interval polling
    fallbackInterval = setInterval(fetchInitial, 4000);

    return () => {
      isMounted = false;
      if (wsBackpack) {
        try { wsBackpack.close(); } catch {}
      }
      if (wsBinance) {
        try { wsBinance.close(); } catch {}
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [symbol]);

  return data;
}
