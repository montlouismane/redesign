'use client';

import React, { useState, useMemo } from 'react';
import { RefreshCw, Activity, Receipt, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import { TransactionCard } from './TransactionCard';
import { ActivitySummary } from './ActivitySummary';
import { ActivityFilters } from './ActivityFilters';
import { useActivityData } from './useActivityData';
import { exportActivityLogsToCSV, exportActivityLogsToJSON } from './exportUtils';
import type { ActivityTabProps, ActivityFiltersState, ActivityLogEntry, TimeRangeFilter } from './types';
import styles from '../AgentSettingsBoard.module.css';

const DEFAULT_VISIBLE_LOGS = 5;
const DEFAULT_VISIBLE_TXS = 5;

/**
 * Get the time threshold for a given time range filter
 */
function getTimeThreshold(timeRange: TimeRangeFilter): number {
  const now = Date.now();
  switch (timeRange) {
    case 'hour':
      return now - 60 * 60 * 1000; // 1 hour ago
    case 'day':
      return now - 24 * 60 * 60 * 1000; // 24 hours ago
    case 'week':
      return now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
    case 'all':
    default:
      return 0; // No threshold
  }
}

/**
 * Filter logs based on filter state
 */
function filterLogs(logs: ActivityLogEntry[], filters: ActivityFiltersState): ActivityLogEntry[] {
  const timeThreshold = getTimeThreshold(filters.timeRange);

  return logs.filter(log => {
    // Filter by time range
    if (log.timestamp < timeThreshold) return false;

    // Filter by event type
    if (filters.eventType !== 'all' && log.level !== filters.eventType) return false;

    return true;
  });
}

/**
 * Loading skeleton for activity cards
 */
function ActivitySkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${styles.activityCard} ${styles.skeleton}`}>
          <div className={styles.skeletonLine} style={{ width: '60%', height: '12px' }} />
          <div className={styles.skeletonLine} style={{ width: '100%', height: '16px', marginTop: '8px' }} />
        </div>
      ))}
    </>
  );
}

/**
 * Loading skeleton for transaction cards
 */
function TransactionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${styles.transactionCard} ${styles.skeleton}`}>
          <div className={styles.skeletonLine} style={{ width: '40%', height: '14px' }} />
          <div className={styles.skeletonLine} style={{ width: '80%', height: '12px', marginTop: '10px' }} />
          <div className={styles.skeletonLine} style={{ width: '60%', height: '10px', marginTop: '8px' }} />
        </div>
      ))}
    </>
  );
}

/**
 * Empty state component
 */
function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className={styles.emptyState}>
      <Icon className={styles.emptyStateIcon} size={48} />
      <span className={styles.emptyStateText}>{message}</span>
    </div>
  );
}

/**
 * ActivityTab - Self-contained container for Activity Log and Transactions
 *
 * Features:
 * - Self-contained data fetching via useActivityData hook
 * - Activity Summary showing event counts
 * - Filters for event type and time range
 * - Export to JSON/CSV
 * - Expandable lists with "Show More"
 * - Loading skeletons and empty states
 */
