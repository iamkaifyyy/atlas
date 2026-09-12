import { EventEmitter } from 'node:events';
import type {
  Order,
  OrderSide,
  OrderType,
  TradeFill,
  OrderBookLevel,
  MarketDepth,
  CreateOrderParams
} from './types.js';

export class MatchingEngine extends EventEmitter {
  public symbol: string;
  private bids: Map<number, Order[]> = new Map(); // price -> FIFO orders
  private asks: Map<number, Order[]> = new Map(); // price -> FIFO orders
  private orders: Map<string, Order> = new Map();
  private trades: TradeFill[] = [];
  private lastPrice: number;
  private orderCounter = 1;
  private tradeCounter = 1;

  constructor(symbol = 'ETH/USDC', initialPrice = 3045.0) {
    super();
    this.symbol = symbol;
    this.lastPrice = initialPrice;
    this.seedLiquidity(initialPrice);
  }

  public getLastPrice(): number {
    return this.lastPrice;
  }

  public setLastPrice(price: number): void {
    this.lastPrice = price;
  }

  public getRecentTrades(limit = 50): TradeFill[] {
    return this.trades.slice(-limit).reverse();
  }

  public createOrder(params: CreateOrderParams): { order: Order; fills: TradeFill[] } {
    const side = params.side;
    const type: OrderType = params.type || 'LIMIT';
    const quantity = Number(params.quantity);
    let price = params.price ? Number(params.price) : this.lastPrice;

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (type === 'LIMIT' && price <= 0) {
      throw new Error('Price must be greater than 0 for limit orders');
    }

    // Precision rounding
    price = Number(price.toFixed(2));
    const roundedQty = Number(quantity.toFixed(4));

    const orderId = `ord-${Date.now()}-${this.orderCounter++}`;
    const order: Order = {
      id: orderId,
      userId: params.userId || 'trader-1',
      symbol: this.symbol,
      side,
      type,
      price,
      quantity: roundedQty,
      filledQuantity: 0,
      remainingQuantity: roundedQty,
      status: 'OPEN',
      timestamp: Date.now()
    };

    const fills = this.matchOrder(order);

    if (order.remainingQuantity > 0 && order.type === 'LIMIT') {
      this.addOrderToBook(order);
    } else if (order.remainingQuantity === 0) {
      order.status = 'FILLED';
    } else if (order.type === 'MARKET') {
      // Unfilled market orders cancel remaining
      order.status = order.filledQuantity > 0 ? 'PARTIALLY_FILLED' : 'CANCELLED';
    }

    this.orders.set(order.id, order);

    this.emit('orderCreated', order);
    if (fills.length > 0) {
      this.emit('trades', fills);
      this.emit('depth', this.getDepth(10));
    }

    return { order, fills };
  }

  private matchOrder(takerOrder: Order): TradeFill[] {
    const fills: TradeFill[] = [];
    const isBuy = takerOrder.side === 'BUY';

    while (takerOrder.remainingQuantity > 0) {
      const bestPrice = isBuy ? this.getLowestAskPrice() : this.getHighestBidPrice();
      if (bestPrice === null) break;

      // Check price matching constraint for limit orders
      if (takerOrder.type === 'LIMIT') {
        if (isBuy && bestPrice > takerOrder.price) break;
        if (!isBuy && bestPrice < takerOrder.price) break;
      }

      const book = isBuy ? this.asks : this.bids;
      const levelOrders = book.get(bestPrice);
      if (!levelOrders || levelOrders.length === 0) {
        book.delete(bestPrice);
        continue;
      }

      const makerOrder = levelOrders[0];
      const matchQty = Number(
        Math.min(takerOrder.remainingQuantity, makerOrder.remainingQuantity).toFixed(4)
      );

      if (matchQty <= 0) break;

      // Execute Fill
      const fill: TradeFill = {
        tradeId: `trd-${Date.now()}-${this.tradeCounter++}`,
        makerOrderId: makerOrder.id,
        takerOrderId: takerOrder.id,
        side: takerOrder.side,
        price: bestPrice,
        quantity: matchQty,
        timestamp: Date.now()
      };

      fills.push(fill);
      this.trades.push(fill);
      this.lastPrice = bestPrice;

      // Update quantities
      takerOrder.filledQuantity = Number((takerOrder.filledQuantity + matchQty).toFixed(4));
      takerOrder.remainingQuantity = Number(
        Math.max(0, takerOrder.remainingQuantity - matchQty).toFixed(4)
      );
      takerOrder.status = takerOrder.remainingQuantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED';

      makerOrder.filledQuantity = Number((makerOrder.filledQuantity + matchQty).toFixed(4));
      makerOrder.remainingQuantity = Number(
        Math.max(0, makerOrder.remainingQuantity - matchQty).toFixed(4)
      );
      makerOrder.status = makerOrder.remainingQuantity === 0 ? 'FILLED' : 'PARTIALLY_FILLED';

      // Remove filled maker order from queue
      if (makerOrder.remainingQuantity === 0) {
        levelOrders.shift();
      }

      // If price level is empty, remove it from map
      if (levelOrders.length === 0) {
        book.delete(bestPrice);
      }
    }

    return fills;
  }

