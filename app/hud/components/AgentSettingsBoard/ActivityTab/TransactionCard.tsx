'use client';

import React from 'react';
import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import type { TransactionCardProps } from './types';
import styles from '../AgentSettingsBoard.module.css';

/**
 * Format number with commas and decimals
 */
function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format currency value
 */
function formatCurrency(value: number): string {
  return `$${formatNumber(Math.abs(value))}`;
}

/**
 * Format timestamp to date string
 */
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * TransactionCard - Displays a single transaction entry
 *
 * Features:
 * - Position type indicator (Long/Short with arrow)
 * - P&L prominently displayed with color coding
 * - Details row: entry price, size, leverage
 * - External link to Cardanoscan
 */
export function TransactionCard({ transaction }: TransactionCardProps) {
  const isProfit = transaction.pnl >= 0;
  const isLong = transaction.positionType === 'Long';

  return (
    <div className={styles.transactionCard}>
      <div className={styles.txHeader}>
        <div
          className={styles.positionIndicator}
          data-position={transaction.positionType}
        >
          {isLong ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </div>
        <div className={styles.txInfo}>
          <span className={styles.txAction}>{transaction.action}</span>
          <span className={styles.txPair}>{transaction.pair}</span>
        </div>
        <div className={styles.txPnl} data-profit={isProfit}>
          {transaction.pnl !== 0 && (
            <>
              {isProfit ? '+' : '-'}
              {formatCurrency(transaction.pnl)}
            </>
          )}
        </div>
      </div>

      <div className={styles.txDetails}>
        <span>Entry: ${formatNumber(transaction.entryPrice, 4)}</span>
        <span>Size: {formatNumber(transaction.positionSize)}</span>
        {transaction.leverage && <span>{transaction.leverage}x</span>}
      </div>

      <div className={styles.txFooter}>
        <span className={styles.txTimestamp}>
          {formatDate(transaction.timestamp)}
        </span>
        <a
          href={`https://cardanoscan.io/transaction/${transaction.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.txLink}
        >
          View TX
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
