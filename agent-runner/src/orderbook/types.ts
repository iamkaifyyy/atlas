export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  timestamp: number;
}

export interface TradeFill {
  tradeId: string;
  makerOrderId: string;
  takerOrderId: string;
  side: OrderSide;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface MarketDepth {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastPrice: number;
  timestamp: number;
}

export interface CreateOrderParams {
  userId?: string;
  symbol?: string;
  side: OrderSide;
  type?: OrderType;
  price?: number;
  quantity: number;
}
