'use client';

import React from 'react';
import { X } from 'lucide-react';
import styles from './AgentSettingsBoard.module.css';

export interface HelpItem {
  field: string;
  description: string;
  example?: string;
}

export interface HelpModalProps {
  title: string;
  items: HelpItem[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Help Modal Component
 *
 * Provides contextual help for settings sections
 *
 * Usage:
 * ```tsx
 * <HelpModal
 *   title="Buy Configuration"
 *   items={[
 *     {
 *       field: "Min Buy Confidence",
 *       description: "Minimum confidence score required to execute a buy order",
 *       example: "Set to 65% for moderate risk, 75% for conservative"
 *     }
 *   ]}
 *   isOpen={showHelp}
 *   onClose={() => setShowHelp(false)}
 * />
 * ```
 */
export function HelpModal({ title, items, isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.helpModal} onClick={handleOverlayClick}>
      <div className={styles.helpContent}>
        <div className={styles.helpHeader}>
          <h2 className={styles.helpTitle}>{title}</h2>
          <button
            className={styles.helpClose}
            onClick={onClose}
            aria-label="Close help"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.helpList}>
          {items.map((item, index) => (
            <div key={index} className={styles.helpItem}>
              <div className={styles.helpFieldName}>{item.field}</div>
              <div className={styles.helpFieldDesc}>{item.description}</div>
              {item.example && (
                <div className={styles.helpFieldExample}>
                  Example: {item.example}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Predefined help content for common sections
 */
export const HELP_CONTENT = {
  buyConfiguration: {
    title: "Buy Configuration",
    items: [
      {
        field: "Min Buy Confidence",
        description: "Minimum confidence score (0-100%) required to execute a buy order. Higher values mean fewer but higher-quality trades.",
        example: "65% for balanced approach, 75% for conservative, 55% for aggressive"
      },
      {
        field: "Low Tier Size",
        description: "Position size in ADA for low confidence signals (just above minimum threshold).",
        example: "40 ADA for cautious entry, 80 ADA for moderate"
      },
      {
        field: "Mid Tier Size",
        description: "Position size in ADA for medium confidence signals (well above threshold).",
        example: "80 ADA for balanced, 150 ADA for aggressive"
      },
      {
        field: "High Tier Size",
        description: "Position size in ADA for high confidence signals (near certainty).",
        example: "120 ADA for conservative, 250 ADA for aggressive"
      },
    ],
  },
  sellConfiguration: {
    title: "Sell Configuration",
    items: [
      {
        field: "Stop Loss",
        description: "Maximum acceptable loss percentage before automatically exiting position.",
        example: "10% for balanced risk, 5% for tight stops, 15% for wide stops"
      },
      {
        field: "Take Profit",
        description: "Target profit percentage for automatic position exit.",
        example: "20% for quick profits, 50% for letting winners run"
      },
      {
        field: "Price Trigger",
        description: "Minimum price movement percentage to evaluate exit conditions.",
        example: "3.5% to avoid noise, 1% for tight management"
      },
      {
        field: "Re-entry Cooldown",
        description: "Minutes to wait before trading the same asset again.",
        example: "30 min to avoid overtrading, 60 min for conservative"
      },
    ],
  },
  safetyControls: {
    title: "Safety Controls",
    items: [
      {
        field: "Min Hold Time",
        description: "Minimum minutes to hold a position before allowing exit (prevents panic selling).",
        example: "30 min for volatile markets, 15 min for liquid markets"
      },
      {
        field: "Profit Unlock",
        description: "Profit percentage threshold to activate trailing stop loss.",
        example: "20% to lock in gains, 10% for early protection"
      },
      {
        field: "Emergency Stop",
        description: "Drawdown percentage that triggers full system shutdown.",
        example: "-6% for moderate safety, -10% for aggressive"
      },
      {
        field: "Trailing Unlock",
        description: "Distance percentage for trailing stop after profit unlock.",
        example: "5% to protect most gains, 10% for more breathing room"
      },
    ],
  },
  riskManagement: {
    title: "Risk Management",
    items: [
      {
        field: "Edge Gate",
        description: "Requires positive expected value (net edge) before executing trades.",
        example: "Enable for systematic trading, disable for manual override"
      },
      {
        field: "Liquidity Guard",
        description: "Protects against high slippage in illiquid markets by checking market depth.",
        example: "3% max impact for safety, 5% for flexibility"
      },
      {
        field: "Max Open Positions",
        description: "Maximum number of concurrent positions to limit exposure.",
        example: "10 positions for diversification, 5 for focus"
      },
      {
        field: "Max Daily Loss",
        description: "Circuit breaker that stops all trading if daily loss exceeds threshold.",
        example: "10% for balanced protection, 5% for conservative"
      },
    ],
  },
};
