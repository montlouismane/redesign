'use client';

import React, { useState, useEffect } from 'react';
import { Tag, ArrowRight, ArrowLeft, AlertCircle, Brain, PieChart, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { BotMode } from '../types';
import { AGENT_MODES, AGENT_MODE_ORDER } from '../../../../features/agents/constants';
import styles from './steps.module.css';

const MODE_ICONS: Record<BotMode, React.ElementType> = {
  standard: PieChart,
  't-mode': Brain,
  prediction: TrendingUp,
  perpetuals: Zap,
};

interface NameStepProps {
  botName: string;
  onNameChange: (name: string) => void;
  botMode: BotMode;
  onModeChange: (mode: BotMode) => void;
  onNext: () => void;
  onBack: () => void;
  isCreatingWallet: boolean;
}

export function NameStep({
  botName,
  onNameChange,
  botMode,
  onModeChange,
  onNext,
  onBack,
  isCreatingWallet
}: NameStepProps) {
  const [nameError, setNameError] = useState<string | null>(null);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError('Strategy name is required');
      return false;
    }
    if (value.length < 3) {
      setNameError('Name must be at least 3 characters');
      return false;
    }
    if (value.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onNameChange(value);
    if (nameError) validateName(value);
  };

  const handleNext = () => {
    if (validateName(botName)) {
      onNext();
    }
  };

  const isValid = botName.trim().length >= 3 && botName.length <= 50;

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Tag size={24} />
        </div>
        <div className={styles.stepInfo}>
          <h3>NAME YOUR STRATEGY</h3>
          <p>Give your trading agent a unique identifier and select its operating mode</p>
        </div>
      </div>

      {/* Strategy Name Input */}
      <div className={styles.inputSection}>
        <label className={styles.inputLabel}>STRATEGY IDENTIFIER</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={botName}
            onChange={handleNameChange}
            onBlur={() => validateName(botName)}
            placeholder="e.g., QUANTUM OMEGA, ALPHA PRIME..."
            className={`${styles.textInput} ${nameError ? styles.inputError : ''}`}
            autoComplete="off"
            autoFocus
          />
          {nameError && (
            <div className={styles.errorText}>
              <AlertCircle size={12} />
              {nameError}
            </div>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className={styles.inputSection}>
        <label className={styles.inputLabel}>OPERATING MODE</label>
        <div className={styles.modeGrid}>
          {AGENT_MODE_ORDER.map((modeKey) => {
            const modeDef = AGENT_MODES[modeKey];
            const isSelected = botMode === modeKey;
            const Icon = MODE_ICONS[modeKey];

            return (
              <div
                key={modeKey}
                className={`${styles.modeCard} ${isSelected ? styles.modeSelected : ''}`}
                onClick={() => onModeChange(modeKey)}
              >
                {isSelected && (
                  <div className={styles.checkIcon}>
                    <CheckCircle size={16} />
                  </div>
                )}
                <div className={styles.modeIcon}>
                  <Icon size={20} />
                </div>
                <div className={styles.modeTitle}>{modeDef.classicLabel}</div>
                <div className={styles.modeDesc}>{modeDef.description}</div>
                <RiskBadge level={modeDef.riskLevel} />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.stepFooter}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={16} />
          BACK
        </button>
        <button
          className={styles.nextButton}
          onClick={handleNext}
          disabled={!isValid || isCreatingWallet}
        >
          {isCreatingWallet ? (
            <>
              <span className={styles.spinner} />
              CREATING...
            </>
          ) : (
            <>
              CREATE WALLET
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    low: styles.riskLow,
    medium: styles.riskMedium,
    'medium-high': styles.riskMediumHigh,
    high: styles.riskHigh,
  };

  return (
    <span className={`${styles.riskBadge} ${colorMap[level] || styles.riskMedium}`}>
      {level.replace('-', ' ')}
    </span>
  );
}
