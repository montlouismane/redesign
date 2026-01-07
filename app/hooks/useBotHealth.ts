'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BotHealthResponse, BotHealthItem, AgentStatus } from '@/app/features/agents/types';
import { apiCallJson, isBackendMode, withUserAddress } from '@/lib/backend/api';

// =============================================================================
// Types
// =============================================================================

export interface BotHealthState {
  health: BotHealthResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// Mock Data
// =============================================================================

const MOCK_HEALTH_ITEMS: BotHealthItem[] = [
  {
    label: 'Bot Status',
    value: 'RUNNING',
    status: 'ok',
    timestamp: new Date().toISOString(),
  },
  {
    label: 'Last Trade',
    value: '2m ago',
    status: 'ok',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    label: 'API Connection',
    value: 'Connected',
    status: 'ok',
  },
  {
    label: 'Wallet Balance',
    value: '15,234 ADA',
    status: 'ok',
  },
  {
    label: 'Open Positions',
    value: '3 / 10',
    status: 'ok',
  },
  {
    label: 'Daily P&L',
    value: '+$234.56',
    status: 'ok',
  },
  {
    label: 'Error Count',
    value: '0 errors',
    status: 'ok',
  },
  {
    label: 'Uptime',
    value: '12h 34m',
    status: 'ok',
  },
];

function getMockHealth(botId: string): BotHealthResponse {
  return {
    botId,
    status: 'running',
    items: MOCK_HEALTH_ITEMS,
    lastCheck: new Date().toISOString(),
  };
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for fetching bot health status with polling
 *
 * In demo mode: returns mock health data
 * In backend mode: fetches from /api/bot/health and polls at specified interval
 *
 * @param botId - Bot identifier
 * @param pollInterval - Polling interval in milliseconds (default: 15000 = 15 seconds)
 */
export function useBotHealth(
  botId: string,
  pollInterval: number = 15000
): BotHealthState {
  const [health, setHealth] = useState<BotHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch bot health
  const fetchHealth = useCallback(async () => {
    // Demo mode: return mock data
    if (!isBackendMode()) {
      setHealth(getMockHealth(botId));
      setIsLoading(false);
      setError(null);
      return;
    }

    // Backend mode: validate bot ID
    if (!botId) {
      setHealth(null);
      setIsLoading(false);
      setError(new Error('Bot ID is required'));
      return;
    }

    // Only show loading on initial fetch, not on polls
    if (!health) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({ botId });
      const data = await apiCallJson<BotHealthResponse>(
        `/api/bot/health?${params.toString()}`,
        {
          headers: withUserAddress({}, botId),
        }
      );

      setHealth(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch bot health');
      setError(error);

      // Keep previous health data on error if available
      if (!health) {
        setHealth(null);
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('[useBotHealth] Error fetching health:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [botId, health]);

  // Initial fetch
  useEffect(() => {
    fetchHealth();
  }, [botId]); // Only depend on botId to avoid infinite loop

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchHealth();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [pollInterval, fetchHealth]);

  return {
    health,
    isLoading,
    error,
    refetch: fetchHealth,
  };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Get simplified bot status from health check
 */
export function useBotStatus(botId: string, pollInterval?: number): {
  status: AgentStatus | null;
  isHealthy: boolean;
  isLoading: boolean;
  error: Error | null;
} {
  const { health, isLoading, error } = useBotHealth(botId, pollInterval);

  const status = health?.status || null;
  const isHealthy = status === 'running' && !error;

  return { status, isHealthy, isLoading, error };
}

/**
 * Get specific health metric
 */
export function useHealthMetric(
  botId: string,
  metricLabel: string,
  pollInterval?: number
): {
  metric: BotHealthItem | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { health, isLoading, error } = useBotHealth(botId, pollInterval);

  const metric = health?.items.find((item) => item.label === metricLabel) || null;

  return { metric, isLoading, error };
}
