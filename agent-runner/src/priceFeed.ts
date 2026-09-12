import { EventEmitter } from 'node:events';
import type { MatchingEngine } from './orderbook/matchingEngine.js';
import { backpackClient } from './backpackClient.js';

export interface PriceTick {
  asset: string;
  price: number;
  timestamp: number;
  source: 'orderbook' | 'manual' | 'backpack';
}

export class PriceFeedService extends EventEmitter {
  private currentPrice: number;
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private manualOverride = false;
  private matchingEngine: MatchingEngine;

  constructor(matchingEngine: MatchingEngine) {
    super();
    this.matchingEngine = matchingEngine;
    this.currentPrice = matchingEngine.getLastPrice();

    // Listen to real trade events from matching engine
    this.matchingEngine.on('trades', (fills) => {
      if (fills && fills.length > 0) {
        const lastTrade = fills[fills.length - 1];
        this.currentPrice = lastTrade.price;
        this.emitPrice('orderbook');
      }
    });
  }

  public getCurrentPrice(): number {
    return this.currentPrice;
  }

  public setPrice(price: number): void {
    this.currentPrice = Number(price.toFixed(2));
    this.manualOverride = true;
    this.matchingEngine.seedLiquidity(this.currentPrice);
    this.emitPrice('manual');
  }

  public nudgePrice(delta: number): void {
    this.currentPrice = Math.max(1, Number((this.currentPrice + delta).toFixed(2)));
    this.manualOverride = true;
    this.matchingEngine.seedLiquidity(this.currentPrice);
    this.emitPrice('manual');
  }

  public resetToLive(): void {
    this.manualOverride = false;
  }

  public async syncWithBackpack(): Promise<number> {
    try {
      const ticker = await backpackClient.getTicker('ETH_USDC');
      if (ticker && ticker.lastPrice) {
        this.currentPrice = Number(parseFloat(ticker.lastPrice).toFixed(2));
        this.matchingEngine.setLastPrice(this.currentPrice);
        this.emitPrice('backpack');
      }
    } catch (err) {
      console.warn('Backpack sync fallback:', err);
    }
    return this.currentPrice;
  }

  public start(intervalMs = 2500): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial sync with Backpack
    this.syncWithBackpack();

    // Poll live Backpack Exchange ticker
    this.timer = setInterval(async () => {
      if (!this.manualOverride) {
        try {
          const ticker = await backpackClient.getTicker('ETH_USDC');
          if (ticker && ticker.lastPrice) {
            this.currentPrice = Number(parseFloat(ticker.lastPrice).toFixed(2));
            this.matchingEngine.setLastPrice(this.currentPrice);
            this.emitPrice('backpack');
            return;
          }
        } catch {
          // Graceful fallback to drift if offline
          const drift = (Math.random() - 0.49) * 1.2;
          this.currentPrice = Number((this.currentPrice + drift).toFixed(2));
          this.matchingEngine.setLastPrice(this.currentPrice);
        }
      }
      this.emitPrice(this.manualOverride ? 'manual' : 'orderbook');
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  private emitPrice(source: 'orderbook' | 'manual' | 'backpack'): void {
    const tick: PriceTick = {
      asset: this.matchingEngine.symbol,
      price: this.currentPrice,
      timestamp: Date.now(),
      source
    };
    this.emit('price', tick);
  }
}
