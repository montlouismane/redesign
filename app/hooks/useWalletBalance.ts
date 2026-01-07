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
  refetch: () => Promise<void>;
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
    // Add more tokens as needed
  },
};

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for fetching wallet balance from indexer
 *
 * In demo mode: returns mock balance data
 * In backend mode: fetches from /api/indexer/balance?address={walletAddress}
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

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    // Demo mode: return mock data
    if (!isBackendMode()) {
      setBalance(MOCK_BALANCE);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Backend mode: validate address
    if (!walletAddress) {
      setBalance(null);
      setIsLoading(false);
      setError(new Error('Wallet address is required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ address: walletAddress });
      const data = await apiCallJson<WalletBalanceResponse>(
        `/api/indexer/balance?${params.toString()}`,
        {
          headers: withUserAddress({}, walletAddress),
        }
      );

      setBalance(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch wallet balance');
      setError(error);
      setBalance(null);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useWalletBalance] Error fetching balance:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

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

  const balance = walletBalance?.tokens[tokenUnit] || '0';

  return { balance, isLoading, error };
}
