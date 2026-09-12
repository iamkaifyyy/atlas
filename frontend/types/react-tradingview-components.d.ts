declare module 'react-tradingview-components' {
  import React, { Component, ComponentType } from 'react';

  export interface TradingViewStockChartWidgetProps {
    symbol?: string;
    theme?: 'Dark' | 'Light' | string;
    range?: '1d' | '5d' | '1m' | '3m' | '6m' | 'ytd' | '12m' | '60m' | 'all' | string;
    interval?: string;
    autosize?: boolean;
    height?: number | string;
    width?: number | string;
    allow_symbol_change?: boolean;
    enable_publishing?: boolean;
    hideideas?: boolean;
    hide_legend?: boolean;
    hide_side_toolbar?: boolean;
    hide_top_toolbar?: boolean;
    locale?: string;
    save_image?: boolean;
    show_popup_button?: boolean;
    style?: string;
    timezone?: string;
    toolbar_bg?: string;
    watchlist?: string[];
    withdateranges?: boolean;
    studies?: any[];
    [key: string]: any;
  }

  export class TradingViewStockChartWidget extends Component<TradingViewStockChartWidgetProps> {}
  export class TradingViewMarketWidget extends Component<any> {}
  export const Themes: { LIGHT: string; DARK: string };
  export const IntervalTypes: Record<string, string>;
  export const RangeTypes: Record<string, string>;
  export const BarStyles: Record<string, string>;

  export default TradingViewStockChartWidget;
}
