import React, { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries, // ⬅️ 방법 1: 미리 정의된 상수
  UTCTimestamp,
  CandlestickData,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';

export type Candle = CandlestickData<UTCTimestamp>;

export default function LWCandleChart({
  candles,
  height = 400,
}: {
  candles: Candle[];
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>();

  useEffect(() => {
    if (!wrapRef.current) return;

    chartRef.current = createChart(wrapRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#e0e0e0',
      },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      timeScale: { borderColor: '#333' },
      rightPriceScale: { borderColor: '#333' },
    });

    // ⬇️ ① 시리즈 생성 (두 방법 중 택1)
    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderVisible: false,
    });

    seriesRef.current.setData(candles);
    return () => chartRef.current?.remove();
  }, []);

  // ⬇️ ② 데이터 갱신
  useEffect(() => {
    seriesRef.current?.setData(candles);
  }, [candles]);

  // ⬇️ ③ 높이 prop 반영(선택)
  useEffect(() => {
    chartRef.current?.applyOptions({ height });
  }, [height]);

  return <div ref={wrapRef} style={{ width: '100%', height }} />;
}