  private addOrderToBook(order: Order): void {
    const book = order.side === 'BUY' ? this.bids : this.asks;
    if (!book.has(order.price)) {
      book.set(order.price, []);
    }
    book.get(order.price)!.push(order);
    this.emit('depth', this.getDepth(10));
  }

  public cancelOrder(orderId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.status === 'FILLED' || order.status === 'CANCELLED') {
      return false;
    }

    const book = order.side === 'BUY' ? this.bids : this.asks;
    const levelOrders = book.get(order.price);
    if (levelOrders) {
      const idx = levelOrders.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        levelOrders.splice(idx, 1);
        if (levelOrders.length === 0) {
          book.delete(order.price);
        }
      }
    }

    order.status = 'CANCELLED';
    this.emit('orderCancelled', order);
    this.emit('depth', this.getDepth(10));
    return true;
  }

  public getOpenOrders(userId?: string): Order[] {
    const list: Order[] = [];
    for (const order of this.orders.values()) {
      if (order.status === 'OPEN' || order.status === 'PARTIALLY_FILLED') {
        if (!userId || order.userId === userId) {
          list.push({ ...order });
        }
      }
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getDepth(limit = 10): MarketDepth {
    // Sort bids descending (highest buy offer first)
    const sortedBidPrices = Array.from(this.bids.keys()).sort((a, b) => b - a);
    const bids: OrderBookLevel[] = [];
    for (const price of sortedBidPrices.slice(0, limit)) {
      const orders = this.bids.get(price) || [];
      const amount = Number(orders.reduce((sum, o) => sum + o.remainingQuantity, 0).toFixed(3));
      if (amount > 0) {
        bids.push({
          price,
          amount,
          total: Number((price * amount).toFixed(2))
        });
      }
    }

    // Sort asks ascending (lowest sell offer first)
    const sortedAskPrices = Array.from(this.asks.keys()).sort((a, b) => a - b);
    const asks: OrderBookLevel[] = [];
    for (const price of sortedAskPrices.slice(0, limit)) {
      const orders = this.asks.get(price) || [];
      const amount = Number(orders.reduce((sum, o) => sum + o.remainingQuantity, 0).toFixed(3));
      if (amount > 0) {
        asks.push({
          price,
          amount,
          total: Number((price * amount).toFixed(2))
        });
      }
    }

    return {
      bids,
      asks,
      lastPrice: this.lastPrice,
      timestamp: Date.now()
    };
  }

  private getLowestAskPrice(): number | null {
    if (this.asks.size === 0) return null;
    return Math.min(...this.asks.keys());
  }

  private getHighestBidPrice(): number | null {
    if (this.bids.size === 0) return null;
    return Math.max(...this.bids.keys());
  }

  public seedLiquidity(centerPrice: number): void {
    const base = Number(centerPrice.toFixed(2));
    this.bids.clear();
    this.asks.clear();

    // Seed bids (Buyers willing to pay less than centerPrice)
    for (let i = 1; i <= 10; i++) {
      const price = Number((base - i * 1.5).toFixed(2));
      const quantity = Number((Math.random() * 1.5 + 0.4).toFixed(3));
      this.createOrder({
        userId: 'market-maker',
        side: 'BUY',
        type: 'LIMIT',
        price,
        quantity
      });
    }

    // Seed asks (Sellers willing to sell higher than centerPrice)
    for (let i = 1; i <= 10; i++) {
      const price = Number((base + i * 1.5).toFixed(2));
      const quantity = Number((Math.random() * 1.5 + 0.4).toFixed(3));
      this.createOrder({
        userId: 'market-maker',
        side: 'SELL',
        type: 'LIMIT',
        price,
        quantity
      });
    }

    this.lastPrice = base;
  }
}
