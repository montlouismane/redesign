'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AgentListItem } from '../types';
import { agentService } from '../api/agentService';

// =============================================================================
// Types
// =============================================================================

interface UseAgentListReturn {
  /** List of agents (lightweight items for sidebar) */
  agents: AgentListItem[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Refetch the list */
  refetch: () => Promise<void>;
}

// =============================================================================
// Hook
// =============================================================================

export function useAgentList(): UseAgentListReturn {
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await agentService.getListItems();
      setAgents(items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load agents';
      setError(message);
      console.error('useAgentList: Failed to fetch agents', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return {
    agents,
    isLoading,
    error,
    refetch: fetchAgents,
  };
}
