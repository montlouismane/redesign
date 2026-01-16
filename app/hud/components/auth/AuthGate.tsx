'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Image from 'next/image';
import { BrowserWallet } from '@meshsdk/core';
import { AdminContext, AdminContextType } from '../../../contexts/AdminContext';
import { useWallet } from '../../../contexts/WalletContext';
import { validateT1AdamNfts, getUpgradeMessage, ValidationResult } from '../../../lib/adam-nft-validator';
import WalletButton, { WalletButtonState } from './WalletButton';
import WalletSelectModal from './WalletSelectModal';
import CardanoIcon from './CardanoIcon';
import PhantomIcon from './PhantomIcon';
import styles from './AuthGate.module.css';

// Admin wallet addresses (mainnet) - bypass NFT check
const ADMIN_WALLET_ADDRESSES = [
  'addr1q9s6m9d8yedfcf53yhq5j5zsg0s58wpzamwexrxpfelgz2wgk0s9l9fqc93tyc8zu4z7hp9dlska2kew9trdg8nscjcq3sk5s3',
  'addr1qxxejya96h5cc64t997sjrwsed8g2r8j8rznfd4fmkg8yyckq3z7pxf5q8pphlx9jk87w53utq45qd47j9xws4ps0h6s66eyw2'
];

// Blockfrost API configuration
const BLOCKFROST_API_KEY = process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ||
  process.env.NEXT_PUBLIC_BLOCKFROST_KEY ||
  'mainnetXdMvEPp07a5GgSWtpSqUytnmtR4OvJzr';
const BLOCKFROST_API_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

// Phantom type definition
type PhantomSolana = {
  isPhantom?: boolean;
  publicKey?: { toBase58(): string; toString(): string };
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
};

interface AuthGateProps {
  children: ReactNode;
}

type AuthState = 'idle' | 'connecting' | 'verifying' | 'verified' | 'denied' | 'subscription';

