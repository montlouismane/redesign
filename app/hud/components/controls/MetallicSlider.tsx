'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from './MetallicSlider.module.css';

interface MetallicSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  tickCount?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  showTicks?: boolean;
  snapToTicks?: boolean;
  'aria-label'?: string;
}

/**
 * MetallicSlider - Premium copper slider with native range input foundation
 *
 * Features:
 * - Native <input type="range"> for accessibility and browser compatibility
 * - 3D brushed copper aesthetic using CSS gradients
 * - Visible tick marks with optional snap behavior
 * - Floating value label that follows the thumb
 * - Full mouse and touch support
 * - ARIA labels for accessibility
 */
export function MetallicSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  tickCount = 11,
  label,
  unit = '',
  disabled = false,
  showTicks = true,
  snapToTicks = true,
  'aria-label': ariaLabel,
}: MetallicSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate percentage for positioning
  const percentage = ((value - min) / (max - min)) * 100;

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

  // Format display value
  const displayValue = step < 1 ? value.toFixed(1) : value.toLocaleString();

  return (
    <div
      className={styles.metallicSlider}
      data-disabled={disabled}
      data-dragging={isDragging}
    >
      {label && (
        <label className={styles.sliderLabel}>
          {label}
        </label>
      )}

      <div
        ref={trackRef}
        className={styles.sliderContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track background with copper gradient */}
        <div className={styles.trackBackground}>
          {/* Fill bar showing current value */}
          <div
            className={styles.trackFill}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tick marks */}
        {showTicks && (
          <div className={styles.tickContainer}>
            {ticks.map((tick, index) => (
              <div
                key={index}
                className={styles.tick}
                style={{ left: `${tick.position}%` }}
                data-active={tick.value <= value}
                data-major={index === 0 || index === tickCount - 1 || index === Math.floor(tickCount / 2)}
              />
            ))}
          </div>
        )}

        {/* Floating value label */}
        <div
          className={styles.valueLabel}
          style={{ left: `${percentage}%` }}
          data-visible={isDragging || isHovered}
        >
          <span className={styles.valueLabelText}>
            {displayValue}{unit && <span className={styles.valueLabelUnit}>{unit}</span>}
          </span>
          <div className={styles.valueLabelArrow} />
        </div>

        {/* Custom thumb visual (positioned by percentage) */}
        <div
          className={styles.thumbVisual}
          style={{ left: `${percentage}%` }}
          data-dragging={isDragging}
        >
          <div className={styles.thumbInner}>
            <div className={styles.thumbHighlight} />
            <div className={styles.thumbGroove} />
            <div className={styles.thumbGroove} />
          </div>
        </div>

        {/* Native range input (invisible but functional) */}
        <input
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
          aria-label={ariaLabel || label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {/* Static value display below */}
      <div className={styles.valueDisplay}>
        <span className={styles.valueNumber}>{displayValue}</span>
        {unit && <span className={styles.valueUnit}>{unit}</span>}
      </div>
    </div>
  );
}
