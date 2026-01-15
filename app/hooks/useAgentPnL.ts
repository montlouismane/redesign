'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiCallJson, isBackendMode, withUserAddress } from '@/lib/backend/api';

// Types for agent P&L data
export interface AgentPnLData {
  id: string;
  name: string;
  pnl24h: number;
  pnl7d: number;
  pnlTotal: number;
  trades24h: number;
  winRate: number;
  lastUpdated: string;
}

export interface CombinedPnLData {
  pnl24h: number;
  pnl7d: number;
  pnlTotal: number;
  trades24h: number;
  winRate: number;
  agentCount: number;
}

export interface UseAgentPnLOptions {
  walletAddress?: string;
  selectedAgentIds?: string[];
  range?: '1H' | '24H' | '7D' | '30D' | 'ALL';
}

export interface UseAgentPnLReturn {
  // Individual agent P&L
  agentsPnL: AgentPnLData[];
  // Combined P&L for selected agents
  combinedPnL: CombinedPnLData;
  // Loading state
  isLoading: boolean;
  // Error state
  error: string | null;
  // Actions
  selectAgent: (agentId: string) => void;
  deselectAgent: (agentId: string) => void;
  selectAllAgents: () => void;
  clearSelection: () => void;
  // Currently selected agent IDs
  selectedIds: string[];
  // Refetch data
  refetch: () => Promise<void>;
}

// Mock data for development - replace with real API when backend is connected
const MOCK_AGENTS_PNL: AgentPnLData[] = [
  {
    id: 'agent-t',
    name: 'Agent T',
    pnl24h: 127.45,
    pnl7d: 543.21,
    pnlTotal: 2341.87,
    trades24h: 12,
    winRate: 68,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'agent-alpha',
    name: 'Alpha Fund',
    pnl24h: 45.32,
    pnl7d: 234.56,
    pnlTotal: 1567.89,
    trades24h: 3,
    winRate: 72,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'agent-predictor',
    name: 'Oracle',
    pnl24h: 0,
    pnl7d: 89.12,
    pnlTotal: 456.78,
    trades24h: 0,
    winRate: 61,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'agent-leverage',
    name: 'High Roller',
    pnl24h: 0,
    pnl7d: -123.45,
    pnlTotal: 234.56,
    trades24h: 0,
    winRate: 52,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'agent-conservative',
    name: 'Safe Harbor',
    pnl24h: 12.34,
    pnl7d: 67.89,
    pnlTotal: 890.12,
    trades24h: 1,
    winRate: 85,
    lastUpdated: new Date().toISOString(),
  },
];

/**
 * Hook for managing agent-specific P&L data with selection filtering
 *
 * When connected to production backend, this will use:
 * - GET /api/analytics/pnl-by-agent?walletId=...&agentIds=...&range=...
 * - WebSocket 'agentPnlUpdate' events for real-time updates
 */
export function useAgentPnL(options: UseAgentPnLOptions = {}): UseAgentPnLReturn {
  const { walletAddress, selectedAgentIds: initialSelectedIds = [], range = '24H' } = options;

  const [agentsPnL, setAgentsPnL] = useState<AgentPnLData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agent P&L data
  const fetchAgentPnL = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Demo mode: return mock data
      if (!isBackendMode()) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setAgentsPnL(MOCK_AGENTS_PNL);

        // Default to all agents selected if none specified
        if (selectedIds.length === 0) {
          setSelectedIds(MOCK_AGENTS_PNL.map((a) => a.id));
        }
        return;
      }

      // Backend mode: fetch from production API
      const params = new URLSearchParams();
      if (walletAddress) params.set('walletId', walletAddress);
      if (selectedIds.length > 0) params.set('agentIds', selectedIds.join(','));
      params.set('range', range);

      interface PnLApiResponse {
        agents: AgentPnLData[];
        combined: {
          totalPnl: number;
          totalPnlPercentage: number;
          totalTrades: number;
        };
      }

      const data = await apiCallJson<PnLApiResponse>(
        `/api/analytics/pnl-by-agent?${params.toString()}`,
        {
          headers: withUserAddress({}, walletAddress),
        }
      );

      setAgentsPnL(data.agents || []);

      // Default to all agents selected if none specified
      if (selectedIds.length === 0 && data.agents?.length > 0) {
        setSelectedIds(data.agents.map((a) => a.id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent P&L');
      // Fall back to mock data on error
      if (process.env.NODE_ENV === 'development') {
        console.error('[useAgentPnL] Error fetching P&L, using mock data:', err);
        setAgentsPnL(MOCK_AGENTS_PNL);
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, range, selectedIds]);

  // Initial fetch
  useEffect(() => {
    fetchAgentPnL();
  }, [fetchAgentPnL]);

  // Calculate combined P&L for selected agents
  const combinedPnL = useMemo<CombinedPnLData>(() => {
    const selectedAgents = agentsPnL.filter((a) => selectedIds.includes(a.id));

    if (selectedAgents.length === 0) {
      return {
        pnl24h: 0,
        pnl7d: 0,
        pnlTotal: 0,
        trades24h: 0,
        winRate: 0,
        agentCount: 0,
      };
    }

    const totals = selectedAgents.reduce(
      (acc, agent) => ({
        pnl24h: acc.pnl24h + agent.pnl24h,
        pnl7d: acc.pnl7d + agent.pnl7d,
        pnlTotal: acc.pnlTotal + agent.pnlTotal,
        trades24h: acc.trades24h + agent.trades24h,
        winRateSum: acc.winRateSum + agent.winRate,
      }),
      { pnl24h: 0, pnl7d: 0, pnlTotal: 0, trades24h: 0, winRateSum: 0 }
    );

    return {
      pnl24h: totals.pnl24h,
      pnl7d: totals.pnl7d,
      pnlTotal: totals.pnlTotal,
      trades24h: totals.trades24h,
      winRate: Math.round(totals.winRateSum / selectedAgents.length),
      agentCount: selectedAgents.length,
    };
  }, [agentsPnL, selectedIds]);

  // Selection actions
  const selectAgent = useCallback((agentId: string) => {
    setSelectedIds((prev) => (prev.includes(agentId) ? prev : [...prev, agentId]));
  }, []);

  const deselectAgent = useCallback((agentId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== agentId));
  }, []);

  const selectAllAgents = useCallback(() => {
    setSelectedIds(agentsPnL.map((a) => a.id));
  }, [agentsPnL]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    agentsPnL,
    combinedPnL,
    isLoading,
    error,
    selectAgent,
    deselectAgent,
    selectAllAgents,
    clearSelection,
    selectedIds,
    refetch: fetchAgentPnL,
  };
}
