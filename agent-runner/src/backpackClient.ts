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
    startTimeSeconds?: number,
    endTimeSeconds?: number
  ): Promise<BackpackKline[]> {
    const now = Math.floor(Date.now() / 1000);
    const endTime = endTimeSeconds || now;
    let span = 86400 * 3;
    if (interval === '1m') span = 3600 * 12; // 12 hours (720 candles)
    else if (interval === '15m') span = 86400 * 3; // 3 days (288 candles)
    else if (interval === '1h') span = 86400 * 7; // 7 days (168 candles)
    else if (interval === '1d') span = 86400 * 60; // 60 days (60 candles)

    const startTime = startTimeSeconds || (endTime - span);
    const res = await fetch(
      `${BACKPACK_API_BASE}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Backpack klines fetch failed (${res.status}): ${errText}`);
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
