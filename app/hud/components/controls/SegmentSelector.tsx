'use client';

import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useClickSound } from './useClickSound';
import styles from './controls.module.css';

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentOption[];
  disabled?: boolean;
}

/**
 * SegmentSelector - Mode picker with tabs
 *
 * Features:
 * - Active segment has copper backlight glow
 * - Smooth sliding indicator animation
 * - Click to switch modes
 *
 * Usage:
 * <SegmentSelector
 *   value={mode}
 *   onChange={(v) => setMode(v)}
 *   options={[
 *     { value: 'standard', label: 'STANDARD' },
 *     { value: 't-mode', label: 'T-MODE' },
 *     { value: 'predict', label: 'PREDICT' },
 *     { value: 'perps', label: 'PERPS' },
 *   ]}
 * />
 */
export function SegmentSelector({
  value,
  onChange,
  options,
  disabled = false,
}: SegmentSelectorProps) {
  const { playClick } = useClickSound();

  const activeIndex = options.findIndex((opt) => opt.value === value);
  const segmentWidth = 100 / options.length;

  const { left } = useSpring({
    left: activeIndex * segmentWidth,
    config: { tension: 300, friction: 26 },
  });

  const handleSelect = (optionValue: string) => {
    if (disabled || optionValue === value) return;
    playClick();
    onChange(optionValue);
  };

  return (
    <div className={styles.segmentSelector} data-disabled={disabled}>
      <div className={styles.segmentTrack}>
        {/* Animated active indicator */}
        <animated.div
          className={styles.segmentIndicator}
          style={{
            left: left.to((l) => `${l}%`),
            width: `${segmentWidth}%`,
          }}
        />

        {/* Segment buttons */}
        {options.map((option) => (
          <button
            key={option.value}
            className={styles.segmentBtn}
            data-active={option.value === value}
            onClick={() => handleSelect(option.value)}
            disabled={disabled}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
