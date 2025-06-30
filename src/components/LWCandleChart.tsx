import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export interface Candle {
  time: number; // epoch seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  candles: Candle[];
  height?: number;
}

export default function LWCandleChart({ candles, height = 400 }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ReturnType<typeof createChart>>();

  // create + destroy
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = createChart(chartRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#e0e0e0',
      },
      grid: { horzLines: { visible: false }, vertLines: { visible: false } },
      timeScale: { borderColor: '#333' },
      rightPriceScale: { borderColor: '#333' },
    });
    const series = chartInstance.current.addCandlestickSeries();
    series.setData(candles);

    return () => chartInstance.current?.remove();
  }, []); // 최초 한 번

  // 데이터 갱신
  useEffect(() => {
    const series = chartInstance.current?.serieses()[0]; // 첫 번째 시리즈
    if (series) series.setData(candles);
  }, [candles]);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
}
