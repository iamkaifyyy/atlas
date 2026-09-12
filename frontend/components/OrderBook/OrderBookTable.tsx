'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Layers, PlusCircle, ArrowDown, ArrowUp, Check } from 'lucide-react';
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
type ActiveTab = 'depth' | 'order';
type OrderSide = 'BUY' | 'SELL';

// Helper to render individual bid/ask depth level
interface DepthRowProps {
  entry: OrderBookEntry;
  maxTotal: number;
  side: 'ask' | 'bid';
  onSelectPrice: (price: number) => void;
}

const DepthRow: React.FC<DepthRowProps> = ({ entry, maxTotal, side, onSelectPrice }) => {
  const depthPct = Math.min(100, Math.round((entry.total / Math.max(maxTotal, 1)) * 100));
  const isAsk = side === 'ask';

  return (
    <div
      onClick={() => onSelectPrice(entry.price)}
      className={`relative grid grid-cols-3 text-xs font-mono py-1 px-1.5 cursor-pointer rounded transition ${
        isAsk ? 'hover:bg-rose-500/10' : 'hover:bg-emerald-500/10'
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 pointer-events-none rounded ${
          isAsk ? 'bg-rose-500/10' : 'bg-emerald-500/10'
        }`}
        style={{ width: `${depthPct}%` }}
      />
      <span className={`z-10 ${isAsk ? 'text-rose-400' : 'text-emerald-400'}`}>
        {entry.price.toFixed(2)}
      </span>
      <span className="text-right text-white z-10">{entry.amount.toFixed(3)}</span>
      <span className="text-right text-muted z-10">${entry.total.toFixed(0)}</span>
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('depth');
  const [bookSource, setBookSource] = useState<BookSource>('backpack');
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQty, setOrderQty] = useState('0.5');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Live Backpack depth state
  const [backpackBids, setBackpackBids] = useState<OrderBookEntry[]>([]);
  const [backpackAsks, setBackpackAsks] = useState<OrderBookEntry[]>([]);
  const [backpackLastPrice, setBackpackLastPrice] = useState(2525.0);
  const [isBackpackLoading, setIsBackpackLoading] = useState(true);

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
          raw.slice(0, 10).map(([pStr, qStr]) => {
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
        // Silently fall back to existing data
      }
    }

    fetchBackpackDepth();
    const interval = setInterval(fetchBackpackDepth, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeBids = bookSource === 'backpack' ? backpackBids : localBids;
  const activeAsks = bookSource === 'backpack' ? backpackAsks : localAsks;
  const effectiveLastPrice = bookSource === 'backpack' ? backpackLastPrice : localLastPrice;
  const effectiveLoading = bookSource === 'backpack' ? isBackpackLoading : localLoading;

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
      return (activeAsks[0].price - activeBids[0].price).toFixed(2);
    }
    return '0.45';
  }, [activeAsks, activeBids]);

  const handleQuickPriceSelect = (price: number) => {
    setOrderPrice(price.toFixed(2));
    setActiveTab('order');
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPlaceOrder) return;
    setOrderError(null);
    setOrderSuccess(false);

    const price = orderPrice ? Number.parseFloat(orderPrice) : effectiveLastPrice;
    const quantity = Number.parseFloat(orderQty);

    if (isNaN(quantity) || quantity <= 0) {
      setOrderError('Quantity must be greater than 0');
      return;
    }

    const res = await onPlaceOrder({
      side: orderSide,
      type: 'LIMIT',
      price,
      quantity
    });

    if (res.success) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setActiveTab('depth');
      }, 800);
    } else {
      setOrderError(res.error || 'Failed to place order');
    }
  };

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-console-border gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-coral" />
          <h3 className="text-xs font-semibold text-white tracking-[0.28px] uppercase">Order Book</h3>

          {/* Source toggles */}
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

        {/* View tabs */}
        <div className="flex items-center gap-1 bg-console-elevated p-0.5 rounded border border-console-border text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('depth')}
            className={`px-2.5 py-0.5 rounded font-medium transition ${
              activeTab === 'depth'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            Depth
          </button>
          <button
            type="button"
            onClick={() => {
              if (!orderPrice) setOrderPrice(effectiveLastPrice.toFixed(2));
              setActiveTab('order');
            }}
            className={`px-2.5 py-0.5 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'order'
                ? 'bg-white text-console-surface font-semibold shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            <PlusCircle className="w-2.5 h-2.5" />
            Place
          </button>
        </div>
      </div>

      {activeTab === 'order' ? (
        /* Order entry form */
        <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col justify-between py-3 space-y-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-console-elevated rounded-lg border border-console-border">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 text-white'
                    : 'text-muted hover:text-white'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                Buy (Bid)
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`py-1.5 rounded text-xs font-semibold transition flex items-center justify-center gap-1 ${
                  orderSide === 'SELL'
                    ? 'bg-rose-600 text-white'
                    : 'text-muted hover:text-white'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                Sell (Ask)
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-muted mb-1 uppercase tracking-[0.28px]">
                Limit Price (USDC)
              </label>
              <input
                type="number"
                step="0.1"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                placeholder={effectiveLastPrice.toFixed(2)}
                className="w-full px-3 py-2 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-coral transition"
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted mb-1 uppercase tracking-[0.28px]">
                Quantity (ETH)
              </label>
              <input
                type="number"
                step="0.05"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                placeholder="0.5"
                className="w-full px-3 py-2 bg-console-elevated border border-console-border rounded-lg text-white font-mono text-xs focus:outline-none focus:border-coral transition"
              />
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
            className={`w-full py-2.5 rounded-full text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
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
                Order Placed in Book!
              </>
            ) : isSubmitting ? (
              'Submitting...'
            ) : (
              `Submit ${orderSide === 'BUY' ? 'Bid' : 'Ask'} to Engine`
            )}
          </button>
        </form>
      ) : (
        /* Depth ladder display */
        <>
          <div className="flex items-center justify-between text-[10px] font-mono text-muted py-1.5 border-b border-console-border">
            <span>Spread: ${spread}</span>
            <span className="text-muted">
              {bookSource === 'backpack' ? 'Backpack Exchange API' : 'Atlas In-Memory Engine'}
            </span>
          </div>

          <div className="grid grid-cols-3 text-[10px] font-medium text-muted py-1.5 border-b border-console-border uppercase tracking-[0.28px]">
            <div>Price (USDC)</div>
            <div className="text-right">Size (ETH)</div>
            <div className="text-right">Total (USDC)</div>
          </div>

          {effectiveLoading && activeBids.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-muted py-12 font-mono">
              Loading {bookSource === 'backpack' ? 'Backpack' : 'Atlas'} depth...
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-1 py-1">
              {/* Asks (Sell Orders) */}
              <div className="space-y-0.5">
                {activeAsks.slice(0, 5).reverse().map((ask, idx) => (
                  <DepthRow
                    key={`ask-${idx}`}
                    entry={ask}
                    maxTotal={maxAskTotal}
                    side="ask"
                    onSelectPrice={handleQuickPriceSelect}
                  />
                ))}
              </div>

              {/* Mid Price Divider */}
              <div className="py-2 px-3 bg-console-elevated rounded-lg border border-console-border flex items-center justify-between text-xs font-mono">
                <span className="text-muted text-[10px]">
                  {bookSource === 'backpack' ? 'Backpack Last Price' : 'Atlas Mid Price'}
                </span>
                <span className="font-bold text-white tracking-wider">
                  ${effectiveLastPrice.toFixed(2)}
                </span>
              </div>

              {/* Bids (Buy Orders) */}
              <div className="space-y-0.5">
                {activeBids.slice(0, 5).map((bid, idx) => (
                  <DepthRow
                    key={`bid-${idx}`}
                    entry={bid}
                    maxTotal={maxBidTotal}
                    side="bid"
                    onSelectPrice={handleQuickPriceSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

