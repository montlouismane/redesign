'use client';

import React from 'react';
import { ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial, HorizontalSlider, SegmentSelector, HudToggle } from '../../controls';
import { HelpCircle } from 'lucide-react';
import styles from '../AgentSettingsBoard.module.css';

export interface PredictionSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
  onFaqClick?: () => void;
}

/**
 * Prediction Mode Settings Component
 *
 * Configuration for prediction market trading strategy
 * Matches production version with HUD visual style
 *
 * Sections:
 * - Prediction Parameters: Confidence thresholds, position sizing
 * - Trade Rules: Min ADA values, intervals, limit orders
 * - Mode Controls: Risk tolerance, paper trading
 */
export function PredictionSettings({ settings, onChange, onFaqClick }: PredictionSettingsProps) {
  const defaults = {
    minPredictionConfidence: settings.minPredictionConfidence ?? 60,
    maxPositionPct: settings.maxPositionPct ?? 25,
    minAdaFloor: settings.minAdaFloor ?? 50,
    minTradeAda: settings.minTradeAda ?? 5,
    reviewInterval: settings.reviewInterval ?? 120,
    riskTolerance: settings.riskTolerance ?? 'moderate',
    allowLimitOrders: settings.allowLimitOrders ?? false,
  };

  return (
    <div className={styles.unifiedBoard}>
      {/* Prediction Strategy */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Prediction Strategy</div>
          {onFaqClick && (
            <button
              className={styles.faqButton}
              onClick={onFaqClick}
              title="View Prediction Mode FAQ"
            >
              <HelpCircle size={14} />
              FAQ
            </button>
          )}
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.denseGrid}>
            <ControlRow label="Min Confidence" helper="Minimum prediction confidence">
              <MetallicDial
                value={defaults.minPredictionConfidence}
                onChange={(value) => onChange({ minPredictionConfidence: value })}
                min={50} max={95} safeMin={55} safeMax={85} unit="%"
              />
            </ControlRow>
            <ControlRow label="Max Position %" helper="AI check frequency">
              <MetallicDial
                value={defaults.maxPositionPct}
                onChange={(value) => onChange({ maxPositionPct: value })}
                min={1} max={100} safeMin={10} safeMax={50} unit="%"
              />
            </ControlRow>
            <ControlRow label="Risk Tolerance">
              <SegmentSelector
                value={defaults.riskTolerance}
                onChange={(value) => onChange({ riskTolerance: value })}
                options={[
                  { value: 'conservative', label: 'Conservative' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'aggressive', label: 'Aggressive' },
                ]}
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Row: Trade Rules & Controls */}
      <div className={styles.sectionRow}>
        {/* Trade Rules */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Trade Rules</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Min ADA Floor" helper="Minimum wallet balance">
                <HorizontalSlider
                  value={defaults.minAdaFloor}
                  onChange={(value) => onChange({ minAdaFloor: value })}
                  min={10} max={500} step={10} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="Min Trade ADA" helper="Minimum per trade">
                <HorizontalSlider
                  value={defaults.minTradeAda}
                  onChange={(value) => onChange({ minTradeAda: value })}
                  min={1} max={100} step={1} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="Review Interval" helper="Check frequency">
                <HorizontalSlider
                  value={defaults.reviewInterval}
                  onChange={(value) => onChange({ reviewInterval: value })}
                  min={5} max={720} step={5} unit="min"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Mode Controls */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Mode Controls</div>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid}>
              <ControlRow label="Allow Limit Orders" helper="Enable limit order placement">
                <HudToggle
                  value={defaults.allowLimitOrders}
                  onChange={(value) => onChange({ allowLimitOrders: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
