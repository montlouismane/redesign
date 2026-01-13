'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import styles from './MetallicDial.module.css';
import { useControlSound } from './useControlSound';

interface MetallicDialProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  degrees?: number;
  numTicks?: number;
  safeMin?: number;
  safeMax?: number;
  label?: string;
  unit?: string;
  disabled?: boolean;
  size?: number;
}

/**
 * MetallicDial - Premium rotary knob with smooth circular drag
 *
 * Inspired by https://codepen.io/bbx/pen/QBKYOy
 *
 * Features:
 * - Smooth circular drag using atan-based angle calculation
 * - Configurable rotation range (default 270°)
 * - Active tick marks that light up as value increases
 * - No +/- stepper buttons - pure drag interaction
 * - Inline value editing (click center to type)
 * - Safe zone highlighting
 * - Touch support for mobile
 * - Metallic copper aesthetic
 */
export function MetallicDial({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  degrees = 270,
  numTicks = 25,
  safeMin,
  safeMax,
  label,
  unit = '%',
  disabled = false,
  size = 120,
}: MetallicDialProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const lastValueRef = useRef<number>(value);
  const { playTick } = useControlSound('dial');

  // Calculate angle range
  const startAngle = (360 - degrees) / 2;
  const endAngle = startAngle + degrees;

  // Convert between value and angle
  const convertRange = useCallback(
    (oldMin: number, oldMax: number, newMin: number, newMax: number, oldValue: number) => {
      return ((oldValue - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
    },
    []
  );

  // Current angle based on value
  const currentDeg = useMemo(() => {
    return convertRange(min, max, startAngle, endAngle, value);
  }, [min, max, startAngle, endAngle, value, convertRange]);

  // Check if value is in safe zone
  const isInSafeZone = useMemo(() => {
    if (safeMin === undefined || safeMax === undefined) return true;
    return value >= safeMin && value <= safeMax;
  }, [value, safeMin, safeMax]);

  // Get angle from mouse/touch position
  const getDeg = useCallback(
    (clientX: number, clientY: number, centerX: number, centerY: number) => {
      const x = clientX - centerX;
      const y = clientY - centerY;
      let deg = (Math.atan(y / x) * 180) / Math.PI;

      // Adjust for quadrant
      if ((x < 0 && y >= 0) || (x < 0 && y < 0)) {
        deg += 90;
      } else {
        deg += 270;
      }

      // Clamp to valid range
      return Math.min(Math.max(startAngle, deg), endAngle);
    },
    [startAngle, endAngle]
  );

  // Start drag handler
  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || isEditing) return;

      const knob = knobRef.current;
      if (!knob) return;

      const rect = knob.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setIsDragging(true);

      // Update value immediately
      const deg = getDeg(clientX, clientY, centerX, centerY);
      const newValue = Math.round(convertRange(startAngle, endAngle, min, max, deg) / step) * step;
      const clampedValue = Math.max(min, Math.min(max, newValue));

      // Play tick on initial click if value changes
      if (clampedValue !== lastValueRef.current) {
        playTick(clampedValue > lastValueRef.current ? 'up' : 'down');
        lastValueRef.current = clampedValue;
      }
      onChange(clampedValue);

      // Create move handler with captured center
      const moveHandler = (e: MouseEvent | TouchEvent) => {
        const point = 'touches' in e ? e.touches[0] : e;
        const moveDeg = getDeg(point.clientX, point.clientY, centerX, centerY);
        const moveValue = Math.round(convertRange(startAngle, endAngle, min, max, moveDeg) / step) * step;
        const clampedMoveValue = Math.max(min, Math.min(max, moveValue));

        // Play tick when value changes (stepped)
        if (clampedMoveValue !== lastValueRef.current) {
          playTick(clampedMoveValue > lastValueRef.current ? 'up' : 'down');
          lastValueRef.current = clampedMoveValue;
        }
        onChange(clampedMoveValue);
      };

      const upHandler = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
        document.removeEventListener('touchmove', moveHandler);
        document.removeEventListener('touchend', upHandler);
      };

      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
      document.addEventListener('touchmove', moveHandler, { passive: false });
      document.addEventListener('touchend', upHandler);
    },
    [disabled, isEditing, getDeg, convertRange, startAngle, endAngle, min, max, step, onChange, playTick]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    },
    [startDrag]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    },
    [startDrag]
  );

  // Generate tick marks
  const ticks = useMemo(() => {
    if (numTicks === 0) return [];

    const tickArray: { deg: number; isActive: boolean; isSafe: boolean }[] = [];
    const incr = degrees / numTicks;

    for (let deg = startAngle; deg <= endAngle; deg += incr) {
      const tickValue = convertRange(startAngle, endAngle, min, max, deg);
      const isActive = deg <= currentDeg;
      const isSafe = safeMin !== undefined && safeMax !== undefined
        ? tickValue >= safeMin && tickValue <= safeMax
        : false;
      tickArray.push({ deg, isActive, isSafe });
    }
    return tickArray;
  }, [numTicks, degrees, startAngle, endAngle, currentDeg, min, max, safeMin, safeMax, convertRange]);

  // Inline editing handlers
  const startEditing = useCallback(() => {
    if (disabled) return;
    setInputValue(String(Math.round(value * 10) / 10));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [disabled, value]);

  const commitEdit = useCallback(() => {
    const num = parseFloat(inputValue);
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

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        commitEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    },
    [commitEdit, cancelEdit]
  );

  // Format display value
  const displayValue = step < 1 ? value.toFixed(1) : String(Math.round(value));

  // Calculate margin for ticks (based on default size 120)
  const margin = size * 0.15;
  const tickRadius = margin + size / 2;
  const baseTickHeight = 66; // Fixed tick height that works at size=120

  return (
    <div
      className={styles.metallicDial}
      data-disabled={disabled}
      data-dragging={isDragging}
      style={{ '--dial-size': `${size}px` } as React.CSSProperties}
    >
      {label && <label className={styles.dialLabel}>{label}</label>}

      <div className={styles.knobContainer} style={{ width: size, height: size }}>
        {/* Tick marks */}
        {numTicks > 0 && (
          <div className={styles.ticks}>
            {ticks.map((tick, i) => (
              <div
                key={i}
                className={styles.tick}
                data-active={tick.isActive}
                data-safe={tick.isSafe}
                style={{
                  height: baseTickHeight,
                  left: tickRadius - 20,
                  top: tickRadius - 20,
                  transform: `rotate(${tick.deg}deg)`,
                  transformOrigin: 'top',
                }}
              />
            ))}
          </div>
        )}

        {/* Outer knob */}
        <div
          ref={knobRef}
          className={styles.knobOuter}
          style={{ margin }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Inner knob with rotation */}
          <div
            className={styles.knobInner}
            style={{ transform: `rotate(${currentDeg}deg)` }}
          >
            {/* Grip indicator */}
            <div className={styles.grip} />
          </div>
        </div>

        {/* Center value display */}
        <div className={styles.valueOverlay}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className={styles.valueInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={commitEdit}
              autoFocus
            />
          ) : (
            <button
              className={styles.valueButton}
              onClick={startEditing}
              disabled={disabled}
              data-decimal={step < 1}
            >
              <span className={styles.valueNumber} data-decimal={step < 1}>{displayValue}</span>
              <span className={styles.valueUnit} data-decimal={step < 1}>{unit}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
