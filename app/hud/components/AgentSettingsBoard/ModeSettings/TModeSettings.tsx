'use client';

import { CollapsibleSection, ControlRow } from '../CollapsibleSection';
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
 * - Buy Configuration (4 cols): Confidence + Low/Mid/High, then Blacklist (3 cols) + Paper Trading (1 col)
 * - Sell Configuration (2 cols): Stop Loss/Take Profit (top), Price Trigger/Re-entry (bottom)
 *
 * Safety Controls (collapsible): Recent Buy Guard settings
 * Advanced Settings (modal): Market Controls, Horizon settings
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

    // Safety Controls
    minHoldTime: settings.minHoldTime ?? 30,
    profitUnlock: settings.profitUnlock ?? 20,
    emergencyStop: settings.emergencyStop ?? 6,
    trailingUnlock: settings.trailingUnlock ?? 0,
  };

  return (
    <div className={styles.unifiedBoard}>
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

      {/* Row: Buy Configuration (wider) | Sell Configuration (narrower) */}
      <div className={styles.sectionRow} style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Buy Configuration - 4 column layout */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Buy Configuration</div>
          </div>
          <div className={styles.sectionContent}>
            {/* Row 1: Confidence + Tier Sizes (4 columns) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <ControlRow label="Min Confidence" helper="AI threshold">
                <MetallicDial
                  value={defaults.minBuyConfidence}
                  onChange={(value) => updateSetting('minBuyConfidence', value)}
                  min={40} max={90} safeMin={65} safeMax={75} unit="%"
                />
              </ControlRow>
              <ControlRow label="Low (ADA)" helper="Low confidence buy">
                <HorizontalSlider
                  value={defaults.lowTierSize}
                  onChange={(value) => updateSetting('lowTierSize', value)}
                  min={50} max={250} step={10} inputMin={0} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="Mid (ADA)" helper="Mid confidence buy">
                <HorizontalSlider
                  value={defaults.midTierSize}
                  onChange={(value) => updateSetting('midTierSize', value)}
                  min={75} max={500} step={25} inputMin={0} unit="ADA"
                />
              </ControlRow>
              <ControlRow label="High (ADA)" helper="High confidence buy">
                <HorizontalSlider
                  value={defaults.highTierSize}
                  onChange={(value) => updateSetting('highTierSize', value)}
                  min={100} max={750} step={25} inputMin={0} unit="ADA"
                />
              </ControlRow>
            </div>

            {/* Divider */}
            <div style={{
              borderTop: '1px solid var(--borderLight)',
              margin: '8px 0 4px 0',
              opacity: 0.5
            }} />

            {/* Row 2: Token Blacklist (full width) */}
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--textMuted)',
                letterSpacing: '0.08em',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                Token Blacklist
              </div>
              <TagInput
                tags={defaults.tokenBlacklist}
                onChange={(tags) => updateSetting('tokenBlacklist', tags)}
                placeholder="SCAM, RUG, FAKE..."
              />
            </div>
          </div>
        </div>

        {/* Sell Configuration - 2 column layout */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>Sell Configuration</div>
          </div>
          <div className={styles.sectionContent}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <ControlRow label="Stop Loss" helper="Exit on drop">
                <MetallicDial
                  value={defaults.stopLoss}
                  onChange={(value) => updateSetting('stopLoss', value)}
                  min={0} max={50} safeMin={5} safeMax={20} unit="%"
                />
              </ControlRow>
              <ControlRow label="Take Profit" helper="Exit on rise">
                <MetallicDial
                  value={defaults.takeProfit}
                  onChange={(value) => updateSetting('takeProfit', value)}
                  min={1} max={100} safeMin={5} safeMax={30} unit="%"
                />
              </ControlRow>
              <ControlRow label="Price Trigger" helper="Min price move before re-evaluation">
                <HorizontalSlider
                  value={defaults.priceTrigger}
                  onChange={(value) => updateSetting('priceTrigger', value)}
                  min={0.5} max={10} step={0.5} unit="%"
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

      {/* Safety Controls - Collapsible */}
      <CollapsibleSection id="tmode-safety" title="Safety Controls" defaultExpanded={false}>
        <div className={styles.denseGrid}>
          <ControlRow label="Min Hold Time" helper="Hold period after buy">
            <TimeAdjuster
              value={defaults.minHoldTime}
              onChange={(value) => updateSetting('minHoldTime', value)}
              min={1} max={120} step={1} unit="min" size="large"
            />
          </ControlRow>
          <ControlRow label="Profit Unlock" helper="Bypasses hold time">
            <MetallicDial
              value={defaults.profitUnlock}
              onChange={(value) => updateSetting('profitUnlock', value)}
              min={0} max={50} safeMin={10} safeMax={30} unit="%"
            />
          </ControlRow>
          <ControlRow label="Emergency Stop" helper="Loss % triggers sell">
            <MetallicDial
              value={defaults.emergencyStop}
              onChange={(value) => updateSetting('emergencyStop', value)}
              min={0} max={50} safeMin={3} safeMax={15} unit="%"
            />
          </ControlRow>
          <ControlRow label="Trailing Unlock" helper="% from peak">
            <HorizontalSlider
              value={defaults.trailingUnlock}
              onChange={(value) => updateSetting('trailingUnlock', value)}
              min={0} max={20} step={1} unit="%"
            />
          </ControlRow>
        </div>
      </CollapsibleSection>
    </div>
  );
}
