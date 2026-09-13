export const HEDERA_CONFIG = {
  network: 'testnet',
  topicId: process.env.NEXT_PUBLIC_HEDERA_TOPIC_ID || '0.0.5678912',
  operatorId: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '0.0.4819203',
  rpcUrl: 'https://testnet.hedera.api.hgraph.io/v1/graphql',
  hashscanBaseUrl: 'https://hashscan.io/testnet',
  x402PriceHbar: '0.1',
};

export interface HcsAuditRecord {
  topicId: string;
  sequenceNumber: number;
  transactionId: string;
  hashscanUrl: string;
  tradeId: string;
  symbol: string;
  side: string;
  amount: number;
  price: number;
  timestamp: string;
  consensusTimestamp: string;
}

export function buildHashscanTxUrl(txId: string): string {
  // Format txId from 0.0.xxxx@sec.nanos to Hashscan URL format
  const cleanId = txId.replace('@', '-').replace('.', '-');
  return `${HEDERA_CONFIG.hashscanBaseUrl}/transaction/${cleanId}`;
}

export function buildHashscanTopicUrl(topicId: string): string {
  return `${HEDERA_CONFIG.hashscanBaseUrl}/topic/${topicId}`;
}
