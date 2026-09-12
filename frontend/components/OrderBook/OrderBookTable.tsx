'use client';

import React, { useState, useEffect } from 'react';
import { Layers, PlusCircle, ArrowDown, ArrowUp, Check, Radio } from 'lucide-react';
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

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  bids: localBids,
  asks: localAsks,
  lastPrice: localLastPrice,
  isLoading: localLoading,
  onPlaceOrder,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'depth' | 'order'>('depth');
  const [bookSource, setBookSource] = useState<'backpack' | 'local'>('backpack');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderPrice, setOrderPrice] = useState<string>('');
  const [orderQty, setOrderQty] = useState<string>('0.5');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Backpack live depth state
  const [backpackBids, setBackpackBids] = useState<OrderBookEntry[]>([]);
  const [backpackAsks, setBackpackAsks] = useState<OrderBookEntry[]>([]);
  const [backpackLastPrice, setBackpackLastPrice] = useState<number>(2525.0);
  const [isBackpackLoading, setIsBackpackLoading] = useState<boolean>(true);

  // Poll Backpack Depth
  useEffect(() => {
    let isMounted = true;

    async function fetchBackpackDepth() {
      try {
        let res = await fetch('https://api.backpack.exchange/api/v1/depth?symbol=ETH_USDC');
        if (!res.ok) {
          res = await fetch(`${BACKEND_HTTP_URL}/api/backpack/depth?symbol=ETH_USDC`);
        }
        if (res.ok) {
          const json = await res.json();
          if (json.asks && json.bids && isMounted) {
            const parsedAsks: OrderBookEntry[] = json.asks.slice(0, 10).map((a: [string, string]) => {
              const p = parseFloat(a[0]);
              const q = parseFloat(a[1]);
              return { price: p, amount: q, total: p * q };
            });
            const parsedBids: OrderBookEntry[] = json.bids.slice(0, 10).map((b: [string, string]) => {
              const p = parseFloat(b[0]);
              const q = parseFloat(b[1]);
              return { price: p, amount: q, total: p * q };
            });

            setBackpackAsks(parsedAsks);
            setBackpackBids(parsedBids);
            if (parsedAsks.length > 0) {
              setBackpackLastPrice(parsedAsks[0].price);
            }
            setIsBackpackLoading(false);
          }
        }
      } catch {
        // Fallback to local
      }
    }

    fetchBackpackDepth();
    const timer = setInterval(fetchBackpackDepth, 2500);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const activeBids = bookSource === 'backpack' ? backpackBids : localBids;
  const activeAsks = bookSource === 'backpack' ? backpackAsks : localAsks;
  const effectiveLastPrice = bookSource === 'backpack' ? backpackLastPrice : localLastPrice;
  const effectiveLoading = bookSource === 'backpack' ? isBackpackLoading : localLoading;

  const maxAskTotal = activeAsks.length ? Math.max(...activeAsks.map((a) => a.total)) : 1;
  const maxBidTotal = activeBids.length ? Math.max(...activeBids.map((b) => b.total)) : 1;
  const spread =
    activeAsks[0] && activeBids[0]
      ? (activeAsks[0].price - activeBids[0].price).toFixed(2)
      : '0.45';

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
    <div className="bg-surface rounded-xl border border-border/80 p-3.5 shadow-sm flex flex-col h-full">
      {/* Header & Source Toggles */}
      <div className="flex flex-wrap items-center justify-between pb-2 border-b border-border/60 gap-1.5">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-300" />
          <h3 className="text-xs font-semibold text-white">Order Book</h3>

          {/* Source Switcher */}
          <div className="flex items-center gap-0.5 bg-surface-elevated p-0.5 rounded border border-border/50 text-[10px]">
            <button
              type="button"
              onClick={() => setBookSource('backpack')}
              className={`px-1.5 py-0.5 rounded transition ${
                bookSource === 'backpack'
                  ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Backpack L2
            </button>
            <button
              type="button"
              onClick={() => setBookSource('local')}
              className={`px-1.5 py-0.5 rounded transition ${
                bookSource === 'local'
                  ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Atlas Engine
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface-elevated/70 p-0.5 rounded-lg border border-border/50 text-[10px]">
          <button
            type="button"
            onClick={() => setActiveTab('depth')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              activeTab === 'depth'
                ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
            className={`px-2 py-0.5 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'order'
                ? 'bg-zinc-200 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PlusCircle className="w-2.5 h-2.5" />
            Place
          </button>
        </div>
      </div>

      {activeTab === 'order' ? (
        /* Place Limit/Market Order Form */
        <form onSubmit={handleOrderSubmit} className="flex-1 flex flex-col justify-between py-3 space-y-3">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-surface-elevated rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1 ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                Buy (Bid)
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`py-1.5 rounded text-xs font-medium transition flex items-center justify-center gap-1 ${
                  orderSide === 'SELL'
                    ? 'bg-rose-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                Sell (Ask)
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Limit Price (USDC)
              </label>
              <input
                type="number"
                step="0.1"
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                placeholder={effectiveLastPrice.toFixed(2)}
                className="w-full px-2.5 py-1.5 bg-surface-elevated border border-border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Quantity (ETH)
              </label>
              <input
                type="number"
                step="0.05"
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
                placeholder="0.5"
                className="w-full px-2.5 py-1.5 bg-surface-elevated border border-border rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
            className={`w-full py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              orderSuccess
                ? 'bg-emerald-600 text-white'
                : orderSide === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
        /* Depth Ladder Table */
        <>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 py-1 border-b border-border/40">
            <span>Spread: ${spread}</span>
            <span className="text-slate-500">
              {bookSource === 'backpack' ? 'Backpack Exchange API' : 'Atlas In-Memory Engine'}
            </span>
          </div>

          <div className="grid grid-cols-3 text-[10px] font-medium text-slate-400 py-1 border-b border-border/30">
            <div>Price (USDC)</div>
            <div className="text-right">Size (ETH)</div>
            <div className="text-right">Total (USDC)</div>
          </div>

          {effectiveLoading && activeBids.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-12 font-mono">
              Loading {bookSource === 'backpack' ? 'Backpack' : 'Atlas'} depth...
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-1 py-1">
              {/* Asks (Sells) */}
              <div className="space-y-0.5">
                {activeAsks.slice(0, 5).reverse().map((ask, idx) => {
                  const depthPct = Math.min(100, Math.round((ask.total / maxAskTotal) * 100));
                  return (
                    <div
                      key={`ask-${idx}`}
                      onClick={() => handleQuickPriceSelect(ask.price)}
                      className="relative grid grid-cols-3 text-xs font-mono py-0.5 px-1 cursor-pointer hover:bg-rose-500/10 rounded transition"
                    >
                      <div
                        className="absolute inset-y-0 right-0 bg-rose-500/10 pointer-events-none rounded"
                        style={{ width: `${depthPct}%` }}
                      />
                      <span className="text-rose-400 z-10">{ask.price.toFixed(2)}</span>
                      <span className="text-right text-slate-300 z-10">{ask.amount.toFixed(3)}</span>
                      <span className="text-right text-slate-400 z-10">${ask.total.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Mid Price */}
              <div className="py-1 px-2 bg-surface-elevated/70 rounded border border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[10px]">
                  {bookSource === 'backpack' ? 'Backpack Last Price' : 'Atlas Mid Price'}
                </span>
                <span className="font-bold text-white tracking-wider">
                  ${effectiveLastPrice.toFixed(2)}
                </span>
              </div>

              {/* Bids (Buys) */}
              <div className="space-y-0.5">
                {activeBids.slice(0, 5).map((bid, idx) => {
                  const depthPct = Math.min(100, Math.round((bid.total / maxBidTotal) * 100));
                  return (
                    <div
                      key={`bid-${idx}`}
                      onClick={() => handleQuickPriceSelect(bid.price)}
                      className="relative grid grid-cols-3 text-xs font-mono py-0.5 px-1 cursor-pointer hover:bg-emerald-500/10 rounded transition"
                    >
                      <div
                        className="absolute inset-y-0 right-0 bg-emerald-500/10 pointer-events-none rounded"
                        style={{ width: `${depthPct}%` }}
                      />
                      <span className="text-emerald-400 z-10">{bid.price.toFixed(2)}</span>
                      <span className="text-right text-slate-300 z-10">{bid.amount.toFixed(3)}</span>
                      <span className="text-right text-slate-400 z-10">${bid.total.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
