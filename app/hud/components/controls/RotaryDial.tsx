'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useClickSound } from './useClickSound';
import styles from './controls.module.css';

interface RotaryDialProps {
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
}

/**
 * RotaryDial - Circular percentage control with 270° rotation
 *
 * Critical features:
 * - Circular drag using Math.atan2() for angle calculation
 * - 270° arc from -135° to +135° (top-center is 0°)
 * - Safe zone highlighting
 * - Smooth spring animations
 * - Inline value editing (click to type)
 * - Touch support for mobile
 */
export function RotaryDial({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  safeMin,
  safeMax,
  label,
  unit = '%',
  disabled = false,
}: RotaryDialProps) {
  const { playClick } = useClickSound();
  const dialRef = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  // Convert value to angle (-135° to +135°, 270° total range)
  const valueToAngle = useCallback((val: number) => {
    const normalized = (val - min) / (max - min);
    return normalized * 270 - 135;
  }, [min, max]);

  const angle = valueToAngle(value);

  // Animated rotation
  const [{ rotation }, api] = useSpring(() => ({
    rotation: angle,
    config: { tension: 280, friction: 26 },
  }));

  useEffect(() => {
    if (!isDragging) {
      api.start({ rotation: angle });
    }
  }, [angle, api, isDragging]);

  // Check if value is in safe zone
  const isInSafeZone = safeMin !== undefined && safeMax !== undefined
    ? value >= safeMin && value <= safeMax
    : true;

  // Calculate angle from mouse/touch position relative to dial center
  const calculateAngleFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!dialRef.current) return null;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate angle in degrees from center
    // atan2 returns angle from positive X axis, counterclockwise
    // We want: top = 0°, clockwise rotation
    let angleDeg = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);

    // angleDeg is now: top=0°, right=90°, bottom=±180°, left=-90°
    // Our dial range is -135° to +135° (270° total, bottom 90° is dead zone)

    // Handle the dead zone (bottom area where |angle| > 135°)
    if (angleDeg > 135) {
      angleDeg = 135;
    } else if (angleDeg < -135) {
      angleDeg = -135;
    }

    return angleDeg;
  }, []);

  const angleToValue = useCallback((angleDeg: number) => {
    // Convert -135° to +135° back to value range
    const normalized = (angleDeg + 135) / 270;
    let newValue = normalized * (max - min) + min;

    // Round to step
    newValue = Math.round(newValue / step) * step;

    // Clamp to range
    return Math.max(min, Math.min(max, newValue));
  }, [min, max, step]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    playClick();

    // Immediately update value based on click position
    const angleDeg = calculateAngleFromPoint(e.clientX, e.clientY);
    if (angleDeg !== null) {
      const newValue = angleToValue(angleDeg);
      onChange(newValue);
      api.start({ rotation: angleDeg, immediate: true });
    }
  }, [disabled, isEditing, playClick, calculateAngleFromPoint, angleToValue, onChange, api]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const angleDeg = calculateAngleFromPoint(e.clientX, e.clientY);
    if (angleDeg === null) return;

    const newValue = angleToValue(angleDeg);
    onChange(newValue);
    api.start({ rotation: angleDeg, immediate: true });
  }, [isDragging, calculateAngleFromPoint, angleToValue, onChange, api]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Snap to final value angle
      api.start({ rotation: valueToAngle(value) });
    }
  }, [isDragging, api, valueToAngle, value]);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isEditing) return;
    e.preventDefault();
    setIsDragging(true);
    playClick();

    const touch = e.touches[0];
    const angleDeg = calculateAngleFromPoint(touch.clientX, touch.clientY);
    if (angleDeg !== null) {
      const newValue = angleToValue(angleDeg);
      onChange(newValue);
      api.start({ rotation: angleDeg, immediate: true });
    }
  }, [disabled, isEditing, playClick, calculateAngleFromPoint, angleToValue, onChange, api]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const angleDeg = calculateAngleFromPoint(touch.clientX, touch.clientY);
    if (angleDeg === null) return;

    const newValue = angleToValue(angleDeg);
    onChange(newValue);
    api.start({ rotation: angleDeg, immediate: true });
  }, [isDragging, calculateAngleFromPoint, angleToValue, onChange, api]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      api.start({ rotation: valueToAngle(value) });
    }
  }, [isDragging, api, valueToAngle, value]);

  // Global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Stepper controls
  const increment = () => {
    if (disabled) return;
    playClick();
    onChange(Math.min(max, value + step));
  };

  const decrement = () => {
    if (disabled) return;
    playClick();
    onChange(Math.max(min, value - step));
  };

  // Inline editing handlers
  const startEditing = useCallback(() => {
    if (disabled) return;
    setInputValue(String(value));
    setIsEditing(true);
    // Focus input after render
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

  // Safe zone arc parameters (if defined)
  const safeStartAngle = safeMin !== undefined ? valueToAngle(safeMin) : -135;
  const safeEndAngle = safeMax !== undefined ? valueToAngle(safeMax) : 135;

  // SVG path for arc
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    // Handle case where start equals end (no arc to draw)
    if (Math.abs(endAngle - startAngle) < 0.1) return '';

    const start = polarToCartesian(0, 0, radius, endAngle);
    const end = polarToCartesian(0, 0, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Format display value
  const displayValue = step < 1 ? value.toFixed(1) : String(Math.round(value));

  return (
    <div className={styles.rotaryDial} data-disabled={disabled}>
      {label && <div className={styles.controlLabel}>{label}</div>}

      <div className={styles.dialContainer}>
        <svg
          ref={dialRef}
          className={styles.dialSvg}
          viewBox="-100 -100 200 200"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Background circle with brushed metal effect */}
          <defs>
            <radialGradient id={`brushedMetal-${label || 'default'}`}>
              <stop offset="0%" stopColor="rgba(196, 124, 72, 0.3)" />
              <stop offset="50%" stopColor="rgba(196, 124, 72, 0.15)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.4)" />
            </radialGradient>
            <filter id={`dialGlow-${label || 'default'}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring */}
          <circle
            cx="0"
            cy="0"
            r="85"
            fill={`url(#brushedMetal-${label || 'default'})`}
            stroke="rgba(196, 124, 72, 0.4)"
            strokeWidth="1"
          />

          {/* Track arc (270°) */}
          <path
            d={createArc(-135, 135, 70)}
            fill="none"
            stroke="rgba(196, 124, 72, 0.2)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Safe zone arc (if defined) */}
          {safeMin !== undefined && safeMax !== undefined && (
            <path
              d={createArc(safeStartAngle, safeEndAngle, 70)}
              fill="none"
              stroke="rgba(53, 255, 155, 0.3)"
              strokeWidth="12"
              strokeLinecap="round"
            />
          )}

          {/* Value arc */}
          <animated.path
            d={rotation.to((r) => createArc(-135, Math.max(-135, r), 70))}
            fill="none"
            stroke={isInSafeZone ? 'rgba(196, 124, 72, 0.9)' : 'rgba(245, 158, 11, 0.9)'}
            strokeWidth="12"
            strokeLinecap="round"
            filter={`url(#dialGlow-${label || 'default'})`}
          />

          {/* Center hub */}
          <circle
            cx="0"
            cy="0"
            r="45"
            fill="rgba(0, 0, 0, 0.6)"
            stroke="rgba(196, 124, 72, 0.3)"
            strokeWidth="1"
          />

          {/* Indicator notch (rotates with value) */}
          <animated.g
            transform={rotation.to((r) => `rotate(${r})`)}
            style={{ pointerEvents: 'none' }}
          >
            <circle
              cx="0"
              cy="-70"
              r="8"
              fill={isInSafeZone ? 'rgba(196, 124, 72, 1)' : 'rgba(245, 158, 11, 1)'}
              stroke="rgba(0, 0, 0, 0.5)"
              strokeWidth="2"
              filter={`url(#dialGlow-${label || 'default'})`}
            />
            <line
              x1="0"
              y1="-45"
              x2="0"
              y2="-62"
              stroke="rgba(196, 124, 72, 0.6)"
              strokeWidth="2"
            />
          </animated.g>

          {/* Tick marks */}
          {Array.from({ length: 7 }, (_, i) => {
            const tickAngle = -135 + (i * 270) / 6;
            const start = polarToCartesian(0, 0, 78, tickAngle);
            const end = polarToCartesian(0, 0, 85, tickAngle);
            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="rgba(196, 124, 72, 0.4)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Value display - inline editable */}
        <div className={styles.dialValue}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className={styles.dialValueInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              disabled={disabled}
              autoComplete="off"
            />
          ) : (
            <button
              className={styles.dialValueButton}
              onClick={startEditing}
              disabled={disabled}
            >
              <span className={styles.dialValueNumber}>{displayValue}</span>
              <span className={styles.dialValueUnit}>{unit}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stepper buttons */}
      <div className={styles.stepperButtons}>
        <button
          className={styles.stepperBtn}
          onClick={decrement}
          disabled={disabled || value <= min}
        >
          −
        </button>
        <button
          className={styles.stepperBtn}
          onClick={increment}
          disabled={disabled || value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}
