'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Wallet, ArrowRight, ArrowLeft, RefreshCw, Copy, Check, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { BotChain } from '../types';
import { getNativeCurrency, getDefaultReserve } from '@/lib/chainTokens';
import styles from './steps.module.css';

interface FundStepProps {
  address: string;
  chain: BotChain;
  balance: number;
  funded: boolean;
  checking: boolean;
  onCheckBalance: () => void;
  onNext: () => void;
  onBack: () => void;
}

const MIN_FUND_AMOUNTS: Record<BotChain, number> = {
  cardano: 50,
  solana: 0.1,
  base: 0.01
};

export function FundStep({
  address,
  chain,
  balance,
  funded,
  checking,
  onCheckBalance,
  onNext,
  onBack
}: FundStepProps) {
  const [copied, setCopied] = useState(false);
  const [autoCheckCount, setAutoCheckCount] = useState(0);

  const currency = getNativeCurrency(chain);
  const minRequired = MIN_FUND_AMOUNTS[chain];
  const shortAddress = address ? `${address.slice(0, 16)}...${address.slice(-12)}` : '';

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Auto-check balance every 10 seconds
  useEffect(() => {
    if (funded || !address) return;

    const interval = setInterval(() => {
      if (!checking && autoCheckCount < 60) { // Max 10 minutes of auto-checking
        onCheckBalance();
        setAutoCheckCount(c => c + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [funded, address, checking, autoCheckCount, onCheckBalance]);

  // Initial check
  useEffect(() => {
    if (address && !funded) {
      onCheckBalance();
    }
  }, [address]);

  const getExplorerUrl = () => {
    switch (chain) {
      case 'cardano':
        return `https://cardanoscan.io/address/${address}`;
      case 'solana':
        return `https://solscan.io/account/${address}`;
      case 'base':
        return `https://basescan.org/address/${address}`;
      default:
        return '#';
    }
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Wallet size={24} />
        </div>
        <div className={styles.stepInfo}>
          <h3>FUND YOUR AGENT</h3>
          <p>Send {currency} to your agent&apos;s wallet to enable trading</p>
        </div>
      </div>

      {/* Address Display */}
      <div className={styles.fundCard}>
        <div className={styles.fundCardLabel}>DEPOSIT ADDRESS</div>
        <div className={styles.addressBox}>
          <code className={styles.addressCode}>{shortAddress}</code>
          <div className={styles.addressActions}>
            <button className={styles.iconButton} onClick={copyAddress} title="Copy address">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <a
              href={getExplorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.iconButton}
              title="View on explorer"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
        <button className={styles.fullAddressButton} onClick={copyAddress}>
          {copied ? 'Address copied!' : 'Copy full address'}
        </button>
      </div>

      {/* Balance Display */}
      <div className={`${styles.balanceCard} ${funded ? styles.balanceFunded : ''}`}>
        <div className={styles.balanceHeader}>
          <span className={styles.balanceLabel}>CURRENT BALANCE</span>
          <button
            className={styles.refreshButton}
            onClick={onCheckBalance}
            disabled={checking}
          >
            <RefreshCw size={14} className={checking ? styles.spinning : ''} />
            {checking ? 'CHECKING...' : 'REFRESH'}
          </button>
        </div>
        <div className={styles.balanceAmount}>
          <span className={styles.balanceValue}>{balance.toFixed(chain === 'cardano' ? 2 : 4)}</span>
          <span className={styles.balanceCurrency}>{currency}</span>
        </div>
        <div className={styles.balanceStatus}>
          {funded ? (
            <span className={styles.statusFunded}>
              <CheckCircle size={14} />
              Wallet funded - ready to configure
            </span>
          ) : (
            <span className={styles.statusPending}>
              <AlertCircle size={14} />
              Minimum {minRequired} {currency} required
            </span>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {!funded && (
        <div className={styles.waitingIndicator}>
          <div className={styles.waitingPulse} />
          <span>Waiting for funds... (auto-checking every 10s)</span>
        </div>
      )}

      <div className={styles.stepFooter}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={16} />
          BACK
        </button>
        <button
          className={styles.nextButton}
          onClick={onNext}
          disabled={!funded}
        >
          CONFIGURE AGENT
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
