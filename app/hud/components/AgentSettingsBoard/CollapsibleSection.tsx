'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './AgentSettingsBoard.module.css';

export interface CollapsibleSectionProps {
  /** Unique ID for localStorage persistence */
  id: string;
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const STORAGE_KEY_PREFIX = 'agent-settings-section-';

/**
 * Collapsible Section Component
 *
 * Provides expandable/collapsible container for settings groups
 * with localStorage persistence for user preferences.
 *
 * Usage:
 * ```tsx
 * <CollapsibleSection id="buy-config" title="Buy Configuration" defaultExpanded>
 *   <ControlRow label="Min Confidence">
 *     <RotaryDial value={65} onChange={...} />
 *   </ControlRow>
 * </CollapsibleSection>
 * ```
 */
export function CollapsibleSection({
  id,
  title,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (saved !== null) {
        setIsExpanded(saved === 'true');
      }
    } catch {
      // localStorage not available
    }
  }, [id]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, String(newState));
    } catch {
      // localStorage not available
    }
  };

  return (
    <div className={styles.collapsibleSection}>
      <button
        className={styles.collapsibleHeader}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.collapsibleTitle}>{title}</span>
        <ChevronDown
          size={18}
          className={`${styles.collapsibleIcon} ${isExpanded ? styles.expanded : ''}`}
        />
      </button>
      <div className={`${styles.collapsibleContent} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.collapsibleBody}>{children}</div>
      </div>
    </div>
  );
}

export interface ControlRowProps {
  label: string;
  helper?: string;
  children: React.ReactNode;
}

/**
 * Control Row Component
 *
 * Standardized layout for a control with label and optional help text
 */
export function ControlRow({ label, helper, children }: ControlRowProps) {
  return (
    <div className={styles.controlRow}>
      <label className={styles.controlLabel}>{label}</label>
      {children}
      {helper && <span className={styles.controlHelper}>{helper}</span>}
    </div>
  );
}
