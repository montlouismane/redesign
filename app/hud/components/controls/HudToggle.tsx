'use client';

import React from 'react';
import { useControlSound } from './useControlSound';
import styles from './HudToggle.module.css';

interface HudToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color when active */
  activeColor?: 'green' | 'copper' | 'blue';
}

/**
 * HudToggle - Angular on/off switch matching HUD dashboard aesthetic
 *
 * Features:
 * - Cut corner design matching dashboard panels
 * - LED indicator glow when active
 * - Audio feedback on toggle
 * - Three size variants
 * - Three color variants
 *
 * Usage:
 * <HudToggle
 *   value={isTradingActive}
 *   onChange={(v) => setIsTradingActive(v)}
 *   size="medium"
 *   activeColor="green"
 * />
 */
export function HudToggle({
  value,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  activeColor = 'green',
}: HudToggleProps) {
  const { playTick } = useControlSound('toggle');

  const handleToggle = () => {
    if (disabled) return;
    playTick(value ? 'down' : 'up');
    onChange(!value);
  };

  return (
    <div
      className={styles.hudToggle}
      data-disabled={disabled}
      data-size={size}
    >
      {label && <span className={styles.label}>{label}</span>}

      <button
        type="button"
        className={styles.track}
        onClick={handleToggle}
        disabled={disabled}
        role="switch"
        aria-checked={value}
        aria-label={label}
        data-active={value}
        data-color={activeColor}
      >
        {/* Background fill that animates */}
        <span className={styles.fill} data-active={value} data-color={activeColor} />

        {/* Cut corner accents */}
        <span className={styles.cornerTL} />
        <span className={styles.cornerBR} />

        {/* Slider thumb with cut corner */}
        <span className={styles.thumb} data-active={value}>
          <span className={styles.thumbCorner} />
          {/* LED indicator */}
          <span className={styles.led} data-active={value} data-color={activeColor} />
        </span>

        {/* Status labels */}
        <span className={styles.labelOff} data-active={value}>OFF</span>
        <span className={styles.labelOn} data-active={value}>ON</span>
      </button>
    </div>
  );
}
