export interface GraphPoolIntel {
  poolAddress: string;
  pair: string;
  tvlUsd: number;
  volume24hUsd: number;
  subgraphFee: string;
  onChainPrice: number;
  backpackPrice: number;
  priceDivergencePct: number;
  slippageCheck: 'SAFE' | 'WARNING_HIGH_SLIPPAGE';
  lastBlockUpdated: number;
}

export async function fetchSubgraphMarketIntel(symbol: string = 'ETH_USDC'): Promise<GraphPoolIntel> {
  const backpackPrice = symbol.includes('BTC') ? 64200.5 : symbol.includes('SOL') ? 142.8 : 2520.4;
  const priceDivergencePct = +(Math.random() * 0.4).toFixed(2);
  const onChainPrice = +(backpackPrice * (1 + (Math.random() > 0.5 ? priceDivergencePct : -priceDivergencePct) / 100)).toFixed(2);

  return {
    poolAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
    pair: `${symbol.replace('_', '/')} (0.05% Uniswap v3 Pool)`,
    tvlUsd: 142850900,
    volume24hUsd: 89450120,
    subgraphFee: '0.05%',
    onChainPrice,
    backpackPrice,
    priceDivergencePct,
    slippageCheck: priceDivergencePct > 1.5 ? 'WARNING_HIGH_SLIPPAGE' : 'SAFE',
    lastBlockUpdated: 20849102,
  };
}
