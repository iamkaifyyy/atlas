'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RefreshCw, BarChart2 } from 'lucide-react';

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  height?: number | string;
}

declare global {
  interface Window {
    TradingView?: any;
    tvWidget?: any;
  }
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'COINBASE:ETHUSD',
  interval = '1D',
  height = 480
}) => {
  const containerId = useRef(`tv_chart_${Math.random().toString(36).substring(7)}`).current;
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout;

    function initWidget() {
      if (!isMounted || !window.TradingView) return;

      const containerEl = document.getElementById(containerId);
      if (!containerEl) return;
      containerEl.innerHTML = '';

      try {
        // Instantiate official TradingView Advanced Real-Time Chart widget
        const widget = (window.tvWidget = new window.TradingView.widget({
          autosize: true,
          symbol: symbol || 'COINBASE:ETHUSD',
          interval: interval || '1D',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#080c14',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container: containerId,
          container_id: containerId,
          withdateranges: true,
          hide_side_toolbar: false,
          overrides: {
            'paneProperties.background': '#080c14',
            'paneProperties.backgroundType': 'solid',
            'paneProperties.vertGridProperties.color': 'rgba(51, 65, 85, 0.2)',
            'paneProperties.horzGridProperties.color': 'rgba(51, 65, 85, 0.2)',
            'scalesProperties.textColor': '#94a3b8'
          }
        }));

        // Remove loading screen once widget is mounted
        timer = setTimeout(() => {
          if (isMounted) setIsLoading(false);
        }, 600);

        if (widget && typeof widget.onChartReady === 'function') {
          widget.onChartReady(() => {
            if (isMounted) setIsLoading(false);
            try {
              if (widget.activeChart && typeof widget.activeChart().setDragExportEnabled === 'function') {
                widget.activeChart().setDragExportEnabled(true);
              }
            } catch {
              // Optional feature check
            }
          });
        }
      } catch (err) {
        console.error('TradingView widget initialization error:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    if (window.TradingView) {
      initWidget();
    } else if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        if (isMounted) initWidget();
      };
      script.onerror = () => {
        if (isMounted) setIsLoading(false);
      };
      document.head.appendChild(script);
    } else {
      // Script already in DOM, wait for it
      const checkInterval = setInterval(() => {
        if (window.TradingView) {
          clearInterval(checkInterval);
          if (isMounted) initWidget();
        }
      }, 100);
      setTimeout(() => clearInterval(checkInterval), 4000);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      const el = document.getElementById(containerId);
      if (el) el.innerHTML = '';
    };
  }, [symbol, interval, containerId]);

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
      className={`relative w-full rounded-xl overflow-hidden bg-[#080c14] border border-border/70 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface/90 border-b border-border/60 text-xs font-mono">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-white tracking-wider">TradingView Pro Live Feed</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {symbol}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-elevated transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="relative flex-1 w-full h-full min-h-[380px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#080c14] text-xs font-mono text-slate-400">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <span>Connecting to TradingView Market Feed...</span>
          </div>
        )}

        <div id={containerId} className="w-full h-full" style={{ minHeight: '380px' }} />
      </div>
    </div>
  );
};
