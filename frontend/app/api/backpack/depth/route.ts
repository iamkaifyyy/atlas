import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'ETH_USDC';

  try {
    const res = await fetch(`https://api.backpack.exchange/api/v1/depth?symbol=${symbol}`, {
      headers: { 'User-Agent': 'Atlas-Client/1.0' },
      cache: 'no-store'
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    try {
      const bRes = await fetch(`http://localhost:3001/api/backpack/depth?symbol=${symbol}`, {
        cache: 'no-store'
      });
      if (bRes.ok) {
        return NextResponse.json(await bRes.json());
      }
    } catch {}
  }

  return NextResponse.json({ bids: [], asks: [] });
}
