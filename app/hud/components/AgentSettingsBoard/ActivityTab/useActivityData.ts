'use client';

/**
 * useActivityData Hook
 * Self-contained data fetching for activity logs and transactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ActivityLogEntry,
  TransactionEntry,
  ActivityLevel,
  UseActivityDataOptions,
  UseActivityDataReturn,
} from './types';

const DEFAULT_REFRESH_INTERVAL = 10000; // 10 seconds
const DEFAULT_LOG_LINES = 100;

/**
 * Parse a raw log string into a structured ActivityLogEntry
 * Expected format: "[TIMESTAMP] [LEVEL] message"
 * e.g., "[2026-01-14T16:00:00.000Z] [TRADE] Bought 100 ADA at $0.45"
 */
function parseLogString(logString: string, index: number): ActivityLogEntry | null {
  try {
    // Try to match timestamp pattern [ISO_DATE]
    const timestampMatch = logString.match(/^\[([^\]]+)\]/);
    let timestamp = Date.now();
    let remainder = logString;

    if (timestampMatch) {
      const parsedDate = new Date(timestampMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        timestamp = parsedDate.getTime();
      }
      remainder = logString.slice(timestampMatch[0].length).trim();
    }

    // Try to match level pattern [LEVEL]
    const levelMatch = remainder.match(/^\[([^\]]+)\]/);
    let level: ActivityLevel = 'info';
    let message = remainder;

    if (levelMatch) {
      const levelStr = levelMatch[1].toUpperCase();
      message = remainder.slice(levelMatch[0].length).trim();

      // Map various level strings to our ActivityLevel type
      if (levelStr === 'TRADE' || levelStr === 'SUCCESS' || levelStr.includes('BUY') || levelStr.includes('SELL')) {
        level = 'trade';
      } else if (levelStr === 'DECISION' || levelStr === 'ANALYZE') {
        level = 'decision';
      } else if (levelStr === 'ERROR' || levelStr === 'ERR' || levelStr === 'CRITICAL') {
        level = 'error';
      } else if (levelStr === 'WARN' || levelStr === 'WARNING') {
        level = 'warning';
      } else if (levelStr === 'INFO' || levelStr === 'GENERAL' || levelStr === 'STATUS') {
        level = 'info';
      } else if (levelStr === 'SUCCESS' || levelStr === 'OK') {
        level = 'success';
      }
    }

    // Try to extract trading pair from message (e.g., "ADA/USD", "BTC/USDT")
    const pairMatch = message.match(/\b([A-Z]{2,6}\/[A-Z]{2,6})\b/);
    const pair = pairMatch ? pairMatch[1] : undefined;

    return {
      id: `log-${timestamp}-${index}`,
      timestamp,
      message,
      level,
      pair,
    };
  } catch {
    // If parsing fails, return a basic entry
    return {
      id: `log-${Date.now()}-${index}`,
      timestamp: Date.now(),
      message: logString,
      level: 'info',
    };
  }
}

/**
 * Parse raw logs array into ActivityLogEntry array
 */
function parseLogs(rawLogs: string[]): ActivityLogEntry[] {
  return rawLogs
    .map((log, index) => parseLogString(log, index))
    .filter((entry): entry is ActivityLogEntry => entry !== null)
    .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
}

/**
 * Custom hook for fetching and managing activity data
 */
export function useActivityData({
  agentId,
  walletAddress,
  autoRefresh = true,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
}: UseActivityDataOptions): UseActivityDataReturn {
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [transactions, setTransactions] = useState<TransactionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch activity logs from the API
   */
  const fetchLogs = useCallback(async () => {
    if (!agentId) return;

    try {
      const response = await fetch(
        `/api/bot/user/${agentId}/logs?lines=${DEFAULT_LOG_LINES}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`);
      }

      const data = await response.json();
      const rawLogs: string[] = data.logs || [];
      const parsedLogs = parseLogs(rawLogs);

      setActivityLogs(parsedLogs);
      setError(null);
    } catch (err) {
      console.error('[useActivityData] Error fetching logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch activity logs'));
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  /**
   * Fetch transactions from the API
   * Note: This endpoint may need to be adjusted based on your API structure
   */
  const fetchTransactions = useCallback(async () => {
    if (!walletAddress) {
      setIsLoadingTransactions(false);
      return;
    }

    try {
      // Try to fetch from perpetuals history endpoint
      const response = await fetch(
        `/api/strike/perpetuals/history?address=${walletAddress}`
      );

      if (!response.ok) {
        // If endpoint doesn't exist, just set empty transactions
        setTransactions([]);
        return;
      }

      const data = await response.json();
      const rawTransactions = data.transactions || [];

      // Map the API response to our TransactionEntry format
      const mappedTransactions: TransactionEntry[] = rawTransactions.map(
        (tx: Record<string, unknown>, index: number) => ({
          id: (tx.txHash as string) || `tx-${index}`,
          txHash: (tx.txHash as string) || '',
          timestamp: (tx.time as number) || Date.now(),
          action: (tx.action as string) || 'Unknown',
          pair: (tx.pair as string) || 'UNKNOWN/USD',
          positionType: ((tx.positionType as string) || 'Long') as 'Long' | 'Short',
          entryPrice: (tx.enteredPrice as number) || 0,
          positionSize: (tx.positionSize as number) || 0,
          leverage: tx.leverage as number | undefined,
          pnl: (tx.pnl as number) || 0,
          status: ((tx.status as string) || 'confirmed') as 'pending' | 'confirmed' | 'failed',
        })
      );

      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('[useActivityData] Error fetching transactions:', err);
      // Don't set error for transactions - just leave empty
      setTransactions([]);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [walletAddress]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  /**
   * Manual refresh transactions
   */
  const refreshTransactions = useCallback(() => {
    setIsLoadingTransactions(true);
    fetchTransactions();
  }, [fetchTransactions]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
    fetchTransactions();
  }, [fetchLogs, fetchTransactions]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchLogs();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, fetchLogs]);

  return {
    activityLogs,
    transactions,
    isLoading,
    isLoadingTransactions,
    error,
    refresh,
    refreshTransactions,
  };
}
