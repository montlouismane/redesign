'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiCallJson, isBackendMode } from '@/lib/backend/api';
import { useWalletAddress } from '../contexts/WalletContext';

export type PortfolioRange = '1H' | '24H' | '7D' | '30D' | 'ALL';

export type PortfolioSeriesPoint = { time: number; value: number };

export type EquitySummary = {
  endValue: number;
  changePct: number;
};

export type EquitySeriesState = {
  points: PortfolioSeriesPoint[];
  summary: EquitySummary;
  isLive: boolean;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Generate demo equity series data (fallback when backend is unavailable or in demo mode)
 */
function generateDemoSeries(range: PortfolioRange): PortfolioSeriesPoint[] {
  const now = Math.floor(Date.now() / 1000);
  const dur =
    range === '1H'
      ? 60 * 60
      : range === '24H'
        ? 60 * 60 * 24
        : range === '7D'
          ? 60 * 60 * 24 * 7
          : range === '30D'
            ? 60 * 60 * 24 * 30
            : 60 * 60 * 24 * 120;

  const n = range === '1H' ? 50 : range === '24H' ? 72 : range === '7D' ? 90 : range === '30D' ? 110 : 140;
  const base = 12403.92;
  const pts: PortfolioSeriesPoint[] = [];
  
  for (let i = 0; i < n; i++) {
    const t = n <= 1 ? 0 : i / (n - 1);
    const time = Math.floor(now - (1 - t) * dur);
    const wave = Math.sin(i * 0.22) * 120 + Math.sin(i * 0.07) * 180;
    const trend = t * 680;
    const value = base + wave + trend;
    pts.push({ time, value });
  }
  
  return pts;
}

/**
 * Calculate summary from equity points
 */
function calculateSummary(points: PortfolioSeriesPoint[]): EquitySummary {
  if (points.length === 0) {
    return { endValue: 0, changePct: 0 };
  }
  
  const sorted = [...points].sort((a, b) => a.time - b.time);
  const first = sorted[0]!.value;
  const last = sorted[sorted.length - 1]!.value;
  const changePct = first === 0 ? 0 : ((last - first) / first) * 100;
  
  return { endValue: last, changePct };
}

/**
 * Hook to fetch equity series data.
 * 
 * In demo mode: generates synthetic data
 * In backend mode: fetches from /api/portfolio/equity (Next.js route) or backend proxy
 * 
 * @param range - Time range for the equity curve
 * @param address - Optional stake address override (defaults to wallet context)
 */
export function useEquitySeries(
  range: PortfolioRange,
  address?: string | null
): EquitySeriesState {
  const contextWalletAddress = useWalletAddress();
  const effectiveAddress = address ?? contextWalletAddress;
  
  const [state, setState] = useState<EquitySeriesState>({
    points: [],
    summary: { endValue: 0, changePct: 0 },
    isLive: false,
    isLoading: true,
    error: null,
  });

  const fetchEquity = useCallback(async () => {
    const controller = new AbortController();
    
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    // Demo mode: generate synthetic data
    if (!isBackendMode()) {
      const demoPoints = generateDemoSeries(range);
      const demoSummary = calculateSummary(demoPoints);
      
      setState({
        points: demoPoints,
        summary: demoSummary,
        isLive: false,
        isLoading: false,
        error: null,
      });
      return () => controller.abort();
    }

    // Backend mode: fetch from API
    const stakeAddress = effectiveAddress || process.env.NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS;
    
    if (!stakeAddress) {
      // No address provided, use demo data
      const demoPoints = generateDemoSeries(range);
      const demoSummary = calculateSummary(demoPoints);
      
      setState({
        points: demoPoints,
        summary: demoSummary,
        isLive: false,
        isLoading: false,
        error: null,
      });
      return () => controller.abort();
    }

    try {
      const params = new URLSearchParams({
        address: stakeAddress,
        range,
        quote: 'USD',
      });

      // Use the preserved Next.js route for now (can switch to backend proxy later)
      const data = await apiCallJson<{
        points?: PortfolioSeriesPoint[];
        summary?: { endValue?: number; changePct?: number };
      }>(`/api/portfolio/equity?${params.toString()}`, {
        signal: controller.signal,
      });

      const series = (data.points ?? []).slice().sort((a, b) => a.time - b.time);
      
      if (series.length === 0) {
        throw new Error('No series points returned');
      }

      const summary: EquitySummary = data.summary
        ? {
            endValue: data.summary.endValue ?? series[series.length - 1]!.value,
            changePct: data.summary.changePct ?? calculateSummary(series).changePct,
          }
        : calculateSummary(series);

      setState({
        points: series,
        summary,
        isLive: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return () => controller.abort();
      }

      // Fallback to demo data on error
      const demoPoints = generateDemoSeries(range);
      const demoSummary = calculateSummary(demoPoints);
      
      setState({
        points: demoPoints,
        summary: demoSummary,
        isLive: false,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      });
    }

    return () => controller.abort();
  }, [range, effectiveAddress]);

  useEffect(() => {
    const cleanup = fetchEquity();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [fetchEquity]);

  return state;
}

