'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type WalletIdentity = {
  address: string | null;
  stakeAddress: string | null; // For Cardano
  chain: 'cardano' | 'solana' | 'base' | null;
};

type WalletContextType = {
  wallet: WalletIdentity;
  setWallet: (wallet: Partial<WalletIdentity> & { address: string }) => void;
  clearWallet: () => void;
  isLoading: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const LS_KEY = 'adam:walletIdentity';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWalletState] = useState<WalletIdentity>(() => {
    // Initialize from localStorage or env var
    if (typeof window === 'undefined') {
      return { address: null, stakeAddress: null, chain: null };
    }

    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          address: parsed.address || null,
          stakeAddress: parsed.stakeAddress || null,
          chain: parsed.chain || null,
        };
      }
    } catch {
      // Ignore parse errors
    }

    // Fallback to env var for demo mode
    const envAddress = process.env.NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS;
    if (envAddress) {
      return {
        address: envAddress,
        stakeAddress: envAddress.startsWith('stake1') ? envAddress : null,
        chain: envAddress.startsWith('stake1') ? 'cardano' : null,
      };
    }

    return { address: null, stakeAddress: null, chain: null };
  });

  const [isLoading, setIsLoading] = useState(false);

  const setWallet = useCallback((next: Partial<WalletIdentity> & { address: string }) => {
    const updated: WalletIdentity = {
      address: next.address,
      stakeAddress: next.stakeAddress ?? wallet.stakeAddress,
      chain: next.chain ?? wallet.chain,
    };

    setWalletState(updated);

    // Persist to localStorage
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }, [wallet]);

  const clearWallet = useCallback(() => {
    setWalletState({ address: null, stakeAddress: null, chain: null });
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Sync with env var changes (for demo mode)
  useEffect(() => {
    const envAddress = process.env.NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS;
    if (envAddress && !wallet.address) {
      setWallet({
        address: envAddress,
        stakeAddress: envAddress.startsWith('stake1') ? envAddress : null,
        chain: envAddress.startsWith('stake1') ? 'cardano' : null,
      });
    }
  }, [wallet.address, setWallet]);

  const value: WalletContextType = {
    wallet,
    setWallet,
    clearWallet,
    isLoading,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

/**
 * Get the effective wallet address for API calls.
 * Prefers stake address for Cardano, falls back to regular address.
 */
export function useWalletAddress(): string | null {
  const { wallet } = useWallet();
  return wallet.stakeAddress || wallet.address;
}



