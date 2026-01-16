'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  useAgentList,
  useAgent,
  useCreateAgent,
  useDeleteAgent,
  agentService,
} from '../../features/agents';
import type { Agent, AgentStatus, AgentListItem } from '../../features/agents/types';
import type { AgentMode } from '../types';
import { DeleteConfirmation } from '../../features/agents/components';
import { AgentDetailSlide } from '../views/AgentDetailSlide';
import { HudCreateAgentModal } from './HudCreateAgentModal';

interface HudAgentManagerProps {
  children: (props: HudAgentManagerRenderProps) => React.ReactNode;
}

export interface HudAgentManagerRenderProps {
  // Agent list for sidebar
  agents: AgentListItem[];
  isLoadingList: boolean;

  // Selected agent
  selectedAgentId: string | null;
  selectAgent: (id: string | null) => void;

  // Open detail slide
  openAgentDetail: (id: string) => void;

  // Open create modal
  openCreateModal: () => void;

  // Whether the agent detail overlay is open (for hiding dashboard panels)
  isOverlayActive: boolean;

  // Convert to legacy format for existing AgentsPanel
  toLegacyAgentRow: (agent: AgentListItem) => {
    id: string;
    chip: string;
    name: string;
    role: string;
    mode: AgentMode;
    runtimeState: 'running' | 'idle' | 'alert' | 'stopped';
    pnlPct: number;
  };
}

export function HudAgentManager({ children }: HudAgentManagerProps) {
  // Agent list
  const { agents, isLoading: isLoadingList, refetch: refetchList } = useAgentList();

  // Selection state
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Single agent for detail view
  const { agent: detailAgent, updateAgent, setStatus, refetch: refetchAgent } = useAgent(detailAgentId);

  // Create agent
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { clearError: clearCreateError } = useCreateAgent();

  // Delete agent
  const {
    confirmationState: deleteState,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    error: deleteError,
  } = useDeleteAgent();

  // Auto-select first agent if none selected
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId]);

  // Open agent detail slide
  const openAgentDetail = useCallback((id: string) => {
    setDetailAgentId(id);
    setIsDetailOpen(true);
    setSelectedAgentId(id);
  }, []);

  // Close agent detail slide
  const closeAgentDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  // Handle agent update from slide
  const handleAgentUpdate = useCallback(async (agentId: string, data: any) => {
    await updateAgent(data);
    refetchList();
  }, [updateAgent, refetchList]);

  // Handle status change
  const handleStatusChange = useCallback(async (agentId: string, status: 'running' | 'stopped') => {
    await setStatus(status as AgentStatus);
    refetchList();
  }, [setStatus, refetchList]);

  // Handle delete request (opens confirmation)
  const handleDeleteRequest = useCallback((agentId: string, agentName: string) => {
    requestDelete(agentId, agentName);
  }, [requestDelete]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    const success = await confirmDelete();
    if (success) {
      setIsDetailOpen(false);
      setDetailAgentId(null);
      if (selectedAgentId === deleteState.agentId) {
        setSelectedAgentId(null);
      }
      refetchList();
    }
  }, [confirmDelete, deleteState.agentId, selectedAgentId, refetchList]);

  // Convert to legacy format for existing AgentsPanel
  // Aligned with production status values
  const toLegacyAgentRow = useCallback((agent: AgentListItem) => {
    const statusMap: Record<string, 'running' | 'idle' | 'alert' | 'stopped'> = {
      running: 'running',
      stopped: 'stopped',
      error: 'alert',
      unknown: 'idle',
      timeout: 'alert',
      not_found: 'stopped',
    };

    const modeRoles: Record<string, string> = {
      standard: 'Balanced',
      't-mode': 'AI Trading',
      prediction: 'Predictor',
      perpetuals: 'Leveraged',
    };

    return {
      id: agent.id,
      chip: agent.name.slice(0, 2).toUpperCase(),
      name: agent.name,
      role: modeRoles[agent.mode] || 'Agent',
      mode: (agent.mode as AgentMode) || 'standard',
      runtimeState: statusMap[agent.status] || 'stopped',
      pnlPct: agent.pnl24h,
    };
  }, []);

  // Render props
  const renderProps: HudAgentManagerRenderProps = {
    agents,
    isLoadingList,
    selectedAgentId,
    selectAgent: setSelectedAgentId,
    openAgentDetail,
    openCreateModal: () => setIsCreateModalOpen(true),
    isOverlayActive: isDetailOpen,
    toLegacyAgentRow,
  };

  return (
    <>
      {children(renderProps)}

      {/* Agent Detail Slide */}
      <AgentDetailSlide
        agent={detailAgent}
        isOpen={isDetailOpen}
        onClose={closeAgentDetail}
        onUpdate={handleAgentUpdate}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChange}
      />

      {/* Create Agent Modal */}
      <HudCreateAgentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          clearCreateError();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteState.isOpen}
        agentName={deleteState.agentName}
        onConfirm={handleDeleteConfirm}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </>
  );
}
