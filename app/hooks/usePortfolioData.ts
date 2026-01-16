'use client';

import { useMemo } from 'react';
import { isBackendMode } from '@/lib/backend/api';
import {
  useTaptoolsPortfolio,
  useTaptoolsTradeHistory,
  type TaptoolsPortfolioResponse,
  type TaptoolsTradeHistoryResponse,
} from '@/lib/backend/taptoolsClient';
import { useBotHealth } from '@/app/hooks/useBotHealth';
import type { HoldingRow, TradeRow } from '@/app/hud/types';

// =============================================================================
// Types
// =============================================================================

export interface PortfolioDataState {
  holdings: HoldingRow[];
  recentTrades: TradeRow[];
  systemStatus: SystemStatusItem[];
  totalValue: number;
  isLoading: boolean;
  error: Error | null;
  stale: boolean;
}

export interface SystemStatusItem {
  label: string;
  status: string;
  tone: 'ok' | 'warn' | 'bad' | 'neutral';
  pulse: boolean;
}

// =============================================================================
// Mock Data (for demo mode)
// =============================================================================

const MOCK_HOLDINGS: HoldingRow[] = [
  { symbol: 'SOL', name: 'Solana', value: '$4,200', changePct: 5.2, color: '#7c3aed' },
  { symbol: 'ADA', name: 'Cardano', value: '$1,840', changePct: -1.4, color: '#2563eb' },
  { symbol: 'SNEK', name: 'Snek', value: '$920', changePct: 12.8, color: '#eab308' },
  { symbol: 'WIF', name: 'Dogwifhat', value: '$410', changePct: -3.2, color: '#7c2d12' },
  { symbol: 'BONK', name: 'Bonk', value: '$220', changePct: 8.4, color: '#ea580c' },
  { symbol: 'ETH', name: 'Ethereum', value: '$140', changePct: 1.1, color: '#4f46e5' },
  { symbol: 'USDC', name: 'USD Coin', value: '$50', changePct: 0.0, color: '#60a5fa' },
  { symbol: 'XRP', name: 'Ripple', value: '$45', changePct: -0.5, color: '#9ca3af' },
  { symbol: 'DOT', name: 'Polkadot', value: '$32', changePct: 2.3, color: '#db2777' },
];

const MOCK_TRADES: TradeRow[] = [
  { type: 'BUY', pair: 'SNEK/ADA', time: '2m' },
  { type: 'SELL', pair: 'SOL/USDC', time: '12m' },
  { type: 'BUY', pair: 'WIF/SOL', time: '45m' },
];

const MOCK_SYSTEM_STATUS: SystemStatusItem[] = [
  { label: 'Execution Engine', status: 'ONLINE', tone: 'ok', pulse: true },
  { label: 'Data Feeds', status: '12ms', tone: 'ok', pulse: false },
  { label: 'AI Logic Core', status: 'TRAINING', tone: 'warn', pulse: false },
];

// =============================================================================
// Color Map for Tokens
// =============================================================================

const TOKEN_COLORS: Record<string, string> = {
  ADA: '#2563eb',
  SOL: '#7c3aed',
  SNEK: '#eab308',
  WIF: '#7c2d12',
  BONK: '#ea580c',
  ETH: '#4f46e5',
  USDC: '#60a5fa',
  USDT: '#26a17b',
  BTC: '#f7931a',
  XRP: '#9ca3af',
  DOT: '#db2777',
  MATIC: '#8247e5',
  AVAX: '#e84142',
  LINK: '#2a5ada',
  UNI: '#ff007a',
};

function getTokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] || '#6b7280';
}

// =============================================================================
// Transformation Functions
// =============================================================================

