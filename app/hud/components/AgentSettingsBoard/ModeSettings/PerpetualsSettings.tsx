'use client';

import React from 'react';
import { ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { VerticalSlider } from '../../controls/VerticalSlider';
import { MetallicDial } from '../../controls/MetallicDial';
import { HudToggle } from '../../controls/HudToggle';
import { TimeAdjuster } from '../../controls/TimeAdjuster';
import styles from '../AgentSettingsBoard.module.css';

export interface PerpetualsSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
}

/**
 * Perpetuals Mode Settings Component
 *
 * Configuration for perpetuals/futures trading strategy
 */
export function PerpetualsSettings({ settings, onChange }: PerpetualsSettingsProps) {
  const updateSetting = (key: string, value: unknown) => {
    onChange({ [key]: value });
  };

  const defaults = {
    // Leverage Settings
    maxLeverage: settings.maxLeverage ?? 2,
    defaultLeverage: settings.defaultLeverage ?? 3,
    maxPositionSize: settings.maxPositionSize ?? 100,

    // Risk Controls
    stopLoss: settings.stopLoss ?? 5,
    takeProfit: settings.takeProfit ?? 15,
    riskLimit: settings.riskLimit ?? 10,
    minCollateral: settings.minCollateral ?? 20,

    // Allowed Assets
    allowedAssets: settings.allowedAssets ?? ['ADA', 'SNEK', 'WMTX', 'IAG'],

    // Position Limits
    maxConcurrent: settings.maxConcurrent ?? 4,
    maxPerAsset: settings.maxPerAsset ?? 1,
    maxOpensPerCycle: settings.maxOpensPerCycle ?? 1,
    priceTrigger: settings.priceTrigger ?? 1,
  };

  const toggleAsset = (asset: string) => {
    const current = defaults.allowedAssets;
    if (current.includes(asset)) {
      updateSetting('allowedAssets', current.filter((a: string) => a !== asset));
    } else {
      updateSetting('allowedAssets', [...current, asset]);
    }
  };

  const ASSET_OPTIONS = ['ADA', 'SNEK', 'WMTX', 'IAG', 'BTC'];

  return (
    <div className={styles.unifiedBoard}>
      {/* Top Row: Leverage (Left) & Risk (Right) */}
      <div className={styles.sectionRow} style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* LEVERAGE SETTINGS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Leverage Settings</div>
            <div className={styles.cardSubtitle} style={{ fontSize: '11px', opacity: 0.7 }}>Position leverage controls</div>
          </div>
          <div className={styles.sectionContent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <ControlRow label="Max Leverage" helper="">
                <VerticalSlider
                  value={defaults.maxLeverage}
                  onChange={(v) => updateSetting('maxLeverage', v)}
                  min={1} max={10} step={1} unit="x"
                />
              </ControlRow>
              <ControlRow label="Default Leverage" helper="">
                <VerticalSlider
                  value={defaults.defaultLeverage}
                  onChange={(v) => updateSetting('defaultLeverage', v)}
                  min={1} max={10} step={1} unit="x"
                />
              </ControlRow>
            </div>
            <ControlRow label="Max Position Size (ADA)" helper="">
              <div style={{ width: '90%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                <HorizontalSlider
                  value={defaults.maxPositionSize}
                  onChange={(v) => updateSetting('maxPositionSize', v)}
                  min={10} max={1000} step={10} inputMin={0} unit="ADA"
                />
              </div>
            </ControlRow>
          </div>
        </div>

        {/* RISK CONTROLS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Risk Controls</div>
            <div className={styles.cardSubtitle} style={{ fontSize: '11px', opacity: 0.7 }}>Stop loss, take profit, and limits</div>
          </div>
          <div className={styles.sectionContent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', rowGap: '24px' }}>
              <ControlRow label="Stop Loss" helper="">
                <MetallicDial
                  value={defaults.stopLoss}
                  onChange={(v) => updateSetting('stopLoss', v)}
                  min={1} max={50} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Take Profit" helper="">
                <MetallicDial
                  value={defaults.takeProfit}
                  onChange={(v) => updateSetting('takeProfit', v)}
                  min={2} max={100} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Risk Limit" helper="">
                <MetallicDial
                  value={defaults.riskLimit}
                  onChange={(v) => updateSetting('riskLimit', v)}
                  min={5} max={50} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Min Collateral (USD)" helper="">
                <div style={{ width: '90%', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
                  <HorizontalSlider
                    value={defaults.minCollateral}
                    onChange={(v) => updateSetting('minCollateral', v)}
                    min={10} max={500} step={10}
                    unit="$"
                  />
                </div>
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Assets (Left) & Limits (Right) */}
      <div className={styles.sectionRow} style={{ gridTemplateColumns: '1fr 1fr' }}>

        {/* ALLOWED ASSETS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Allowed Assets</div>
            <div className={styles.cardSubtitle} style={{ fontSize: '11px', opacity: 0.7 }}>Which assets to trade</div>
          </div>
          <div className={styles.sectionContent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {ASSET_OPTIONS.map(asset => (
                <div key={asset} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--borderLight)'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    color: defaults.allowedAssets.includes(asset) ? 'var(--textDisplay)' : 'var(--textMuted)'
                  }}>
                    {asset}
                  </span>
                  <HudToggle
                    value={defaults.allowedAssets.includes(asset)}
                    onChange={() => toggleAsset(asset)}
                    activeColor="copper"
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* POSITION LIMITS */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Position Limits</div>
            <div className={styles.cardSubtitle} style={{ fontSize: '11px', opacity: 0.7 }}>Concurrent position controls</div>
          </div>
          <div className={styles.sectionContent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', rowGap: '24px' }}>
              <ControlRow label="Max Concurrent" helper="">
                <TimeAdjuster
                  value={defaults.maxConcurrent}
                  onChange={(v) => updateSetting('maxConcurrent', v)}
                  min={1} max={10} step={1} unit=""
                />
              </ControlRow>
              <ControlRow label="Max Per Asset" helper="">
                <TimeAdjuster
                  value={defaults.maxPerAsset}
                  onChange={(v) => updateSetting('maxPerAsset', v)}
                  min={1} max={5} step={1} unit=""
                />
              </ControlRow>
              <ControlRow label="Max Opens/Cycle" helper="">
                <TimeAdjuster
                  value={defaults.maxOpensPerCycle}
                  onChange={(v) => updateSetting('maxOpensPerCycle', v)}
                  min={1} max={5} step={1} unit=""
                />
              </ControlRow>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel} style={{ position: 'relative', top: '-35px', zIndex: 1, marginBottom: '0' }}>Price Trigger</label>
                <div style={{ marginTop: '-40px', paddingBottom: '20px' }}>
                  <MetallicDial
                    value={defaults.priceTrigger}
                    onChange={(v) => updateSetting('priceTrigger', v)}
                    min={0.5} max={5} step={0.1} unit="%"
                    size={100}
                    tickHeightRatio={0.45}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
