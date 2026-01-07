'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useClickSound } from './useClickSound';
import styles from './controls.module.css';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  defaultExpanded?: boolean;
  onHelp?: () => void;
  children: React.ReactNode;
}

/**
 * CollapsibleSection - Expandable section container
 *
 * Features:
 * - Copper header bar with section title
 * - ▼/▶ collapse indicator with rotation animation
 * - [?] help button that calls onHelp callback
 * - Smooth height animation on expand/collapse
 * - Remembers state in localStorage by section ID
 *
 * Usage:
 * <CollapsibleSection
 *   id="risk-settings"
 *   title="Risk Management"
 *   onHelp={() => showHelp('risk')}
 * >
 *   <RotaryDial ... />
 *   <HorizontalSlider ... />
 * </CollapsibleSection>
 */
export function CollapsibleSection({
  id,
  title,
  defaultExpanded = true,
  onHelp,
  children,
}: CollapsibleSectionProps) {
  const { playClick } = useClickSound();
  const storageKey = `collapsible-${id}`;

  // Load saved state from localStorage
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window === 'undefined') return defaultExpanded;
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved === 'true' : defaultExpanded;
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, String(isExpanded));
  }, [isExpanded, storageKey]);

  // Measure content height for animation
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, children]);

  const { height, opacity, rotate } = useSpring({
    height: isExpanded ? contentHeight : 0,
    opacity: isExpanded ? 1 : 0,
    rotate: isExpanded ? 0 : -90,
    config: { tension: 280, friction: 30 },
  });

  const toggleExpanded = () => {
    playClick();
    setIsExpanded(!isExpanded);
  };

  const handleHelp = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    onHelp?.();
  };

  return (
    <div className={styles.collapsibleSection}>
      {/* Header */}
      <button
        className={styles.collapsibleHeader}
        onClick={toggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${id}`}
      >
        <div className={styles.collapsibleHeaderLeft}>
          <animated.div
            className={styles.collapsibleIcon}
            style={{
              transform: rotate.to((r) => `rotate(${r}deg)`),
            }}
          >
            <ChevronDown size={18} />
          </animated.div>
          <span className={styles.collapsibleTitle}>{title}</span>
        </div>

        {onHelp && (
          <button
            className={styles.collapsibleHelpBtn}
            onClick={handleHelp}
            aria-label={`Help for ${title}`}
          >
            <HelpCircle size={16} />
          </button>
        )}
      </button>

      {/* Content */}
      <animated.div
        id={`collapsible-content-${id}`}
        className={styles.collapsibleContent}
        style={{
          height,
          opacity,
          overflow: 'hidden',
        }}
      >
        <div ref={contentRef} className={styles.collapsibleInner}>
          {children}
        </div>
      </animated.div>
    </div>
  );
}
