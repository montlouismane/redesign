'use client';

import React, { useState } from 'react';
import { AgentProfileCard, type Agent, type AgentMode } from './AgentProfileCard';
import { TModeSettings } from './ModeSettings/TModeSettings';
import { StandardSettings } from './ModeSettings/StandardSettings';
import { PredictionSettings } from './ModeSettings/PredictionSettings';
import { PerpetualsSettings } from './ModeSettings/PerpetualsSettings';
import { RiskSettings } from './RiskSettings';
import { HudToggle } from '../controls/HudToggle';
import { InfoTooltip } from '../controls/InfoTooltip';
import { Save } from 'lucide-react';
import styles from './AgentSettingsBoard.module.css';
import { useControlSound } from '../controls/useControlSound';

export interface AgentSettings {
  // Mode-specific settings are managed by each mode component
  [key: string]: any;
}

export interface RiskConfig {
  // Edge Gate
  edgeGateEnabled: boolean;
  minNetEdge: number;
  logSkippedEdge: boolean;

  // Liquidity Guard
  liquidityGuardEnabled: boolean;
  maxImpact: number;
  autoDownsize: boolean;
  skipIlliquid: boolean;

  // Cooldowns
  perAssetCooldownEnabled: boolean;
  winCooldown: number;
  lossCooldown: number;
  scratchCooldown: number;

  // Portfolio Risk
  maxOpenPositions: number;
  maxSinglePosition: number;
  maxDailyLoss: number;

  // Dry Run
  dryRunEnabled: boolean;
  logToDatabase: boolean;
  virtualAda: number;
}

export interface AgentSettingsBoardProps {
  agent: Agent;
  settings: AgentSettings;
  riskSettings: RiskConfig;
  onSettingsChange: (settings: Partial<AgentSettings>) => void;
  onRiskSettingsChange: (settings: Partial<RiskConfig>) => void;
  onModeChange: (mode: AgentMode) => void;
  onNameChange: (name: string) => void;
  onAvatarChange: (file: File) => void;
  onStart: () => void;
  onStop: () => void;
  onUpdate: () => void;
  onSave: () => void;
}

/**
 * Agent Settings Board - Main container for agent configuration
 *
 * Features:
 * - Agent profile card with stats and actions
 * - Mode selector (STANDARD | T-MODE | PREDICT | PERPS)
 * - Dynamic mode-specific settings form
 * - Shared risk management settings
 * - Save button for persisting changes
 *
 * Usage:
 * ```tsx
 * <AgentSettingsBoard
 *   agent={agentData}
 *   settings={settings}
 *   riskSettings={riskConfig}
 *   onSettingsChange={(partial) => updateSettings(partial)}
 *   onRiskSettingsChange={(partial) => updateRiskSettings(partial)}
 *   onModeChange={(mode) => switchMode(mode)}
 *   onSave={() => persistSettings()}
 * />
 * ```
 */
export function AgentSettingsBoard({
  agent,
  settings,
  riskSettings,
  onSettingsChange,
  onRiskSettingsChange,
  onModeChange,
  onNameChange,
  onAvatarChange,
  onStart,
  onStop,
  onUpdate,
  onSave,
}: AgentSettingsBoardProps) {
  /* State for Tab Navigation */
  const [activeTab, setActiveTab] = useState<'strategy' | 'risk'>('strategy');
  const { playTick: playConfirmSound } = useControlSound('confirm');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSettingsChange = (partial: Partial<AgentSettings>) => {
    setHasUnsavedChanges(true);
    onSettingsChange(partial);
  };

  const handleRiskSettingsChange = (partial: Partial<RiskConfig>) => {
    setHasUnsavedChanges(true);
    onRiskSettingsChange(partial);
  };

  const handleModeChange = (mode: AgentMode) => {
    setHasUnsavedChanges(true);
    onModeChange(mode);
  };

  const handleSave = () => {
    playConfirmSound();
    onSave();
    setHasUnsavedChanges(false);
  };

  const scrollToSettings = () => {
    // Scroll to top of settings board
    const board = document.querySelector(`.${styles.settingsBoard}`);
    board?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.settingsBoard}>
      {/* Agent Profile Card (Always Visible) */}
      <AgentProfileCard
        agent={agent}
        onNameChange={onNameChange}
        onAvatarChange={onAvatarChange}
        onStart={onStart}
        onStop={onStop}
        onUpdate={onUpdate}
        onScrollToSettings={scrollToSettings}
      />

      {/* Tab Navigation */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'strategy' ? styles.active : ''}`}
          onClick={() => setActiveTab('strategy')}
        >
          Strategy
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'risk' ? styles.active : ''}`}
          onClick={() => setActiveTab('risk')}
        >
          Risk Management
        </button>
      </div>

      {/* STRATEGY TAB CONTENT */}
      {activeTab === 'strategy' && (
        <React.Fragment>
          {/* Mode Selector */}
          <div className={styles.modeSelector}>
            <div className={styles.modeSelectorHeader}>
              <div className={styles.modeSelectorTitle}>Trading Mode</div>
              <div className={styles.paperTradingToggle}>
                <span className={styles.paperTradingLabel}>
                  Paper Trading
                  <InfoTooltip text="Simulate trades without execution" />
                </span>
                <HudToggle
                  value={settings.paperTradingEnabled ?? false}
                  onChange={(value) => handleSettingsChange({ paperTradingEnabled: value })}
                  activeColor="copper"
                />
              </div>
            </div>
            <div className={styles.segmentSelector}>
              <button
                className={`${styles.segmentBtn} ${agent.mode === 'standard' ? styles.active : ''}`}
                onClick={() => handleModeChange('standard')}
              >
                Standard
              </button>
              <button
                className={`${styles.segmentBtn} ${agent.mode === 't-mode' ? styles.active : ''}`}
                onClick={() => handleModeChange('t-mode')}
              >
                T-Mode
              </button>
              <button
                className={`${styles.segmentBtn} ${agent.mode === 'prediction' ? styles.active : ''}`}
                onClick={() => handleModeChange('prediction')}
              >
                Predict
              </button>
              <button
                className={`${styles.segmentBtn} ${agent.mode === 'perpetuals' ? styles.active : ''}`}
                onClick={() => handleModeChange('perpetuals')}
              >
                Perps
              </button>
            </div>
          </div>

          {/* Mode-Specific Settings */}
          <div id="mode-settings" className={styles.settingsSection} style={{ border: 'none', background: 'transparent', padding: 0 }}>
            <div className={styles.sectionTitle} style={{ marginBottom: '16px' }}>{agent.mode.toUpperCase()} Configuration</div>

            {agent.mode === 't-mode' && (
              <TModeSettings
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {agent.mode === 'standard' && (
              <StandardSettings
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {agent.mode === 'prediction' && (
              <PredictionSettings
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {agent.mode === 'perpetuals' && (
              <PerpetualsSettings
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}
          </div>
        </React.Fragment>
      )}

      {/* RISK TAB CONTENT */}
      {activeTab === 'risk' && (
        <div className={styles.settingsSection} style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <RiskSettings
            settings={riskSettings}
            onChange={handleRiskSettingsChange}
          />
        </div>
      )}

      {/* Save Button */}
      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={!hasUnsavedChanges}
        style={{ opacity: hasUnsavedChanges ? 1 : 0.5 }}
      >
        <Save size={16} />
        Save Changes
      </button>
    </div>
  );
}
