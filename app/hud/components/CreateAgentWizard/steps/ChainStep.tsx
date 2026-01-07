'use client';

import React from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { BotChain } from '../types';
import styles from './steps.module.css';

// Chain icons - using simple text/emoji for now
const CHAIN_CONFIG: Record<BotChain, { name: string; symbol: string; color: string; description: string }> = {
  cardano: {
    name: 'CARDANO',
    symbol: '₳',
    color: '#0033AD',
    description: 'eUTxO model, low fees, DEX aggregation via Minswap/SundaeSwap'
  },
  solana: {
    name: 'SOLANA',
    symbol: '◎',
    color: '#9945FF',
    description: 'High speed, account model, Jupiter aggregator'
  },
  base: {
    name: 'BASE',
    symbol: 'Ξ',
    color: '#0052FF',
    description: 'L2 EVM chain, low gas, Uniswap V3 routing'
  }
};

interface ChainStepProps {
  selectedChain: BotChain;
  onChainSelect: (chain: BotChain) => void;
  onNext: () => void;
  allowedChains?: BotChain[];
}

export function ChainStep({ selectedChain, onChainSelect, onNext, allowedChains = ['cardano', 'solana', 'base'] }: ChainStepProps) {
  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Globe size={24} />
        </div>
        <div className={styles.stepInfo}>
          <h3>SELECT NETWORK</h3>
          <p>Choose the blockchain network for your trading agent</p>
        </div>
      </div>

      <div className={styles.chainGrid}>
        {(['cardano', 'solana', 'base'] as BotChain[]).map((chain) => {
          const config = CHAIN_CONFIG[chain];
          const isSelected = selectedChain === chain;
          const isDisabled = !allowedChains.includes(chain);

          return (
            <button
              key={chain}
              className={`${styles.chainCard} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
              onClick={() => !isDisabled && onChainSelect(chain)}
              disabled={isDisabled}
            >
              <div className={styles.chainSymbol} style={{ color: config.color }}>
                {config.symbol}
              </div>
              <div className={styles.chainName}>{config.name}</div>
              <div className={styles.chainDesc}>{config.description}</div>
              {isDisabled && <div className={styles.disabledBadge}>RESTRICTED</div>}
              {isSelected && <div className={styles.selectedIndicator} />}
            </button>
          );
        })}
      </div>

      <div className={styles.stepFooter}>
        <button className={styles.nextButton} onClick={onNext}>
          CONTINUE
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
