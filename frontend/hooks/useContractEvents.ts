'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BACKEND_WS_URL, BACKEND_HTTP_URL } from '../lib/contractAddress';
import type { TradeEventPayload, AgentConfig } from '../../shared/types/agentConfig';

export interface ContractEventsState {
  events: TradeEventPayload[];
  pendingTrades: TradeEventPayload[];
  currentPrice: number;
  priceSource: 'live' | 'mock';
  isConnected: boolean;
  agentConfig: AgentConfig | null;
  approveTrade: (tradeId: string) => Promise<boolean>;
  rejectTrade: (tradeId: string) => Promise<boolean>;
  triggerKillSwitch: () => Promise<boolean>;
  nudgePrice: (delta: number) => Promise<void>;
  simulateTrade: (params: { amount: number; price: number; status?: string; reason?: string }) => Promise<void>;
}

export function useContractEvents(): ContractEventsState {
  const [events, setEvents] = useState<TradeEventPayload[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(3045.0);
  const [priceSource, setPriceSource] = useState<'live' | 'mock'>('live');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Derive pending approvals
  const pendingTrades = events.filter((e) => e.status === 'PENDING_APPROVAL');

  const fetchInitialStatus = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_HTTP_URL}/api/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.currentPrice) setCurrentPrice(data.currentPrice);
        if (data.config) setAgentConfig(data.config);
      }
      const eventsRes = await fetch(`${BACKEND_HTTP_URL}/api/events`);
      if (eventsRes.ok) {
        const data = await eventsRes.json();
        if (Array.isArray(data.events)) setEvents(data.events);
      }
    } catch {
      // Backend may not be started yet; graceful fallback
    }
  }, []);

  useEffect(() => {
    fetchInitialStatus();

    let reconnectTimer: NodeJS.Timeout;

    function connect() {
      try {
        const ws = new WebSocket(BACKEND_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'PRICE_TICK') {
              setCurrentPrice(msg.data.price);
              setPriceSource(msg.data.source);
            } else if (msg.type === 'TRADE_EVENT') {
              setEvents((prev) => [msg.data, ...prev.filter((e) => e.tradeId !== msg.data.tradeId)]);
            } else if (msg.type === 'EVENT_HISTORY') {
              setEvents(msg.data);
            } else if (msg.type === 'CONFIG_UPDATED') {
              setAgentConfig(msg.data);
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [fetchInitialStatus]);

  const approveTrade = async (tradeId: string): Promise<boolean> => {
    try {
      await fetch(`${BACKEND_HTTP_URL}/api/trade/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId })
      });
      const approvedEvent: TradeEventPayload = {
        tradeId,
        timestamp: Date.now(),
        status: 'APPROVED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: 0.8,
        price: currentPrice,
        txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      setEvents((prev) => [approvedEvent, ...prev.filter((e) => e.tradeId !== tradeId)]);
      return true;
    } catch {
      return false;
    }
  };

  const rejectTrade = async (tradeId: string): Promise<boolean> => {
    try {
      const rejectedEvent: TradeEventPayload = {
        tradeId,
        timestamp: Date.now(),
        status: 'REJECTED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: 0.8,
        price: currentPrice,
        reason: 'Manually rejected by owner'
      };
      setEvents((prev) => [rejectedEvent, ...prev.filter((e) => e.tradeId !== tradeId)]);
      return true;
    } catch {
      return false;
    }
  };

  const triggerKillSwitch = async (): Promise<boolean> => {
    try {
      await fetch(`${BACKEND_HTTP_URL}/api/kill-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const killEvent: TradeEventPayload = {
        tradeId: 'KILL',
        timestamp: Date.now(),
        status: 'KILLED',
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: 5.0,
        price: 0,
        reason: 'Emergency kill-switch executed. All operations halted and funds returned.'
      };
      setEvents((prev) => [killEvent, ...prev]);
      return true;
    } catch {
      return false;
    }
  };

  const nudgePrice = async (delta: number) => {
    try {
      await fetch(`${BACKEND_HTTP_URL}/api/price/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta })
      });
    } catch {
      setCurrentPrice((p) => Number((p + delta).toFixed(2)));
    }
  };

  const simulateTrade = async (params: { amount: number; price: number; status?: string; reason?: string }) => {
    try {
      await fetch(`${BACKEND_HTTP_URL}/api/simulate-trade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
    } catch {
      const localEvent: TradeEventPayload = {
        tradeId: `DEMO-${Date.now().toString().slice(-4)}`,
        timestamp: Date.now(),
        status: (params.status || 'EXECUTED') as any,
        asset: 'ETH/USDC',
        action: 'BUY',
        amount: params.amount,
        price: params.price,
        reason: params.reason
      };
      setEvents((prev) => [localEvent, ...prev]);
    }
  };

  return {
    events,
    pendingTrades,
    currentPrice,
    priceSource,
    isConnected,
    agentConfig,
    approveTrade,
    rejectTrade,
    triggerKillSwitch,
    nudgePrice,
    simulateTrade
  };
}
