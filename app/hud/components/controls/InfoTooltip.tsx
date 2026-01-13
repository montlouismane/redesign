'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import styles from './InfoTooltip.module.css';

export interface InfoTooltipProps {
  /** The tooltip text to display */
  text: string;
  /** Size of the info icon in pixels */
  size?: number;
  /** Position of tooltip relative to icon */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * InfoTooltip - Accessible tooltip with info icon
 *
 * Features:
 * - Desktop: Shows on hover
 * - Mobile: Shows on tap, dismisses on tap outside
 * - Auto-positions to stay within viewport
 * - Accessible with ARIA attributes
 *
 * Usage:
 * ```tsx
 * <InfoTooltip text="Simulate trades without execution" />
 * ```
 */
export function InfoTooltip({
  text,
  size = 14,
  position = 'top',
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2, 9)}`);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Handle click outside to dismiss on mobile
  const handleClickOutside = useCallback((e: MouseEvent | TouchEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible && isTouchDevice) {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [isVisible, isTouchDevice, handleClickOutside]);

  const handleMouseEnter = () => {
    if (!isTouchDevice) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice) {
      setIsVisible(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible((prev) => !prev);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsVisible((prev) => !prev);
    } else if (e.key === 'Escape') {
      setIsVisible(false);
    }
  };

  return (
    <span
      ref={containerRef}
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-describedby={isVisible ? tooltipId.current : undefined}
    >
      <Info
        size={size}
        className={styles.icon}
        aria-hidden="true"
      />
      {isVisible && (
        <span
          id={tooltipId.current}
          role="tooltip"
          className={`${styles.tooltip} ${styles[position]}`}
        >
          {text}
          <span className={styles.arrow} />
        </span>
      )}
    </span>
  );
}
