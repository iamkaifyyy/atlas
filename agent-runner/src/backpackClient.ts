export interface BackpackTicker {
  symbol: string;
  firstPrice: string;
  lastPrice: string;
  high: string;
  low: string;
  volume: string;
  quoteVolume: string;
  priceChange: string;
  priceChangePercent: string;
  trades: string;
}

export interface BackpackDepth {
  asks: [string, string][];
  bids: [string, string][];
}

export interface BackpackKline {
  start: string;
  end: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  quoteVolume: string;
  trades: string;
}

export interface BackpackTrade {
  id: number;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
  isBuyerMaker: boolean;
}

const BACKPACK_API_BASE = 'https://api.backpack.exchange/api/v1';

export class BackpackClient {
  /**
   * Fetch 24-hour ticker statistics for a market pair
   */
  async getTicker(symbol: string = 'ETH_USDC'): Promise<BackpackTicker> {
    const res = await fetch(`${BACKPACK_API_BASE}/ticker?symbol=${symbol}`);
    if (!res.ok) {
      throw new Error(`Backpack ticker fetch failed: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetch live Level 2 order book depth
   */
  async getDepth(symbol: string = 'ETH_USDC'): Promise<BackpackDepth> {
    const res = await fetch(`${BACKPACK_API_BASE}/depth?symbol=${symbol}`);
    if (!res.ok) {
      throw new Error(`Backpack depth fetch failed: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetch historical OHLC klines/candlesticks
   */
  async getKlines(
    symbol: string = 'ETH_USDC',
    interval: string = '1h',
    startTimeSeconds?: number
  ): Promise<BackpackKline[]> {
    const startTime = startTimeSeconds || Math.floor(Date.now() / 1000) - 86400 * 3;
    const res = await fetch(
      `${BACKPACK_API_BASE}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}`
    );
    if (!res.ok) {
      throw new Error(`Backpack klines fetch failed: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Fetch recent publicly executed trades
   */
  async getTrades(symbol: string = 'ETH_USDC', limit: number = 20): Promise<BackpackTrade[]> {
    const res = await fetch(`${BACKPACK_API_BASE}/trades?symbol=${symbol}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Backpack trades fetch failed: ${res.statusText}`);
    }
    return res.json();
  }
}

export const backpackClient = new BackpackClient();
