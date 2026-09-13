import { NextRequest, NextResponse } from 'next/server';
import { fetchSubgraphMarketIntel } from '@/../agent-runner/src/graphClient';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'ETH_USDC';

  try {
    const intel = await fetchSubgraphMarketIntel(symbol);
    return NextResponse.json({
      status: 'SUCCESS',
      network: 'Ethereum Mainnet (Uniswap v3 Subgraph Studio)',
      subgraphId: 'QmXttn9s...v3pool',
      data: intel,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
