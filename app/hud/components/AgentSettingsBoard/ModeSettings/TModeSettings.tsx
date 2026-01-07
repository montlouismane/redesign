'use client';

import React from 'react';
import { CollapsibleSection, ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import styles from '../AgentSettingsBoard.module.css';
import {
  MetallicDial,
  HorizontalSlider,
  VerticalSlider,
  ToggleSwitch,
  TagInput
} from '@/app/hud/components/controls';

export interface TModeSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
}

/**
 * T-Mode Settings Component
 *
 * Configuration for T-Mode trading strategy
 *
 * Sections:
 * - Buy Configuration: Confidence thresholds, tier sizing
 * - Sell Configuration: Stop loss, take profit, triggers
 * - Safety Controls: Hold times, profit unlocks, emergency stops
 * - Token Management: Blacklist management
 * - Paper Trading: Enable simulated trading
 *
 * Safe ranges are indicated in helper text for each control
 */
export function TModeSettings({ settings, onChange }: TModeSettingsProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  // Default values for T-Mode
  const defaults = {
    minBuyConfidence: settings.minBuyConfidence ?? 65,
    lowTierSize: settings.lowTierSize ?? 40,
    midTierSize: settings.midTierSize ?? 80,
    highTierSize: settings.highTierSize ?? 120,
    stopLoss: settings.stopLoss ?? 10,
    takeProfit: settings.takeProfit ?? 93,
    priceTrigger: settings.priceTrigger ?? 3.5,
    reEntryCooldown: settings.reEntryCooldown ?? 30,
    minHoldTime: settings.minHoldTime ?? 30,
    profitUnlock: settings.profitUnlock ?? 20,
    emergencyStop: settings.emergencyStop ?? -6,
    trailingUnlock: settings.trailingUnlock ?? 0,
    tokenBlacklist: settings.tokenBlacklist ?? [],
    paperTradingEnabled: settings.paperTradingEnabled ?? false,
  };

  return (
    <div className={styles.unifiedBoard}>
      {/* Entry Strategy (Section 1) */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Entry Strategy</div>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <ControlRow label="Min Buy Confidence">
              <MetallicDial
                value={defaults.minBuyConfidence}
                onChange={(value) => updateSetting('minBuyConfidence', value)}
                min={10} max={100} safeMin={60} safeMax={80} unit="%"
              />
            </ControlRow>
            <ControlRow label="Low Confidence Size">
              <HorizontalSlider
                value={defaults.lowTierSize}
                onChange={(value) => updateSetting('lowTierSize', value)}
                min={40} max={1000} unit="ADA"
              />
            </ControlRow>
            <ControlRow label="Mid Confidence Size">
              <HorizontalSlider
                value={defaults.midTierSize}
                onChange={(value) => updateSetting('midTierSize', value)}
                min={40} max={2000} unit="ADA"
              />
            </ControlRow>
            <ControlRow label="High Confidence Size">
              <HorizontalSlider
                value={defaults.highTierSize}
                onChange={(value) => updateSetting('highTierSize', value)}
                min={40} max={5000} unit="ADA"
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Row: Exit & Safety */}
      <div className={styles.sectionRow}>
        {/* Exit Strategy */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Exit Strategy</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Stop Loss">
                <MetallicDial
                  value={defaults.stopLoss}
                  onChange={(value) => updateSetting('stopLoss', value)}
                  min={0.1} max={50} step={0.1} unit="%"
                />
              </ControlRow>
              <ControlRow label="Take Profit">
                <MetallicDial
                  value={defaults.takeProfit}
                  onChange={(value) => updateSetting('takeProfit', value)}
                  min={1} max={100} unit="%"
                />
              </ControlRow>
              <ControlRow label="Price Trigger">
                <MetallicDial
                  value={defaults.priceTrigger}
                  onChange={(value) => updateSetting('priceTrigger', value)}
                  min={0.5} max={10} step={0.1} unit="%"
                />
              </ControlRow>
              <ControlRow label="Re-entry Wait">
                <VerticalSlider
                  value={defaults.reEntryCooldown}
                  onChange={(value) => updateSetting('reEntryCooldown', value)}
                  min={1} max={120} unit="min"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Safety Controls */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Safety Controls</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Min Hold Time">
                <VerticalSlider
                  value={defaults.minHoldTime}
                  onChange={(value) => updateSetting('minHoldTime', value)}
                  min={1} max={120} unit="min"
                />
              </ControlRow>
              <ControlRow label="Emergency Stop">
                <MetallicDial
                  value={defaults.emergencyStop}
                  onChange={(value) => updateSetting('emergencyStop', value)}
                  min={-50} max={0} step={0.1} unit="%"
                />
              </ControlRow>
              <ControlRow label="Profit Unlock">
                <MetallicDial
                  value={defaults.profitUnlock}
                  onChange={(value) => updateSetting('profitUnlock', value)}
                  min={0} max={50} unit="%"
                />
              </ControlRow>
              <ControlRow label="Trailing Step">
                <MetallicDial
                  value={defaults.trailingUnlock}
                  onChange={(value) => updateSetting('trailingUnlock', value)}
                  min={0} max={20} unit="%"
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls (Section 3) */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Admin Controls</div>
          <ToggleSwitch
            value={defaults.paperTradingEnabled}
            onChange={(value) => updateSetting('paperTradingEnabled', value)}
          />
        </div>
        <div className={styles.sectionContent}>
          <ControlRow label="Token Blacklist" helper="Exclude symbols">
            <TagInput
              tags={defaults.tokenBlacklist}
              onChange={(tags) => updateSetting('tokenBlacklist', tags)}
              placeholder="Add token symbol..."
            />
          </ControlRow>
        </div>
      </div>
    </div>
  );
}
