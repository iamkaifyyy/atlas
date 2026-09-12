'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  PlusCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Activity,
  History,
  TrendingUp,
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import type { OrderBookEntry } from '../../../shared/types/agentConfig';
import type { PlaceOrderParams } from '../../hooks/useOrderBook';
import { BACKEND_HTTP_URL } from '../../lib/contractAddress';

interface OrderBookTableProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice: number;
  isLoading?: boolean;
  onPlaceOrder?: (params: PlaceOrderParams) => Promise<{ success: boolean; error?: string }>;
  isSubmitting?: boolean;
}

type BookSource = 'backpack' | 'local';
type ActiveTab = 'depth' | 'trades' | 'order';
type OrderSide = 'BUY' | 'SELL';
type OrderType = 'LIMIT' | 'MARKET';
type LayoutMode = 'both' | 'bids' | 'asks';
type Precision = 0.01 | 0.1 | 1.0 | 5.0;

interface RecentTrade {
  id: number | string;
  price: number;
  amount: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

interface DepthRowProps {
  entry: OrderBookEntry;
  maxTotal: number;
  side: 'ask' | 'bid';
  cumulativeTotal?: number;
  onSelectPrice: (price: number, cumulative?: number) => void;
}

const DepthRow: React.FC<DepthRowProps> = ({
  entry,
  maxTotal,
  side,
  cumulativeTotal,
  onSelectPrice
}) => {
  const depthPct = Math.min(100, Math.round((entry.total / Math.max(maxTotal, 1)) * 100));
  const isAsk = side === 'ask';

  return (
    <div
      onClick={() => onSelectPrice(entry.price, cumulativeTotal)}
      title={`Click to fill limit order at $${entry.price.toFixed(2)}`}
      className={`group relative grid grid-cols-3 text-xs font-mono py-1 px-1.5 cursor-pointer rounded transition ${
        isAsk ? 'hover:bg-rose-500/15' : 'hover:bg-emerald-500/15'
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 pointer-events-none rounded transition-all duration-300 ${
          isAsk ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
        }`}
        style={{ width: `${depthPct}%` }}
      />
      <span className={`z-10 font-medium ${isAsk ? 'text-rose-400' : 'text-emerald-400'}`}>
        {entry.price.toFixed(2)}
      </span>
      <span className="text-right text-white z-10">{entry.amount.toFixed(3)}</span>
      <span className="text-right text-muted z-10 font-sans text-[11px]">${entry.total.toFixed(0)}</span>
    </div>
  );
};

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  bids: localBids,
  asks: localAsks,
  lastPrice: localLastPrice,
  isLoading: localLoading,
  onPlaceOrder,
  isSubmitting
}) => {
  // Navigation & configuration state
  const [activeTab, setActiveTab] = useState<ActiveTab>('depth');
  const [bookSource, setBookSource] = useState<BookSource>('backpack');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('both');
  const [precision, setPrecision] = useState<Precision>(0.1);

  // Order ticket state
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQty, setOrderQty] = useState('0.5');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Live Backpack depth state
  const [backpackBids, setBackpackBids] = useState<OrderBookEntry[]>([]);
  const [backpackAsks, setBackpackAsks] = useState<OrderBookEntry[]>([]);
  const [backpackLastPrice, setBackpackLastPrice] = useState(2525.0);
  const [isBackpackLoading, setIsBackpackLoading] = useState(true);

  // Recent public trades tape
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [isTradesLoading, setIsTradesLoading] = useState(true);

  // Poll live depth
  useEffect(() => {
    let isMounted = true;

    async function fetchBackpackDepth() {
      try {
        let res = await fetch('https://api.backpack.exchange/api/v1/depth?symbol=ETH_USDC');
        if (!res.ok) {
          res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/depth?symbol=ETH_USDC`);
        }
        if (!res.ok || !isMounted) return;

        const json = await res.json();
        if (!json.asks || !json.bids) return;

        const parseEntries = (raw: [string, string][]): OrderBookEntry[] =>
          raw.slice(0, 15).map(([pStr, qStr]) => {
            const price = parseFloat(pStr);
            const amount = parseFloat(qStr);
            return { price, amount, total: price * amount };
          });

        const parsedAsks = parseEntries(json.asks);
        const parsedBids = parseEntries(json.bids);

        setBackpackAsks(parsedAsks);
        setBackpackBids(parsedBids);
        if (parsedAsks.length > 0) {
          setBackpackLastPrice(parsedAsks[0].price);
        }
        setIsBackpackLoading(false);
      } catch {
        // Fallback gracefully
      }
    }

    fetchBackpackDepth();
    const interval = setInterval(fetchBackpackDepth, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Poll recent market trades
  const fetchRecentTrades = useCallback(async () => {
    try {
      let res = await fetch('https://api.backpack.exchange/api/v1/trades?symbol=ETH_USDC&limit=25');
      if (!res.ok) {
        res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/trades?symbol=ETH_USDC&limit=25`);
      }
      if (!res.ok) return;

      const json = await res.json();
      if (Array.isArray(json)) {
        const parsed: RecentTrade[] = json.map((t) => ({
          id: t.id,
          price: parseFloat(t.price),
          amount: parseFloat(t.quantity),
          side: t.isBuyerMaker ? 'SELL' : 'BUY',
          timestamp: t.timestamp || Date.now()
        }));
        setRecentTrades(parsed);
        setIsTradesLoading(false);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchRecentTrades();
    const interval = setInterval(fetchRecentTrades, 3000);
    return () => clearInterval(interval);
  }, [fetchRecentTrades]);

  // Aggregate levels by selected precision
  const aggregateLevels = (levels: OrderBookEntry[], prec: Precision): OrderBookEntry[] => {
    if (prec === 0.01) return levels;
    const map = new Map<number, { amount: number; total: number }>();

    for (const lvl of levels) {
      const roundedPrice = Number((Math.round(lvl.price / prec) * prec).toFixed(2));
      const existing = map.get(roundedPrice) || { amount: 0, total: 0 };
      existing.amount += lvl.amount;
      existing.total += lvl.amount * roundedPrice;
      map.set(roundedPrice, existing);
    }

    return Array.from(map.entries()).map(([price, val]) => ({
      price,
      amount: Number(val.amount.toFixed(4)),
      total: Number(val.total.toFixed(2))
    }));
  };

  const rawBids = bookSource === 'backpack' ? backpackBids : localBids;
  const rawAsks = bookSource === 'backpack' ? backpackAsks : localAsks;
  const effectiveLastPrice = bookSource === 'backpack' ? backpackLastPrice : localLastPrice;
  const effectiveLoading = bookSource === 'backpack' ? isBackpackLoading : localLoading;

  const activeBids = useMemo(() => aggregateLevels(rawBids, precision), [rawBids, precision]);
  const activeAsks = useMemo(() => aggregateLevels(rawAsks, precision), [rawAsks, precision]);

  const maxAskTotal = useMemo(
    () => (activeAsks.length ? Math.max(...activeAsks.map((a) => a.total)) : 1),
    [activeAsks]
  );
  const maxBidTotal = useMemo(
    () => (activeBids.length ? Math.max(...activeBids.map((b) => b.total)) : 1),
    [activeBids]
  );

  const spread = useMemo(() => {
    if (activeAsks[0] && activeBids[0]) {
      const diff = activeAsks[0].price - activeBids[0].price;
      const pct = (diff / activeBids[0].price) * 100;
      return { diff: diff.toFixed(2), pct: pct.toFixed(3) };
    }
    return { diff: '0.45', pct: '0.018' };
  }, [activeAsks, activeBids]);

  // Handle level click: autofills order ticket
  const handleQuickPriceSelect = (price: number) => {
    setOrderPrice(price.toFixed(2));
    if (orderType === 'MARKET') setOrderType('LIMIT');
    setActiveTab('order');
  };

  // Order submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPlaceOrder) return;
    setOrderError(null);
    setOrderSuccess(false);

    const price = orderType === 'LIMIT'
      ? (orderPrice ? Number.parseFloat(orderPrice) : effectiveLastPrice)
      : undefined;
    const quantity = Number.parseFloat(orderQty);

    if (isNaN(quantity) || quantity <= 0) {
      setOrderError('Quantity must be greater than 0');
      return;
    }
    if (orderType === 'LIMIT' && (!price || price <= 0)) {
      setOrderError('Limit price must be specified');
      return;
    }

    const res = await onPlaceOrder({
      side: orderSide,
      type: orderType,
      price,
      quantity
    });

    if (res.success) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setActiveTab('depth');
      }, 900);
    } else {
      setOrderError(res.error || 'Failed to place order');
    }
  };

  // Order calculation metrics
  const numericPrice = orderType === 'LIMIT'
    ? (Number.parseFloat(orderPrice) || effectiveLastPrice)
    : effectiveLastPrice;
  const numericQty = Number.parseFloat(orderQty) || 0;
  const orderValueUsdc = numericPrice * numericQty;
  const feeRate = orderType === 'LIMIT' ? 0.0005 : 0.0008; // 0.05% maker, 0.08% taker
  const estimatedFeeUsdc = orderValueUsdc * feeRate;
  const totalCostUsdc = orderSide === 'BUY'
    ? orderValueUsdc + estimatedFeeUsdc
    : orderValueUsdc - estimatedFeeUsdc;

  return (
    <div className="flex flex-col h-full font-mono">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-console-border gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-coral" />
          <h3 className="text-xs font-semibold text-white tracking-[0.28px] uppercase">Order Book</h3>

          {/* Engine Source Selector */}
          <div className="flex items-center gap-0.5 bg-console-elevated p-0.5 rounded border border-console-border text-[10px]">
            {(['backpack', 'local'] as const).map((source) => (
              <button
                key={source}
                type="button"
                onClick={() => setBookSource(source)}
                className={`px-2 py-0.5 rounded transition ${
                  bookSource === source
                    ? 'bg-white text-console-surface font-semibold shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
              >
                {source === 'backpack' ? 'Backpack L2' : 'Atlas Engine'}
              </button>
            ))}
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-console-elevated p-0.5 rounded border border-console-border text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('depth')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              activeTab === 'depth'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            Depth
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trades')}
            className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'trades'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <History className="w-2.5 h-2.5" />
            Tape
          </button>
          <button
            type="button"
            onClick={() => {
              if (!orderPrice) setOrderPrice(effectiveLastPrice.toFixed(2));
              setActiveTab('order');
            }}
            className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'order'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <PlusCircle className="w-2.5 h-2.5" />
            Trade
          </button>
        </div>
      </div>

      {/* 2. Mode-Specific Content */}
      {activeTab === 'trades' ? (
        /* Market Trades Stream (Tape) */
        <div className="flex-1 flex flex-col pt-2 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-console-border text-[10px] text-muted uppercase tracking-[0.28px]">
            <div>Price (USDC)</div>
            <div className="text-right">Size (ETH)</div>
            <div className="text-right">Time</div>
          </div>

          {isTradesLoading && recentTrades.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted py-12">
              <Activity className="w-4 h-4 text-coral animate-spin mr-2" />
              Loading Backpack Tape...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1 py-1 max-h-[380px] scrollbar-none">
              {recentTrades.map((trade) => {
                const isBuy = trade.side === 'BUY';
                const timeStr = new Date(trade.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
                return (
                  <div
                    key={trade.id}
                    onClick={() => handleQuickPriceSelect(trade.price)}
                    className="grid grid-cols-3 py-1 px-1.5 hover:bg-console-elevated rounded cursor-pointer transition text-[11px]"
                  >
                    <span className={`font-semibold flex items-center gap-1 ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isBuy ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      ${trade.price.toFixed(2)}
                    </span>
                    <span className="text-right text-white font-medium">
                      {trade.amount.toFixed(4)}
                    </span>
                    <span className="text-right text-muted text-[10px]">
                      {timeStr}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'order' ? (
        /* Order Placement Ticket */
        <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col justify-between py-3 space-y-3">
          <div className="space-y-3">
            {/* Side Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-console-elevated rounded-lg border border-console-border">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  orderSide === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-muted hover:text-white'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                Buy (Bid)
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  orderSide === 'SELL' ? 'bg-rose-600 text-white shadow-sm' : 'text-muted hover:text-white'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                Sell (Ask)
              </button>
            </div>

            {/* Order Type Toggle (Limit vs Market) */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted text-[11px] uppercase tracking-[0.28px]">Execution Type</span>
              <div className="flex items-center gap-1 bg-console-elevated p-0.5 rounded border border-console-border text-[11px]">
                {(['LIMIT', 'MARKET'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`px-2.5 py-0.5 rounded transition font-medium ${
                      orderType === type
                        ? 'bg-white text-console-surface font-semibold shadow-sm'
                        : 'text-muted hover:text-white'
                    }`}
                  >
                    {type === 'LIMIT' ? 'Limit' : 'Market'}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit Price Field */}
            {orderType === 'LIMIT' ? (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] text-muted uppercase tracking-[0.28px]">
                    Limit Price (USDC)
                  </label>
                  <button
                    type="button"
                    onClick={() => setOrderPrice(effectiveLastPrice.toFixed(2))}
                    className="text-[10px] text-coral hover:underline"
                  >
                    Mid: ${effectiveLastPrice.toFixed(2)}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  placeholder={effectiveLastPrice.toFixed(2)}
                  className="w-full px-3 py-2 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-coral transition"
                />
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-console-elevated border border-console-border text-xs">
                <span className="text-muted text-[11px] block">Execution Price</span>
                <span className="text-emerald-400 font-semibold font-mono">
                  Market Best Match (~${effectiveLastPrice.toFixed(2)})
                </span>
              </div>
            )}

            {/* Quantity Field & Preset Chips */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-muted uppercase tracking-[0.28px]">
                  Order Size (ETH)
                </label>
                <span className="text-[10px] text-muted font-mono">
                  ~${orderValueUsdc.toFixed(2)} USDC
                </span>
              </div>
              <input
                type="number"
                step="0.05"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                placeholder="0.5"
                className="w-full px-3 py-2 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-coral transition"
              />

              {/* Quick Size Presets */}
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {['0.1', '0.25', '0.5', '1.0'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setOrderQty(val)}
                    className={`py-1 rounded text-[10px] font-mono border transition ${
                      orderQty === val
                        ? 'bg-console-border border-coral text-white'
                        : 'bg-console-elevated border-console-border text-muted hover:text-white'
                    }`}
                  >
                    {val} ETH
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Settlement Docket */}
            <div className="p-3 bg-console-elevated rounded-lg border border-console-border space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Order Value:</span>
                <span className="text-white">${orderValueUsdc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted">Est. Fee ({orderType === 'LIMIT' ? '0.05%' : '0.08%'}):</span>
                <span className="text-muted">${estimatedFeeUsdc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-console-border font-semibold">
                <span className="text-white">Estimated Total:</span>
                <span className="text-emerald-400">${totalCostUsdc.toFixed(2)} USDC</span>
              </div>
            </div>

            {orderError && (
              <div className="text-[11px] text-rose-400 font-mono">
                {orderError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-full text-xs font-semibold font-mono tracking-wide transition flex items-center justify-center gap-1.5 ${
              orderSuccess
                ? 'bg-emerald-600 text-white'
                : orderSide === 'BUY'
                ? 'bg-white hover:bg-soft-stone text-console-surface'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {orderSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Order Dispatched to Engine!
              </>
            ) : isSubmitting ? (
              'Submitting On-Chain...'
            ) : (
              `Submit ${orderSide} ${orderType} (${numericQty} ETH)`
            )}
          </button>
        </form>
      ) : (
        /* Depth Ladder View */
        <>
          {/* Sub-Header: Precision selector & View Layout Mode */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted py-1.5 border-b border-console-border">
            <div className="flex items-center gap-1">
              <span>Spread:</span>
              <span className="text-white font-medium">${spread.diff}</span>
              <span className="text-emerald-400">({spread.pct}%)</span>
            </div>

            {/* Layout Toggles (Both, Bids, Asks) & Precision */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 bg-console-elevated p-0.5 rounded border border-console-border text-[9px]">
                <button
                  type="button"
                  onClick={() => setLayoutMode('both')}
                  className={`px-1.5 py-0.5 rounded ${layoutMode === 'both' ? 'bg-white text-black font-bold' : 'text-muted hover:text-white'}`}
                  title="Show Bids and Asks"
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('bids')}
                  className={`px-1.5 py-0.5 rounded ${layoutMode === 'bids' ? 'bg-emerald-600 text-white font-bold' : 'text-muted hover:text-white'}`}
                  title="Show Bids Only"
                >
                  Bids
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('asks')}
                  className={`px-1.5 py-0.5 rounded ${layoutMode === 'asks' ? 'bg-rose-600 text-white font-bold' : 'text-muted hover:text-white'}`}
                  title="Show Asks Only"
                >
                  Asks
                </button>
              </div>

              {/* Tick Grouping */}
              <select
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value) as Precision)}
                className="bg-console-elevated border border-console-border rounded px-1.5 py-0.5 text-[10px] text-white focus:outline-none"
              >
                <option value={0.01}>0.01</option>
                <option value={0.1}>0.1</option>
                <option value={1.0}>1.0</option>
                <option value={5.0}>5.0</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 text-[10px] font-medium text-muted py-1.5 border-b border-console-border uppercase tracking-[0.28px]">
            <div>Price (USDC)</div>
            <div className="text-right">Size (ETH)</div>
            <div className="text-right">Total (USDC)</div>
          </div>

          {effectiveLoading && activeBids.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted py-12 font-mono">
              <Activity className="w-4 h-4 text-coral animate-spin mr-2" />
              Connecting {bookSource === 'backpack' ? 'Backpack Exchange' : 'Atlas Engine'}...
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-1 py-1">
              {/* Asks (Sell Orders) */}
              {(layoutMode === 'both' || layoutMode === 'asks') && (
                <div className="space-y-0.5">
                  {activeAsks
                    .slice(0, layoutMode === 'asks' ? 12 : 6)
                    .reverse()
                    .map((ask, idx) => (
                      <DepthRow
                        key={`ask-${idx}`}
                        entry={ask}
                        maxTotal={maxAskTotal}
                        side="ask"
                        onSelectPrice={handleQuickPriceSelect}
                      />
                    ))}
                </div>
              )}

              {/* Mid-Market Price Strip */}
              <div className="py-2 px-3 bg-console-elevated rounded-lg border border-console-border flex items-center justify-between text-xs font-mono my-1">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-muted text-[10px]">
                    {bookSource === 'backpack' ? 'Backpack Mark Price' : 'Atlas Mid Price'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-white text-sm tracking-tight">
                    ${effectiveLastPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bids (Buy Orders) */}
              {(layoutMode === 'both' || layoutMode === 'bids') && (
                <div className="space-y-0.5">
                  {activeBids
                    .slice(0, layoutMode === 'bids' ? 12 : 6)
                    .map((bid, idx) => (
                      <DepthRow
                        key={`bid-${idx}`}
                        entry={bid}
                        maxTotal={maxBidTotal}
                        side="bid"
                        onSelectPrice={handleQuickPriceSelect}
                      />
                    ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

