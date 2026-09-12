'use client';

import React, { Component, useEffect, useState, useRef, useMemo } from 'react';
import { TradingViewStockChartWidget } from 'react-tradingview-components';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Activity,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  Clock,
  Radio,
  BarChart2
} from 'lucide-react';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

/**
 * Example class component as specified in the user request:
 * npm install --save react-tradingview-components
 * import React, { Component } from 'react'
 * import TradingViewStockChartWidget from 'react-tradingview-components'
 * class Example extends Component {
 *   render() {
 *     return <TradingViewStockChartWidget symbol='NASDAQ:AAPL' theme='Dark' range='12m' />
 *   }
 * }
 */
export class Example extends Component<{
  symbol?: string;
  theme?: 'Dark' | 'Light';
  range?: '1d' | '5d' | '1m' | '3m' | '6m' | 'ytd' | '12m' | '60m' | 'all' | string;
}> {
  render() {
    return (
      <TradingViewStockChartWidget
        symbol={this.props.symbol || 'NASDAQ:AAPL'}
        theme={this.props.theme || 'Dark'}
        range={this.props.range || '12m'}
        autosize={true}
        allow_symbol_change={true}
      />
    );
  }
}

interface BackpackTickerSnapshot {
  symbol: string;
  lastPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  priceChange: number;
  priceChangePercent: number;
  trades: number;
  timestamp: number;
}

interface BackpackTradeItem {
  id: number;
  price: string;
  quantity: string;
  timestamp: number;
  isBuyerMaker: boolean;
}

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  range?: string;
  theme?: 'Dark' | 'Light';
  height?: number | string;
  onSymbolChange?: (symbol: string) => void;
}

const SYMBOL_PRESETS = [
  { value: 'NASDAQ:AAPL', label: 'AAPL (NASDAQ:AAPL)', bpEquivalent: 'ETH_USDC', isStock: true },
  { value: 'COINBASE:ETHUSD', label: 'ETH / USD (Coinbase)', bpEquivalent: 'ETH_USDC', isStock: false },
  { value: 'BINANCE:BTCUSDT', label: 'BTC / USDT (Binance)', bpEquivalent: 'BTC_USDC', isStock: false },
  { value: 'BINANCE:SOLUSDT', label: 'SOL / USDT (Binance)', bpEquivalent: 'SOL_USDC', isStock: false },
  { value: 'BINANCE:ETHUSDT', label: 'ETH / USDT (Binance)', bpEquivalent: 'ETH_USDC', isStock: false }
];

