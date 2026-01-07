'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './AgentSettingsBoard.module.css';

export interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

/**
 * Collapsible Section Component
 *
 * Provides expandable/collapsible container for settings groups
 *
 * Usage:
 * ```tsx
 * <CollapsibleSection title="Buy Configuration" defaultExpanded>
 *   <ControlRow label="Min Confidence">
 *     <RotaryDial value={65} onChange={...} />
 *   </ControlRow>
 * </CollapsibleSection>
 * ```
 */
export function CollapsibleSection({
  title,
  defaultExpanded = false,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={styles.collapsibleSection}>
      <button
        className={styles.collapsibleHeader}
        onClick={() => setIsExpanded(!isExpanded)}
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
