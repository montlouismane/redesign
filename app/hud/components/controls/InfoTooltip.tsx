'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
 * - Renders via Portal to avoid clip-path issues
 * - Accessible with ARIA attributes
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
  const [mounted, setMounted] = useState(false);

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Calculate position synchronously to avoid snapping
  const getTooltipStyle = (): React.CSSProperties => {
    if (!containerRef.current) return {};

    const rect = containerRef.current.getBoundingClientRect();
    const gap = 10;

    switch (position) {
      case 'top':
        return {
          left: rect.left + rect.width / 2,
          top: rect.top - gap,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          left: rect.left + rect.width / 2,
          top: rect.bottom + gap,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          left: rect.left - gap,
          top: rect.top + rect.height / 2,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          left: rect.right + gap,
          top: rect.top + rect.height / 2,
          transform: 'translateY(-50%)',
        };
      default:
        return {};
    }
  };

  // Render tooltip via portal to escape clip-path containers
  const tooltipElement = isVisible && mounted ? createPortal(
    <span
      id={tooltipId.current}
      role="tooltip"
      className={styles.tooltip}
      style={getTooltipStyle()}
    >
      <span className={styles.tooltipInner}>
        {text}
      </span>
      {/* Edge lines */}
      <span className={`${styles.edgeLine} ${styles.edgeTop}`} />
      <span className={`${styles.edgeLine} ${styles.edgeRight}`} />
      <span className={`${styles.edgeLine} ${styles.edgeBottom}`} />
      <span className={`${styles.edgeLine} ${styles.edgeLeft}`} />
      {/* Corner outlines */}
      <span className={`${styles.cornerLine} ${styles.cornerTL}`} />
      <span className={`${styles.cornerLine} ${styles.cornerTR}`} />
      <span className={`${styles.cornerLine} ${styles.cornerBL}`} />
      <span className={`${styles.cornerLine} ${styles.cornerBR}`} />
    </span>,
    document.body
  ) : null;

  return (
    <>
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
      </span>
      {tooltipElement}
    </>
  );
}
