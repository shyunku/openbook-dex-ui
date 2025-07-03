// utils/fetchCandles.ts
import { Connection } from '@solana/web3.js';
import { Market } from '@openbook-dex/openbook';
import type { Candle } from '../components/LWCandleChart';
import { UTCTimestamp } from 'lightweight-charts';

/* … */

export async function fetchCandles(
  market: Market,
  connection: Connection,
  intervalSec = 60,
  limit = 1000,
): Promise<Candle[]> {
  const fills = await market.loadFills(connection, limit);

  type Bucket = {
    open?: number;
    close?: number;
    high: number;
    low: number;
    // volume: number;   // 필요하면 나중에 따로 사용
  };
  const buckets: Record<number, Bucket> = {};

  for (const f of fills) {
    const bucketTime = Math.floor(f.timestamp / intervalSec) * intervalSec;

    if (!buckets[bucketTime]) {
      buckets[bucketTime] = {
        open: f.price,
        close: f.price,
        high: f.price,
        low: f.price,
      };
    }

    const b = buckets[bucketTime];
    b.close = f.price;
    b.high = Math.max(b.high, f.price);
    b.low = Math.min(b.low, f.price);
  }

  return Object.entries(buckets)
    .map(([t, b]) => ({
      time: Number(t) as UTCTimestamp, // ⬅️ 캐스팅
      open: b.open!,
      high: b.high,
      low: b.low,
      close: b.close!,
    }))
    .sort((a, b) => a.time - b.time);
}
