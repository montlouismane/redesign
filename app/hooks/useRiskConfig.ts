'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RiskConfig } from '@/app/features/agents/types';
import { apiCallJson, isBackendMode, withUserAddress } from '@/lib/backend/api';
import { validateRiskConfig } from '@/lib/validation/riskConfig';

// =============================================================================
// Types
// =============================================================================

export interface RiskConfigState {
  config: RiskConfig | null;
  isLoading: boolean;
  error: Error | null;
  updateConfig: (updates: Partial<RiskConfig>) => Promise<void>;
  refetch: () => Promise<void>;
}

// =============================================================================
// Default Mock Risk Config
// =============================================================================

const DEFAULT_RISK_CONFIG: RiskConfig = {
  edgeAfterCost: {
    enabled: true,
    minNetEdgePct: 0.5,
    logSkipped: true,
  },
  liquidityGuard: {
    enabled: true,
    maxImpactPct: 2.0,
    autoDownsize: true,
    skipIlliquid: true,
  },
  cooldowns: {
    perAssetEnabled: true,
    winCooldownMinutes: 30,
    lossCooldownMinutes: 60,
    scratchCooldownMinutes: 15,
  },
  portfolioRisk: {
    maxOpenPositions: 10,
    maxSinglePositionPct: 25,
    maxDailyLossPct: 5,
  },
  dryRun: {
    enabled: false,
    logToDatabase: true,
    virtualBalances: {
      cardano: {
        ADA: 10000,
      },
    },
  },
};

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for managing bot risk configuration
 *
 * In demo mode: returns default config with local state management
 * In backend mode: fetches from /api/risk/config/:botId and updates via PATCH
 *
 * @param botId - Bot identifier
 */
export function useRiskConfig(botId: string): RiskConfigState {
  const [config, setConfig] = useState<RiskConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch risk configuration
  const fetchConfig = useCallback(async () => {
    // Demo mode: return default config
    if (!isBackendMode()) {
      setConfig(DEFAULT_RISK_CONFIG);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Backend mode: fetch from API
    if (!botId) {
      setConfig(null);
      setIsLoading(false);
      setError(new Error('Bot ID is required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiCallJson<RiskConfig>(`/api/risk/config/${botId}`, {
        headers: withUserAddress({}, botId),
      });
      setConfig(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch risk config');
      setError(error);
      setConfig(null);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useRiskConfig] Error fetching config:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [botId]);

  // Update risk configuration
  const updateConfig = useCallback(async (updates: Partial<RiskConfig>) => {
    if (!config) {
      throw new Error('No config loaded');
    }

    // Validate updates before applying
    const validationErrors = validateRiskConfig(updates);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
    }

    const updatedConfig: RiskConfig = {
      ...config,
      ...updates,
    };

    // Demo mode: just update local state
    if (!isBackendMode()) {
      setConfig(updatedConfig);
      return;
    }

    // Backend mode: send PATCH request
    if (!botId) {
      throw new Error('Bot ID is required');
    }

    try {
      const data = await apiCallJson<RiskConfig>(`/api/risk/config/${botId}`, {
        method: 'PATCH',
        headers: withUserAddress({}, botId),
        body: JSON.stringify(updates),
      });

      setConfig(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update risk config');

      if (process.env.NODE_ENV === 'development') {
        console.error('[useRiskConfig] Error updating config:', error);
      }

      throw error;
    }
  }, [botId, config]);

  // Initial fetch
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    refetch: fetchConfig,
  };
}
