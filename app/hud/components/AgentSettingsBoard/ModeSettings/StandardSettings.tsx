'use client';

import { useState } from 'react';
import { CollapsibleSection, ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial } from '../../controls/MetallicDial';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { TimeAdjuster } from '../../controls/TimeAdjuster';
import { AllocationEditor } from '../../controls/AllocationEditor';
import { HelpCircle } from 'lucide-react';
import styles from '../AgentSettingsBoard.module.css';

export interface StandardSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
  onFaqClick?: () => void;
  onBacktestClick?: () => void;
}

/**
 * Standard Mode Settings Component - Primary View
 *
 * Compact configuration with MetallicDials for percentages.
 * Uses tabs and 2-column layout to minimize scrolling.
 *
 * Tab: Allocation - Token distribution targets
 * Tab: Settings - Collapsible sections with denseGrid layout
 */
export function StandardSettings({ settings, onChange, onFaqClick, onBacktestClick }: StandardSettingsProps) {
  const [activeTab, setActiveTab] = useState<'allocation' | 'settings'>('settings');

  const defaults = {
    // Asset Allocation
    targetAllocations: settings.targetAllocations ?? { ADA: 100 },

    // Rebalance Settings
    slippageTolerance: settings.slippageTolerance ?? 1.5,
    rebalanceTolerance: settings.rebalanceTolerance ?? 5,
    cycleInterval: settings.cycleInterval ?? 5,

    // Trade Limits
    minTradeSize: settings.minTradeSize ?? 10,
    maxTradeSize: settings.maxTradeSize ?? 200,
    nativeReserve: settings.nativeReserve ?? 250,

    // Safety Controls
    minHoldTime: settings.minHoldTime ?? 30,
    profitUnlock: settings.profitUnlock ?? 20,
    emergencyStop: settings.emergencyStop ?? 6,
    trailingUnlock: settings.trailingUnlock ?? 0,

  };

  return (
    <div className={styles.unifiedBoard}>
      {/* Angular frame overlay */}
      <div className={styles.panelFrame}>
        <div className={styles.frameLines} />
        <div className={styles.frameAccents}>
          <div className={`${styles.accent} ${styles.accentTL}`} />
          <div className={`${styles.accent} ${styles.accentTR}`} />
          <div className={`${styles.accent} ${styles.accentBL}`} />
          <div className={`${styles.accent} ${styles.accentBR}`} />
        </div>
      </div>
      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'allocation' ? styles.active : ''}`}
          onClick={() => setActiveTab('allocation')}
        >
          Allocation
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <div style={{ flex: 1 }} />
        {onBacktestClick && (
          <button
            className={styles.faqButton}
            onClick={onBacktestClick}
            title="Run Backtest"
            style={{ background: 'rgba(196, 124, 72, 0.15)', borderColor: 'var(--border)' }}
          >
            Backtest
          </button>
        )}
        {onFaqClick && (
          <button className={styles.faqButton} onClick={onFaqClick} title="View FAQ">
            <HelpCircle size={14} />
          </button>
        )}
      </div>

      {/* Allocation Tab */}
      {activeTab === 'allocation' && (
        <div className={styles.section}>
          <div className={styles.sectionContent}>
            <AllocationEditor
              allocations={defaults.targetAllocations}
              onChange={(allocations) => onChange({ targetAllocations: allocations })}
            />
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <>
          {/* Row: Rebalance Settings | Trade Limits */}
          <div className={styles.sectionRow}>
            {/* Rebalance Settings */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.cardTitle}>Rebalance Settings</div>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.denseGrid}>
                  <ControlRow label="Slippage" helper="Max price impact">
                    <MetallicDial
                      value={defaults.slippageTolerance}
                      onChange={(val) => onChange({ slippageTolerance: val })}
                      min={0.1} max={5} step={0.1} unit="%"
                      safeMin={0.5} safeMax={2}
                    />
                  </ControlRow>
                  <ControlRow label="Rebalance Tolerance" helper="Drift threshold">
                    <MetallicDial
                      value={defaults.rebalanceTolerance}
                      onChange={(val) => onChange({ rebalanceTolerance: val })}
                      min={1} max={20} step={1} unit="%"
                      safeMin={3} safeMax={10}
                    />
                  </ControlRow>
                  <ControlRow label="Cycle Interval" helper="Check frequency">
                    <TimeAdjuster
                      value={defaults.cycleInterval}
                      onChange={(val) => onChange({ cycleInterval: val })}
                      min={1} max={60} step={1} unit="min" size="large"
                    />
                  </ControlRow>
                </div>
              </div>
            </div>

            {/* Trade Limits */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.cardTitle}>Trade Limits</div>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.denseGrid}>
                  <ControlRow label="Min Trade Size" helper="Prevents tiny trades">
                    <HorizontalSlider
                      value={defaults.minTradeSize}
                      onChange={(val) => onChange({ minTradeSize: val })}
                      min={40} max={100} step={1} unit="ADA"
                    />
                  </ControlRow>
                  <ControlRow label="Max Trade Size" helper="Caps single trade">
                    <HorizontalSlider
                      value={defaults.maxTradeSize}
                      onChange={(val) => onChange({ maxTradeSize: val })}
                      min={80} max={1000} step={10} unit="ADA"
                    />
                  </ControlRow>
                  <ControlRow label="Native Reserve" helper="Min balance to keep in wallet">
                    <HorizontalSlider
                      value={defaults.nativeReserve}
                      onChange={(val) => onChange({ nativeReserve: val })}
                      min={50} max={500} step={10} unit="ADA"
                      inputStep={1} inputMin={0}
                    />
                  </ControlRow>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Controls - Collapsed by default */}
          <CollapsibleSection id="standard-safety" title="Safety Controls" defaultExpanded={false}>
            <div className={styles.denseGrid}>
              <ControlRow label="Min Hold Time" helper="Hold period">
                <TimeAdjuster
                  value={defaults.minHoldTime}
                  onChange={(val) => onChange({ minHoldTime: val })}
                  min={1} max={120} step={1} unit="min" size="large"
                />
              </ControlRow>
              <ControlRow label="Profit Unlock" helper="Bypasses hold">
                <MetallicDial
                  value={defaults.profitUnlock}
                  onChange={(val) => onChange({ profitUnlock: val })}
                  min={0} max={50} step={1} unit="%"
                  safeMin={10} safeMax={30}
                />
              </ControlRow>
              <ControlRow label="Emergency Stop" helper="Loss % sells">
                <MetallicDial
                  value={defaults.emergencyStop}
                  onChange={(val) => onChange({ emergencyStop: val })}
                  min={0} max={50} step={1} unit="%"
                  safeMin={3} safeMax={15}
                />
              </ControlRow>
              <ControlRow label="Trailing Unlock" helper="% from peak">
                <HorizontalSlider
                  value={defaults.trailingUnlock}
                  onChange={(val) => onChange({ trailingUnlock: val })}
                  min={0} max={20} step={1} unit="%"
                />
              </ControlRow>
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
