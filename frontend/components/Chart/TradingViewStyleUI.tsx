'use client';

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Search, ChevronDown, MousePointer2, TrendingUp, Minus, Square, Type,
  Magnet, Eraser, Settings, Maximize2, Activity, X, Check, RefreshCw
} from 'lucide-react';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

/* ------------------------------------------------------------------ */
/* Design tokens - Obsidian Neutral Dark Theme (Zero Bluish Elements) */
/* ------------------------------------------------------------------ */
const THEMES = {
  dark: {
    bg: '#09090b',
    panel: '#121215',
    panelAlt: '#1a1a1f',
    border: '#27272a',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    accent: '#10b981',
    bull: '#10b981',
    bear: '#f43f5e',
    grid: '#1c1c21',
    crosshair: '#71717a'
  },
  light: {
    bg: '#ffffff',
    panel: '#f4f4f5',
    panelAlt: '#e4e4e7',
    border: '#d4d4d8',
    text: '#18181b',
    textMuted: '#71717a',
    accent: '#059669',
    bull: '#059669',
    bear: '#e11d48',
    grid: '#f0f0f2',
    crosshair: '#71717a'
  }
};

export interface MarketSymbol {
  ticker: string;
  name: string;
  price: number;
  backpackSymbol?: string;
}

const SYMBOLS: MarketSymbol[] = [
  { ticker: 'ETH_USDC', name: 'Ethereum / USDC (Backpack)', price: 2525.0, backpackSymbol: 'ETH_USDC' },
  { ticker: 'SOL_USDC', name: 'Solana / USDC (Backpack)', price: 102.0, backpackSymbol: 'SOL_USDC' },
  { ticker: 'BTC_USDC', name: 'Bitcoin / USDC (Backpack)', price: 77150.0, backpackSymbol: 'BTC_USDC' },
  { ticker: 'RENDER_USDC', name: 'Render / USDC (Backpack)', price: 1.40, backpackSymbol: 'RENDER_USDC' },
  { ticker: 'JUP_USDC', name: 'Jupiter / USDC (Backpack)', price: 0.25, backpackSymbol: 'JUP_USDC' },
  { ticker: 'AAPL', name: 'Apple Inc. (Simulation)', price: 228.4 },
  { ticker: 'TSLA', name: 'Tesla Inc. (Simulation)', price: 241.1 }
];

const RESOLUTIONS = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const CHART_W = 1000;
const CHART_H = 520;

/* ------------------------------------------------------------------ */
/* Fallback Candle Generator (Deterministic per seed)                 */
/* ------------------------------------------------------------------ */
function seedFromString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCandles(basePrice: number, count: number, seed: number, volatility: number) {
  const rand = mulberry32(seed);
  let price = basePrice;
  const candles: { open: number; close: number; high: number; low: number; time?: number; label?: string }[] = [];
  const now = Math.floor(Date.now() / 1000);
  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (rand() - 0.48) * basePrice * volatility;
    const close = Math.max(open + change, basePrice * 0.05);
    const high = Math.max(open, close) + rand() * basePrice * volatility * 0.5;
    const low = Math.min(open, close) - rand() * basePrice * volatility * 0.5;
    const time = now - (count - i) * 3600;
    candles.push({ open, close, high, low, time });
    price = close;
  }
  return candles;
}

