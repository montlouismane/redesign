'use client';

import React from 'react';
import { CollapsibleSection, ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { MetallicDial, HorizontalSlider, TagInput } from '../../controls';
import styles from '../AgentSettingsBoard.module.css';

export interface PredictionSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
}

/**
 * Prediction Mode Settings Component
 *
 * Configuration for prediction market trading strategy
 *
 * Sections:
 * - Prediction Parameters: Market selection, confidence thresholds
 * - Position Sizing: Stake sizing based on confidence
 * - Market Filters: Event types, time horizons
 */
export function PredictionSettings({ settings, onChange }: PredictionSettingsProps) {
  const defaults = {
    minPredictionConfidence: settings.minPredictionConfidence ?? 70,
    maxStakeSize: settings.maxStakeSize ?? 500,
    minStakeSize: settings.minStakeSize ?? 50,
    eventTypes: settings.eventTypes ?? [],
    maxTimeHorizon: settings.maxTimeHorizon ?? 72,
    minLiquidity: settings.minLiquidity ?? 1000,
  };

  return (
    <div className={styles.gridContainer}>
      {/* Prediction Parameters (Wide) */}
      <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Prediction Strategy</div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.denseGrid}>
            <ControlRow label="Min Confidence">
              <MetallicDial
                value={defaults.minPredictionConfidence}
                onChange={(value) => onChange({ minPredictionConfidence: value })}
                min={50} max={95} safeMin={65} safeMax={80} unit="%"
              />
            </ControlRow>
            <ControlRow label="Time Horizon" helper="Max hours">
              <HorizontalSlider
                value={defaults.maxTimeHorizon}
                onChange={(value) => onChange({ maxTimeHorizon: value })}
                min={1} max={720} step={1} unit="hrs"
              />
            </ControlRow>
            <ControlRow label="Min Liquidity">
              <HorizontalSlider
                value={defaults.minLiquidity}
                onChange={(value) => onChange({ minLiquidity: value })}
                min={100} max={10000} step={100} unit="ADA"
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Position Sizing */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Staking Rules</div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.denseGrid}>
            <ControlRow label="Min Stake">
              <HorizontalSlider
                value={defaults.minStakeSize}
                onChange={(value) => onChange({ minStakeSize: value })}
                min={40} max={1000} unit="ADA"
              />
            </ControlRow>
            <ControlRow label="Max Stake">
              <HorizontalSlider
                value={defaults.maxStakeSize}
                onChange={(value) => onChange({ maxStakeSize: value })}
                min={100} max={5000} unit="ADA"
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Market Filters */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Markets</div>
        </div>
        <div className={styles.cardContent}>
          <ControlRow label="Event Types">
            <TagInput
              tags={defaults.eventTypes}
              onChange={(tags) => onChange({ eventTypes: tags })}
              placeholder="Sports, Crypto..."
            />
          </ControlRow>
        </div>
      </div>
    </div>
  );
}
