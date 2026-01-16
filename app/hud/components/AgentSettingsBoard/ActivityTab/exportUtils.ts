/**
 * Export Utilities
 * Functions for exporting activity data to JSON and CSV formats
 */

import type { ActivityLogEntry, TransactionEntry } from './types';

/**
 * Download a file with the given content
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a timestamp string for filenames
 */
function getTimestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/**
 * Escape a value for CSV (handle quotes and commas)
 */
function escapeCSVValue(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ========================================
// Activity Log Exports
// ========================================

/**
 * Export activity logs to CSV format
 */
export function exportActivityLogsToCSV(
  logs: ActivityLogEntry[],
  filenamePrefix: string = 'activity-logs'
): void {
  const headers = ['Timestamp', 'Level', 'Message', 'Pair', 'Details'];

  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.level.toUpperCase(),
    log.message,
    log.pair || '',
    log.details || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  const filename = `${filenamePrefix}-${getTimestampForFilename()}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

/**
 * Export activity logs to JSON format
 */
export function exportActivityLogsToJSON(
  logs: ActivityLogEntry[],
  filenamePrefix: string = 'activity-logs'
): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalEntries: logs.length,
    logs: logs.map(log => ({
      ...log,
      timestampISO: new Date(log.timestamp).toISOString(),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `${filenamePrefix}-${getTimestampForFilename()}.json`;
  downloadFile(json, filename, 'application/json');
}

// ========================================
// Transaction Exports
// ========================================

/**
 * Export transactions to CSV format
 */
export function exportTransactionsToCSV(
  transactions: TransactionEntry[],
  filenamePrefix: string = 'transactions'
): void {
  const headers = [
    'Timestamp',
    'Action',
    'Pair',
    'Position Type',
    'Entry Price',
    'Position Size',
    'Leverage',
    'P&L',
    'Status',
    'TX Hash'
  ];

  const rows = transactions.map(tx => [
    new Date(tx.timestamp).toISOString(),
    tx.action,
    tx.pair,
    tx.positionType,
    tx.entryPrice.toString(),
    tx.positionSize.toString(),
    tx.leverage?.toString() || '',
    tx.pnl.toString(),
    tx.status,
    tx.txHash,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  const filename = `${filenamePrefix}-${getTimestampForFilename()}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8');
}

/**
 * Export transactions to JSON format
 */
export function exportTransactionsToJSON(
  transactions: TransactionEntry[],
  filenamePrefix: string = 'transactions'
): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalTransactions: transactions.length,
    transactions: transactions.map(tx => ({
      ...tx,
      timestampISO: new Date(tx.timestamp).toISOString(),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const filename = `${filenamePrefix}-${getTimestampForFilename()}.json`;
  downloadFile(json, filename, 'application/json');
}
