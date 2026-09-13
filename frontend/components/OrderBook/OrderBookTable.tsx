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
  XCircle,
  Percent,
  Sliders,
  BarChart2,
  List
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
  selectedMarket?: string;
  onSelectMarket?: (market: string) => void;
  assetUnit?: string;
}

type BookSource = 'backpack' | 'local';
type ActiveTab = 'depth' | 'trades' | 'orders' | 'order';
type OrderSide = 'BUY' | 'SELL';
type OrderType = 'LIMIT' | 'MARKET';
type LayoutMode = 'both' | 'bids' | 'asks';
type Precision = 0.01 | 0.1 | 1.0 | 5.0;
type DepthViewMode = 'ladder' | 'chart';


interface RecentTrade {
  id: number | string;
  price: number;
  amount: number;
  side: 'BUY' | 'SELL';
  timestamp: number;
}

interface OpenOrder {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: string;
  timestamp: number;
}

const MARKET_PAIRS = [
  { symbol: 'ETH_USDC', label: 'ETH / USDC (Ethereum L1)', base: 'ETH', quote: 'USDC' },
  { symbol: 'BTC_USDC', label: 'BTC / USDC (Bitcoin L1)', base: 'BTC', quote: 'USDC' },
  { symbol: 'SOL_USDC', label: 'SOL / USDC (Solana L1)', base: 'SOL', quote: 'USDC' },
  { symbol: 'ARB_USDC', label: 'ARB / USDC (Arbitrum L2)', base: 'ARB', quote: 'USDC' },
  { symbol: 'OP_USDC', label: 'OP / USDC (Optimism L2)', base: 'OP', quote: 'USDC' },
  { symbol: 'STRK_USDC', label: 'STRK / USDC (Starknet L2)', base: 'STRK', quote: 'USDC' },
  { symbol: 'POL_USDC', label: 'POL / USDC (Polygon L2)', base: 'POL', quote: 'USDC' },
  { symbol: 'SUI_USDC', label: 'SUI / USDC (Sui L1)', base: 'SUI', quote: 'USDC' },
  { symbol: 'AVAX_USDC', label: 'AVAX / USDC (Avalanche L1)', base: 'AVAX', quote: 'USDC' },
  { symbol: 'RENDER_USDC', label: 'RENDER / USDC (Render AI)', base: 'RENDER', quote: 'USDC' },
  { symbol: 'LINK_USDC', label: 'LINK / USDC (Chainlink DeFi)', base: 'LINK', quote: 'USDC' }
];

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
  isSubmitting,
  selectedMarket,
  onSelectMarket,
  assetUnit
}) => {
  // Navigation & configuration
  const [selectedPair, setSelectedPair] = useState(selectedMarket || 'ETH_USDC');
  const [activeTab, setActiveTab] = useState<ActiveTab>('depth');
  const [depthViewMode, setDepthViewMode] = useState<DepthViewMode>('ladder');
  const [bookSource, setBookSource] = useState<BookSource>('backpack');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('both');
  const [precision, setPrecision] = useState<Precision>(0.1);

  // Sync external selectedMarket prop
  useEffect(() => {
    if (selectedMarket && selectedMarket !== selectedPair) {
      setSelectedPair(selectedMarket);
      setIsBackpackLoading(true);
      setIsTradesLoading(true);
    }
  }, [selectedMarket]);

  const currentBaseAsset = assetUnit || selectedPair.split('_')[0] || 'ETH';

  // Order ticket state
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQty, setOrderQty] = useState('0.5');
  const [attachTpSl, setAttachTpSl] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
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

  // Open working orders
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Poll live depth for selected market pair via Next.js proxy route
  useEffect(() => {
    let isMounted = true;

    async function fetchBackpackDepth() {
      try {
        let res = await fetch(`/api/backpack/depth?symbol=${selectedPair}`);
        if (!res.ok) {
          res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/depth?symbol=${selectedPair}`);
        }
        if (!res.ok || !isMounted) {
          if (isMounted) setIsBackpackLoading(false);
          return;
        }

        const json = await res.json();
        if (!json.asks || !json.bids) {
          if (isMounted) setIsBackpackLoading(false);
          return;
        }

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
        if (isMounted) setIsBackpackLoading(false);
      }
    }

    fetchBackpackDepth();
    const interval = setInterval(fetchBackpackDepth, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedPair]);

  // Poll recent market trades via Next.js proxy route
  const fetchRecentTrades = useCallback(async () => {
    try {
      let res = await fetch(`/api/backpack/trades?symbol=${selectedPair}&limit=25`);
      if (!res.ok) {
        res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/trades?symbol=${selectedPair}&limit=25`);
      }
      if (!res.ok) {
        setIsTradesLoading(false);
        return;
      }

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
      } else {
        setIsTradesLoading(false);
      }
    } catch {
      setIsTradesLoading(false);
    }
  }, [selectedPair]);

  useEffect(() => {
    fetchRecentTrades();
    const interval = setInterval(fetchRecentTrades, 3000);
    return () => clearInterval(interval);
  }, [fetchRecentTrades]);

  // Poll open orders from matching engine
  const fetchOpenOrders = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_HTTP_URL}/api/orderbook/orders`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.orders)) {
          setOpenOrders(json.orders);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOpenOrders();
      const interval = setInterval(fetchOpenOrders, 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchOpenOrders]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`${BACKEND_HTTP_URL}/api/orderbook/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (res.ok) {
        setOpenOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch {
      // Error
    } finally {
      setCancellingOrderId(null);
    }
  };

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

  // Order book pressure / imbalance calculation
  const totalBidVolume = useMemo(() => activeBids.reduce((sum, b) => sum + b.amount, 0), [activeBids]);
  const totalAskVolume = useMemo(() => activeAsks.reduce((sum, a) => sum + a.amount, 0), [activeAsks]);
  const buyPressurePct = useMemo(() => {
    const total = totalBidVolume + totalAskVolume;
    return total > 0 ? Math.round((totalBidVolume / total) * 100) : 50;
  }, [totalBidVolume, totalAskVolume]);

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
      fetchOpenOrders();
      setTimeout(() => {
        setOrderSuccess(false);
        setActiveTab('depth');
      }, 900);
    } else {
      setOrderError(res.error || 'Failed to place order');
    }
  };

  // Pricing calculations
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

  // Risk / reward ratio calculation
  const riskRewardRatio = useMemo(() => {
    const tp = parseFloat(takeProfitPrice);
    const sl = parseFloat(stopLossPrice);
    if (!tp || !sl || !numericPrice) return null;

    const reward = orderSide === 'BUY' ? tp - numericPrice : numericPrice - tp;
    const risk = orderSide === 'BUY' ? numericPrice - sl : sl - numericPrice;

    if (risk <= 0 || reward <= 0) return null;
    return (reward / risk).toFixed(2);
  }, [takeProfitPrice, stopLossPrice, numericPrice, orderSide]);

  return (
    <div className="flex flex-col h-full font-mono">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-console-border gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-coral" />

          {/* Market Pair Dropdown */}
          <select
            value={selectedPair}
            onChange={(e) => {
              setSelectedPair(e.target.value);
              onSelectMarket?.(e.target.value);
            }}
            className="bg-console-elevated border border-console-border rounded px-2 py-0.5 text-xs text-white font-semibold focus:outline-none focus:border-coral cursor-pointer"
          >
            {MARKET_PAIRS.map((p) => (
              <option key={p.symbol} value={p.symbol}>
                {p.label}
              </option>
            ))}
          </select>

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
                {source === 'backpack' ? 'Backpack' : 'Atlas'}
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
            onClick={() => setActiveTab('orders')}
            className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'orders'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <List className="w-2.5 h-2.5" />
            Orders
            {openOrders.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-coral animate-ping" />
            )}
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

      {/* Orderbook Pressure / Imbalance Gauge */}
      {activeTab === 'depth' && (
        <div className="py-2 border-b border-console-border space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 flex items-center gap-1">
              <span>Bids</span>
              <strong>{buyPressurePct}%</strong>
            </span>
            <span className="text-muted uppercase text-[9px] tracking-wider">Book Pressure</span>
            <span className="text-rose-400 flex items-center gap-1">
              <strong>{100 - buyPressurePct}%</strong>
              <span>Asks</span>
            </span>
          </div>
          <div className="w-full h-1 bg-rose-500/30 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${buyPressurePct}%` }}
            />
            <div
              className="h-full bg-rose-500 transition-all duration-500"
              style={{ width: `${100 - buyPressurePct}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Mode-Specific Content */}
      {activeTab === 'trades' ? (
        /* Market Trades Stream (Tape) */
        <div className="flex-1 flex flex-col pt-2 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-console-border text-[10px] text-muted uppercase tracking-[0.28px]">
            <div>Price (USDC)</div>
            <div className="text-right">Size</div>
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
      ) : activeTab === 'orders' ? (
        /* Open Orders Ledger */
        <div className="flex-1 flex flex-col pt-2 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-console-border text-[10px] text-muted uppercase tracking-[0.28px]">
            <div>Order / Side</div>
            <div className="text-right">Price / Size</div>
            <div className="text-right">Action</div>
          </div>

          {openOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-xs text-muted py-16 gap-2">
              <List className="w-5 h-5 text-muted opacity-50" />
              <span>No active open orders in engine</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-1.5 py-1 max-h-[380px]">
              {openOrders.map((order) => {
                const isBuy = order.side === 'BUY';
                return (
                  <div
                    key={order.id}
                    className="bg-console-elevated p-2.5 rounded-lg border border-console-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {order.side}
                        </span>
                        <span className="text-white text-[11px] font-medium">{order.type}</span>
                      </div>
                      <div className="text-[10px] text-muted pt-0.5">
                        #{order.id.slice(0, 12)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-medium text-[11px]">
                        ${order.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted">
                        {order.remainingQuantity} / {order.quantity} {currentBaseAsset}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 text-[10px] font-medium transition disabled:opacity-50"
                    >
                      {cancellingOrderId === order.id ? '...' : 'Cancel'}
                    </button>
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

            {/* Order Type Toggle */}
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
                  Order Size ({currentBaseAsset})
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
                    {val} {currentBaseAsset}
                  </button>
                ))}
              </div>
            </div>

            {/* TP / SL Risk Guardrails Accordion */}
            <div className="border border-console-border rounded-lg p-2.5 bg-console-elevated space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={attachTpSl}
                    onChange={(e) => setAttachTpSl(e.target.checked)}
                    className="rounded bg-console-surface border-console-border text-coral focus:ring-0"
                  />
                  <span>Attach TP / SL Guardrails</span>
                </label>
                {riskRewardRatio && (
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                    R:R {riskRewardRatio}
                  </span>
                )}
              </div>

              {attachTpSl && (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-console-border/60">
                  <div>
                    <div className="flex justify-between text-[10px] text-muted mb-0.5">
                      <span>Take-Profit</span>
                      <button
                        type="button"
                        onClick={() => setTakeProfitPrice((numericPrice * 1.05).toFixed(2))}
                        className="text-emerald-400 hover:underline"
                      >
                        +5%
                      </button>
                    </div>
                    <input
                      type="number"
                      value={takeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(e.target.value)}
                      placeholder={(numericPrice * 1.05).toFixed(2)}
                      className="w-full px-2 py-1 bg-console-surface border border-console-border rounded text-[11px] text-emerald-400 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-muted mb-0.5">
                      <span>Stop-Loss</span>
                      <button
                        type="button"
                        onClick={() => setStopLossPrice((numericPrice * 0.97).toFixed(2))}
                        className="text-rose-400 hover:underline"
                      >
                        -3%
                      </button>
                    </div>
                    <input
                      type="number"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      placeholder={(numericPrice * 0.97).toFixed(2)}
                      className="w-full px-2 py-1 bg-console-surface border border-console-border rounded text-[11px] text-rose-400 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
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
              `Submit ${orderSide} ${orderType} (${numericQty} ${currentBaseAsset})`
            )}
          </button>
        </form>
      ) : (
        /* Depth Ladder View */
        <>
          {/* Sub-Header: Precision selector, Layout Mode & Depth Chart toggle */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted py-1.5 border-b border-console-border">
            <div className="flex items-center gap-1">
              <span>Spread:</span>
              <span className="text-white font-medium">${spread.diff}</span>
              <span className="text-emerald-400">({spread.pct}%)</span>
            </div>

            {/* Layout Toggles (Both, Bids, Asks) & Precision */}
            <div className="flex items-center gap-1.5">
              {/* Chart vs Ladder Toggle */}
              <div className="flex items-center gap-0.5 bg-console-elevated p-0.5 rounded border border-console-border text-[9px]">
                <button
                  type="button"
                  onClick={() => setDepthViewMode('ladder')}
                  className={`p-1 rounded ${depthViewMode === 'ladder' ? 'bg-white text-black' : 'text-muted hover:text-white'}`}
                  title="Show Depth Ladder"
                >
                  <List className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDepthViewMode('chart')}
                  className={`p-1 rounded ${depthViewMode === 'chart' ? 'bg-white text-black' : 'text-muted hover:text-white'}`}
                  title="Show Depth Curve Chart"
                >
                  <BarChart2 className="w-2.5 h-2.5" />
                </button>
              </div>

              {depthViewMode === 'ladder' && (
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
              )}

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

          {depthViewMode === 'chart' ? (
            /* Visual Cumulative Depth Curve (SVG Visualizer) */
            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-[11px] px-1">
                <span className="text-emerald-400 font-semibold">Cumulative Bids (Buyers)</span>
                <span className="text-rose-400 font-semibold">Cumulative Asks (Sellers)</span>
              </div>

              {/* Visual SVG Curve */}
              <div className="h-44 w-full bg-console-elevated rounded-lg p-2 border border-console-border relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                  {/* Green Bids curve on left half */}
                  <polygon
                    points={`
                      0,120
                      ${activeBids.slice(0, 6).reverse().map((b, i) => `${(i / 5) * 140},${120 - Math.min(110, (b.total / maxBidTotal) * 110)}`).join(' ')}
                      140,120
                    `}
                    className="fill-emerald-500/20 stroke-emerald-500 stroke-1"
                  />
                  {/* Red Asks curve on right half */}
                  <polygon
                    points={`
                      160,120
                      ${activeAsks.slice(0, 6).map((a, i) => `${160 + (i / 5) * 140},${120 - Math.min(110, (a.total / maxAskTotal) * 110)}`).join(' ')}
                      300,120
                    `}
                    className="fill-rose-500/20 stroke-rose-500 stroke-1"
                  />
                  {/* Center Mid line */}
                  <line x1="150" y1="0" x2="150" y2="120" stroke="#ff7759" strokeDasharray="3 3" strokeWidth="1" />
                </svg>

                {/* Center mid-price pin */}
                <div className="absolute inset-x-0 bottom-2 flex justify-center pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-console-surface border border-console-border text-[10px] text-white font-bold">
                    ${effectiveLastPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted">
                <div className="bg-console-elevated p-2 rounded border border-console-border">
                  <div>Total Bid Depth: <strong className="text-white">{totalBidVolume.toFixed(2)} {currentBaseAsset}</strong></div>
                </div>
                <div className="bg-console-elevated p-2 rounded border border-console-border text-right">
                  <div>Total Ask Depth: <strong className="text-white">{totalAskVolume.toFixed(2)} {currentBaseAsset}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            /* Depth Ladder Table */
            <>
              <div className="grid grid-cols-3 text-[10px] font-medium text-muted py-1.5 border-b border-console-border uppercase tracking-[0.28px]">
                <div>Price (USDC)</div>
                <div className="text-right">Size ({selectedPair.split('_')[0]})</div>
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
        </>
      )}
    </div>
  );
};
