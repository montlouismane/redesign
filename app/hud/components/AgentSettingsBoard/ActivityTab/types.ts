/**
 * Activity Tab Types
 * Types for Activity Log and Transaction history display
 */

// Activity log level types
export type ActivityLevel = 'info' | 'warning' | 'error' | 'success' | 'decision' | 'trade';

/**
 * Activity Log Entry - represents agent decisions and actions
 */
export interface ActivityLogEntry {
  id: string;
  timestamp: number; // Unix timestamp
  message: string;
  level: ActivityLevel;
  details?: string; // Optional expanded details
  pair?: string; // Trading pair if relevant (e.g., "ADA/USD")
}

/**
 * Transaction Entry - perpetual/spot trades
 */
export interface TransactionEntry {
  id: string;
  txHash: string;
  timestamp: number; // Unix timestamp
  action: string; // e.g., "Open Position", "Close Position"
  pair: string; // e.g., "ADA/USD"
  positionType: 'Long' | 'Short';
  entryPrice: number;
  positionSize: number;
  leverage?: number;
  pnl: number; // 0 for open positions, actual P&L for closed
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Props for ActivityTab component
 */
export interface ActivityTabProps {
  agentId: string;
  walletAddress?: string;
  // Activity log data
  activityLogs: ActivityLogEntry[];
  onRefreshLogs?: () => void;
  // Transaction data
  transactions: TransactionEntry[];
  onRefreshTransactions?: () => void;
  // Loading states
  isLoadingLogs?: boolean;
  isLoadingTransactions?: boolean;
}

/**
 * Props for ActivityCard component
 */
export interface ActivityCardProps {
  entry: ActivityLogEntry;
}

/**
 * Props for TransactionCard component
 */
export interface TransactionCardProps {
  transaction: TransactionEntry;
}

// ========================================
// Filter Types
// ========================================

/**
 * Event type filter options
 */
export type EventTypeFilter = 'all' | 'decision' | 'trade' | 'error' | 'warning' | 'info' | 'success';

/**
 * Time range filter options
 */
export type TimeRangeFilter = 'hour' | 'day' | 'week' | 'all';

/**
 * Activity filters state
 */
export interface ActivityFiltersState {
  eventType: EventTypeFilter;
  timeRange: TimeRangeFilter;
}

// ========================================
// Summary Types
// ========================================

/**
 * Activity summary counters
 */
export interface ActivitySummaryData {
  totalEvents: number;
  transactions: number;
  alerts: number;
  errors: number;
}

// ========================================
// Hook Types
// ========================================

/**
 * Options for useActivityData hook
 */
export interface UseActivityDataOptions {
  agentId: string;
  walletAddress?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Return type for useActivityData hook
 */
export interface UseActivityDataReturn {
  activityLogs: ActivityLogEntry[];
  transactions: TransactionEntry[];
  isLoading: boolean;
  isLoadingTransactions: boolean;
  error: Error | null;
  refresh: () => void;
  refreshTransactions: () => void;
}
