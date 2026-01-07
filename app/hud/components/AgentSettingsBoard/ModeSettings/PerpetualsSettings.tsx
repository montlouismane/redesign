'use client';

import React from 'react';
import { CollapsibleSection, ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial } from '../../controls/MetallicDial';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { ToggleSwitch } from '../../controls/ToggleSwitch';
import styles from '../AgentSettingsBoard.module.css';

export interface PerpetualsSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
}

/**
 * Perpetuals Mode Settings Component
 *
 * Configuration for perpetuals/futures trading strategy
 *
 * Sections:
 * - Leverage Settings: Max leverage, margin management
 * - Position Management: Entry/exit triggers, sizing
 * - Risk Controls: Liquidation protection, funding rates
 */
export function PerpetualsSettings({ settings, onChange }: PerpetualsSettingsProps) {
  const defaults = {
    maxLeverage: settings.maxLeverage ?? 3,
    minMarginRatio: settings.minMarginRatio ?? 25,
    positionSizeMultiplier: settings.positionSizeMultiplier ?? 1.0,
    stopLossDistance: settings.stopLossDistance ?? 5,
    takeProfitDistance: settings.takeProfitDistance ?? 15,
    maxFundingRate: settings.maxFundingRate ?? 0.1,
    trailingStopEnabled: settings.trailingStopEnabled ?? false,
    trailingStopDistance: settings.trailingStopDistance ?? 3,
  };

  return (
    <div className={styles.unifiedBoard}>
      {/* Row: Leverage & Position */}
      <div className={styles.sectionRow}>
        {/* Leverage Settings */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Leverage</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Max Leverage" helper="x Collateral">
                <MetallicDial
                  value={defaults.maxLeverage}
                  onChange={(v) => onChange({ maxLeverage: v })}
                  min={1} max={20} step={1} unit="x"
                />
              </ControlRow>
              <ControlRow label="Min Margin" helper="Maintenance %">
                <MetallicDial
                  value={defaults.minMarginRatio}
                  onChange={(v) => onChange({ minMarginRatio: v })}
                  min={10} max={50} unit="%"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Position Management */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Position Management</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Size Multiplier">
                <HorizontalSlider
                  value={defaults.positionSizeMultiplier}
                  onChange={(v) => onChange({ positionSizeMultiplier: v })}
                  min={0.1} max={3} step={0.1} unit="x"
                />
              </ControlRow>
              <ControlRow label="Stop Distance">
                <MetallicDial
                  value={defaults.stopLossDistance}
                  onChange={(v) => onChange({ stopLossDistance: v })}
                  min={1} max={20} step={0.5} unit="%"
                />
              </ControlRow>
              <ControlRow label="Profit Distance">
                <MetallicDial
                  value={defaults.takeProfitDistance}
                  onChange={(v) => onChange({ takeProfitDistance: v })}
                  min={2} max={50} unit="%"
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Controls (Section 3) */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Risk Controls</div>
          <ToggleSwitch
            value={defaults.trailingStopEnabled}
            onChange={(v) => onChange({ trailingStopEnabled: v })}
          />
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.denseGrid}>
            <ControlRow label="Max Funding Rate">
              <MetallicDial
                value={defaults.maxFundingRate}
                onChange={(v) => onChange({ maxFundingRate: v })}
                min={0} max={1} step={0.01} unit="%"
              />
            </ControlRow>
            <ControlRow label="Trailing Step" helper="If trailing enabled">
              <MetallicDial
                value={defaults.trailingStopDistance}
                onChange={(v) => onChange({ trailingStopDistance: v })}
                min={0.5} max={10} step={0.5} unit="%"
              />
            </ControlRow>
          </div>
        </div>
      </div>
    </div>
  );
}