const RANGE_PRESETS = ['1d', '5d', '1m', '3m', '6m', '12m', 'all'] as const;

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol: initialSymbol = 'NASDAQ:AAPL',
  range: initialRange = '12m',
  theme = 'Dark',
  height = 520,
  onSymbolChange
}) => {
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [activeRange, setActiveRange] = useState(initialRange);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTapeDrawer, setShowTapeDrawer] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const prevPriceRef = useRef<number | null>(null);

  // Map active TradingView symbol to Backpack Exchange symbol
  const bpSymbol = useMemo(() => {
    const found = SYMBOL_PRESETS.find((p) => p.value === activeSymbol);
    if (found) return found.bpEquivalent;
    if (activeSymbol.includes('BTC')) return 'BTC_USDC';
    if (activeSymbol.includes('SOL')) return 'SOL_USDC';
    return 'ETH_USDC';
  }, [activeSymbol]);

  // Real-time Backpack API Ticker state
  const [bpTicker, setBpTicker] = useState<BackpackTickerSnapshot>({
    symbol: bpSymbol,
    lastPrice: 2522.33,
    high24h: 2544.28,
    low24h: 2506.93,
    volume24h: 782.28,
    quoteVolume24h: 1975961.0,
    priceChange: -13.33,
    priceChangePercent: -0.52,
    trades: 4598,
    timestamp: Date.now()
  });

  // Real-time Backpack recent trades stream
  const [bpTrades, setBpTrades] = useState<BackpackTradeItem[]>([]);

  // Sync symbol prop change
  useEffect(() => {
    if (initialSymbol && initialSymbol !== activeSymbol) {
      setActiveSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Fetch real-time data from Backpack API
  useEffect(() => {
    let isMounted = true;

    async function fetchBackpackData() {
      const startTime = performance.now();
      try {
        // 1. Fetch live Ticker from Backpack Exchange API
        let tickerRes = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${bpSymbol}`).catch(() => null);
        if (!tickerRes || !tickerRes.ok) {
          tickerRes = await fetch(`${BACKEND_HTTP_URL}/api/backpack/ticker?symbol=${bpSymbol}`).catch(() => null);
        }

        if (tickerRes && tickerRes.ok) {
          const tJson = await tickerRes.json();
          const latency = Math.round(performance.now() - startTime);

          if (isMounted && tJson) {
            const nextPrice = parseFloat(tJson.lastPrice) || 0;
            if (prevPriceRef.current !== null && nextPrice !== prevPriceRef.current) {
              setPriceFlash(nextPrice > prevPriceRef.current ? 'up' : 'down');
              setTimeout(() => {
                if (isMounted) setPriceFlash(null);
              }, 800);
            }
            prevPriceRef.current = nextPrice;

            setBpTicker({
              symbol: tJson.symbol || bpSymbol,
              lastPrice: nextPrice,
              high24h: parseFloat(tJson.high) || 0,
              low24h: parseFloat(tJson.low) || 0,
              volume24h: parseFloat(tJson.volume) || 0,
              quoteVolume24h: parseFloat(tJson.quoteVolume) || 0,
              priceChange: parseFloat(tJson.priceChange) || 0,
              priceChangePercent: (parseFloat(tJson.priceChangePercent) || 0) * 100,
              trades: parseInt(tJson.trades, 10) || 0,
              timestamp: Date.now()
            });
            setLatencyMs(latency);
          }
        }

        // 2. Fetch live Trades from Backpack Exchange API
        let tradesRes = await fetch(`https://api.backpack.exchange/api/v1/trades?symbol=${bpSymbol}&limit=8`).catch(() => null);
        if (!tradesRes || !tradesRes.ok) {
          tradesRes = await fetch(`${BACKEND_HTTP_URL}/api/backpack/trades?symbol=${bpSymbol}&limit=8`).catch(() => null);
        }

        if (tradesRes && tradesRes.ok) {
          const tradesJson = await tradesRes.json();
          if (isMounted && Array.isArray(tradesJson)) {
            setBpTrades(tradesJson);
          }
        }
      } catch (err) {
        // Silently handled with fallback
      }
    }

    fetchBackpackData();
    const pollInterval = setInterval(fetchBackpackData, 2500);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [bpSymbol]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${bpSymbol}`).catch(() => null);
      if (res && res.ok) {
        const json = await res.json();
        setBpTicker((prev) => ({
          ...prev,
          lastPrice: parseFloat(json.lastPrice) || prev.lastPrice,
          high24h: parseFloat(json.high) || prev.high24h,
          low24h: parseFloat(json.low) || prev.low24h,
          volume24h: parseFloat(json.volume) || prev.volume24h,
          quoteVolume24h: parseFloat(json.quoteVolume) || prev.quoteVolume24h,
          priceChange: parseFloat(json.priceChange) || prev.priceChange,
          priceChangePercent: (parseFloat(json.priceChangePercent) || 0) * 100,
          trades: parseInt(json.trades, 10) || prev.trades,
          timestamp: Date.now()
        }));
      }
    } catch {
      // Ignored
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleSymbolSelect = (sym: string) => {
    setActiveSymbol(sym);
    if (onSymbolChange) {
      onSymbolChange(sym);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-[#09090b] border border-zinc-800/80 shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* 1. Real-Time Backpack Exchange Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-zinc-950/95 border-b border-zinc-800/70 text-xs font-mono gap-3">
        {/* Left: Backpack Live Status & Mark Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>BACKPACK API V1</span>
            {latencyMs !== null && <span className="text-[10px] text-zinc-400">({latencyMs}ms)</span>}
          </div>

          {/* Real-time Mark Price with Flash Animation */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] uppercase tracking-wider">{bpSymbol}:</span>
            <span
              className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                priceFlash === 'up'
                  ? 'text-emerald-400 bg-emerald-500/20 px-1 rounded'
                  : priceFlash === 'down'
                  ? 'text-rose-400 bg-rose-500/20 px-1 rounded'
                  : 'text-white'
              }`}
            >
              ${bpTicker.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                bpTicker.priceChangePercent >= 0
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-rose-400 bg-rose-500/10'
              }`}
            >
              {bpTicker.priceChangePercent >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {bpTicker.priceChangePercent >= 0 ? '+' : ''}
              {bpTicker.priceChangePercent.toFixed(2)}%
            </span>
          </div>

          {/* 24h High / Low / Volume */}
          <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-zinc-800 text-[11px] text-zinc-400">
            <div>
              <span className="text-zinc-500 mr-1">24h H:</span>
              <span className="text-zinc-200">${bpTicker.high24h.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1">24h L:</span>
              <span className="text-zinc-200">${bpTicker.low24h.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1">24h Vol:</span>
              <span className="text-zinc-200">{bpTicker.volume24h.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-zinc-500 mr-1">Trades:</span>
              <span className="text-zinc-200">{bpTicker.trades.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & Presets */}
        <div className="flex items-center gap-2">
          {/* Symbol Selector */}
          <select
            value={activeSymbol}
            onChange={(e) => handleSymbolSelect(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 hover:border-zinc-600 rounded px-2.5 py-1 text-white text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            {SYMBOL_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Range Selector */}
          <div className="hidden sm:flex items-center bg-zinc-900 rounded border border-zinc-800 p-0.5">
            {RANGE_PRESETS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-medium transition ${
                  activeRange === r ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Live Trades Tape Toggle */}
          <button
            type="button"
            onClick={() => setShowTapeDrawer(!showTapeDrawer)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition ${
              showTapeDrawer
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
            title="Toggle Live Backpack Trades Feed"
          >
            <Layers className="w-3 h-3" />
            <span className="hidden md:inline">Backpack Tape</span>
          </button>

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={handleManualRefresh}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            title="Refresh Backpack API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace: TradingViewStockChartWidget & Live Tape Drawer */}
      <div className="relative flex-1 w-full min-h-[420px] flex overflow-hidden">
        {/* TradingViewStockChartWidget Container */}
        <div className="relative flex-1 w-full h-full bg-[#09090b] tradingview-react-wrapper">
          <style jsx global>{`
            .tradingview-react-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              min-height: 420px;
            }
            .tradingview-react-wrapper > div {
              width: 100% !important;
              height: 100% !important;
              min-height: 420px !important;
            }
            .tradingview-react-wrapper iframe {
              width: 100% !important;
              height: 100% !important;
              min-height: 420px !important;
              border: none !important;
            }
          `}</style>

          {/*
            Official react-tradingview-components TradingViewStockChartWidget:
            <TradingViewStockChartWidget
              symbol='NASDAQ:AAPL'
              theme='Dark'
              range='12m'
            />
          */}
          <TradingViewStockChartWidget
            key={`${activeSymbol}_${activeRange}_${theme}`}
            symbol={activeSymbol}
            theme={theme}
            range={activeRange}
            autosize={true}
            allow_symbol_change={true}
            hide_side_toolbar={false}
            hide_top_toolbar={false}
            hide_legend={false}
            save_image={true}
            withdateranges={true}
            toolbar_bg="#09090b"
          />
        </div>

        {/* 3. Live Backpack Trades Feed Overlay / Drawer */}
        {showTapeDrawer && (
          <div className="w-64 bg-zinc-950/95 border-l border-zinc-800 flex flex-col text-xs font-mono shadow-2xl z-20 transition-all">
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Backpack Tape</span>
              </div>
              <span className="text-[10px] text-zinc-500">{bpSymbol}</span>
            </div>

            <div className="grid grid-cols-3 px-3 py-1 text-[10px] text-zinc-500 border-b border-zinc-800/60 uppercase">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Time</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/60 p-1">
              {bpTrades.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-[11px]">
                  Listening to public trades...
                </div>
              ) : (
                bpTrades.map((trade) => {
                  const isBuy = !trade.isBuyerMaker;
                  const date = new Date(trade.timestamp);
                  const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
                  return (
                    <div
                      key={trade.id}
                      className="grid grid-cols-3 px-2 py-1 text-[11px] hover:bg-zinc-900/60 rounded transition"
                    >
                      <span className={isBuy ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        ${parseFloat(trade.price).toFixed(2)}
                      </span>
                      <span className="text-right text-zinc-300">
                        {parseFloat(trade.quantity).toFixed(4)}
                      </span>
                      <span className="text-right text-zinc-500 text-[10px]">{timeStr}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-2 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Streaming from Backpack</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart;