function transformPortfolioToHoldings(
  portfolio: TaptoolsPortfolioResponse
): HoldingRow[] {
  return portfolio.positions.map((pos) => ({
    symbol: pos.ticker || pos.name.substring(0, 4).toUpperCase(),
    name: pos.name,
    value: `$${(pos.value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    changePct: pos.change24h || 0,
    color: getTokenColor(pos.ticker || pos.name),
  }));
}

function transformTradesToRows(
  trades: TaptoolsTradeHistoryResponse
): TradeRow[] {
  const now = Date.now();
  return trades.trades.slice(0, 10).map((trade) => {
    const tradeTime = new Date(trade.timestamp).getTime();
    const diff = now - tradeTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    let timeStr: string;
    if (days > 0) {
      timeStr = `${days}d`;
    } else if (hours > 0) {
      timeStr = `${hours}h`;
    } else if (minutes > 0) {
      timeStr = `${minutes}m`;
    } else {
      timeStr = '<1m';
    }

    return {
      type: trade.side.toUpperCase() as 'BUY' | 'SELL',
      pair: trade.pair,
      time: timeStr,
    };
  });
}

function transformHealthToSystemStatus(
  health: { items: Array<{ label: string; value: string; status: string }> } | null
): SystemStatusItem[] {
  if (!health?.items) return MOCK_SYSTEM_STATUS;

  return health.items.slice(0, 6).map((item) => ({
    label: item.label,
    status: item.value,
    tone: (item.status === 'ok' ? 'ok' : item.status === 'warn' || item.status === 'warning' ? 'warn' : 'bad') as 'ok' | 'warn' | 'bad' | 'neutral',
    pulse: item.label.toLowerCase().includes('status'),
  }));
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Hook for fetching portfolio data from TapTools with demo mode fallback
 *
 * In demo mode: returns mock data
 * In backend mode: fetches from TapTools API
 *
 * @param walletAddress - Wallet address to query portfolio for
 * @param botId - Bot ID for health status (optional)
 */
export function usePortfolioData(
  walletAddress?: string | null,
  botId?: string | null
): PortfolioDataState {
  // In demo mode, use mock data
  const inDemoMode = !isBackendMode();

  // TapTools hooks (only fetch if in backend mode)
  const portfolioState = useTaptoolsPortfolio(inDemoMode ? null : walletAddress);
  const tradesState = useTaptoolsTradeHistory(inDemoMode ? null : walletAddress);

  // Bot health hook (only fetch if in backend mode and have botId)
  const healthState = useBotHealth(inDemoMode || !botId ? '' : botId);

  // Compute derived data
  const result = useMemo<PortfolioDataState>(() => {
    if (inDemoMode) {
      // Demo mode: return mock data
      const totalValue = MOCK_HOLDINGS.reduce(
        (acc, h) => acc + parseFloat(h.value.replace(/[$,]/g, '')),
        0
      );

      return {
        holdings: MOCK_HOLDINGS,
        recentTrades: MOCK_TRADES,
        systemStatus: MOCK_SYSTEM_STATUS,
        totalValue,
        isLoading: false,
        error: null,
        stale: false,
      };
    }

    // Backend mode: use TapTools data
    const holdings = portfolioState.data
      ? transformPortfolioToHoldings(portfolioState.data)
      : MOCK_HOLDINGS;

    const recentTrades = tradesState.data
      ? transformTradesToRows(tradesState.data)
      : MOCK_TRADES;

    const systemStatus = healthState.health
      ? transformHealthToSystemStatus(healthState.health)
      : MOCK_SYSTEM_STATUS;

    const totalValue = portfolioState.data?.totalValue
      || holdings.reduce((acc, h) => acc + parseFloat(h.value.replace(/[$,]/g, '')), 0);

    const isLoading = portfolioState.loading || tradesState.loading || healthState.isLoading;
    const error = portfolioState.error || tradesState.error || healthState.error;
    const stale = portfolioState.stale || tradesState.stale;

    return {
      holdings,
      recentTrades,
      systemStatus,
      totalValue,
      isLoading,
      error: error || null,
      stale,
    };
  }, [
    inDemoMode,
    portfolioState.data,
    portfolioState.loading,
    portfolioState.error,
    portfolioState.stale,
    tradesState.data,
    tradesState.loading,
    tradesState.error,
    tradesState.stale,
    healthState.health,
    healthState.isLoading,
    healthState.error,
  ]);

  return result;
}

// =============================================================================
// Allocation Helpers
// =============================================================================

export function useAllocationStats(holdings: HoldingRow[], totalValue: number) {
  return useMemo(() => {
    if (totalValue === 0) {
      return { solPct: 0, adaPct: 0, otherPct: 100 };
    }

    const solVal = parseFloat(
      holdings.find((h) => h.symbol === 'SOL')?.value.replace(/[$,]/g, '') || '0'
    );
    const adaVal = parseFloat(
      holdings.find((h) => h.symbol === 'ADA')?.value.replace(/[$,]/g, '') || '0'
    );

    const sPct = Math.round((solVal / totalValue) * 100);
    const aPct = Math.round((adaVal / totalValue) * 100);
    const oPct = 100 - sPct - aPct;

    return { solPct: sPct, adaPct: aPct, otherPct: oPct };
  }, [holdings, totalValue]);
}
