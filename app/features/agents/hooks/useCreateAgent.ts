'use client';

import { useState, useCallback } from 'react';
import type { Agent, AgentMode, CreateAgentPayload } from '../types';
import { DEFAULT_AGENT_SETTINGS } from '../constants';
import { agentService } from '../api/agentService';

// =============================================================================
// Types
// =============================================================================

interface UseCreateAgentReturn {
  /** Create a new agent */
  createAgent: (name: string, mode: AgentMode) => Promise<Agent | null>;
  /** Whether creation is in progress */
  isCreating: boolean;
  /** Error message if creation failed */
  error: string | null;
  /** Clear error */
  clearError: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useCreateAgent(): UseCreateAgentReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAgent = useCallback(async (name: string, mode: AgentMode): Promise<Agent | null> => {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Agent name is required');
      return null;
    }

    if (trimmedName.length > 32) {
      setError('Agent name must be 32 characters or less');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const payload: CreateAgentPayload = {
        name: trimmedName,
        mode,
        settings: DEFAULT_AGENT_SETTINGS,
      };

      const newAgent = await agentService.create(payload);
      return newAgent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create agent';
      setError(message);
      console.error('useCreateAgent: Failed to create agent', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createAgent,
    isCreating,
    error,
    clearError,
  };
}
