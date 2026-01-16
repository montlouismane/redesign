'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './TimeAdjuster.module.css';

interface TimeAdjusterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  /** Size variant: 'default' or 'large' for better vertical fill */
  size?: 'default' | 'large';
}

/**
 * TimeAdjuster - Numeric timer control with +/- buttons
 *
 * A compact control designed for timer/cooldown values.
 * Features:
 * - +/- buttons with satisfying tactile click feedback
 * - Default 5-minute increment (configurable via step prop)
 * - Click-to-edit value display
 * - Copper metallic aesthetic matching other controls
 * - Touch-friendly sizing
 * - Audio click feedback via Web Audio API
 */
export function TimeAdjuster({
  value,
  onChange,
  min = 0,
  max = 120,
  step = 5,
  label,
  unit = 'min',
  disabled = false,
  size = 'default',
}: TimeAdjusterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a satisfying metallic click sound
  const playClickSound = useCallback((isIncrement: boolean) => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Create oscillator for click
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Slightly different pitch for increment vs decrement
      oscillator.frequency.setValueAtTime(isIncrement ? 880 : 660, ctx.currentTime);
      oscillator.type = 'sine';

      // Quick attack, fast decay for a "click" feel
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Audio not supported or blocked - fail silently
    }
  }, [getAudioContext]);

  // Handle increment
  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      playClickSound(true);
      onChange(newValue);
    }
  }, [disabled, max, value, step, onChange, playClickSound]);

  // Handle decrement
  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      playClickSound(false);
      onChange(newValue);
    }
  }, [disabled, min, value, step, onChange, playClickSound]);

  // Start editing on click
  const startEditing = useCallback(() => {
    if (disabled) return;
    setInputValue(String(value));
    setIsEditing(true);
  }, [disabled, value]);

  // Commit edit
  const commitEdit = useCallback(() => {
    const num = parseFloat(inputValue.replace(/,/g, ''));
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      const stepped = Math.round(clamped / step) * step;
      onChange(stepped);
    }
    setIsEditing(false);
  }, [inputValue, min, max, step, onChange]);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setInputValue(String(value));
    setIsEditing(false);
  }, [value]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [commitEdit, cancelEdit]);

  // Format display value
  const displayValue = step < 1 ? value.toFixed(1) : String(Math.round(value));

  return (
    <div
      className={styles.timeAdjuster}
      data-disabled={disabled}
      data-size={size}
    >
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.controlContainer}>
        {/* Decrement button */}
        <button
          type="button"
          className={styles.stepperButton}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label={`Decrease by ${step}`}
        >
          <span className={styles.stepperIcon}>−</span>
        </button>

        {/* Value display / edit */}
        {isEditing ? (
          <div className={styles.editContainer}>
            <input
              type="text"
              className={styles.valueInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              disabled={disabled}
              autoComplete="off"
              autoFocus
            />
          </div>
        ) : (
          <button
            type="button"
            className={styles.valueDisplay}
            onClick={startEditing}
            disabled={disabled}
          >
            <span className={styles.valueNumber}>{displayValue}</span>
            {unit && <span className={styles.valueUnit}>{unit}</span>}
          </button>
        )}

        {/* Increment button */}
        <button
          type="button"
          className={styles.stepperButton}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label={`Increase by ${step}`}
        >
          <span className={styles.stepperIcon}>+</span>
        </button>
      </div>

      <span className={styles.incrementHint}>±{step} {unit}</span>
    </div>
  );
}