export default function AuthGate({ children }: AuthGateProps) {
  const { wallet: walletIdentity, setWallet: setWalletIdentity } = useWallet();

  // State
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [meshWallet, setMeshWallet] = useState<BrowserWallet | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakeAddress, setStakeAddress] = useState('');
  const [phantomAddress, setPhantomAddress] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [error, setError] = useState('');
  const [nftValidation, setNftValidation] = useState<ValidationResult | null>(null);
  const [chain, setChain] = useState<'cardano' | 'solana' | null>(null);
  const [cardanoButtonState, setCardanoButtonState] = useState<WalletButtonState>('idle');
  const [phantomButtonState, setPhantomButtonState] = useState<WalletButtonState>('idle');
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Check for existing Phantom connection on mount
  useEffect(() => {
    const checkPhantom = async () => {
      try {
        const phantom = (globalThis as any)?.phantom?.solana as PhantomSolana | undefined;
        if (phantom?.isPhantom) {
          try {
            const resp = await phantom.connect({ onlyIfTrusted: true });
            const pub = resp?.publicKey?.toString?.() || '';
            if (pub) {
              setPhantomAddress(pub);
            }
          } catch {
            // Not trusted - ignore
          }
        }
      } catch {
        // Phantom not available
      }
    };
    checkPhantom();
  }, []);

  // Fetch with retry helper
  const fetchWithRetry = useCallback(async (url: string, init: RequestInit, attempts = 3): Promise<Response> => {
    let lastErr: Error | null = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(url, init);
        if (!res.ok) {
          const status = res.status;
          const transient = status === 429 || status === 408 || status >= 500;
          if (transient && i < attempts - 1) {
            await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)));
            continue;
          }
          throw new Error(`HTTP ${status}`);
        }
        return res;
      } catch (e) {
        lastErr = e as Error;
        if (i < attempts - 1) {
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, i)));
          continue;
        }
      }
    }
    throw lastErr || new Error('Request failed');
  }, []);

  // Verify NFT ownership for Cardano wallet
  const verifyCardanoWallet = useCallback(async (address: string) => {
    setAuthState('verifying');
    setError('');

    // Check if admin
    if (ADMIN_WALLET_ADDRESSES.includes(address)) {
      setIsAdmin(true);
      setAuthState('verified');
      return;
    }

    try {
      // Fetch wallet assets from Blockfrost
      const response = await fetchWithRetry(
        `${BLOCKFROST_API_URL}/addresses/${address}/utxos`,
        { headers: { 'project_id': BLOCKFROST_API_KEY } }
      );

      const utxos = await response.json();

      // Extract all assets from UTxOs
      const assets: Array<{ unit: string; quantity: string }> = [];
      if (Array.isArray(utxos)) {
        utxos.forEach((utxo: any) => {
          if (Array.isArray(utxo.amount)) {
            utxo.amount.forEach((amt: any) => {
              if (amt.unit !== 'lovelace') {
                assets.push({ unit: amt.unit, quantity: amt.quantity });
              }
            });
          }
        });
      }

      // Validate NFTs
      const validation = validateT1AdamNfts(assets);
      setNftValidation(validation);

      if (validation.shouldAllowAccess) {
        setAuthState('verified');
      } else {
        // Check subscription status
        try {
          const subResponse = await fetch(`/api/subscription/check?address=${address}`);
          const subData = await subResponse.json();
          if (subData.isSubscribed) {
            setIsSubscriber(true);
            setAuthState('verified');
            return;
          }
        } catch {
          // Subscription check failed, continue to denied state
        }

        setError(getUpgradeMessage(validation));
        setAuthState('subscription');
      }
    } catch (err) {
      console.error('NFT verification failed:', err);
      setError('Failed to verify wallet. Please try again.');
      setAuthState('denied');
    }
  }, [fetchWithRetry]);

  // Handle Cardano wallet connection
  const handleCardanoConnect = useCallback(async (wallet: BrowserWallet) => {
    setCardanoButtonState('loading');
    setChain('cardano');

    try {
      const addresses = await wallet.getUsedAddresses();
      const addr = addresses[0] || '';
      setWalletAddress(addr);

      // Get stake address
      const rewardAddresses = await wallet.getRewardAddresses();
      const stake = rewardAddresses[0] || '';
      setStakeAddress(stake);

      setMeshWallet(wallet);

      // Update wallet identity context
      setWalletIdentity({
        address: addr,
        stakeAddress: stake,
        chain: 'cardano',
      });

      // Verify NFT ownership
      await verifyCardanoWallet(addr);
      setCardanoButtonState('idle');
    } catch (err) {
      console.error('Cardano connection failed:', err);
      setCardanoButtonState('error');
      setError('Failed to connect Cardano wallet');
      setAuthState('denied');
      setTimeout(() => setCardanoButtonState('idle'), 2000);
    }
  }, [verifyCardanoWallet, setWalletIdentity]);

  // Handle Phantom (Solana) connection
  const handlePhantomConnect = useCallback(async () => {
    setPhantomButtonState('loading');
    setChain('solana');

    try {
      const phantom = (globalThis as any)?.phantom?.solana as PhantomSolana | undefined;

      if (!phantom?.isPhantom) {
        alert('Phantom wallet (Solana) not found. Please install Phantom and refresh the page.');
        setPhantomButtonState('idle');
        return;
      }

      const resp = await phantom.connect();
      const pub = resp?.publicKey?.toString?.() || '';

      if (!pub) {
        throw new Error('No public key returned');
      }

      setPhantomAddress(pub);
      setWalletAddress(pub);

      // Update wallet identity context
      setWalletIdentity({
        address: pub,
        stakeAddress: null,
        chain: 'solana',
      });

      // For Solana, check subscription status (no NFT check)
      try {
        const subResponse = await fetch(`/api/subscription/check?address=${pub}`);
        const subData = await subResponse.json();
        if (subData.isSubscribed) {
          setIsSubscriber(true);
          setAuthState('verified');
          setPhantomButtonState('idle');
          return;
        }
      } catch {
        // Continue to subscription state
      }

      // Show subscription option for Solana users
      setAuthState('subscription');
      setPhantomButtonState('idle');
    } catch (err) {
      console.error('Phantom connection failed:', err);
      setPhantomButtonState('error');
      setError('Failed to connect Phantom wallet');
      setAuthState('denied');
      setTimeout(() => setPhantomButtonState('idle'), 2000);
    }
  }, [setWalletIdentity]);

  // Reset and try again
  const handleRetry = useCallback(() => {
    setAuthState('idle');
    setError('');
    setMeshWallet(null);
    setWalletAddress('');
    setStakeAddress('');
    setPhantomAddress('');
    setChain(null);
    setNftValidation(null);
    setCardanoButtonState('idle');
    setPhantomButtonState('idle');
  }, []);

  // Demo mode bypass for testing
  const handleDemoBypass = useCallback(() => {
    setWalletAddress('demo_wallet_address');
    setIsAdmin(true);
    setAuthState('verified');
  }, []);

  // Truncate address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Build admin context value
  const adminContextValue: AdminContextType = {
    isAdmin,
    wallet: meshWallet,
    walletAddress,
    stakeAddress,
    isSubscriber,
    chain,
  };

  // If verified, render children with context
  if (authState === 'verified') {
    return (
      <AdminContext.Provider value={adminContextValue}>
        {children}
      </AdminContext.Provider>
    );
  }

  // Render auth gate UI
  return (
    <div className={styles.container}>
      {/* Demo bypass button - top right */}
      <button className={styles.demoBypass} onClick={handleDemoBypass}>
        Demo Mode
      </button>

      <div className={styles.card}>
        {/* Logo section */}
        <div className={styles.logoSection}>
          <Image
            src="/brand/adam-classic-logo.svg"
            alt="ADAM"
            width={426}
            height={133}
            className={styles.logoImage}
            priority
          />
          <div className={styles.greeting}>
            {phantomAddress || walletAddress ? 'Welcome back, Agent' : 'Initialize Protocol'}
          </div>
        </div>

        {/* Wallet selection - idle state */}
        {authState === 'idle' && (
          <div className={styles.walletSection}>
            <div className={styles.walletTitle}>Choose Wallet</div>
            <div className={styles.walletButtons}>
              {/* Cardano wallet button - opens custom wallet selection modal */}
              <WalletButton
                variant="cardano"
                label="Cardano"
                icon={<CardanoIcon size={95} />}
                onClick={() => setWalletModalOpen(true)}
                state={cardanoButtonState}
              />

              {/* Phantom wallet button */}
              <WalletButton
                variant="phantom"
                label="Phantom"
                icon={<PhantomIcon size={95} />}
                onClick={handlePhantomConnect}
                state={phantomButtonState}
              />
            </div>
          </div>
        )}

        {/* Cardano wallet selection modal */}
        <WalletSelectModal
          isOpen={walletModalOpen}
          onClose={() => setWalletModalOpen(false)}
          onSelect={handleCardanoConnect}
        />

        {/* Verifying state */}
        {(authState === 'connecting' || authState === 'verifying') && (
          <div className={styles.verifyingSection}>
            <div className={styles.spinner} />
            <div className={styles.verifyingText}>
              {authState === 'connecting' ? 'Connecting wallet...' : 'Verifying access...'}
            </div>
          </div>
        )}

        {/* Error/Denied state */}
        {authState === 'denied' && (
          <div className={styles.errorSection}>
            <div className={styles.errorText}>{error}</div>
            <button className={styles.retryButton} onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}

        {/* Subscription required state */}
        {authState === 'subscription' && (
          <div className={styles.subscriptionSection}>
            <div className={styles.connectedSection}>
              <div className={styles.connectedBadge}>
                <div className={styles.connectedDot} />
                <span className={styles.connectedText}>Connected</span>
              </div>
              <div className={styles.walletAddress}>
                {truncateAddress(walletAddress)}
              </div>
            </div>
            <div className={styles.subscriptionText}>
              {error || 'No valid ADAM Launch Pass found. Subscribe to access the dashboard.'}
            </div>
            <button className={styles.subscribeButton}>
              Subscribe Now
            </button>
            <button className={styles.retryButton} onClick={handleRetry}>
              Use Different Wallet
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
