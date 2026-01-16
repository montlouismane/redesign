'use client';

import React, { useState, useMemo } from 'react';
import { Settings, ArrowRight, ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';
import { BotChain, BotMode, PortfolioTarget, FormData } from '../types';
import { CHAIN_TOKENS, getNativeCurrency, getDefaultReserve, getTradeSizeLimits } from '@/lib/chainTokens';
import { MetallicDial } from '../../controls/MetallicDial';
import { HorizontalSlider } from '../../controls/HorizontalSlider';
import { ToggleSwitch } from '../../controls/ToggleSwitch';
import styles from './steps.module.css';

interface ConfigureStepProps {
  formData: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ConfigureStep({ formData, onUpdate, onNext, onBack }: ConfigureStepProps) {
  const [totalError, setTotalError] = useState<string | null>(null);

  const chain = formData.botChain;
  const mode = formData.botMode;
  const targets = formData.targets || [];
  const nativeCurrency = getNativeCurrency(chain);
  const tradeLimits = getTradeSizeLimits(chain);
  const chainTokens = CHAIN_TOKENS[chain] || [];

  // Modes that don't need manual allocation
  const skipAllocation = mode === 't-mode' || mode === 'perpetuals' || mode === 'prediction';

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return targets.reduce((sum, t) => sum + (t.percentage || 0), 0);
  }, [targets]);

  // Validate total
  React.useEffect(() => {
    if (skipAllocation) {
      setTotalError(null);
      return;
    }
    if (Math.abs(totalPercentage - 100) > 0.001) {
      setTotalError(`Total allocation is ${totalPercentage.toFixed(1)}%. Must equal 100%.`);
    } else {
      setTotalError(null);
    }
  }, [totalPercentage, skipAllocation]);

  const addTarget = () => {
    const newTargets = [...targets, { token: '', percentage: 0 }];
    onUpdate({ targets: newTargets });
  };

  const removeTarget = (index: number) => {
    if (targets.length > 1 && targets[index]?.token !== nativeCurrency) {
      const newTargets = targets.filter((_, i) => i !== index);
      onUpdate({ targets: newTargets });
    }
  };

  const updateTarget = (index: number, field: keyof PortfolioTarget, value: any) => {
    const newTargets = [...targets];
    newTargets[index] = { ...newTargets[index], [field]: value };
    onUpdate({ targets: newTargets });
  };

  const canProceed = skipAllocation || !totalError;

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <Settings size={24} />
        </div>
        <div className={styles.stepInfo}>
          <h3>CONFIGURE STRATEGY</h3>
          <p>Set up your trading parameters and portfolio allocation</p>
        </div>
      </div>

      {/* Portfolio Allocation - Only for standard mode */}
      {!skipAllocation && (
        <div className={styles.configSection}>
          <div className={styles.sectionTitle}>
            PORTFOLIO ALLOCATION
            {totalError && (
              <span className={styles.sectionError}>
                <AlertCircle size={12} />
                {totalError}
              </span>
            )}
          </div>

          <div className={styles.allocationList}>
            {targets.map((target, index) => (
              <div key={index} className={styles.allocationRow}>
                <select
                  className={styles.tokenSelect}
                  value={target.token}
                  onChange={(e) => updateTarget(index, 'token', e.target.value)}
                >
                  <option value="">Select token...</option>
                  {chainTokens.map((t) => (
                    <option key={t.ticker} value={t.ticker}>
                      {t.ticker} - {t.name}
                    </option>
                  ))}
                </select>
                <div className={styles.percentageInput}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={target.percentage}
                    onChange={(e) => updateTarget(index, 'percentage', parseFloat(e.target.value) || 0)}
                    autoComplete="off"
                  />
                  <span className={styles.percentSymbol}>%</span>
                </div>
                {targets.length > 1 && target.token !== nativeCurrency && (
                  <button
                    className={styles.removeButton}
                    onClick={() => removeTarget(index)}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className={styles.addButton} onClick={addTarget}>
            <Plus size={14} />
            ADD TOKEN
          </button>
        </div>
      )}

      {/* Skip allocation message for automated modes */}
      {skipAllocation && (
        <div className={styles.infoCard}>
          <div className={styles.infoTitle}>AUTOMATED ALLOCATION</div>
          <p>
            {mode === 't-mode' && 'T-Mode automatically manages portfolio allocation based on AI signals.'}
            {mode === 'perpetuals' && 'Perpetuals mode manages positions automatically based on market conditions.'}
            {mode === 'prediction' && 'Prediction mode allocates based on market prediction confidence.'}
          </p>
        </div>
      )}

      {/* Trading Parameters */}
      <div className={styles.configSection}>
        <div className={styles.sectionTitle}>TRADING PARAMETERS</div>

        <div className={styles.parameterGrid}>
          {/* Tolerance/Drift */}
          <div className={styles.parameterItem}>
            <label>Rebalance Threshold</label>
            <MetallicDial
              value={(formData.tolerance || 0.05) * 100}
              onChange={(val) => onUpdate({ tolerance: val / 100 })}
              min={1}
              max={20}
              step={1}
              unit="%"
              size={100}
            />
          </div>

          {/* Min Trade Size */}
          <div className={styles.parameterItem}>
            <label>Min Trade ({nativeCurrency})</label>
            <HorizontalSlider
              value={formData.minTradeSize || tradeLimits.min}
              onChange={(val) => onUpdate({ minTradeSize: val })}
              min={tradeLimits.min / 2}
              max={tradeLimits.max / 2}
              step={chain === 'cardano' ? 5 : 0.01}
              unit={nativeCurrency}
            />
          </div>

          {/* Max Trade Size */}
          <div className={styles.parameterItem}>
            <label>Max Trade ({nativeCurrency})</label>
            <HorizontalSlider
              value={formData.maxTradeSize || tradeLimits.max}
              onChange={(val) => onUpdate({ maxTradeSize: val })}
              min={tradeLimits.min}
              max={tradeLimits.max * 2}
              step={chain === 'cardano' ? 10 : 0.05}
              unit={nativeCurrency}
            />
          </div>

          {/* Reserve */}
          <div className={styles.parameterItem}>
            <label>Reserve ({nativeCurrency})</label>
            <HorizontalSlider
              value={formData.minAdaReserve || getDefaultReserve(chain)}
              onChange={(val) => onUpdate({ minAdaReserve: val })}
              min={chain === 'cardano' ? 40 : 0.01}
              max={chain === 'cardano' ? 200 : 0.5}
              step={chain === 'cardano' ? 5 : 0.01}
              unit={nativeCurrency}
            />
          </div>
        </div>
      </div>

      {/* Mode-specific settings */}
      {mode === 't-mode' && (
        <div className={styles.configSection}>
          <div className={styles.sectionTitle}>T-MODE SETTINGS</div>
          <div className={styles.parameterGrid}>
            <div className={styles.parameterItem}>
              <label>Min Market Cap</label>
              <HorizontalSlider
                value={formData.tModeMinMcap || 100000}
                onChange={(val) => onUpdate({ tModeMinMcap: val })}
                min={50000}
                max={1000000}
                step={10000}
                unit="$"
              />
            </div>
          </div>
        </div>
      )}

      {/* Paper Trading Toggle */}
      <div className={styles.configSection}>
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <label>PAPER TRADING</label>
            <span>Simulate trades without real funds (recommended for testing)</span>
          </div>
          <ToggleSwitch
            value={formData.paperTrading || false}
            onChange={(val) => onUpdate({ paperTrading: val })}
          />
        </div>
      </div>

      <div className={styles.stepFooter}>
        <button className={styles.backButton} onClick={onBack}>
          <ArrowLeft size={16} />
          BACK
        </button>
        <button
          className={styles.nextButton}
          onClick={onNext}
          disabled={!canProceed}
        >
          REVIEW & DEPLOY
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
