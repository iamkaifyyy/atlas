export interface CryptoAsset {
  id: string; // e.g. 'ETH'
  name: string; // e.g. 'Ethereum'
  category: 'Layer 1' | 'Layer 2' | 'DeFi' | 'AI';
  tvSymbol: string; // e.g. 'BINANCE:ETHUSDT'
  bpSymbol: string; // e.g. 'ETH_USDC'
  unit: string; // e.g. 'ETH'
  badge: string; // e.g. 'L1 CORE'
  defaultPrice: number;
}

export const CRYPTO_ASSETS: CryptoAsset[] = [
  // Layer 1
  {
    id: 'ETH',
    name: 'Ethereum',
    category: 'Layer 1',
    tvSymbol: 'BINANCE:ETHUSDT',
    bpSymbol: 'ETH_USDC',
    unit: 'ETH',
    badge: 'L1 CORE',
    defaultPrice: 2520.0
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    category: 'Layer 1',
    tvSymbol: 'BINANCE:BTCUSDT',
    bpSymbol: 'BTC_USDC',
    unit: 'BTC',
    badge: 'L1 SOVEREIGN',
    defaultPrice: 77200.0
  },
  {
    id: 'SOL',
    name: 'Solana',
    category: 'Layer 1',
    tvSymbol: 'BINANCE:SOLUSDT',
    bpSymbol: 'SOL_USDC',
    unit: 'SOL',
    badge: 'L1 HIGH-TPS',
    defaultPrice: 101.5
  },
  {
    id: 'SUI',
    name: 'Sui Network',
    category: 'Layer 1',
    tvSymbol: 'BINANCE:SUIUSDT',
    bpSymbol: 'SUI_USDC',
    unit: 'SUI',
    badge: 'L1 PARALLEL',
    defaultPrice: 1.82
  },
  {
    id: 'AVAX',
    name: 'Avalanche',
    category: 'Layer 1',
    tvSymbol: 'BINANCE:AVAXUSDT',
    bpSymbol: 'AVAX_USDC',
    unit: 'AVAX',
    badge: 'L1 SUBNET',
    defaultPrice: 24.8
  },

  // Layer 2
  {
    id: 'ARB',
    name: 'Arbitrum',
    category: 'Layer 2',
    tvSymbol: 'BINANCE:ARBUSDT',
    bpSymbol: 'ARB_USDC',
    unit: 'ARB',
    badge: 'L2 ROLLUP',
    defaultPrice: 0.54
  },
  {
    id: 'OP',
    name: 'Optimism',
    category: 'Layer 2',
    tvSymbol: 'BINANCE:OPUSDT',
    bpSymbol: 'OP_USDC',
    unit: 'OP',
    badge: 'L2 SUPERCHAIN',
    defaultPrice: 1.45
  },
  {
    id: 'STRK',
    name: 'Starknet',
    category: 'Layer 2',
    tvSymbol: 'BINANCE:STRKUSDT',
    bpSymbol: 'STRK_USDC',
    unit: 'STRK',
    badge: 'L2 ZK-ROLLUP',
    defaultPrice: 0.38
  },
  {
    id: 'POL',
    name: 'Polygon',
    category: 'Layer 2',
    tvSymbol: 'BINANCE:POLUSDT',
    bpSymbol: 'POL_USDC',
    unit: 'POL',
    badge: 'L2 AGGLAYER',
    defaultPrice: 0.39
  },

  // Decentralized AI & DeFi
  {
    id: 'RENDER',
    name: 'Render Network',
    category: 'AI',
    tvSymbol: 'BINANCE:RENDERUSDT',
    bpSymbol: 'RENDER_USDC',
    unit: 'RENDER',
    badge: 'AI COMPUTE',
    defaultPrice: 5.60
  },
  {
    id: 'LINK',
    name: 'Chainlink',
    category: 'DeFi',
    tvSymbol: 'BINANCE:LINKUSDT',
    bpSymbol: 'LINK_USDC',
    unit: 'LINK',
    badge: 'ORACLE DEFI',
    defaultPrice: 11.20
  },
  {
    id: 'UNI',
    name: 'Uniswap',
    category: 'DeFi',
    tvSymbol: 'BINANCE:UNIUSDT',
    bpSymbol: 'UNI_USDC',
    unit: 'UNI',
    badge: 'AMM DEFI',
    defaultPrice: 7.40
  },
  {
    id: 'JUP',
    name: 'Jupiter',
    category: 'DeFi',
    tvSymbol: 'BINANCE:JUPUSDT',
    bpSymbol: 'JUP_USDC',
    unit: 'JUP',
    badge: 'SOLANA DEFI',
    defaultPrice: 0.85
  }
];

export const DEFAULT_CRYPTO_ASSET = CRYPTO_ASSETS[0]; // ETH_USDC

export function findCryptoAsset(symbolOrQuery: string): CryptoAsset {
  const query = symbolOrQuery.toUpperCase();
  const match = CRYPTO_ASSETS.find(
    (a) =>
      a.id === query ||
      a.bpSymbol === query ||
      a.tvSymbol === query ||
      query.includes(a.id)
  );
  return match || DEFAULT_CRYPTO_ASSET;
}
