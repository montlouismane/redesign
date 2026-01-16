'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from './MetallicSlider.module.css';
import { useControlSound } from './useControlSound';

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
  /** Use exponential scale for fine control at lower values */
  exponentialScale?: boolean;
  /** Error message to display (shows error state when set) */
  error?: string;
  /** Minimum allowed value (for validation display, doesn't block input) */
  minAllowed?: number;
  /** Maximum allowed value (for validation display, doesn't block input) */
  /** Maximum allowed value (for validation display, doesn't block input) */
  maxAllowed?: number;
  /** Step size for manual input (defaults to step) */
  inputStep?: number;
  /** Minimum value for manual input (defaults to min) */
  inputMin?: number;
  /** Color theme for the slider */
  colorVariant?: 'copper' | 'red' | 'green' | 'orange';
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
  exponentialScale = false,
  error,
  minAllowed,
  maxAllowed,
  inputStep,
  inputMin,
  colorVariant = 'copper',
}: HorizontalSliderProps) {
  // Define color variables for variants
  const colorStyles: React.CSSProperties = useMemo(() => {
    switch (colorVariant) {
      case 'red':
        return {
          '--copper': '#cc4444',
          '--copper-light': '#ff8888',
          '--copper-dark': '#882222',
          '--copper-glow': 'rgba(255, 68, 68, 0.5)',
        } as React.CSSProperties;
      case 'green':
        return {
          '--copper': '#22cc88',
          '--copper-light': '#66ffaa',
          '--copper-dark': '#118855',
          '--copper-glow': 'rgba(34, 204, 136, 0.5)',
        } as React.CSSProperties;
      case 'orange':
        return {
          '--copper': '#ff8800',
          '--copper-light': '#ffaa44',
          '--copper-dark': '#cc6600',
          '--copper-glow': 'rgba(255, 136, 0, 0.5)',
        } as React.CSSProperties;
      default: // copper
        return {};
    }
  }, [colorVariant]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const lastValueRef = useRef<number>(value);
  const { playTick } = useControlSound('slider');

  // Exponential scale conversion functions
  // Maps linear slider position (0-1) to exponential value
  // Gives fine control in lower 2/3 of range, exponential in upper 1/3
  const linearToExponential = useCallback((linearValue: number): number => {
    if (!exponentialScale) return linearValue;
    const normalized = (linearValue - min) / (max - min);
    // Use power of 2.5 for exponential curve - fine control at start, fast growth at end
    const exponential = Math.pow(normalized, 2.5);
    return min + exponential * (max - min);
  }, [exponentialScale, min, max]);

  const exponentialToLinear = useCallback((expValue: number): number => {
    if (!exponentialScale) return expValue;
    const normalized = (expValue - min) / (max - min);
    // Inverse: take root to convert back to linear
    const linear = Math.pow(normalized, 1 / 2.5);
    return min + linear * (max - min);
  }, [exponentialScale, min, max]);

  // Calculate percentage for positioning (uses exponential conversion if enabled)
  // Caps at 100% so slider thumb stays at max even if value exceeds max
  // Also caps at 0% for bounds check
  const percentage = useMemo(() => {
    let pct: number;
    if (exponentialScale) {
      // Convert actual value to linear position for display
      const linearPos = exponentialToLinear(Math.min(value, max));
      pct = ((linearPos - min) / (max - min)) * 100;
    } else {
      pct = ((value - min) / (max - min)) * 100;
    }
    // Cap at 100% for values above max (manual entry)
    return Math.min(100, Math.max(0, pct));
  }, [value, min, max, exponentialScale, exponentialToLinear]);

  // Check for validation errors
  const hasError = !!error || (minAllowed !== undefined && value < minAllowed) || (maxAllowed !== undefined && value > maxAllowed);
  const validationError = error || (minAllowed !== undefined && value < minAllowed ? `Min: ${minAllowed} ${unit}` : undefined) || (maxAllowed !== undefined && value > maxAllowed ? `Max: ${maxAllowed} ${unit}` : undefined);

  // Safe zone percentages (converted for exponential scale if enabled)
  const safeMinPercent = useMemo(() => {
    if (safeMin === undefined) return 0;
    if (exponentialScale) {
      const linearPos = exponentialToLinear(safeMin);
      return ((linearPos - min) / (max - min)) * 100;
    }
    return ((safeMin - min) / (max - min)) * 100;
  }, [safeMin, min, max, exponentialScale, exponentialToLinear]);

  const safeMaxPercent = useMemo(() => {
    if (safeMax === undefined) return 100;
    if (exponentialScale) {
      const linearPos = exponentialToLinear(safeMax);
      return ((linearPos - min) / (max - min)) * 100;
    }
    return ((safeMax - min) / (max - min)) * 100;
  }, [safeMax, min, max, exponentialScale, exponentialToLinear]);

  const hasSafeZone = safeMin !== undefined && safeMax !== undefined;

  // Check if value is in safe zone
  const isInSafeZone = hasSafeZone ? value >= safeMin && value <= safeMax : true;

  // Generate tick positions (accounts for exponential scale)
  const ticks = useMemo(() => {
    const tickArray: { position: number; value: number }[] = [];
    for (let i = 0; i < tickCount; i++) {
      // Position ticks evenly across the visual slider
      const position = (i / (tickCount - 1)) * 100;
      // Calculate the actual value at this position
      let tickValue: number;
      if (exponentialScale) {
        // For exponential scale, convert linear position to exponential value
        const linearValue = min + (i / (tickCount - 1)) * (max - min);
        tickValue = linearToExponential(linearValue);
      } else {
        tickValue = min + (i / (tickCount - 1)) * (max - min);
      }
      tickArray.push({ position, value: tickValue });
    }
    return tickArray;
  }, [min, max, tickCount, exponentialScale, linearToExponential]);

  // Snap to nearest tick if enabled
  const snapValue = useCallback((val: number): number => {
    if (!snapToTicks) return val;

    const tickStep = (max - min) / (tickCount - 1);
    const nearestTick = Math.round((val - min) / tickStep) * tickStep + min;
    return Math.max(min, Math.min(max, nearestTick));
  }, [min, max, tickCount, snapToTicks]);

  // Handle native input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const linearValue = parseFloat(e.target.value);
    // Convert from linear slider position to exponential value if needed
    const actualValue = exponentialScale ? linearToExponential(linearValue) : linearValue;
    const snapped = snapToTicks ? snapValue(actualValue) : actualValue;
    // Round to step
    const stepped = Math.round(snapped / step) * step;

    // Play tick when value changes (stepped)
    if (stepped !== lastValueRef.current) {
      playTick(stepped > lastValueRef.current ? 'up' : 'down');
      lastValueRef.current = stepped;
    }
    onChange(stepped);
  }, [onChange, snapToTicks, snapValue, exponentialScale, linearToExponential, step, playTick]);

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
      // Normalize using inputMin (defaults to min) and inputStep (defaults to step)
      const effectiveMin = inputMin !== undefined ? inputMin : min;
      // For manual input, default to 1 for integer steps to allow fine control (e.g. entering 75 on a step=50 slider)
      // For decimal steps (< 1), preserve the precision.
      const effectiveStep = inputStep !== undefined
        ? inputStep
        : (step >= 1 ? 1 : step);

      const clamped = Math.max(effectiveMin, num);
      const stepped = Math.round(clamped / effectiveStep) * effectiveStep;
      onChange(stepped);
    }
    setIsEditing(false);
  }, [inputValue, min, step, onChange, inputMin, inputStep]);

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

  // For exponential scale, the native input works in linear space
  // Cap at max so native range input doesn't break when value exceeds max
  const clampedValue = Math.min(value, max);
  const inputDisplayValue = exponentialScale ? exponentialToLinear(clampedValue) : clampedValue;

  return (
    <div
      className={styles.metallicSlider}
      style={colorStyles}
      data-disabled={disabled}
      data-dragging={isDragging}
      data-safe={isInSafeZone}
      data-error={hasError}
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

        {/* Thumb Track Container - constrains visual thumb to track bounds */}
        <div className={styles.thumbTrack}>
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
        </div>

        {/* Native range input (invisible but functional) */}
        {/* For exponential scale, input works in linear space and we convert */}
        <input
          ref={inputRef}
          type="range"
          className={styles.rangeInput}
          value={inputDisplayValue}
          onChange={handleInputChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          min={min}
          max={max}
          step={exponentialScale ? (max - min) / 100 : step}
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
          data-error={hasError}
        >
          <span className={styles.valueNumber} data-error={hasError}>{displayValue}</span>
          {unit && <span className={styles.valueUnit}>{unit}</span>}
        </button>
      )}

      {/* Error message */}
      {validationError && (
        <div className={styles.errorMessage}>{validationError}</div>
      )}
    </div>
  );
}
