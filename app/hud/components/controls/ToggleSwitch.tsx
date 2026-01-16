'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useClickSound } from './useClickSound';
import styles from './controls.module.css';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * ToggleSwitch - Mechanical on/off control
 *
 * Features:
 * - Copper lever styling with spring animation
 * - LED glow indicator when ON (green)
 * - Audio feedback on toggle
 * - Accessibility support
 *
 * Usage:
 * <ToggleSwitch
 *   value={isEnabled}
 *   onChange={(v) => setIsEnabled(v)}
 *   label="Auto-Rebalance"
 * />
 */
export function ToggleSwitch({
  value,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  const { playClick } = useClickSound();

  const { x, backgroundColor } = useSpring({
    x: value ? 28 : 0,
    backgroundColor: value ? 'rgba(53, 255, 155, 0.2)' : 'rgba(0, 0, 0, 0.3)',
    config: { tension: 300, friction: 20 },
  });

  const handleToggle = () => {
    if (disabled) return;
    playClick();
    onChange(!value);
  };

  return (
    <div className={styles.toggleSwitch} data-disabled={disabled}>
      {label && <div className={styles.controlLabel}>{label}</div>}

      <button
        className={styles.toggleTrack}
        onClick={handleToggle}
        disabled={disabled}
        role="switch"
        aria-checked={value}
        aria-label={label}
      >
        <animated.div
          className={styles.toggleBackground}
          style={{ backgroundColor }}
        />

        {/* LED indicator */}
        <div className={styles.toggleLed} data-on={value}>
          <div className={styles.toggleLedCore} />
        </div>

        {/* Lever/thumb */}
        <animated.div
          className={styles.toggleLever}
          style={{
            transform: x.to((val) => `translateX(${val}px)`),
          }}
        >
          {/* Lever notch detail */}
          <div className={styles.toggleLeverNotch} />
        </animated.div>

        {/* Labels */}
        <span className={styles.toggleLabelOff}>OFF</span>
        <span className={styles.toggleLabelOn}>ON</span>
      </button>
    </div>
  );
}
