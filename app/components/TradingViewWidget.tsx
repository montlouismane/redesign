'use client';

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string | number;
  height?: string | number;
  interval?: string;
  hideTopToolbar?: boolean;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
  saveImage?: boolean;
  studies?: string[];
  className?: string;
}

/**
 * TradingView Advanced Chart Widget
 *
 * Displays live market data from TradingView exchanges.
 * Use this for market context (BTC, ETH prices), NOT for portfolio data.
 *
 * For portfolio/agent P&L data, use PortfolioChart with Lightweight Charts.
 */
function TradingViewWidgetComponent({
  symbol = 'BINANCE:ADAUSDT',
  theme = 'dark',
  width = '100%',
  height = 400,
  interval = 'D',
  hideTopToolbar = false,
  hideSideToolbar = true,
  allowSymbolChange = true,
  saveImage = false,
  studies = [],
  className = '',
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous widget
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    containerRef.current.innerHTML = '';

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = typeof width === 'number' ? `${width}px` : width;
    widgetContainer.style.height = typeof height === 'number' ? `${height}px` : height;

    const innerContainer = document.createElement('div');
    innerContainer.className = 'tradingview-widget-container__widget';
    innerContainer.style.width = '100%';
    innerContainer.style.height = '100%';
    widgetContainer.appendChild(innerContainer);

    containerRef.current.appendChild(widgetContainer);

    // Create and inject script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style: '1', // Candlestick
      locale: 'en',
      withdateranges: true,
      hide_top_toolbar: hideTopToolbar,
      hide_side_toolbar: hideSideToolbar,
      allow_symbol_change: allowSymbolChange,
      save_image: saveImage,
      calendar: false,
      studies: studies.length > 0 ? studies : ['RSI@tv-basicstudies'],
      support_host: 'https://www.tradingview.com',
    });

    widgetContainer.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
        scriptRef.current = null;
      }
    };
  }, [symbol, theme, width, height, interval, hideTopToolbar, hideSideToolbar, allowSymbolChange, saveImage, studies]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);

// Common crypto symbols for quick access
export const CRYPTO_SYMBOLS = {
  ADA: 'BINANCE:ADAUSDT',
  SOL: 'BINANCE:SOLUSDT',
  ETH: 'BINANCE:ETHUSDT',
  BTC: 'BINANCE:BTCUSDT',
  AGIX: 'BINANCE:AGIXUSDT',
} as const;
