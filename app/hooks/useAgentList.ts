'use client';

import { useState, useEffect, useCallback } from 'react';
import { agentService } from '@/app/features/agents/api/agentService';
import type { Agent, AgentListItem } from '@/app/features/agents/types';

// =============================================================================
// Types
// =============================================================================

export interface AgentListState {
  agents: Agent[];
  listItems: AgentListItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for fetching and managing agent list
 *
 * Automatically uses agentService which switches between mock and production data
 * based on NEXT_PUBLIC_USE_MOCK_DATA or NEXT_PUBLIC_DATA_MODE env vars
 */
export function useAgentList(): AgentListState {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [listItems, setListItems] = useState<AgentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [fetchedAgents, fetchedListItems] = await Promise.all([
        agentService.getAll(),
        agentService.getListItems(),
      ]);

      setAgents(fetchedAgents);
      setListItems(fetchedListItems);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch agents');
      setError(error);
      setAgents([]);
      setListItems([]);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useAgentList] Error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    listItems,
    isLoading,
    error,
    refetch: fetchAgents,
  };
}

// =============================================================================
// Utility Hooks
// =============================================================================

/**
 * Get a single agent by ID
 */
export function useAgent(agentId: string): {
  agent: Agent | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!agentId) {
      setAgent(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedAgent = await agentService.getById(agentId);
      setAgent(fetchedAgent);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch agent');
      setError(error);
      setAgent(null);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useAgent] Error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  return {
    agent,
    isLoading,
    error,
    refetch: fetchAgent,
  };
}

/**
 * Get agents filtered by status
 */
export function useAgentsByStatus(status: 'running' | 'stopped' | 'error'): {
  agents: Agent[];
  count: number;
  isLoading: boolean;
  error: Error | null;
} {
  const { agents, isLoading, error } = useAgentList();

  const filteredAgents = agents.filter((agent) => agent.status === status);

  return {
    agents: filteredAgents,
    count: filteredAgents.length,
    isLoading,
    error,
  };
}

/**
 * Get running agents count
 */
export function useRunningAgentsCount(): {
  count: number;
  total: number;
  isLoading: boolean;
} {
  const { agents, isLoading } = useAgentList();

  const runningCount = agents.filter((agent) => agent.status === 'running').length;

  return {
    count: runningCount,
    total: agents.length,
    isLoading,
  };
}

/**
 * Get agent performance summary
 */
export function useAgentPerformanceSummary(): {
  totalPnl24h: number;
  totalTrades24h: number;
  averageWinRate: number;
  isLoading: boolean;
  error: Error | null;
} {
  const { agents, isLoading, error } = useAgentList();

  const summary = agents.reduce(
    (acc, agent) => {
      acc.totalPnl24h += agent.performance.pnl24h;
      acc.totalTrades24h += agent.performance.trades24h;
      acc.totalWinRate += agent.performance.winRate;
      return acc;
    },
    { totalPnl24h: 0, totalTrades24h: 0, totalWinRate: 0 }
  );

  const averageWinRate = agents.length > 0 ? summary.totalWinRate / agents.length : 0;

  return {
    totalPnl24h: summary.totalPnl24h,
    totalTrades24h: summary.totalTrades24h,
    averageWinRate,
    isLoading,
    error,
  };
}
