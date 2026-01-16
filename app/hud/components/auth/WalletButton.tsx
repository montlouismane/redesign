'use client';

import { ReactNode, forwardRef } from 'react';
import styles from './WalletButton.module.css';

export type WalletButtonState = 'idle' | 'loading' | 'error' | 'success';

interface WalletButtonProps {
  variant: 'cardano' | 'phantom';
  label: string;
  icon: ReactNode;
  onClick: () => void;
  state?: WalletButtonState;
  disabled?: boolean;
  className?: string;
}

const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(
  ({ variant, label, icon, onClick, state = 'idle', disabled, className = '' }, ref) => {
    const isLoading = state === 'loading';
    const isError = state === 'error';

    return (
      <button
        ref={ref}
        type="button"
        className={`${styles.walletButton} ${styles[variant]} ${isLoading ? styles.loading : ''} ${isError ? styles.error : ''} ${className}`}
        onClick={onClick}
        disabled={disabled || isLoading}
        aria-label={`Connect ${label} wallet`}
        aria-busy={isLoading}
      >
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        <span className={styles.label}>
          {isLoading ? 'Connecting...' : label}
        </span>
      </button>
    );
  }
);

WalletButton.displayName = 'WalletButton';

export default WalletButton;
