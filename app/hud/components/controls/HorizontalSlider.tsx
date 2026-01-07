'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from './MetallicSlider.module.css';

interface HorizontalSliderProps {
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
 * HorizontalSlider - Premium metallic copper slider
 *
 * Features:
 * - Native <input type="range"> for accessibility and browser compatibility
 * - 3D brushed copper aesthetic using CSS gradients
 * - Visible tick marks with optional snap behavior
 * - Floating value label that follows the thumb
 * - Safe zone highlighting (green tint)
 * - Full mouse and touch support
 * - Inline editable value display
 * - ARIA labels for accessibility
 */
export function HorizontalSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  safeMin,
  safeMax,
  label,
  unit = 'ADA',
  disabled = false,
  tickCount = 11,
  showTicks = true,
  snapToTicks = false,
}: HorizontalSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100;

  // Safe zone percentages
  const safeMinPercent = safeMin !== undefined ? ((safeMin - min) / (max - min)) * 100 : 0;
  const safeMaxPercent = safeMax !== undefined ? ((safeMax - min) / (max - min)) * 100 : 100;
  const hasSafeZone = safeMin !== undefined && safeMax !== undefined;

  // Check if value is in safe zone
  const isInSafeZone = hasSafeZone ? value >= safeMin && value <= safeMax : true;

  // Generate tick positions
  const ticks = useMemo(() => {
    const tickArray: { position: number; value: number }[] = [];
    const tickStep = (max - min) / (tickCount - 1);
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + i * tickStep;
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

  // Handle native input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    const snapped = snapToTicks ? snapValue(newValue) : newValue;
    onChange(snapped);
  }, [onChange, snapToTicks, snapValue]);

  // Track mouse/touch interaction for visual feedback
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseUp]);

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
  const displayValue = step < 1 ? value.toFixed(1) : value.toLocaleString();

  return (
    <div
      className={styles.metallicSlider}
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
        {/* Track background with brushed metal effect */}
        <div className={styles.trackBackground}>
          {/* Safe zone highlight */}
          {hasSafeZone && (
            <div
              className={styles.safeZone}
              style={{
                left: `${safeMinPercent}%`,
                width: `${safeMaxPercent - safeMinPercent}%`,
              }}
            />
          )}

          {/* Fill bar showing current value */}
          <div
            className={styles.trackFill}
            style={{ width: `${percentage}%` }}
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
                  style={{ left: `${tick.position}%` }}
                  data-active={tick.value <= value}
                  data-safe={isInSafe}
                  data-major={index === 0 || index === tickCount - 1 || index === Math.floor(tickCount / 2)}
                />
              );
            })}
          </div>
        )}

        {/* Floating value label */}
        <div
          className={styles.valueLabel}
          style={{ left: `${percentage}%` }}
          data-visible={isDragging || isHovered}
          data-safe={isInSafeZone}
        >
          <span className={styles.valueLabelText}>
            {displayValue}{unit && <span className={styles.valueLabelUnit}>{unit}</span>}
          </span>
          <div className={styles.valueLabelArrow} />
        </div>

        {/* Custom thumb visual */}
        <div
          className={styles.thumbVisual}
          style={{ left: `${percentage}%` }}
          data-dragging={isDragging}
          data-safe={isInSafeZone}
        >
          <div className={styles.thumbInner} data-safe={isInSafeZone}>
            <div className={styles.thumbHighlight} />
            <div className={styles.thumbGroove} />
            <div className={styles.thumbGroove} />
          </div>
        </div>

        {/* Native range input (invisible but functional) */}
        <input
          ref={inputRef}
          type="range"
          className={styles.rangeInput}
          value={value}
          onChange={handleInputChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
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
