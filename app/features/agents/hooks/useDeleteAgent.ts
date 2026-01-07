'use client';

import { useState, useCallback } from 'react';
import type { DeleteConfirmationState } from '../types';
import { agentService } from '../api/agentService';

// =============================================================================
// Types
// =============================================================================

interface UseDeleteAgentReturn {
  /** Current confirmation state */
  confirmationState: DeleteConfirmationState;
  /** Open delete confirmation for an agent */
  requestDelete: (agentId: string, agentName: string) => void;
  /** Cancel deletion */
  cancelDelete: () => void;
  /** Confirm and execute deletion */
  confirmDelete: () => Promise<boolean>;
  /** Whether deletion is in progress */
  isDeleting: boolean;
  /** Error message if deletion failed */
  error: string | null;
  /** Clear error */
  clearError: () => void;
}

// =============================================================================
// Hook
// =============================================================================

export function useDeleteAgent(): UseDeleteAgentReturn {
  const [confirmationState, setConfirmationState] = useState<DeleteConfirmationState>({
    isOpen: false,
    agentId: null,
    agentName: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDelete = useCallback((agentId: string, agentName: string) => {
    setConfirmationState({
      isOpen: true,
      agentId,
      agentName,
    });
    setError(null);
  }, []);

  const cancelDelete = useCallback(() => {
    setConfirmationState({
      isOpen: false,
      agentId: null,
      agentName: null,
    });
    setError(null);
  }, []);

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    const { agentId } = confirmationState;

    if (!agentId) {
      setError('No agent selected for deletion');
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await agentService.delete(agentId);

      // Close confirmation on success
      setConfirmationState({
        isOpen: false,
        agentId: null,
        agentName: null,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete agent';
      setError(message);
      console.error('useDeleteAgent: Failed to delete agent', err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [confirmationState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    confirmationState,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    error,
    clearError,
  };
}
