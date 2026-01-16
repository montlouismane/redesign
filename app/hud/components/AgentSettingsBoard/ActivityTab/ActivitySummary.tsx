'use client';

import React, { useMemo } from 'react';
import type { ActivityLogEntry, ActivitySummaryData } from './types';
import styles from '../AgentSettingsBoard.module.css';

interface ActivitySummaryProps {
  logs: ActivityLogEntry[];
}

/**
 * Calculate summary statistics from activity logs
 */
function calculateSummary(logs: ActivityLogEntry[]): ActivitySummaryData {
  return {
    totalEvents: logs.length,
    transactions: logs.filter(l => l.level === 'trade' || l.level === 'success').length,
    alerts: logs.filter(l => l.level === 'warning').length,
    errors: logs.filter(l => l.level === 'error').length,
  };
}

/**
 * ActivitySummary - Displays counters for activity log statistics
 * Shows: Total Events, Transactions, Alerts, Errors
 */
export function ActivitySummary({ logs }: ActivitySummaryProps) {
  const summary = useMemo(() => calculateSummary(logs), [logs]);

  return (
    <div className={styles.activitySummary}>
      <div className={styles.summaryTitle}>Activity Summary</div>
      <div className={styles.summaryGrid}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Total Events:</span>
          <span className={styles.summaryValue}>{summary.totalEvents}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Transactions:</span>
          <span className={styles.summaryValue} data-type="transaction">
            {summary.transactions}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Alerts:</span>
          <span className={styles.summaryValue} data-type="alert">
            {summary.alerts}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Errors:</span>
          <span className={styles.summaryValue} data-type="error">
            {summary.errors}
          </span>
        </div>
      </div>
    </div>
  );
}