function timeLabel(i: number, resolution: string, candleTime?: number) {
  if (candleTime) {
    const d = new Date(candleTime * 1000);
    if (resolution === '1m' || resolution === '5m' || resolution === '15m') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (resolution === '1H' || resolution === '4H') {
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    }
    if (resolution === '1W') {
      return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  const base = new Date(2026, 0, 1);
  if (resolution === '1m' || resolution === '5m' || resolution === '15m') {
    const mins = resolution === '1m' ? i : resolution === '5m' ? i * 5 : i * 15;
    return new Date(base.getTime() + mins * 60000).toTimeString().slice(0, 5);
  }
  if (resolution === '1H' || resolution === '4H') {
    const hrs = resolution === '1H' ? i : i * 4;
    const d = new Date(base.getTime() + hrs * 3600000);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
  }
  if (resolution === '1W') {
    const d = new Date(base.getTime() + i * 7 * 86400000);
    return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
  }
  const d = new Date(base.getTime() + i * 86400000);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ChartStyleIcon({ type, color }: { type: string; color: string }) {
  if (type === 'line') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 12 L5 7 L8 9 L15 2" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'bar') {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line x1="3" y1="2" x2="3" y2="14" stroke={color} strokeWidth="1.4" />
        <line x1="1" y1="5" x2="3" y2="5" stroke={color} strokeWidth="1.4" />
        <line x1="3" y1="10" x2="5" y2="10" stroke={color} strokeWidth="1.4" />
        <line x1="9" y1="4" x2="9" y2="12" stroke={color} strokeWidth="1.4" />
        <line x1="7" y1="6" x2="9" y2="6" stroke={color} strokeWidth="1.4" />
        <line x1="9" y1="9" x2="11" y2="9" stroke={color} strokeWidth="1.4" />
        <line x1="14" y1="3" x2="14" y2="13" stroke={color} strokeWidth="1.4" />
        <line x1="12" y1="5" x2="14" y2="5" stroke={color} strokeWidth="1.4" />
        <line x1="14" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <line x1="4" y1="1" x2="4" y2="15" stroke={color} strokeWidth="1.2" />
      <rect x="2" y="5" width="4" height="6" fill={color} />
      <line x1="12" y1="2" x2="12" y2="12" stroke={color} strokeWidth="1.2" />
      <rect x="10" y="4" width="4" height="5" fill={color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main TradingView Style Component with Backpack API Live Stream     */
/* ------------------------------------------------------------------ */
interface TradingViewStyleUIProps {
  initialSymbol?: string;
  onPriceSelect?: (price: number) => void;
}

export default function TradingViewStyleUI({
  initialSymbol = 'ETH_USDC',
  onPriceSelect
}: TradingViewStyleUIProps) {
  const [themeName, setThemeName] = useState<'dark' | 'light'>('dark');
  const T = THEMES[themeName];

  // Initial symbol index selection
  const defaultIdx = Math.max(0, SYMBOLS.findIndex(s => s.ticker === initialSymbol || s.backpackSymbol === initialSymbol));
  const [symbolIdx, setSymbolIdx] = useState(defaultIdx);
  const [resolution, setResolution] = useState('1H');
  const [chartStyle, setChartStyle] = useState('candle');
  const [tool, setTool] = useState('cursor');
  const [magnet, setMagnet] = useState(false);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [pending, setPending] = useState<any>(null);
  const [dragRect, setDragRect] = useState<any>(null);
  const [textEditor, setTextEditor] = useState<{ x: number; y: number; value: string } | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; idx: number } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [indicatorsOpen, setIndicatorsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState({ sma: false, ema: false });

  // Live Backpack Exchange State
  const [liveCandles, setLiveCandles] = useState<{ open: number; close: number; high: number; low: number; time: number }[] | null>(null);
  const [isBackpackLoading, setIsBackpackLoading] = useState(false);
  const [tickerPrice, setTickerPrice] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const symbol = SYMBOLS[symbolIdx] || SYMBOLS[0];
  const candleCount = resolution === '1m' || resolution === '5m' ? 100 : 70;
  const volatility = resolution === '1W' ? 0.09 : resolution === '1D' ? 0.05 : 0.02;

  // Fetch Live Candlestick Klines from Backpack Exchange API
  const fetchBackpackKlines = useCallback(async () => {
    if (!symbol.backpackSymbol) {
      setLiveCandles(null);
      return;
    }

    setIsBackpackLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const iv = resolution.toLowerCase();
      let span = 86400 * 7;
      if (iv === '1m') span = 3600 * 12;
      else if (iv === '5m') span = 86400 * 2;
      else if (iv === '15m') span = 86400 * 5;
      else if (iv === '1h') span = 86400 * 10;
      else if (iv === '4h') span = 86400 * 30;
      else if (iv === '1d' || iv === '1w') span = 86400 * 90;

      const startTime = now - span;
      const endTime = now;

      let res = await fetch(
        `https://api.backpack.exchange/api/v1/klines?symbol=${symbol.backpackSymbol}&interval=${iv}&startTime=${startTime}&endTime=${endTime}`
      );
      if (!res.ok) {
        res = await fetch(
          `${BACKEND_HTTP_URL}/api/backpack/klines?symbol=${symbol.backpackSymbol}&interval=${iv}&startTime=${startTime}&endTime=${endTime}`
        );
      }

      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const sorted = [...raw].sort(
            (a, b) => new Date(a.start.replace(' ', 'T') + 'Z').getTime() - new Date(b.start.replace(' ', 'T') + 'Z').getTime()
          );

          // Take latest 70-100 candles for pristine chart density
          const sliceCount = resolution === '1m' || resolution === '5m' ? 100 : 70;
          const trimmed = sorted.slice(-sliceCount);

          const formatted = trimmed.map(k => ({
            open: parseFloat(k.open),
            high: parseFloat(k.high),
            low: parseFloat(k.low),
            close: parseFloat(k.close),
            time: Math.floor(new Date(k.start.replace(' ', 'T') + 'Z').getTime() / 1000)
          }));

          setLiveCandles(formatted);
          const latestClose = formatted[formatted.length - 1]?.close;
          if (latestClose) {
            setTickerPrice(latestClose);
            if (onPriceSelect) onPriceSelect(latestClose);
          }
        }
      }
    } catch (err) {
      console.warn('Backpack klines fetch error, using deterministic generator:', err);
    } finally {
      setIsBackpackLoading(false);
    }
  }, [symbol.backpackSymbol, resolution, onPriceSelect]);

  useEffect(() => {
    fetchBackpackKlines();
    const intervalId = setInterval(fetchBackpackKlines, 7000);
    return () => clearInterval(intervalId);
  }, [fetchBackpackKlines]);

  // Fallback synthetic candles if not connected to Backpack
  const fallbackData = useMemo(
    () => generateCandles(symbol.price, candleCount, seedFromString(symbol.ticker + resolution), volatility),
    [symbol.ticker, resolution, symbol.price, candleCount, volatility]
  );

  const data = liveCandles && liveCandles.length > 0 ? liveCandles : fallbackData;

  const { minPrice, maxPrice } = useMemo(() => {
    let mn = Infinity, mx = -Infinity;
    data.forEach((c) => {
      mn = Math.min(mn, c.low);
      mx = Math.max(mx, c.high);
    });
    const pad = Math.max((mx - mn) * 0.08, 0.5);
    return { minPrice: mn - pad, maxPrice: mx + pad };
  }, [data]);

  const priceToY = useCallback((p: number) => ((maxPrice - p) / (maxPrice - minPrice)) * CHART_H, [minPrice, maxPrice]);
  const yToPrice = useCallback((y: number) => maxPrice - (y / CHART_H) * (maxPrice - minPrice), [minPrice, maxPrice]);

  const count = data.length;
  const spacing = CHART_W / count;
  const candleX = (i: number) => i * spacing + spacing / 2;

  // Indicators: SMA 14
  const sma = useMemo(() => {
    if (!activeIndicators.sma) return null;
    const period = 14, out: (number | null)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        out.push(null);
        continue;
      }
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
      out.push(sum / period);
    }
    return out;
  }, [data, activeIndicators.sma]);

  // Indicators: EMA 21
  const ema = useMemo(() => {
    if (!activeIndicators.ema) return null;
    const period = 21, k = 2 / (period + 1), out: (number | null)[] = [];
    let prev: number | null = null;
    data.forEach((c, i) => {
      if (prev === null) {
        prev = c.close;
        out.push(i < period - 1 ? null : prev);
        return;
      }
      prev = c.close * k + prev * (1 - k);
      out.push(i < period - 1 ? null : prev);
    });
    return out;
  }, [data, activeIndicators.ema]);

  function getSvgPoint(evt: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const inv = pt.matrixTransform(ctm.inverse());
    return { x: inv.x, y: inv.y };
  }

  function nearestCandleIndex(x: number) {
    return Math.max(0, Math.min(data.length - 1, Math.floor(x / spacing)));
  }

  function snappedPrice(x: number, y: number) {
    const raw = yToPrice(y);
    if (!magnet) return raw;
    const c = data[nearestCandleIndex(x)];
    const candidates = [c.open, c.high, c.low, c.close];
    let best = candidates[0], bestDist = Infinity;
    candidates.forEach((v) => {
      const d = Math.abs(v - raw);
      if (d < bestDist) {
        bestDist = d;
        best = v;
      }
    });
    return best;
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getSvgPoint(e);
    setHover({ x, y, idx: nearestCandleIndex(x) });
    if (tool === 'rect' && dragRect) setDragRect((d: any) => ({ ...d, x2: x, y2: y }));
    if (tool === 'trend' && pending) setPending((p: any) => ({ ...p, previewX: x, previewY: y }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getSvgPoint(e);
    if (tool === 'hline') {
      const price = snappedPrice(x, y);
      setDrawings((d) => [...d, { id: Date.now() + Math.random(), type: 'hline', price }]);
      if (onPriceSelect) onPriceSelect(price);
    } else if (tool === 'trend') {
      if (!pending) setPending({ x1: x, y1: y });
      else {
        setDrawings((d) => [...d, { id: Date.now() + Math.random(), type: 'trend', x1: pending.x1, y1: pending.y1, x2: x, y2: y }]);
        setPending(null);
      }
    } else if (tool === 'rect') {
      setDragRect({ x1: x, y1: y, x2: x, y2: y });
    } else if (tool === 'text') {
      setTextEditor({ x, y, value: '' });
    } else if (tool === 'eraser') {
      eraseNear(x, y);
    }
  };

  const handleMouseUp = () => {
    if (tool === 'rect' && dragRect) {
      if (Math.abs(dragRect.x2 - dragRect.x1) > 4 && Math.abs(dragRect.y2 - dragRect.y1) > 4) {
        setDrawings((d) => [...d, { id: Date.now() + Math.random(), type: 'rect', ...dragRect }]);
      }
      setDragRect(null);
    }
  };

  function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  function eraseNear(x: number, y: number) {
    const threshold = 14;
    setDrawings((prev) => {
      let removeIdx = -1, best = threshold;
      prev.forEach((d, i) => {
        let dist = Infinity;
        if (d.type === 'hline') dist = Math.abs(priceToY(d.price) - y);
        else if (d.type === 'trend') dist = distToSegment(x, y, d.x1, d.y1, d.x2, d.y2);
        else if (d.type === 'rect') {
          const minX = Math.min(d.x1, d.x2), maxX = Math.max(d.x1, d.x2);
          const minY = Math.min(d.y1, d.y2), maxY = Math.max(d.y1, d.y2);
          dist = (x >= minX && x <= maxX && y >= minY && y <= maxY) ? 0 : Infinity;
        } else if (d.type === 'text') dist = Math.hypot(x - d.x, y - d.y);
        if (dist < best) {
          best = dist;
          removeIdx = i;
        }
      });
      if (removeIdx === -1) return prev;
      const copy = [...prev];
      copy.splice(removeIdx, 1);
      return copy;
    });
  }

  function commitText() {
    if (textEditor && textEditor.value.trim()) {
      setDrawings((d) => [...d, { id: Date.now() + Math.random(), type: 'text', x: textEditor.x, y: textEditor.y, value: textEditor.value.trim() }]);
    }
    setTextEditor(null);
  }

  function toggleFullscreen() {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }

  const priceGridCount = 6;
  const priceGridLines = Array.from({ length: priceGridCount + 1 }, (_, i) => {
    const price = maxPrice - (i / priceGridCount) * (maxPrice - minPrice);
    return { y: priceToY(price), price };
  });

  const timeLabelStep = Math.max(1, Math.floor(count / 8));
  const last = data[data.length - 1];
  const prevClose = data.length > 1 ? data[data.length - 2].close : last.open;
  const changeAbs = last.close - prevClose;
  const changePct = (changeAbs / prevClose) * 100;
  const displayCandle = hover ? data[hover.idx] : last;

  const filteredSymbols = SYMBOLS.filter((s) => (s.ticker + s.name).toLowerCase().includes(searchQuery.toLowerCase()));
  const fmt = (p: number) => (p < 10 ? p.toFixed(4) : p < 1000 ? p.toFixed(2) : p.toFixed(1));

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col select-none rounded-xl overflow-hidden border border-border/80"
      style={{
        background: T.bg,
        color: T.text,
        fontFamily: 'Inter, ui-sans-serif, system-ui',
        minHeight: 560
      }}
    >
      {/* TOP TOOLBAR */}
      <div
        className="flex items-center gap-1 px-3 shrink-0 relative"
        style={{ height: 44, borderBottom: `1px solid ${T.border}`, background: T.panel }}
      >
        {/* Symbol Search Button */}
        <button
          type="button"
          onClick={() => setSearchOpen((o) => !o)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded transition hover:bg-surface-elevated"
          style={{ background: searchOpen ? T.panelAlt : 'transparent' }}
        >
          <Search size={14} color={T.textMuted} />
          <span className="font-bold text-xs tracking-tight text-white font-mono">{symbol.ticker}</span>
          <ChevronDown size={12} color={T.textMuted} />
        </button>

        {/* Live Backpack Badge */}
        {symbol.backpackSymbol && (
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            BACKPACK DEX
          </span>
        )}

        {/* Symbol Search Dropdown */}
        {searchOpen && (
          <div
            className="absolute left-2 top-11 z-30 rounded-lg shadow-2xl overflow-hidden"
            style={{ width: 320, background: T.panel, border: `1px solid ${T.border}` }}
          >
            <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
              <Search size={14} color={T.textMuted} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crypto or stock..."
                className="bg-transparent outline-none text-xs flex-1 font-mono"
                style={{ color: T.text }}
              />
            </div>
            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
              {filteredSymbols.map((s) => {
                const realIdx = SYMBOLS.indexOf(s);
                return (
                  <button
                    key={s.ticker}
                    type="button"
                    onClick={() => {
                      setSymbolIdx(realIdx);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-elevated transition"
                    style={{ background: realIdx === symbolIdx ? T.panelAlt : 'transparent' }}
                  >
                    <div>
                      <div className="text-xs font-semibold text-white font-mono">{s.ticker}</div>
                      <div className="text-[11px]" style={{ color: T.textMuted }}>{s.name}</div>
                    </div>
                    <div className="text-xs font-mono font-medium" style={{ color: T.accent }}>
                      ${fmt(s.price)}
                    </div>
                  </button>
                );
              })}
              {filteredSymbols.length === 0 && (
                <div className="px-3 py-4 text-xs text-center" style={{ color: T.textMuted }}>
                  No matches found
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ width: 1, height: 20, background: T.border, margin: '0 4px' }} />

        {/* Resolutions */}
        <div className="flex items-center gap-0.5 font-mono">
          {RESOLUTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setResolution(r)}
              className="px-2 py-1 rounded text-xs font-medium transition"
              style={{
                background: resolution === r ? T.panelAlt : 'transparent',
                color: resolution === r ? T.accent : T.textMuted,
                fontWeight: resolution === r ? 700 : 500
              }}
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: T.border, margin: '0 4px' }} />

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-0.5">
          {[
            { id: 'candle', label: 'Candles' },
            { id: 'bar', label: 'Bars' },
            { id: 'line', label: 'Line' }
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.label}
              onClick={() => setChartStyle(s.id)}
              className="p-1.5 rounded transition hover:bg-surface-elevated"
              style={{ background: chartStyle === s.id ? T.panelAlt : 'transparent' }}
            >
              <ChartStyleIcon type={s.id} color={chartStyle === s.id ? T.accent : T.textMuted} />
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: T.border, margin: '0 4px' }} />

        {/* Indicators Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIndicatorsOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition hover:bg-surface-elevated"
            style={{ background: indicatorsOpen ? T.panelAlt : 'transparent', color: T.textMuted }}
          >
            <Activity size={14} color={T.accent} />
            <span>Indicators</span>
          </button>
          {indicatorsOpen && (
            <div
              className="absolute left-0 top-9 z-30 rounded-lg shadow-2xl p-1.5"
              style={{ width: 200, background: T.panel, border: `1px solid ${T.border}` }}
            >
              {[
                { key: 'sma', label: 'Moving Average (SMA 14)' },
                { key: 'ema', label: 'Exponential MA (EMA 21)' }
              ].map((ind) => (
                <button
                  key={ind.key}
                  type="button"
                  onClick={() => setActiveIndicators((a: any) => ({ ...a, [ind.key]: !a[ind.key] }))}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition hover:bg-surface-elevated"
                  style={{ color: T.text }}
                >
                  <span>{ind.label}</span>
                  {(activeIndicators as any)[ind.key] && <Check size={13} color={T.accent} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Loading Spinner */}
        {isBackpackLoading && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mr-2">
            <RefreshCw size={13} className="animate-spin text-emerald-400" />
            <span className="hidden md:inline">Backpack Sync</span>
          </div>
        )}

        {/* Appearance Settings */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSettingsOpen((o) => !o)}
            className="p-1.5 rounded transition hover:bg-surface-elevated"
            style={{ background: settingsOpen ? T.panelAlt : 'transparent' }}
            title="Appearance Settings"
          >
            <Settings size={14} color={T.textMuted} />
          </button>
          {settingsOpen && (
            <div
              className="absolute right-0 top-9 z-30 rounded-lg shadow-2xl p-3"
              style={{ width: 190, background: T.panel, border: `1px solid ${T.border}` }}
            >
              <div className="text-xs mb-2 font-semibold" style={{ color: T.textMuted }}>Theme Palette</div>
              <div className="flex gap-1.5">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setThemeName(t)}
                    className="flex-1 text-xs py-1.5 rounded capitalize font-medium transition"
                    style={{
                      background: themeName === t ? T.accent : T.panelAlt,
                      color: themeName === t ? '#09090b' : T.text
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded transition hover:bg-surface-elevated"
          title="Fullscreen"
        >
          <Maximize2 size={14} color={T.textMuted} />
        </button>
      </div>

      {/* BODY (LEFT DRAWING DOCK + SVG CHART CANVAS) */}
      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        {/* LEFT DRAWING TOOLBAR */}
        <div
          className="flex flex-col items-center gap-1 py-2.5 shrink-0"
          style={{ width: 44, borderRight: `1px solid ${T.border}`, background: T.panel }}
        >
          {[
            { id: 'cursor', icon: MousePointer2, label: 'Cross / Select' },
            { id: 'trend', icon: TrendingUp, label: 'Trend Line (Click 2 points)' },
            { id: 'hline', icon: Minus, label: 'Horizontal Price Level' },
            { id: 'rect', icon: Square, label: 'Rectangle Area' },
            { id: 'text', icon: Type, label: 'Text Note' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => {
                setTool(id);
                setPending(null);
              }}
              className="p-2 rounded transition hover:bg-surface-elevated"
              style={{
                background: tool === id ? T.panelAlt : 'transparent',
                border: tool === id ? `1px solid ${T.accent}` : '1px solid transparent'
              }}
            >
              <Icon size={15} color={tool === id ? T.accent : T.textMuted} />
            </button>
          ))}

          <div style={{ width: 22, height: 1, background: T.border, margin: '4px 0' }} />

          <button
            type="button"
            title="Magnet Snapping Mode"
            onClick={() => setMagnet((m) => !m)}
            className="p-2 rounded transition"
            style={{
              background: magnet ? T.panelAlt : 'transparent',
              border: magnet ? `1px solid ${T.accent}` : '1px solid transparent'
            }}
          >
            <Magnet size={15} color={magnet ? T.accent : T.textMuted} />
          </button>

          <button
            type="button"
            title="Eraser (Click any drawing)"
            onClick={() => setTool('eraser')}
            className="p-2 rounded transition"
            style={{
              background: tool === 'eraser' ? T.panelAlt : 'transparent',
              border: tool === 'eraser' ? `1px solid ${T.bear}` : '1px solid transparent'
            }}
          >
            <Eraser size={15} color={tool === 'eraser' ? T.bear : T.textMuted} />
          </button>

          <button
            type="button"
            title="Clear All Drawings"
            onClick={() => setDrawings([])}
            className="p-2 rounded mt-1 transition hover:bg-surface-elevated text-zinc-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* CHART + SCALES */}
        <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
          <div className="flex-1 flex" style={{ minHeight: 0 }}>
            <div className="relative flex-1" style={{ minWidth: 0 }}>
              {/* Floating OHLC Telemetry Overlay */}
              <div className="absolute top-2.5 left-3.5 z-10 text-xs leading-5 font-mono pointer-events-none">
                <div className="flex items-center gap-2 font-sans font-bold" style={{ fontSize: 13 }}>
                  <span>{symbol.ticker}</span>
                  <span style={{ color: T.textMuted, fontWeight: 400 }}>· {resolution} · {symbol.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5" style={{ color: T.textMuted }}>
                  <span>O <b style={{ color: T.text }}>${fmt(displayCandle.open)}</b></span>
                  <span>H <b style={{ color: T.text }}>${fmt(displayCandle.high)}</b></span>
                  <span>L <b style={{ color: T.text }}>${fmt(displayCandle.low)}</b></span>
                  <span>C <b style={{ color: T.text }}>${fmt(displayCandle.close)}</b></span>
                  <span style={{ color: changeAbs >= 0 ? T.bull : T.bear, fontWeight: 600 }}>
                    {changeAbs >= 0 ? '+' : ''}${fmt(changeAbs)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
                  </span>
                </div>
                {(activeIndicators.sma || activeIndicators.ema) && (
                  <div className="flex items-center gap-3 mt-0.5 text-[11px]">
                    {activeIndicators.sma && <span style={{ color: '#F2B84B' }}>● MA(14)</span>}
                    {activeIndicators.ema && <span style={{ color: '#10b981' }}>● EMA(21)</span>}
                  </div>
                )}
              </div>

              {/* Interactive SVG Canvas */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                preserveAspectRatio="none"
                className="w-full h-full block"
                style={{ cursor: tool === 'eraser' ? 'not-allowed' : 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHover(null)}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                {/* Horizontal Price Grid Lines */}
                {priceGridLines.map((g, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={g.y}
                    x2={CHART_W}
                    y2={g.y}
                    stroke={T.grid}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* User Rectangles */}
                {drawings.filter((d) => d.type === 'rect').map((d) => (
                  <rect
                    key={d.id}
                    x={Math.min(d.x1, d.x2)}
                    y={Math.min(d.y1, d.y2)}
                    width={Math.abs(d.x2 - d.x1)}
                    height={Math.abs(d.y2 - d.y1)}
                    fill={T.accent}
                    fillOpacity={0.12}
                    stroke={T.accent}
                    strokeWidth={1.2}
                  />
                ))}
                {dragRect && (
                  <rect
                    x={Math.min(dragRect.x1, dragRect.x2)}
                    y={Math.min(dragRect.y1, dragRect.y2)}
                    width={Math.abs(dragRect.x2 - dragRect.x1)}
                    height={Math.abs(dragRect.y2 - dragRect.y1)}
                    fill={T.accent}
                    fillOpacity={0.08}
                    stroke={T.accent}
                    strokeDasharray="4 3"
                    strokeWidth={1.2}
                  />
                )}

                {/* Primary Chart Rendering (Line, Bars, or Candlesticks) */}
                {chartStyle === 'line' ? (
                  <>
                    <polyline
                      fill="none"
                      stroke={T.accent}
                      strokeWidth={1.8}
                      vectorEffect="non-scaling-stroke"
                      points={data.map((c, i) => `${candleX(i)},${priceToY(c.close)}`).join(' ')}
                    />
                    <polygon
                      fill={T.accent}
                      fillOpacity={0.08}
                      stroke="none"
                      points={`${candleX(0)},${CHART_H} ` + data.map((c, i) => `${candleX(i)},${priceToY(c.close)}`).join(' ') + ` ${candleX(data.length - 1)},${CHART_H}`}
                    />
                  </>
                ) : (
                  data.map((c, i) => {
                    const bull = c.close >= c.open;
                    const color = bull ? T.bull : T.bear;
                    const x = candleX(i);
                    if (chartStyle === 'bar') {
                      const tick = spacing * 0.28;
                      return (
                        <g key={i}>
                          <line x1={x} y1={priceToY(c.high)} x2={x} y2={priceToY(c.low)} stroke={color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                          <line x1={x - tick} y1={priceToY(c.open)} x2={x} y2={priceToY(c.open)} stroke={color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                          <line x1={x} y1={priceToY(c.close)} x2={x + tick} y2={priceToY(c.close)} stroke={color} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                        </g>
                      );
                    }
                    const bodyW = Math.max(2, spacing * 0.65);
                    const yOpen = priceToY(c.open), yClose = priceToY(c.close);
                    const top = Math.min(yOpen, yClose), h = Math.max(1, Math.abs(yClose - yOpen));
                    return (
                      <g key={i}>
                        <line x1={x} y1={priceToY(c.high)} x2={x} y2={priceToY(c.low)} stroke={color} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
                        <rect x={x - bodyW / 2} y={top} width={bodyW} height={h} fill={color} />
                      </g>
                    );
                  })
                )}

                {/* Overlaid Indicators */}
                {sma && (
                  <polyline
                    fill="none"
                    stroke="#F2B84B"
                    strokeWidth={1.6}
                    vectorEffect="non-scaling-stroke"
                    points={data.map((c, i) => (sma[i] != null ? `${candleX(i)},${priceToY(sma[i]!)}` : null)).filter(Boolean).join(' ')}
                  />
                )}
                {ema && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={1.6}
                    vectorEffect="non-scaling-stroke"
                    points={data.map((c, i) => (ema[i] != null ? `${candleX(i)},${priceToY(ema[i]!)}` : null)).filter(Boolean).join(' ')}
                  />
                )}

                {/* User Trend Lines */}
                {drawings.filter((d) => d.type === 'trend').map((d) => (
                  <line
                    key={d.id}
                    x1={d.x1}
                    y1={d.y1}
                    x2={d.x2}
                    y2={d.y2}
                    stroke={T.accent}
                    strokeWidth={1.6}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {pending && tool === 'trend' && pending.previewX != null && (
                  <line
                    x1={pending.x1}
                    y1={pending.y1}
                    x2={pending.previewX}
                    y2={pending.previewY}
                    stroke={T.accent}
                    strokeDasharray="4 3"
                    strokeWidth={1.2}
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {/* User Horizontal Lines */}
                {drawings.filter((d) => d.type === 'hline').map((d) => (
                  <line
                    key={d.id}
                    x1={0}
                    y1={priceToY(d.price)}
                    x2={CHART_W}
                    y2={priceToY(d.price)}
                    stroke={T.accent}
                    strokeDasharray="5 3"
                    strokeWidth={1.2}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* User Text Annotations */}
                {drawings.filter((d) => d.type === 'text').map((d) => (
                  <text key={d.id} x={d.x} y={d.y} fontSize={12} fill={T.text} fontFamily="monospace">
                    {d.value}
                  </text>
                ))}

                {/* Interactive Crosshair */}
                {hover && (
                  <>
                    <line
                      x1={candleX(hover.idx)}
                      y1={0}
                      x2={candleX(hover.idx)}
                      y2={CHART_H}
                      stroke={T.crosshair}
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                    <line
                      x1={0}
                      y1={hover.y}
                      x2={CHART_W}
                      y2={hover.y}
                      stroke={T.crosshair}
                      strokeDasharray="3 3"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}
              </svg>

              {/* Text Note Popup Editor */}
              {textEditor && (
                <input
                  autoFocus
                  value={textEditor.value}
                  onChange={(e) => setTextEditor((t) => (t ? { ...t, value: e.target.value } : null))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitText();
                    if (e.key === 'Escape') setTextEditor(null);
                  }}
                  onBlur={commitText}
                  placeholder="Type note..."
                  className="absolute text-xs px-2 py-1 rounded outline-none shadow-xl font-mono"
                  style={{
                    left: `${(textEditor.x / CHART_W) * 100}%`,
                    top: `${(textEditor.y / CHART_H) * 100}%`,
                    background: T.panelAlt,
                    border: `1px solid ${T.accent}`,
                    color: T.text,
                    width: 150
                  }}
                />
              )}
            </div>

            {/* VERTICAL PRICE SCALE */}
            <div
              className="relative shrink-0 font-mono"
              style={{ width: 68, borderLeft: `1px solid ${T.border}`, background: T.panel }}
            >
              {priceGridLines.map((g, i) => (
                <div
                  key={i}
                  className="absolute text-[11px] pl-1.5"
                  style={{
                    top: `${(g.y / CHART_H) * 100}%`,
                    transform: 'translateY(-50%)',
                    color: T.textMuted
                  }}
                >
                  ${fmt(g.price)}
                </div>
              ))}

              {hover && (
                <div
                  className="absolute text-[11px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    top: `${(hover.y / CHART_H) * 100}%`,
                    transform: 'translateY(-50%)',
                    left: 2,
                    background: T.accent,
                    color: '#09090b'
                  }}
                >
                  ${fmt(yToPrice(hover.y))}
                </div>
              )}

              <div
                className="absolute text-[11px] px-1.5 py-0.5 rounded font-bold"
                style={{
                  top: `${(priceToY(last.close) / CHART_H) * 100}%`,
                  transform: 'translateY(-50%)',
                  left: 2,
                  background: last.close >= last.open ? T.bull : T.bear,
                  color: '#09090b'
                }}
              >
                ${fmt(last.close)}
              </div>
            </div>
          </div>

          {/* HORIZONTAL TIME SCALE */}
          <div
            className="flex shrink-0"
            style={{ height: 26, borderTop: `1px solid ${T.border}`, background: T.panel }}
          >
            <div className="relative flex-1">
              {data.map((c, i) => {
                if (i % timeLabelStep !== 0) return null;
                return (
                  <div
                    key={i}
                    className="absolute text-[10px] font-mono"
                    style={{
                      left: `${(candleX(i) / CHART_W) * 100}%`,
                      transform: 'translateX(-50%)',
                      top: 4,
                      color: T.textMuted
                    }}
                  >
                    {timeLabel(i, resolution, c.time)}
                  </div>
                );
              })}

              {hover && (
                <div
                  className="absolute text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                  style={{
                    left: `${(candleX(hover.idx) / CHART_W) * 100}%`,
                    transform: 'translateX(-50%)',
                    top: 2,
                    background: T.accent,
                    color: '#09090b'
                  }}
                >
                  {timeLabel(hover.idx, resolution, data[hover.idx]?.time)}
                </div>
              )}
            </div>
            <div style={{ width: 68, borderLeft: `1px solid ${T.border}` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
