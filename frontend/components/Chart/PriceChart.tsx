'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import type { TradeEventPayload } from '../../../shared/types/agentConfig';
import { AgentTradeMarker } from './AgentTradeMarker';

interface PriceChartProps {
  currentPrice: number;
  events: TradeEventPayload[];
}

export const PriceChart: React.FC<PriceChartProps> = ({ currentPrice, events }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090909' },
        textColor: '#999999',
        fontSize: 11,
        fontFamily: 'monospace'
      },
      grid: {
        vertLines: { color: 'rgba(38, 38, 38, 0.4)' },
        horzLines: { color: 'rgba(38, 38, 38, 0.4)' }
      },
      width: chartContainerRef.current.clientWidth,
      height: 330,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: '#262626'
      },
      rightPriceScale: {
        borderColor: '#262626'
      }
    });

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(255, 255, 255, 0.2)',
      bottomColor: 'rgba(255, 255, 255, 0.01)',
      lineColor: '#ffffff',
      lineWidth: 2
    });

    const now = Math.floor(Date.now() / 1000);
    const initialData = [];
    let base = currentPrice || 3045;
    for (let i = 40; i >= 0; i--) {
      const time = (now - i * 5) as any;
      base = Number((base + (Math.random() - 0.49) * 2).toFixed(2));
      initialData.push({ time, value: base });
    }
    areaSeries.setData(initialData);

    chartRef.current = chart;
    seriesRef.current = areaSeries;

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
  }, [mounted]);

  useEffect(() => {
    if (!seriesRef.current || !currentPrice) return;
    const time = Math.floor(Date.now() / 1000) as any;
    try {
      seriesRef.current.update({ time, value: currentPrice });
    } catch {
      // Ignored if update happens within same second
    }
  }, [currentPrice]);

  useEffect(() => {
    if (!seriesRef.current || !events.length) return;

    const markers = events.slice(0, 10).map((e) => {
      const time = Math.floor(e.timestamp / 1000) as any;
      if (e.status === 'EXECUTED' || e.status === 'APPROVED') {
        return {
          time,
          position: 'belowBar' as const,
          color: '#10b981',
          shape: 'arrowUp' as const,
          text: `BUY ${e.amount} ETH`
        };
      }
      if (e.status === 'PENDING_APPROVAL') {
        return {
          time,
          position: 'aboveBar' as const,
          color: '#f59e0b',
          shape: 'circle' as const,
          text: `APPROVAL: ${e.amount} ETH`
        };
      }
      return {
        time,
        position: 'aboveBar' as const,
        color: '#ef4444',
        shape: 'square' as const,
        text: `REJECTED`
      };
    });

    try {
      seriesRef.current.setMarkers(markers);
    } catch {
      // Sync tolerance
    }
  }, [events]);

  const latestActiveTrade = events.find(
    (e) => e.status === 'EXECUTED' || e.status === 'PENDING_APPROVAL' || e.status === 'REJECTED'
  );

  return (
    <div className="framer-card p-5 relative flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs text-ink-muted font-mono uppercase tracking-wider">ETH / USDC</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                ${currentPrice ? currentPrice.toFixed(2) : '3,045.00'}
              </span>
            </div>
          </div>
        </div>

        {latestActiveTrade && (
          <AgentTradeMarker event={latestActiveTrade} />
        )}
      </div>

      <div ref={chartContainerRef} className="w-full h-[330px] rounded-xl overflow-hidden border border-hairline" />

      <div className="flex items-center justify-between text-[11px] text-ink-muted mt-3 pt-2.5 border-t border-hairline">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Executed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Pending Approval
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Cap Blocked
          </span>
        </div>
        <span className="font-mono text-ink-muted">Live feed</span>
      </div>
    </div>
  );
};
