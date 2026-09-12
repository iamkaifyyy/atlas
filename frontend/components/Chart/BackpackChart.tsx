'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { Activity, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

interface BackpackChartProps {
  initialSymbol?: string;
  height?: number;
}

export const BackpackChart: React.FC<BackpackChartProps> = ({
  initialSymbol = 'ETH_USDC',
  height = 480
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState('1h');
  const [ticker, setTicker] = useState<{
    lastPrice: string;
    high: string;
    low: string;
    volume: string;
    priceChange: string;
    priceChangePercent: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Ticker Data
  useEffect(() => {
    let isMounted = true;
    async function fetchTicker() {
      try {
        let res = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${symbol}`);
        if (!res.ok) {
          res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/ticker?symbol=${symbol}`);
        }
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setTicker(data);
        }
      } catch (err) {
        // Fallback gracefully
      }
    }

    fetchTicker();
    const t = setInterval(fetchTicker, 3000);
    return () => {
      isMounted = false;
      clearInterval(t);
    };
  }, [symbol]);

  // Mount Chart and fetch Klines
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#080c14' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'monospace'
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.15)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.15)' }
      },
      width: chartContainerRef.current.clientWidth,
      height: height - 60,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e293b'
      },
      rightPriceScale: {
        borderColor: '#1e293b'
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e'
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: ''
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    async function loadKlines() {
      setIsLoading(true);
      try {
        const startTime = Math.floor(Date.now() / 1000) - (timeframe === '1m' ? 86400 : 86400 * 7);
        let res = await fetch(
          `https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=${timeframe}&startTime=${startTime}`
        );
        if (!res.ok) {
          res = await fetch(
            `${BACKEND_HTTP_URL}/api/backpack/klines?symbol=${symbol}&interval=${timeframe}&startTime=${startTime}`
          );
        }

        if (res.ok) {
          const rawKlines = await res.json();
          if (Array.isArray(rawKlines) && rawKlines.length > 0) {
            const candleData: any[] = [];
            const volumeData: any[] = [];

            // Sort klines ascending by start time
            const sorted = [...rawKlines].sort(
              (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
            );

            for (const k of sorted) {
              const time = Math.floor(new Date(k.start + ' UTC').getTime() / 1000) as any;
              const open = parseFloat(k.open);
              const high = parseFloat(k.high);
              const low = parseFloat(k.low);
              const close = parseFloat(k.close);
              const volume = parseFloat(k.volume);

              candleData.push({ time, open, high, low, close });
              volumeData.push({
                time,
                value: volume,
                color: close >= open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'
              });
            }

            candleSeries.setData(candleData);
            volumeSeries.setData(volumeData);
          }
        }
      } catch (err) {
        console.error('Failed to load Backpack klines:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadKlines();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, timeframe, height]);

  const priceChangeNum = ticker ? parseFloat(ticker.priceChangePercent) * 100 : 0;
  const isPositive = priceChangeNum >= 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#080c14] border border-border/70 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-surface/90 border-b border-border/60 text-xs font-mono gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wider">Backpack Exchange Feed</span>
          </div>

          {/* Symbol Selector */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-surface-elevated border border-border/60 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ETH_USDC">ETH / USDC</option>
            <option value="SOL_USDC">SOL / USDC</option>
            <option value="BTC_USDC">BTC / USDC</option>
          </select>

          {/* Live Price from Backpack */}
          {ticker && (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white">${parseFloat(ticker.lastPrice).toFixed(2)}</span>
              <span className={`flex items-center text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPositive ? '+' : ''}{priceChangeNum.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Interval Toggles */}
        <div className="flex items-center gap-1 bg-surface-elevated/70 p-0.5 rounded-lg border border-border/50 text-[11px]">
          {['1m', '15m', '1h', '1d'].map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setTimeframe(iv)}
              className={`px-2 py-0.5 rounded uppercase transition ${
                timeframe === iv ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {iv}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full" style={{ height: height - 60 }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#080c14]/80 backdrop-blur-sm text-xs font-mono text-slate-400">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span>Streaming Backpack Candlestick Klines...</span>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Footer Stats from Backpack */}
      {ticker && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-border/50 bg-surface/50 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span>24h High: <strong className="text-slate-200">${parseFloat(ticker.high).toFixed(2)}</strong></span>
            <span>24h Low: <strong className="text-slate-200">${parseFloat(ticker.low).toFixed(2)}</strong></span>
            <span>24h Volume: <strong className="text-slate-200">{parseFloat(ticker.volume).toFixed(1)}</strong></span>
          </div>
          <span className="text-emerald-400">Direct DEX API Stream</span>
        </div>
      )}
    </div>
  );
};
