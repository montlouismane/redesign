'use client';

import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { X, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import type { Agent as ProductionAgent, AgentMode } from '../../features/agents/types';
import { useAgentSettings } from '../../features/agents/hooks/useAgentSettings';
import {
  AgentSettingsBoard,
  type Agent as BoardAgent,
  type AgentSettings as BoardAgentSettings,
  type RiskConfig,
} from '../components/AgentSettingsBoard';
import styles from './AgentDetailSlide.module.css';

// =============================================================================
// Type Adapters - Convert between production and board types
// =============================================================================

/**
 * Convert production Agent to AgentSettingsBoard Agent format
 */
function adaptAgentToBoard(agent: ProductionAgent): BoardAgent {
  return {
    id: agent.id,
    name: agent.name,
    avatar: agent.avatar ?? undefined,
    mode: agent.mode,
    chain: 'cardano', // Default chain - could be extended from production type
    walletAddress: 'addr1...', // Placeholder - should come from wallet context
    createdAt: agent.createdAt,
    status: agent.status === 'unknown' || agent.status === 'timeout' || agent.status === 'not_found'
      ? 'stopped'
      : agent.status,
    performance: {
      pnl24h: agent.performance.pnl24h,
      pnl24hPct: (agent.performance.pnl24h / 10000) * 100, // Estimate percentage
      winRate: agent.performance.winRate,
      totalTrades: agent.performance.trades24h * 30, // Estimate from 24h trades
    },
  };
}

/**
 * Get default risk config
 */
function getDefaultRiskConfig(): RiskConfig {
  return {
    edgeGateEnabled: false,
    minNetEdge: 0.5,
    logSkippedEdge: true,
    liquidityGuardEnabled: true,
    maxImpact: 3.0,
    autoDownsize: true,
    skipIlliquid: false,
    perAssetCooldownEnabled: true,
    winCooldown: 15,
    lossCooldown: 60,
    scratchCooldown: 30,
    maxOpenPositions: 10,
    maxSinglePosition: 20,
    maxDailyLoss: 10,
    // Safety Controls (global)
    minHoldTime: 30,
    profitUnlock: 20,
    emergencyStop: 6,
    trailingUnlock: 0,
    // Partial Profit Taking
    partialExits: {
      enabled: false,
      targets: [
        { id: '1', pnlPct: 10, sellPct: 50, trailingAfter: false },
        { id: '2', pnlPct: 20, sellPct: 25, trailingAfter: true, trailingDistancePct: 5 }
      ]
    },
    dryRunEnabled: false,
    logToDatabase: true,
    virtualAda: 10000,
  };
}

interface AgentDetailSlideProps {
  agent: ProductionAgent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (agentId: string, data: any) => Promise<void>;
  onDelete: (agentId: string, agentName: string) => void;
  onStatusChange: (agentId: string, status: 'running' | 'stopped') => Promise<void>;
  isUpdating?: boolean;
}

export function AgentDetailSlide({
  agent,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onStatusChange,
  isUpdating = false,
}: AgentDetailSlideProps) {
  // Use existing hook for form state management
  const {
    formValues,
    name,
    mode,
    isDirty,
    updateName,
    updateMode,
    getUpdatePayload,
    validate,
  } = useAgentSettings(agent);

  // Local state for board settings and risk config
  const [boardSettings, setBoardSettings] = useState<BoardAgentSettings>({});
  const [riskSettings, setRiskSettings] = useState<RiskConfig>(getDefaultRiskConfig());

  // Scroll hint state
  const contentRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Convert production agent to board agent format
  const boardAgent = useMemo(() => {
    if (!agent) return null;
    const adapted = adaptAgentToBoard(agent);
    // Keep name and mode in sync with hook
    return { ...adapted, name, mode };
  }, [agent, name, mode]);

  // Fullscreen animation - scale and fade
  const panelAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.98)',
    config: { tension: 300, friction: 30 },
  });

  // Backdrop animation
  const backdropAnimation = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { tension: 300, friction: 30 },
  });

  // Lock scroll when slide is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!agent || !isDirty) return;

    const timer = setTimeout(async () => {
      if (validate()) {
        const payload = getUpdatePayload();
        if (Object.keys(payload).length > 0) {
          await onUpdate(agent.id, payload);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [agent, isDirty, formValues, name, mode, validate, getUpdatePayload, onUpdate]);

  // Scroll hint detection
  useEffect(() => {
    const el = contentRef.current;
    if (!el || !isOpen) return;

    const checkScroll = () => {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20;
      setShowScrollHint(isScrollable && !isAtBottom);
    };

    // Initial check with slight delay for content to render
    const initialTimer = setTimeout(checkScroll, 100);

    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(initialTimer);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isOpen, boardAgent]);

  // Handlers for AgentSettingsBoard
  const handleNameChange = useCallback((newName: string) => {
    updateName(newName);
  }, [updateName]);

  const handleModeChange = useCallback((newMode: AgentMode) => {
    updateMode(newMode);
  }, [updateMode]);

  const handleAvatarChange = useCallback(async (file: File) => {
    if (!agent) return;
    // In production, upload to storage and update agent
    const url = URL.createObjectURL(file);
    await onUpdate(agent.id, { avatar: url });
  }, [agent, onUpdate]);

  const handleStart = useCallback(async () => {
    if (!agent) return;
    await onStatusChange(agent.id, 'running');
  }, [agent, onStatusChange]);

  const handleStop = useCallback(async () => {
    if (!agent) return;
    await onStatusChange(agent.id, 'stopped');
  }, [agent, onStatusChange]);

  const handleUpdateAgent = useCallback(async () => {
    if (!agent) return;
    if (validate()) {
      const payload = getUpdatePayload();
      if (Object.keys(payload).length > 0) {
        await onUpdate(agent.id, payload);
      }
    }
  }, [agent, validate, getUpdatePayload, onUpdate]);

  const handleSave = useCallback(async () => {
    if (!agent) return;
    if (validate()) {
      const payload = getUpdatePayload();
      // Include risk settings in save
      await onUpdate(agent.id, { ...payload, riskSettings });
    }
  }, [agent, validate, getUpdatePayload, onUpdate, riskSettings]);

  const handleSettingsChange = useCallback((partial: Partial<BoardAgentSettings>) => {
    setBoardSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleRiskSettingsChange = useCallback((partial: Partial<RiskConfig>) => {
    setRiskSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleDelete = useCallback(() => {
    if (agent) {
      onDelete(agent.id, agent.name);
    }
  }, [agent, onDelete]);

  if (!isOpen && !agent) return null;

  return (
    <>
      {/* Backdrop */}
      <animated.div
        style={{
          ...backdropAnimation,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        className={styles.backdrop}
        onClick={onClose}
      />

      {/* Slide Panel */}
      <animated.div
        style={{ ...panelAnimation, pointerEvents: isOpen ? 'auto' : 'none' }}
        className={styles.slidePanel}
      >
        {/* Copper glow edge */}
        <div className={styles.glowEdge} />

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>AGENT SETTINGS</h2>
          <div className={styles.headerActions}>
            {/* Status indicator */}
            {isDirty && (
              <span className={styles.savingIndicator}>
                {isUpdating ? 'Saving...' : 'Unsaved'}
              </span>
            )}
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - AgentSettingsBoard */}
        <div ref={contentRef} className={styles.content}>
          {boardAgent ? (
            <>
              <AgentSettingsBoard
                agent={boardAgent}
                settings={boardSettings}
                riskSettings={riskSettings}
                onSettingsChange={handleSettingsChange}
                onRiskSettingsChange={handleRiskSettingsChange}
                onModeChange={handleModeChange}
                onNameChange={handleNameChange}
                onAvatarChange={handleAvatarChange}
                onStart={handleStart}
                onStop={handleStop}
                onUpdate={handleUpdateAgent}
                onSave={handleSave}
              />

              {/* Danger Zone - kept separate for prominence */}
              <section className={`${styles.section} ${styles.dangerZone}`}>
                <h3 className={styles.sectionTitle}>DANGER ZONE</h3>
                <button
                  onClick={handleDelete}
                  disabled={isUpdating}
                  className={styles.deleteButton}
                >
                  <Trash2 size={16} />
                  Delete Agent
                </button>
                <p className={styles.dangerHint}>
                  This action cannot be undone. All agent data will be permanently deleted.
                </p>
              </section>
            </>
          ) : (
            <div className={styles.emptyState}>
              <AlertCircle size={48} />
              <p>Select an agent to view settings</p>
            </div>
          )}
        </div>

        {/* Scroll Hint */}
        <div className={`${styles.scrollHint} ${!showScrollHint ? styles.hidden : ''}`}>
          <ChevronDown size={20} className={styles.scrollHintChevron} />
          <ChevronDown size={20} className={styles.scrollHintChevron} />
        </div>
      </animated.div>
    </>
  );
}
