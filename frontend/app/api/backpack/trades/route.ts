import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'ETH_USDC';
  const limit = searchParams.get('limit') || '20';

  try {
    const res = await fetch(`https://api.backpack.exchange/api/v1/trades?symbol=${symbol}&limit=${limit}`, {
      headers: { 'User-Agent': 'Atlas-Client/1.0' },
      cache: 'no-store'
    });
    if (res.ok) {
      return NextResponse.json(await res.json());
    }
  } catch {
    try {
      const bRes = await fetch(`http://localhost:3001/api/backpack/trades?symbol=${symbol}&limit=${limit}`, {
        cache: 'no-store'
      });
      if (bRes.ok) {
        return NextResponse.json(await bRes.json());
      }
    } catch {}
  }

  return NextResponse.json([]);
}
