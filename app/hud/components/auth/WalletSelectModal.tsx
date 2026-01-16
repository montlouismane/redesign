'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserWallet } from '@meshsdk/core';
import styles from './WalletSelectModal.module.css';

interface WalletInfo {
  name: string;
  icon: string;
  version?: string;
  id: string; // The actual wallet key for enable()
}

interface WalletSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wallet: BrowserWallet) => void;
}

export default function WalletSelectModal({ isOpen, onClose, onSelect }: WalletSelectModalProps) {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect available wallets on mount
  useEffect(() => {
    if (!isOpen) return;

    const detectWallets = async () => {
      setLoading(true);
      setError(null);
      try {
        const available = await BrowserWallet.getAvailableWallets();
        // Filter out Nami wallet (Lace is preferred)
        const filtered = available.filter(w => w.name.toLowerCase() !== 'nami');
        setWallets(filtered);
      } catch (err) {
        console.error('Failed to detect wallets:', err);
        setError('Failed to detect wallets');
      } finally {
        setLoading(false);
      }
    };

    detectWallets();
  }, [isOpen]);

  // Handle wallet selection
  const handleSelect = useCallback(async (walletName: string) => {
    setConnecting(walletName);
    setError(null);

    try {
      const wallet = await BrowserWallet.enable(walletName);
      onSelect(wallet);
      onClose();
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);

      // Provide more helpful error messages
      let errorMsg = 'Failed to connect wallet';
      if (err?.message) {
        errorMsg = err.message;
      } else if (err?.info) {
        errorMsg = err.info;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      // Common error scenarios
      if (errorMsg.includes('User declined') || errorMsg.includes('rejected')) {
        errorMsg = 'Connection rejected. Please approve the connection in your wallet.';
      } else if (errorMsg.includes('enable') || errorMsg === 'Failed to connect wallet') {
        errorMsg = `Could not connect to ${walletName}. Make sure your wallet is unlocked and try again.`;
      }

      setError(errorMsg);
      setConnecting(null);
    }
  }, [onSelect, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="wallet-modal-title">
        <div className={styles.header}>
          <h2 id="wallet-modal-title" className={styles.title}>Select Wallet</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <span>Detecting wallets...</span>
            </div>
          )}

          {!loading && wallets.length === 0 && (
            <div className={styles.empty}>
              <p>No Cardano wallets detected.</p>
              <p className={styles.hint}>
                Install a wallet extension like Nami, Eternl, or Lace to continue.
              </p>
            </div>
          )}

          {!loading && wallets.length > 0 && (
            <div className={styles.walletList}>
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  className={styles.walletItem}
                  onClick={() => handleSelect(wallet.name)}
                  disabled={connecting !== null}
                >
                  <img
                    src={wallet.icon}
                    alt={wallet.name}
                    className={styles.walletIcon}
                  />
                  <span className={styles.walletName}>{wallet.name}</span>
                  {connecting === wallet.name && (
                    <div className={styles.connectingSpinner} />
                  )}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
