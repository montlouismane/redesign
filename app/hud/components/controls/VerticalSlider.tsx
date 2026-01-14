'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from './MetallicVerticalSlider.module.css';
import { useControlSound } from './useControlSound';

interface VerticalSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  safeMin?: number;
  safeMax?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  tickCount?: number;
  showTicks?: boolean;
  snapToTicks?: boolean;
}

/**
 * VerticalSlider - Premium metallic copper vertical slider
 *
 * Features:
 * - Native <input type="range"> for accessibility and browser compatibility
 * - 3D brushed copper aesthetic using CSS gradients
 * - Vertical orientation (height = time metaphor)
 * - Visible tick marks with optional snap behavior
 * - Floating value label that follows the thumb
 * - Safe zone highlighting (green tint)
 * - Full mouse and touch support
 * - Inline editable value display
 * - ARIA labels for accessibility
 */
export function VerticalSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  safeMin,
  safeMax,
  label,
  unit = 'min',
  disabled = false,
  tickCount = 11,
  showTicks = true,
  snapToTicks = false,
}: VerticalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const { playTick } = useControlSound('slider');
  const lastValueRef = useRef(value);

  // Calculate percentage for positioning (inverted for vertical - bottom = 0%, top = 100%)
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Safe zone percentages
  const safeMinPercent = safeMin !== undefined ? ((safeMin - min) / (max - min)) * 100 : 0;
  const safeMaxPercent = safeMax !== undefined ? ((safeMax - min) / (max - min)) * 100 : 100;
  const hasSafeZone = safeMin !== undefined && safeMax !== undefined;

  // Check if value is in safe zone
  const isInSafeZone = hasSafeZone ? value >= safeMin && value <= safeMax : true;

  // Generate tick positions (from bottom to top)
  const ticks = useMemo(() => {
    const tickArray: { position: number; value: number }[] = [];
    const tickStep = (max - min) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + i * tickStep;
      // Position from bottom (0% at bottom, 100% at top)
      const position = ((tickValue - min) / (max - min)) * 100;
      tickArray.push({ position, value: tickValue });
    }
    return tickArray;
  }, [min, max, tickCount]);

  // Snap to nearest tick if enabled
  const snapValue = useCallback((val: number): number => {
    if (!snapToTicks) return val;

    const tickStep = (max - min) / (tickCount - 1);
    const nearestTick = Math.round((val - min) / tickStep) * tickStep + min;
    return Math.max(min, Math.min(max, nearestTick));
  }, [min, max, tickCount, snapToTicks]);

  // Handle pointer down (drag start)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled || isEditing || !trackRef.current) return;

    e.preventDefault();
    setIsDragging(true);

    const track = trackRef.current;
    track.setPointerCapture(e.pointerId);

    const updateValue = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      const trackHeight = rect.height;
      // Calculate height from bottom
      const heightFromBottom = rect.bottom - clientY;
      const rawPercent = Math.min(100, Math.max(0, (heightFromBottom / trackHeight) * 100));

      const newValue = min + (rawPercent / 100) * (max - min);

      // Snap to step
      let steppedValue = Math.round(newValue / step) * step;
      steppedValue = Math.max(min, Math.min(max, steppedValue));

      if (snapToTicks) {
        steppedValue = snapValue(steppedValue);
      }

      onChange(steppedValue);
    };

    updateValue(e.clientY);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updateValue(moveEvent.clientY);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', handlePointerUp);
    };

    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', handlePointerUp);
  }, [disabled, isEditing, min, max, step, onChange, snapToTicks, snapValue]);

  // Listen for pointer move/up on track (handled via setPointerCapture implicitly or explicitly)
  // Actually, standard addEventListener on element works best with setPointerCapture

  // Play sound on value change
  useEffect(() => {
    if (value !== lastValueRef.current) {
      if (Math.abs(value - lastValueRef.current) >= step) {
        playTick();
        lastValueRef.current = value;
      }
    }
  }, [value, step, playTick]);

  // Inline editing handlers
  const startEditing = useCallback(() => {
    if (disabled) return;
    setInputValue(String(value));
    setIsEditing(true);
    setTimeout(() => {
      const input = document.querySelector(`.${styles.valueInput}`) as HTMLInputElement;
      input?.select();
    }, 0);
  }, [disabled, value]);

  const commitEdit = useCallback(() => {
    const num = parseFloat(inputValue.replace(/,/g, ''));
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, num));
      const stepped = Math.round(clamped / step) * step;
      onChange(stepped);
    }
    setIsEditing(false);
  }, [inputValue, min, max, step, onChange]);

  const cancelEdit = useCallback(() => {
    setInputValue(String(value));
    setIsEditing(false);
  }, [value]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  }, [commitEdit, cancelEdit]);

  const handleInputBlur = useCallback(() => {
    commitEdit();
  }, [commitEdit]);

  // Format display value
  const displayValue = step < 1 ? value.toFixed(1) : String(Math.round(value));

  return (
    <div
      className={styles.metallicVerticalSlider}
      data-disabled={disabled}
      data-dragging={isDragging}
      data-safe={isInSafeZone}
    >
      {label && (
        <label className={styles.sliderLabel}>
          {label}
        </label>
      )}

      <div
        className={styles.sliderContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track Area - defines the travel range */}
        <div
          className={styles.trackArea}
          ref={trackRef}
          onPointerDown={handlePointerDown}
        >
          {/* Track background with brushed metal effect */}
          <div className={styles.trackBackground}>
            {/* Safe zone highlight */}
            {hasSafeZone && (
              <div
                className={styles.safeZone}
                style={{
                  bottom: `${safeMinPercent}%`,
                  height: `${safeMaxPercent - safeMinPercent}%`,
                }}
              />
            )}

            {/* Fill bar showing current value (from bottom) */}
            <div
              className={styles.trackFill}
              style={{ height: `${percentage}%` }}
              data-safe={isInSafeZone}
            />
          </div>

          {/* Tick marks */}
          {showTicks && (
            <div className={styles.tickContainer}>
              {ticks.map((tick, index) => {
                const isInSafe = hasSafeZone
                  ? tick.value >= safeMin! && tick.value <= safeMax!
                  : false;
                return (
                  <div
                    key={index}
                    className={styles.tick}
                    style={{ bottom: `${tick.position}%` }}
                    data-active={tick.value <= value}
                    data-safe={isInSafe}
                    data-major={index === 0 || index === tickCount - 1 || index === Math.floor(tickCount / 2)}
                  />
                );
              })}
            </div>
          )}

          {/* Floating value label removed per user request */}

          {/* Custom thumb visual */}
          <div
            className={styles.thumbVisual}
            style={{ bottom: `${percentage}%` }}
            data-dragging={isDragging}
            data-safe={isInSafeZone}
          >
            <div className={styles.thumbInner} data-safe={isInSafeZone}>
              <div className={styles.thumbHighlight} />
              <div className={styles.thumbGroove} />
              <div className={styles.thumbGroove} />
            </div>
          </div>
        </div>
      </div>

      {/* Value display - inline editable */}
      {isEditing ? (
        <div className={styles.valueEditContainer}>
          <input
            type="text"
            className={styles.valueInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            disabled={disabled}
            autoComplete="off"
            autoFocus
          />
          <span className={styles.valueUnit}>{unit}</span>
        </div>
      ) : (
        <button
          className={styles.valueDisplay}
          onClick={startEditing}
          disabled={disabled}
          data-safe={isInSafeZone}
        >
          <span className={styles.valueNumber}>{displayValue}</span>
          {unit && <span className={styles.valueUnit}>{unit}</span>}
        </button>
      )}
    </div>
  );
}
