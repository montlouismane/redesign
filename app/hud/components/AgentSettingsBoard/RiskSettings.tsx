'use client';

import React from 'react';
import { ControlRow } from './CollapsibleSection';
import { RiskConfig } from './AgentSettingsBoard';
import { MetallicDial } from '../controls/MetallicDial';
import { HorizontalSlider } from '../controls/HorizontalSlider';
import { VerticalSlider } from '../controls/VerticalSlider';
import { HudToggle } from '../controls/HudToggle';
import styles from './AgentSettingsBoard.module.css';

export interface RiskSettingsProps {
  settings: RiskConfig;
  onChange: (settings: Partial<RiskConfig>) => void;
}

/**
 * Risk Settings Component
 *
 * Shared risk management configuration across all trading modes.
 * Uses unified board layout for seamless panel feel.
 *
 * Sections:
 * - Edge Gate: Net edge validation before trades
 * - Liquidity Guard: Market impact and liquidity checks
 * - Cooldowns: Per-asset trade spacing rules
 * - Portfolio Risk: Overall position and loss limits
 * - Dry Run: Testing mode with virtual funds
 */
export function RiskSettings({ settings, onChange }: RiskSettingsProps) {
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
      {/* Row: Edge Gate & Liquidity Guard */}
      <div className={styles.sectionRow}>
        {/* Edge Gate */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Edge Gate</div>
            <HudToggle
              value={settings.edgeGateEnabled ?? false}
              onChange={(value) => onChange({ edgeGateEnabled: value })}
            />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              <ControlRow
                label="Min Net Edge"
                helper="Minimum profit margin required"
              >
                <MetallicDial
                  value={settings.minNetEdge ?? 0.5}
                  onChange={(value) => onChange({ minNetEdge: value })}
                  min={0}
                  max={10}
                  step={0.1}
                  unit="%"
                />
              </ControlRow>
              <ControlRow label="Log Skips" helper="Record skipped trades">
                <HudToggle
                  value={settings.logSkippedEdge ?? true}
                  onChange={(value) => onChange({ logSkippedEdge: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Liquidity Guard */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Liquidity Guard</div>
            <HudToggle
              value={settings.liquidityGuardEnabled ?? true}
              onChange={(value) => onChange({ liquidityGuardEnabled: value })}
            />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              <ControlRow label="Max Impact" helper="Max slippage impact">
                <MetallicDial
                  value={settings.maxImpact ?? 3.0}
                  onChange={(value) => onChange({ maxImpact: value })}
                  min={0.5} max={20} step={0.5} unit="%"
                />
              </ControlRow>
              <ControlRow label="Auto Downsize" helper="Reduce size if impact high">
                <HudToggle
                  value={settings.autoDownsize ?? true}
                  onChange={(value) => onChange({ autoDownsize: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Cooldown Rules (Full Width) */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Cooldown Rules</div>
          <HudToggle
            value={settings.perAssetCooldownEnabled ?? true}
            onChange={(value) => onChange({ perAssetCooldownEnabled: value })}
          />
        </div>
        <div className={styles.sectionContent}>
          {/* 3 controls = 3-col (responsive: 2+1 centered on smaller) */}
          <div className={styles.grid3col}>
            <ControlRow label="Win Cooldown">
              <VerticalSlider
                value={settings.winCooldown ?? 15}
                onChange={(value) => onChange({ winCooldown: value })}
                min={0} max={10} step={1} unit="min"
              />
            </ControlRow>
            <ControlRow label="Loss Cooldown">
              <VerticalSlider
                value={settings.lossCooldown ?? 60}
                onChange={(value) => onChange({ lossCooldown: value })}
                min={0} max={120} step={5} unit="min"
              />
            </ControlRow>
            <ControlRow label="Scratch Cooldown">
              <VerticalSlider
                value={settings.scratchCooldown ?? 30}
                onChange={(value) => onChange({ scratchCooldown: value })}
                min={0} max={60} step={1} unit="min"
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Row: Portfolio Risk & Simulation Mode */}
      <div className={styles.sectionRow}>
        {/* Portfolio Risk */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Portfolio Risk</div>
          </div>
          <div className={styles.sectionContent}>
            <ControlRow label="Max Open Positions">
              <HorizontalSlider
                value={settings.maxOpenPositions ?? 10}
                onChange={(value) => onChange({ maxOpenPositions: value })}
                min={1} max={50} step={1} unit=""
              />
            </ControlRow>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', marginTop: '16px' }}>
              <ControlRow label="Max Position %">
                <MetallicDial
                  value={settings.maxSinglePosition ?? 20}
                  onChange={(value) => onChange({ maxSinglePosition: value })}
                  min={1} max={100} unit="%"
                />
              </ControlRow>
              <ControlRow label="Max Daily Loss">
                <MetallicDial
                  value={settings.maxDailyLoss ?? 10}
                  onChange={(value) => onChange({ maxDailyLoss: value })}
                  min={1} max={50} unit="%"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Simulation Mode */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Simulation Mode</div>
            <HudToggle
              value={settings.dryRunEnabled ?? false}
              onChange={(value) => onChange({ dryRunEnabled: value })}
            />
          </div>
          <div className={styles.sectionContent}>
            <ControlRow label="Starting Capital">
              <HorizontalSlider
                value={settings.virtualAda ?? 10000}
                onChange={(value) => onChange({ virtualAda: value })}
                min={100} max={50000} step={100} unit="ADA"
              />
            </ControlRow>
            <div style={{ marginTop: '16px' }}>
              <ControlRow label="Log to DB">
                <HudToggle
                  value={settings.logToDatabase ?? true}
                  onChange={(value) => onChange({ logToDatabase: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
