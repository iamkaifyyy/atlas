export type TriggerType = 'PRICE_BELOW' | 'PRICE_ABOVE';

export interface TriggerCondition {
  asset: string;
  type: TriggerType;
  targetPrice: number;
}

export interface SpendingCap {
  maxTotalSpend: number;
  maxPerTradeSpend: number;
  currentTotalSpend?: number;
}

export interface ApprovalThreshold {
  thresholdAmount: number;
}

export interface AgentConfig {
  id?: string;
  name: string;
  assetPair: 'ETH/USDC';
  trigger: TriggerCondition;
  spendingCap: SpendingCap;
  approvalThreshold: ApprovalThreshold;
  action: 'BUY' | 'SELL';
  tradeAmount: number;
  active: boolean;
  vaultAddress?: string;
  createdAt?: number;
}

export type TradeStatus =
  | 'ATTEMPTED'
  | 'EXECUTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'KILLED';

export interface TradeEventPayload {
  tradeId: string;
  timestamp: number;
  status: TradeStatus;
  asset: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
  txHash?: string;
  reason?: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastPrice: number;
  timestamp: number;
}
