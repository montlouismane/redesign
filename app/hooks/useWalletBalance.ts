'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WalletBalanceResponse } from '@/app/features/agents/types';
import { apiCallJson, isBackendMode, withUserAddress } from '@/lib/backend/api';

// =============================================================================
// Types
// =============================================================================

export interface WalletBalanceState {
  balance: WalletBalanceResponse | null;
  isLoading: boolean;
  error: Error | null;
  stale: boolean;
  refetch: () => Promise<void>;
}

type CacheEntry = {
  promise?: Promise<WalletBalanceResponse>;
  data?: WalletBalanceResponse;
  error?: Error;
  fetchedAt: number;
};

// =============================================================================
// Cache Configuration
// =============================================================================

const balanceCache = new Map<string, CacheEntry>();
const BALANCE_CACHE_TTL_MS = Number(process.env.NEXT_PUBLIC_BALANCE_CACHE_TTL_MS || 30000);
const ERROR_COOLDOWN_MS = 5000;

// =============================================================================
// Telemetry
// =============================================================================

function recordBalanceTelemetry(event: string) {
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    const metrics = (w.__talosBalanceMetrics as Record<string, number>) || { hits: 0 };
    metrics[event] = (metrics[event] || 0) + 1;
    metrics.hits += 1;
    w.__talosBalanceMetrics = metrics;
  } else if (process.env.NODE_ENV === 'development') {
    console.debug(`[BalanceMetrics] ${event}`);
  }
}

// =============================================================================
// Cache Helper
// =============================================================================

function buildCacheKey(address: string): string {
  return `addr:${address}`;
}

async function fetchCachedBalance(walletAddress: string): Promise<WalletBalanceResponse> {
  const key = buildCacheKey(walletAddress);
  const now = Date.now();
  const cached = balanceCache.get(key);

  if (cached) {
    // Return in-flight promise if one exists
    if (cached.promise) {
      recordBalanceTelemetry('inflightReuse');
      return cached.promise;
    }

    const age = now - cached.fetchedAt;

    // Return cached data if still fresh
    if (cached.data && age < BALANCE_CACHE_TTL_MS) {
      recordBalanceTelemetry('cacheHit');
      return cached.data;
    }

    // If in error cooldown, re-throw
    if (cached.error && age < ERROR_COOLDOWN_MS) {
      recordBalanceTelemetry('errorCooldown');
      throw cached.error;
    }
  }

  // Make network request
  const params = new URLSearchParams({ address: walletAddress });
  const promise = apiCallJson<WalletBalanceResponse>(
    `/api/indexer/balance?${params.toString()}`,
    {
      headers: withUserAddress({}, walletAddress),
    }
  )
    .then((data) => {
      balanceCache.set(key, { data, fetchedAt: Date.now() });
      recordBalanceTelemetry('networkFetch');
      return data;
    })
    .catch((err) => {
      const error = err instanceof Error ? err : new Error('balance_fetch_failed');
      balanceCache.set(key, { error, fetchedAt: Date.now() });
      recordBalanceTelemetry('networkError');
      throw error;
    });

  balanceCache.set(key, { promise, fetchedAt: now });
  return promise;
}

export function clearBalanceCache() {
  balanceCache.clear();
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_BALANCE: WalletBalanceResponse = {
  lovelace: '15234567890', // ~15,234 ADA
  tokens: {
    // Example Cardano native tokens
    '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '1000000',
    'f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc53541474958': '5000',
  },
};

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for fetching wallet balance from indexer with caching
 *
 * In demo mode: returns mock balance data
 * In backend mode: fetches from /api/indexer/balance with TTL caching
 *
 * Features:
 * - TTL-based cache (30s default)
 * - In-flight request deduplication
 * - Error cooldown to prevent hammering
 *
 * @param walletAddress - Wallet address to query
 * @param pollInterval - Optional polling interval in ms (default: no polling)
 */
export function useWalletBalance(
  walletAddress: string,
  pollInterval?: number
): WalletBalanceState {
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stale, setStale] = useState(false);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    // Demo mode: return mock data
    if (!isBackendMode()) {
      setBalance(MOCK_BALANCE);
      setIsLoading(false);
      setError(null);
      setStale(false);
      return;
    }

    // Backend mode: validate address
    if (!walletAddress) {
      setBalance(null);
      setIsLoading(false);
      setError(new Error('Wallet address is required'));
      setStale(false);
      return;
    }

    // Check cache first for immediate display
    const key = buildCacheKey(walletAddress);
    const cached = balanceCache.get(key);
    if (cached?.data) {
      const age = Date.now() - cached.fetchedAt;
      setBalance(cached.data);
      setStale(age >= BALANCE_CACHE_TTL_MS);
      setIsLoading(!cached.data);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchCachedBalance(walletAddress);
      setBalance(data);
      setStale(false);
    } catch (err) {
      const fetchError = err instanceof Error ? err : new Error('Failed to fetch wallet balance');
      setError(fetchError);
      // Keep previous balance data on error if available
      if (!balance) {
        setBalance(null);
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('[useWalletBalance] Error fetching balance:', fetchError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, balance]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  // Polling (if enabled)
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchBalance();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    stale,
    refetch: fetchBalance,
  };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Get ADA balance in human-readable format
 */
export function useAdaBalance(walletAddress: string): {
  ada: number;
  isLoading: boolean;
  error: Error | null;
} {
  const { balance, isLoading, error } = useWalletBalance(walletAddress);

  const ada = balance
    ? parseFloat(balance.lovelace) / 1_000_000
    : 0;

  return { ada, isLoading, error };
}

/**
 * Get token balance for a specific token unit
 */
export function useTokenBalance(
  walletAddress: string,
  tokenUnit: string
): {
  balance: string;
  isLoading: boolean;
  error: Error | null;
} {
  const { balance: walletBalance, isLoading, error } = useWalletBalance(walletAddress);

  const tokenBalance = walletBalance?.tokens[tokenUnit] || '0';

  return { balance: tokenBalance, isLoading, error };
}
