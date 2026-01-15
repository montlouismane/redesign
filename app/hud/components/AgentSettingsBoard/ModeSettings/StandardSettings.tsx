'use client';

import { ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial } from '../../controls/MetallicDial';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { TimeAdjuster } from '../../controls/TimeAdjuster';
import { AllocationCarousel } from '../../controls/AllocationCarousel';
import { HelpCircle } from 'lucide-react';
import styles from '../AgentSettingsBoard.module.css';

export interface StandardSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
  onFaqClick?: () => void;
  onBacktestClick?: () => void;
}

/**
 * Standard Mode Settings Component
 *
 * Single-screen configuration with:
 * - Token allocation carousel at top
 * - Rebalance settings (slippage, tolerance, cycle)
 * - Trade limits (min/max size, native reserve)
 *
 * Note: Safety Controls (Min Hold, Profit Unlock, Emergency Stop) are now global
 * and configured in the Risk Management tab.
 */
export function StandardSettings({ settings, onChange, onFaqClick, onBacktestClick }: StandardSettingsProps) {
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

      {/* Header with actions */}
      <div className={styles.settingsHeader}>
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

      {/* Allocation Section - Full Width Carousel */}
      <div className={styles.section}>
        <div className={styles.sectionContent}>
          <AllocationCarousel
            allocations={defaults.targetAllocations}
            onChange={(allocations) => onChange({ targetAllocations: allocations })}
          />
        </div>
      </div>

      {/* Row: Rebalance Settings | Trade Limits */}
      <div className={styles.sectionRow}>
        {/* Rebalance Settings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Rebalance Settings</div>
          </div>
          <div className={styles.sectionContent}>
            {/* 3 controls = 3-col (responsive: 2+1 centered on smaller) */}
            <div className={styles.grid3col}>
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
            {/* 3 controls = 3-col (responsive: 2+1 centered on smaller) */}
            <div className={styles.grid3col}>
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
    </div>
  );
}
