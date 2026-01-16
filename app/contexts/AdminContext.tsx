'use client';

import { createContext, useContext } from 'react';
import { BrowserWallet } from '@meshsdk/core';

export interface AdminContextType {
  isAdmin: boolean;
  wallet: BrowserWallet | null;
  walletAddress: string;
  stakeAddress: string;
  isSubscriber: boolean;
  chain: 'cardano' | 'solana' | 'base' | null;
}

export const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  wallet: null,
  walletAddress: '',
  stakeAddress: '',
  isSubscriber: false,
  chain: null,
});

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminContext.Provider');
  }
  return context;
};
