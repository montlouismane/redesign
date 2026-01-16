'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Agent, AgentStatus, UpdateAgentPayload } from '../types';
import { agentService } from '../api/agentService';

// =============================================================================
// Types
// =============================================================================

interface UseAgentReturn {
  /** The agent data (null if not found or loading) */
  agent: Agent | null;
  /** Loading state */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Update the agent */
  updateAgent: (data: UpdateAgentPayload) => Promise<Agent | null>;
  /** Set agent status (start/stop/pause) */
  setStatus: (status: AgentStatus) => Promise<Agent | null>;
  /** Whether an update is in progress */
  isUpdating: boolean;
  /** Refetch the agent */
  refetch: () => Promise<void>;
}

// =============================================================================
// Hook
// =============================================================================

export function useAgent(id: string | null): UseAgentReturn {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    if (!id) {
      setAgent(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await agentService.getById(id);
      setAgent(data);
      if (!data) {
        setError('Agent not found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load agent';
      setError(message);
      setAgent(null);
      console.error('useAgent: Failed to fetch agent', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const updateAgent = useCallback(
    async (data: UpdateAgentPayload): Promise<Agent | null> => {
      if (!id || !agent) {
        console.warn('useAgent: Cannot update - no agent loaded');
        return null;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updated = await agentService.update(id, data);
        setAgent(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update agent';
        setError(message);
        console.error('useAgent: Failed to update agent', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [id, agent]
  );

  const setStatus = useCallback(
    async (status: AgentStatus): Promise<Agent | null> => {
      if (!id || !agent) {
        console.warn('useAgent: Cannot set status - no agent loaded');
        return null;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updated = await agentService.setStatus(id, status);
        setAgent(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update status';
        setError(message);
        console.error('useAgent: Failed to set status', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [id, agent]
  );

  return {
    agent,
    isLoading,
    error,
    updateAgent,
    setStatus,
    isUpdating,
    refetch: fetchAgent,
  };
}
