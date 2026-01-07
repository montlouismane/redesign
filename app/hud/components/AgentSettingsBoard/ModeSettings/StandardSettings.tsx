'use client';

import React from 'react';
import { ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial } from '../../controls/MetallicDial';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { SegmentSelector } from '../../controls/SegmentSelector';
import { AllocationEditor } from '../../controls/AllocationEditor';
import styles from '../AgentSettingsBoard.module.css';

export interface StandardSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
}

/**
 * Standard Mode Settings Component
 *
 * Configuration for standard portfolio rebalancing strategy.
 * Production API compatible - allocations stored as percentages (0-100).
 *
 * Sections:
 * - Target Allocations: Token distribution targets (must sum to 100%)
 * - Trade Parameters: Slippage, min/max sizes, drift tolerance
 * - Rebalance Schedule: Check frequency (hourly/daily/weekly)
 *
 * API Format:
 * - UI: percentages 0-100
 * - Backend: decimals 0-1 (converted in agentService)
 */
export function StandardSettings({ settings, onChange }: StandardSettingsProps) {
  const defaults = {
    targetAllocations: settings.targetAllocations ?? { ADA: 50, AGIX: 30, MIN: 20 },
    slippageTolerance: settings.slippageTolerance ?? 1.5,
    minTradeSize: settings.minTradeSize ?? 50,
    maxTradeSize: settings.maxTradeSize ?? 5000,
    tolerancePct: settings.tolerancePct ?? 5,
    rebalanceFrequency: settings.rebalanceFrequency ?? 'daily',
  };

  return (
    <div className={styles.gridContainer}>
      {/* Target Allocations (Full Width) */}
      <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Target Allocations</div>
        </div>
        <div className={styles.cardContent}>
          <AllocationEditor
            allocations={defaults.targetAllocations}
            onChange={(allocations) => onChange({ targetAllocations: allocations })}
          />
        </div>
      </div>

      {/* Trade Parameters */}
      <div className={styles.card} style={{ gridColumn: 'span 2' }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Execution Parameters</div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.denseGrid}>
            <ControlRow label="Slippage" helper="Max tolerance %">
              <MetallicDial
                value={defaults.slippageTolerance}
                onChange={(val) => onChange({ slippageTolerance: val })}
                min={0.1}
                max={5}
                step={0.1}
                unit="%"
                safeMin={0.5}
                safeMax={2}
              />
            </ControlRow>
            <ControlRow label="Rebalance Drift" helper="Trigger threshold %">
              <MetallicDial
                value={defaults.tolerancePct}
                onChange={(val) => onChange({ tolerancePct: val })}
                min={1}
                max={20}
                step={1}
                unit="%"
                safeMin={3}
                safeMax={10}
              />
            </ControlRow>
            <ControlRow label="Min Trade Size">
              <HorizontalSlider
                value={defaults.minTradeSize}
                onChange={(val) => onChange({ minTradeSize: val })}
                min={10}
                max={500}
                step={10}
                unit="ADA"
                safeMin={25}
                safeMax={100}
              />
            </ControlRow>
            <ControlRow label="Max Trade Size">
              <HorizontalSlider
                value={defaults.maxTradeSize}
                onChange={(val) => onChange({ maxTradeSize: val })}
                min={500}
                max={50000}
                step={500}
                unit="ADA"
                safeMin={1000}
                safeMax={10000}
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Rebalance Schedule */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Schedule</div>
        </div>
        <div className={styles.cardContent}>
          <ControlRow label="Check Frequency" helper="How often to check and rebalance">
            <SegmentSelector
              value={defaults.rebalanceFrequency}
              onChange={(val) => onChange({ rebalanceFrequency: val })}
              options={[
                { value: 'hourly', label: '1H' },
                { value: 'daily', label: '24H' },
                { value: 'weekly', label: '7D' },
              ]}
            />
          </ControlRow>
        </div>
      </div>
    </div>
  );
}
