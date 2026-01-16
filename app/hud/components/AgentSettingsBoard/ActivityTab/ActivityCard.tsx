'use client';

import React from 'react';
import type { ActivityCardProps, ActivityLevel } from './types';
import styles from '../AgentSettingsBoard.module.css';

/**
 * Get display configuration for activity level
 */
function getLevelConfig(level: ActivityLevel): { label: string } {
  switch (level) {
    case 'decision':
      return { label: 'DECISION' };
    case 'error':
      return { label: 'ERROR' };
    case 'trade':
      return { label: 'TRADE' };
    case 'success':
      return { label: 'SUCCESS' };
    case 'warning':
      return { label: 'WARNING' };
    default:
      return { label: 'INFO' };
  }
}

/**
 * Format timestamp to locale time string
 */
function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * ActivityCard - Displays a single activity log entry
 *
 * Features:
 * - Left border accent color based on level
 * - Level badge with color coding
 * - Timestamp badge
 * - Optional pair badge for trade-related entries
 */
export function ActivityCard({ entry }: ActivityCardProps) {
  const { label } = getLevelConfig(entry.level);

  return (
    <div className={styles.activityCard} data-level={entry.level}>
      <div className={styles.activityCardHeader}>
        <span className={styles.levelBadge} data-level={entry.level}>
          {label}
        </span>
        <span className={styles.timestampBadge}>
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>
      <p className={styles.activityMessage}>{entry.message}</p>
      {entry.pair && (
        <span className={styles.pairBadge}>{entry.pair}</span>
      )}
    </div>
  );
}