export function ActivityTab({
  agentId,
  walletAddress,
}: Pick<ActivityTabProps, 'agentId' | 'walletAddress'>) {
  // State for UI
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [expandedTxs, setExpandedTxs] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filters, setFilters] = useState<ActivityFiltersState>({
    eventType: 'all',
    timeRange: 'day', // Default to last 24 hours
  });

  // Fetch data using custom hook
  const {
    activityLogs,
    transactions,
    isLoading,
    isLoadingTransactions,
    refresh,
    refreshTransactions,
  } = useActivityData({
    agentId,
    walletAddress,
    autoRefresh: true,
    refreshInterval: 10000,
  });

  // Apply filters to logs
  const filteredLogs = useMemo(
    () => filterLogs(activityLogs, filters),
    [activityLogs, filters]
  );

  // Visible logs based on expansion state
  const visibleLogs = expandedLogs
    ? filteredLogs
    : filteredLogs.slice(0, DEFAULT_VISIBLE_LOGS);
  const visibleTxs = expandedTxs
    ? transactions
    : transactions.slice(0, DEFAULT_VISIBLE_TXS);

  const hasMoreLogs = filteredLogs.length > DEFAULT_VISIBLE_LOGS;
  const hasMoreTxs = transactions.length > DEFAULT_VISIBLE_TXS;

  // Export handlers
  const handleExportCSV = () => {
    exportActivityLogsToCSV(filteredLogs, `activity-${agentId.slice(0, 8)}`);
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    exportActivityLogsToJSON(filteredLogs, `activity-${agentId.slice(0, 8)}`);
    setShowExportMenu(false);
  };

  return (
    <div className={styles.unifiedBoard}>
      {/* Angular frame overlay */}
      <div className={styles.panelFrame}>
        <div className={styles.frameLines} />
        <div className={styles.frameAccents}>
          <div className={`${styles.accent} ${styles.accentTL}`} />
          <div className={`${styles.accent} ${styles.accentTR}`} />
          <div className={`${styles.accent} ${styles.accentBL}`} />
          <div className={`${styles.accent} ${styles.accentBR}`} />
        </div>
      </div>

      {/* Activity Log Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <Activity size={16} className={styles.sectionIcon} />
            <div className={styles.cardTitle}>Activity Log</div>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button
              onClick={refresh}
              className={styles.refreshBtn}
              disabled={isLoading}
              aria-label="Refresh activity log"
            >
              <RefreshCw size={14} className={isLoading ? styles.spinning : ''} />
            </button>
            <div className={styles.exportDropdown}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={styles.exportBtn}
                aria-label="Export options"
              >
                <Download size={12} />
                Export
              </button>
              {showExportMenu && (
                <div className={styles.exportMenu}>
                  <button onClick={handleExportCSV} className={styles.exportMenuItem}>
                    Export CSV
                  </button>
                  <button onClick={handleExportJSON} className={styles.exportMenuItem}>
                    Export JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sectionContent}>
          {/* Activity Summary + Filters (side-by-side on desktop) */}
          <div className={styles.summaryFiltersRow}>
            <ActivitySummary logs={filteredLogs} />
            <ActivityFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Activity List */}
          {isLoading ? (
            <ActivitySkeleton count={3} />
          ) : filteredLogs.length === 0 ? (
            <EmptyState message="No activity matches filters" icon={Activity} />
          ) : (
            <>
              <div className={styles.activityList}>
                {visibleLogs.map((log) => (
                  <ActivityCard key={log.id} entry={log} />
                ))}
              </div>
              {hasMoreLogs && (
                <button
                  className={styles.showMoreBtn}
                  onClick={() => setExpandedLogs(!expandedLogs)}
                >
                  {expandedLogs ? (
                    <>
                      Show Less <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Show {filteredLogs.length - DEFAULT_VISIBLE_LOGS} More <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <Receipt size={16} className={styles.sectionIcon} />
            <div className={styles.cardTitle}>Transactions</div>
          </div>
          <button
            onClick={refreshTransactions}
            className={styles.refreshBtn}
            disabled={isLoadingTransactions}
            aria-label="Refresh transactions"
          >
            <RefreshCw size={14} className={isLoadingTransactions ? styles.spinning : ''} />
          </button>
        </div>
        <div className={styles.sectionContent}>
          {isLoadingTransactions ? (
            <TransactionSkeleton count={3} />
          ) : transactions.length === 0 ? (
            <EmptyState message="No transactions yet" icon={Receipt} />
          ) : (
            <>
              <div className={styles.transactionList}>
                {visibleTxs.map((tx) => (
                  <TransactionCard key={tx.id} transaction={tx} />
                ))}
              </div>
              {hasMoreTxs && (
                <button
                  className={styles.showMoreBtn}
                  onClick={() => setExpandedTxs(!expandedTxs)}
                >
                  {expandedTxs ? (
                    <>
                      Show Less <ChevronUp size={14} />
                    </>
                  ) : (
                    <>
                      Show {transactions.length - DEFAULT_VISIBLE_TXS} More <ChevronDown size={14} />
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
