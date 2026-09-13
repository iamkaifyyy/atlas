import { NextRequest, NextResponse } from 'next/server';
import { findCryptoAsset } from '@/lib/cryptoAssets';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const symbol = searchParams.get('symbol') || 'ETH_USDC';
  const cleanSymbol = symbol.replace('BINANCE:', '').replace('USDT', '_USDC').toUpperCase();
  const asset = findCryptoAsset(cleanSymbol);

  // 1. Fetch authentic ticker directly from Backpack Exchange API
  try {
    const res = await fetch(`https://api.backpack.exchange/api/v1/ticker?symbol=${asset.bpSymbol}`, {
      headers: { 'User-Agent': 'Atlas-Client/1.0' },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (data.lastPrice || data.close)) {
        const last = parseFloat(data.lastPrice || data.close);
        const open = parseFloat(data.firstPrice || data.open) || last;
        const change = last - open;
        const changePct = open > 0 ? (change / open) * 100 : 0;

        return NextResponse.json({
          symbol: asset.bpSymbol,
          firstPrice: open.toString(),
          lastPrice: last.toString(),
          high: (data.high || last * 1.01).toString(),
          low: (data.low || last * 0.99).toString(),
          priceChange: change.toFixed(4),
          priceChangePercent: changePct.toFixed(2),
          volume: data.volume?.toString() || '0',
          quoteVolume: data.quoteVolume?.toString() || '0',
          trades: data.trades?.toString() || '0'
        });
      }
    }
  } catch {}

  // 2. Fetch authentic ticker from Binance API for L1 & L2 tokens
  try {
    const binanceSymbol = `${asset.id}USDT`;
    const bRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`, {
      headers: { 'User-Agent': 'Atlas-Client/1.0' },
      cache: 'no-store'
    });

    if (bRes.ok) {
      const bData = await bRes.json();
      if (bData && bData.lastPrice) {
        return NextResponse.json({
          symbol: asset.bpSymbol,
          firstPrice: bData.openPrice,
          lastPrice: bData.lastPrice,
          high: bData.highPrice,
          low: bData.lowPrice,
          priceChange: bData.priceChange,
          priceChangePercent: bData.priceChangePercent,
          volume: bData.volume,
          quoteVolume: bData.quoteVolume,
          trades: bData.count?.toString() || '0'
        });
      }
    }
  } catch {}

  // Return base market fallback if network unreachable
  return NextResponse.json({
    symbol: asset.bpSymbol,
    firstPrice: asset.defaultPrice.toString(),
    lastPrice: asset.defaultPrice.toString(),
    high: (asset.defaultPrice * 1.01).toFixed(2),
    low: (asset.defaultPrice * 0.99).toFixed(2),
    priceChange: '0.00',
    priceChangePercent: '0.00',
    volume: '0',
    quoteVolume: '0',
    trades: '0'
  });
}
