'use client';

import { ControlRow } from '../CollapsibleSection';
import { AgentSettings } from '../AgentSettingsBoard';
import styles from '../AgentSettingsBoard.module.css';
import {
  MetallicDial,
  HorizontalSlider,
  TimeAdjuster,
  TagInput,
} from '@/app/hud/components/controls';
import { HelpCircle, Settings2 } from 'lucide-react';

export interface TModeSettingsProps {
  settings: AgentSettings;
  onChange: (settings: Partial<AgentSettings>) => void;
  onFaqClick?: () => void;
  onAdvancedClick?: () => void;
}

/**
 * T-Mode Settings Component - Primary View
 *
 * Compact layout with efficient space usage:
 * - Buy Configuration: Confidence dial + Low/Mid/High tier sliders
 * - Sell Configuration: Stop Loss/Take Profit, Price Trigger, Re-entry
 * - Token Blacklist: Exclude specific tokens from trading
 *
 * Note: Recent Buy Guard (Min Hold, Profit Unlock, Emergency Stop) is now global
 * and configured in the Risk Management tab.
 */
export function TModeSettings({ settings, onChange, onFaqClick, onAdvancedClick }: TModeSettingsProps) {
  const updateSetting = (key: string, value: unknown) => {
    onChange({ ...settings, [key]: value });
  };

  const defaults = {
    // Buy Configuration
    minBuyConfidence: settings.minBuyConfidence ?? 68,
    lowTierSize: settings.lowTierSize ?? 250,
    midTierSize: settings.midTierSize ?? 500,
    highTierSize: settings.highTierSize ?? 1000,

    // Sell Configuration
    stopLoss: settings.stopLoss ?? 10,
    takeProfit: settings.takeProfit ?? 10,
    priceTrigger: settings.priceTrigger ?? 1,
    reEntryCooldown: settings.reEntryCooldown ?? 30,

    // Blacklist
    tokenBlacklist: settings.tokenBlacklist ?? [],
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
      {/* Header with FAQ and Advanced buttons */}
      <div className={styles.section} style={{ background: 'transparent', border: 'none', padding: '0 0 8px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {onAdvancedClick && (
            <button
              className={styles.faqButton}
              onClick={onAdvancedClick}
              title="Advanced Settings"
            >
              <Settings2 size={14} />
              Advanced
            </button>
          )}
          {onFaqClick && (
            <button className={styles.faqButton} onClick={onFaqClick} title="View T-Mode FAQ">
              <HelpCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Row: Buy Configuration | Sell Configuration */}
      <div className={styles.sectionRow}>
        {/* Buy Configuration - 4 column layout */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Buy Configuration</div>
          </div>
          <div className={styles.sectionContent}>
            {/* Confidence dial - primary control, centered and prominent */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <ControlRow label="Min Confidence" helper="AI threshold">
                <MetallicDial
                  value={defaults.minBuyConfidence}
                  onChange={(value) => updateSetting('minBuyConfidence', value)}
                  min={40} max={90} safeMin={65} safeMax={75} unit="%"
                  size={160}
                />
              </ControlRow>
            </div>

            {/* Tier Sizes - 3 across row (Low → Mid → High) */}
            <div className={styles.tierRow}>
              <ControlRow label="Low (ADA)" helper="Low confidence">
                <HorizontalSlider
                  value={defaults.lowTierSize}
                  onChange={(value) => updateSetting('lowTierSize', value)}
                  min={50} max={250} step={10} inputMin={0} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="Mid (ADA)" helper="Mid confidence">
                <HorizontalSlider
                  value={defaults.midTierSize}
                  onChange={(value) => updateSetting('midTierSize', value)}
                  min={75} max={500} step={25} inputMin={0} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="High (ADA)" helper="High confidence">
                <HorizontalSlider
                  value={defaults.highTierSize}
                  onChange={(value) => updateSetting('highTierSize', value)}
                  min={100} max={750} step={25} inputMin={0} unit="ADA"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Sell Configuration - 2 column layout */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Sell Configuration</div>
          </div>
          <div className={styles.sectionContent}>
            {/* 4 controls = 2x2 grid */}
            <div className={styles.grid2x2}>
              <ControlRow label="Stop Loss" helper="Exit on drop">
                <MetallicDial
                  value={defaults.stopLoss}
                  onChange={(value) => updateSetting('stopLoss', value)}
                  min={0} max={50} safeMin={5} safeMax={20} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Take Profit" helper="Exit on rise">
                <MetallicDial
                  value={defaults.takeProfit}
                  onChange={(value) => updateSetting('takeProfit', value)}
                  min={1} max={100} safeMin={5} safeMax={30} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Price Trigger" helper="Min price move before re-evaluation">
                <MetallicDial
                  value={defaults.priceTrigger}
                  onChange={(value) => updateSetting('priceTrigger', value)}
                  min={0.5} max={10} step={0.5} unit="%"
                  size={140}
                />
              </ControlRow>
              <ControlRow label="Re-entry Cooldown" helper="Token wait">
                <TimeAdjuster
                  value={defaults.reEntryCooldown}
                  onChange={(value) => updateSetting('reEntryCooldown', value)}
                  min={5} max={120} step={5} unit="min" size="large"
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Token Blacklist - Full width section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>Token Blacklist</div>
        </div>
        <div className={styles.sectionContent}>
          <TagInput
            tags={defaults.tokenBlacklist}
            onChange={(tags) => updateSetting('tokenBlacklist', tags)}
            placeholder="Add tokens to exclude: SCAM, RUG, FAKE..."
          />
        </div>
      </div>

    </div>
  );
}
