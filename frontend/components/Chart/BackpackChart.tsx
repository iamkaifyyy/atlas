'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { TrendingUp, TrendingDown, RefreshCw, BarChart2 } from 'lucide-react';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

interface BackpackChartProps {
  initialSymbol?: string;
  height?: number;
  onPriceUpdate?: (price: number) => void;
}

interface OHLCData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export const BackpackChart: React.FC<BackpackChartProps> = ({
  initialSymbol = 'ETH_USDC',
  height = 480,
  onPriceUpdate
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState<'1m' | '15m' | '1h' | '1d'>('1h');
  const [ticker, setTicker] = useState<{
    lastPrice: string;
    high: string;
    low: string;
    volume: string;
    quoteVolume?: string;
    priceChange: string;
    priceChangePercent: string;
    trades?: string;
  } | null>(null);
  const [hoveredOHLC, setHoveredOHLC] = useState<OHLCData | null>(null);
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
          if (isMounted) {
            setTicker(data);
            if (onPriceUpdate && data.lastPrice) {
              const p = parseFloat(data.lastPrice);
              if (!isNaN(p)) onPriceUpdate(p);
            }
          }
        }
      } catch (err) {
        // Silently handled
      }
    }

    fetchTicker();
    const t = setInterval(fetchTicker, 2500);
    return () => {
      isMounted = false;
      clearInterval(t);
    };
  }, [symbol, onPriceUpdate]);

  // Mount Chart and fetch Klines
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#09090b' },
        textColor: '#a1a1aa',
        fontSize: 11,
        fontFamily: 'monospace'
      },
      grid: {
        vertLines: { color: 'rgba(39, 39, 42, 0.35)' },
        horzLines: { color: 'rgba(39, 39, 42, 0.35)' }
      },
      width: chartContainerRef.current.clientWidth,
      height: height - 60,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#27272a'
      },
      rightPriceScale: {
        borderColor: '#27272a'
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
      color: '#3f3f46',
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

    // Crosshair hover OHLC listener
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredOHLC(null);
        return;
      }
      const candleData = param.seriesData.get(candleSeries) as any;
      if (candleData && typeof candleData.open === 'number') {
        const volData = param.seriesData.get(volumeSeries) as any;
        setHoveredOHLC({
          open: candleData.open,
          high: candleData.high,
          low: candleData.low,
          close: candleData.close,
          volume: volData?.value
        });
      } else {
        setHoveredOHLC(null);
      }
    });

    async function loadKlines() {
      try {
        const now = Math.floor(Date.now() / 1000);
        let span = 86400 * 7;
        if (timeframe === '1m') span = 3600 * 12; // 12 hours = 720 candles
        else if (timeframe === '15m') span = 86400 * 3; // 3 days = 288 candles
        else if (timeframe === '1h') span = 86400 * 7; // 7 days = 168 candles
        else if (timeframe === '1d') span = 86400 * 60; // 60 days = 60 candles

        const startTime = now - span;
        const endTime = now;

        let res = await fetch(
          `https://api.backpack.exchange/api/v1/klines?symbol=${symbol}&interval=${timeframe}&startTime=${startTime}&endTime=${endTime}`
        );
        if (!res.ok) {
          res = await fetch(
            `${BACKEND_HTTP_URL}/api/backpack/klines?symbol=${symbol}&interval=${timeframe}&startTime=${startTime}&endTime=${endTime}`
          );
        }

        if (res.ok) {
          const rawKlines = await res.json();
          if (Array.isArray(rawKlines) && rawKlines.length > 0 && isMounted) {
            const candleData: any[] = [];
            const volumeData: any[] = [];

            // Sort ascending by start time
            const sorted = [...rawKlines].sort(
              (a, b) => new Date(a.start.replace(' ', 'T') + 'Z').getTime() - new Date(b.start.replace(' ', 'T') + 'Z').getTime()
            );

            for (const k of sorted) {
              const time = Math.floor(new Date(k.start.replace(' ', 'T') + 'Z').getTime() / 1000) as any;
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
        if (isMounted) setIsLoading(false);
      }
    }

    loadKlines();

    // Auto-refresh the latest candlestick every 8 seconds
    const pollTimer = setInterval(loadKlines, 8000);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, timeframe, height]);

  const priceChangeNum = ticker ? parseFloat(ticker.priceChangePercent) * 100 : 0;
  const isPositive = priceChangeNum >= 0;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#09090b] border border-border/70 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-surface/90 border-b border-border/60 text-xs font-mono gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wider">Backpack Exchange Candlestick</span>
          </div>

          {/* Symbol Selector */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-surface-elevated border border-border/60 rounded px-2 py-0.5 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500 font-semibold"
          >
            <option value="ETH_USDC">ETH / USDC</option>
            <option value="SOL_USDC">SOL / USDC</option>
            <option value="BTC_USDC">BTC / USDC</option>
            <option value="RENDER_USDC">RENDER / USDC</option>
            <option value="JUP_USDC">JUP / USDC</option>
          </select>

          {/* Live Price from Backpack */}
          {ticker && (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-white font-mono">
                ${parseFloat(ticker.lastPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`flex items-center text-[11px] font-semibold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPositive ? '+' : ''}{priceChangeNum.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Hover OHLC Values */}
          {hoveredOHLC ? (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-zinc-400 border-l border-border/60 pl-3">
              <span>O: <strong className={hoveredOHLC.close >= hoveredOHLC.open ? 'text-emerald-400' : 'text-rose-400'}>${hoveredOHLC.open.toFixed(2)}</strong></span>
              <span>H: <strong className="text-zinc-200">${hoveredOHLC.high.toFixed(2)}</strong></span>
              <span>L: <strong className="text-zinc-200">${hoveredOHLC.low.toFixed(2)}</strong></span>
              <span>C: <strong className={hoveredOHLC.close >= hoveredOHLC.open ? 'text-emerald-400' : 'text-rose-400'}>${hoveredOHLC.close.toFixed(2)}</strong></span>
              {hoveredOHLC.volume !== undefined && (
                <span>Vol: <strong className="text-zinc-300">{hoveredOHLC.volume.toFixed(2)}</strong></span>
              )}
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono border-l border-border/60 pl-3">
              <BarChart2 className="w-3 h-3" />
              <span>Hover candles for OHLC</span>
            </div>
          )}
        </div>

        {/* Interval Toggles */}
        <div className="flex items-center gap-1 bg-surface-elevated/70 p-0.5 rounded-lg border border-border/50 text-[11px]">
          {(['1m', '15m', '1h', '1d'] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setTimeframe(iv)}
              className={`px-2 py-0.5 rounded uppercase transition font-mono ${
                timeframe === iv
                  ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
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
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#09090b]/80 backdrop-blur-sm text-xs font-mono text-zinc-400">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
            <span>Streaming Backpack Candlestick Klines...</span>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Footer Stats from Backpack */}
      {ticker && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-border/50 bg-surface/50 text-[11px] font-mono text-zinc-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span>24h High: <strong className="text-zinc-200">${parseFloat(ticker.high).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
            <span>24h Low: <strong className="text-zinc-200">${parseFloat(ticker.low).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
            <span>24h Volume: <strong className="text-zinc-200">{parseFloat(ticker.volume).toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong></span>
            {ticker.trades && (
              <span>Trades: <strong className="text-zinc-200">{Number(ticker.trades).toLocaleString()}</strong></span>
            )}
          </div>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Direct DEX API Stream
          </span>
        </div>
      )}
    </div>
  );
};
