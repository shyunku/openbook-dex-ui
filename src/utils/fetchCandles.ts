// utils/fetchCandles.ts
import { Connection } from '@solana/web3.js';
import { Market } from '@openbook-dex/openbook';
import { Candle } from '../components/LWCandleChart';
/**
 * OpenBook 체결 내역 → OHLCV 캔들로 집계
 * @param market        OpenBook Market 객체
 * @param connection    Solana connection (market.loadFills 에 필요)
 * @param intervalSec   캔들 길이 (기본 60초 = 1분)
 * @param limit         불러올 체결 개수 (기본 1,000개)
 */
export async function fetchCandles(
  market: Market,
  connection: Connection,
  intervalSec = 60,
  limit = 1000,
): Promise<Candle[]> {
  // 1) 체결 가져오기 (최신순)
  const fills = await market.loadFills(connection, limit);

  // 2) 버킷(캔들)별 임시 저장소
  type Bucket = {
    open?: number;
    close?: number;
    high: number;
    low: number;
    volume: number;
  };
  const buckets: Record<number, Bucket> = {};

  for (const f of fills) {
    const bucketTime = Math.floor(f.timestamp / intervalSec) * intervalSec;

    // 첫 등장 = open‧high‧low 초기화
    if (!buckets[bucketTime]) {
      buckets[bucketTime] = {
        open: f.price, // 맨 처음 본 체결이 open
        close: f.price, // 매번 덮어쓰므로 마지막이 close
        high: f.price,
        low: f.price,
        volume: 0,
      };
    }

    const b = buckets[bucketTime];
    b.close = f.price; // 최신 가격이 close
    b.high = Math.max(b.high, f.price);
    b.low = Math.min(b.low, f.price);
    b.volume += f.size; // 수량 합산
  }

  // 3) 시간순 정렬 → Candle[] 변환
  return Object.entries(buckets)
    .map(([t, b]) => ({
      time: Number(t),
      open: b.open!,
      high: b.high,
      low: b.low,
      close: b.close!,
      volume: b.volume,
    }))
    .sort((a, b) => a.time - b.time);
}
