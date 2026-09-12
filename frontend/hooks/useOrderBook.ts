'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BACKEND_HTTP_URL, BACKEND_WS_URL } from '../lib/contractAddress';
import type { OrderBookData } from '../../shared/types/agentConfig';

export interface PlaceOrderParams {
  side: 'BUY' | 'SELL';
  type?: 'LIMIT' | 'MARKET';
  price?: number;
  quantity: number;
}

export function useOrderBook() {
  const [data, setData] = useState<OrderBookData>({
    bids: [],
    asks: [],
    lastPrice: 3045.0,
    timestamp: Date.now()
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchBook = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_HTTP_URL}/api/orderbook`);
      if (res.ok) {
        const json = await res.json();
        if (json.bids && json.asks) {
          setData(json);
          setIsLoading(false);
        }
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    fetchBook();

    let reconnectTimer: NodeJS.Timeout;

    function connectWs() {
      try {
        const ws = new WebSocket(BACKEND_WS_URL);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'ORDERBOOK_UPDATE' && msg.data) {
              setData(msg.data);
              setIsLoading(false);
            }
          } catch {
            // Ignore malformed WS
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 3000);
        };
      } catch {
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    }

    connectWs();

    // Regular polling fallback every 2.5s
    const interval = setInterval(fetchBook, 2500);

    return () => {
      clearTimeout(reconnectTimer);
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchBook]);

  const placeOrder = async (params: PlaceOrderParams): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_HTTP_URL}/api/orderbook/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (json.depth) setData(json.depth);
        return { success: true };
      }
      return { success: false, error: json.error || 'Failed to place order' };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    ...data,
    isLoading,
    isSubmitting,
    placeOrder,
    refreshBook: fetchBook
  };
}
