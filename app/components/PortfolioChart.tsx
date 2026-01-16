'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { PortfolioRange, PortfolioSeriesPoint } from '../hooks/useEquitySeries';
import styles from '../HudDashboard.module.css';

import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  UTCTimestamp,
  createChart,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';

interface PortfolioChartProps {
  series: PortfolioSeriesPoint[];
  range: PortfolioRange;
  formatMoney: (x: number) => string;
  className?: string;
  height?: number;
  theme?: 'dark' | 'light';
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({
  series,
  range,
  formatMoney,
  className = '',
  height = 420,
  theme = 'dark',
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const [chartReady, setChartReady] = useState(false);

  const chartData = useMemo(
    () =>
      (series ?? []).map((point) => ({
        time: point.time as UTCTimestamp,
        value: point.value,
      })),
    [series]
  );

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    // StrictMode/dev safety: ensure we don't leave a previous chart mounted
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      areaSeriesRef.current = null;
    }

    setChartReady(false);

    let raf = requestAnimationFrame(() => {
      // If the container isn't sized yet, try once more next frame.
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) {
        raf = requestAnimationFrame(() => {
          const ww = container.clientWidth;
          const hh = container.clientHeight;
          if (!ww || !hh) return;
          init(ww, hh);
        });
        return;
      }
      init(w, h);
    });

    function init(width: number, heightPx: number) {
      if (!container) return;
      const isLight = theme === 'light';

      const chart = createChart(container, {
        autoSize: true,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: isLight ? 'rgba(107, 114, 128, 0.7)' : 'rgba(232, 232, 238, 0.55)',
          fontFamily: isLight ? 'system-ui, -apple-system' : 'Orbitron, system-ui',
          fontSize: isLight ? 10 : 11,
        },
        grid: {
          vertLines: { 
            color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)', 
            visible: false 
          },
          horzLines: { 
            color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)' 
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { 
            color: isLight ? 'rgba(196, 124, 72, 0.3)' : 'rgba(255, 178, 74, 0.4)', 
            width: 1, 
            style: 0 
          },
          horzLine: { 
            color: isLight ? 'rgba(196, 124, 72, 0.3)' : 'rgba(255, 178, 74, 0.4)', 
            width: 1, 
            style: 0 
          },
        },
        rightPriceScale: {
          borderColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
          visible: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
          visible: true,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: isLight ? 8 : 12,
          barSpacing: isLight ? 4 : 6,
        },
        // Fallback sizes if ResizeObserver fails
        width,
        height: heightPx,
      });

      // v5 API: addSeries(AreaSeries), not addAreaSeries()
      // Classic theme uses copper color (#c47c48), HUD uses brighter copper
      const lineColor = isLight ? 'rgba(196, 124, 72, 0.95)' : 'rgba(255, 178, 74, 0.95)';
      const fillColor = isLight ? 'rgba(196, 124, 72, 0.15)' : 'rgba(255, 178, 74, 0.12)';
      
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor,
        topColor: fillColor,
        bottomColor: 'rgba(0, 0, 0, 0)',
        lineWidth: isLight ? 3 : 2,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: isLight ? 3 : 4,
        crosshairMarkerBorderColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.55)',
        crosshairMarkerBackgroundColor: lineColor,
      });

      chartRef.current = chart;
      areaSeriesRef.current = areaSeries;
      setChartReady(true);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      areaSeriesRef.current = null;
    };
  }, [series, range, formatMoney, theme]);

  // Update chart data when series changes
  useEffect(() => {
    if (!chartReady) return;
    if (!areaSeriesRef.current) return;
    areaSeriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [chartReady, chartData]);

  // Update price formatter when formatMoney changes
  useEffect(() => {
    if (!areaSeriesRef.current) return;

    areaSeriesRef.current.applyOptions({
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatMoney(price),
      },
    });
  }, [formatMoney]);

  // Format time labels based on range
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.timeScale().applyOptions({
      timeVisible: true,
      // Note: tickMarkFormatter was removed in newer lightweight-charts versions
      // Time formatting is now handled automatically based on the time scale
    });
  }, [range]);

  const overlayText = !chartReady ? 'LOADING CHART…' : series?.length ? null : 'NO DATA';
  const isLight = theme === 'light';

  // Only apply HUD styles if not using classic theme
  const chartWrapClass = isLight ? className : `${className} ${styles.chartWrap}`;
  
  return (
    <div className={chartWrapClass} style={{ height }}>
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        aria-label="Portfolio performance chart"
      />
      {overlayText ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div 
            className={`text-sm font-semibold ${isLight ? 'text-gray-400' : 'text-white/35'}`}
          >
            {overlayText}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PortfolioChart;
