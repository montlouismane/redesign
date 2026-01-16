'use client';

import React from 'react';
import { Rocket, ArrowLeft, CheckCircle, AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { FormData, DeploymentResult, WalletInfo } from '../types';
import { getNativeCurrency } from '@/lib/chainTokens';
import { AGENT_MODES } from '../../../../features/agents/constants';
import styles from './steps.module.css';

interface DeployStepProps {
  formData: FormData;
  walletInfo: WalletInfo;
  balance: number;
  deploymentResult: DeploymentResult | null;
  isDeploying: boolean;
  onDeploy: () => void;
  onBack: () => void;
  onComplete: () => void;
}

export function DeployStep({
  formData,
  walletInfo,
  balance,
  deploymentResult,
  isDeploying,
  onDeploy,
  onBack,
  onComplete
}: DeployStepProps) {
  const currency = getNativeCurrency(formData.botChain);
  const modeDef = AGENT_MODES[formData.botMode];
  const shortAddress = walletInfo.address ? `${walletInfo.address.slice(0, 12)}...${walletInfo.address.slice(-8)}` : '';

  // Compute allocation summary
  const allocationSummary = formData.targets?.length > 0
    ? formData.targets.map(t => `${t.token}: ${t.percentage}%`).join(', ')
    : 'Automated';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepIcon} ${deploymentResult?.success ? styles.successIcon : ''}`}>
          {deploymentResult?.success ? <CheckCircle size={24} /> : <Rocket size={24} />}
        </div>
        <div className={styles.stepInfo}>
          <h3>{deploymentResult?.success ? 'DEPLOYMENT SUCCESSFUL' : 'REVIEW & DEPLOY'}</h3>
          <p>
            {deploymentResult?.success
              ? 'Your trading agent is now active and monitoring the market'
              : 'Review your configuration before deploying'}
          </p>
        </div>
      </div>

      {/* Success State */}
      {deploymentResult?.success && (
        <div className={styles.successCard}>
          <CheckCircle size={48} className={styles.successIcon} />
          <h4>Agent Deployed Successfully!</h4>
          <p>Your &quot;{formData.botName}&quot; agent is now active and will begin trading based on your configuration.</p>
          <button className={styles.completeButton} onClick={onComplete}>
            VIEW DASHBOARD
          </button>
        </div>
      )}

      {/* Error State */}
      {deploymentResult && !deploymentResult.success && (
        <div className={styles.errorCard}>
          <AlertCircle size={24} />
          <div>
            <strong>Deployment Failed</strong>
            <p>{deploymentResult.error || 'An unknown error occurred'}</p>
          </div>
        </div>
      )}

      {/* Review Summary */}
      {!deploymentResult?.success && (
        <>
          <div className={styles.reviewCard}>
            <div className={styles.reviewTitle}>DEPLOYMENT SUMMARY</div>

            <div className={styles.reviewGrid}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Strategy Name</span>
                <span className={styles.reviewValue}>{formData.botName}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Network</span>
                <span className={styles.reviewValue}>{formData.botChain.toUpperCase()}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Mode</span>
                <span className={styles.reviewValue}>{modeDef?.classicLabel || formData.botMode}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Wallet</span>
                <span className={styles.reviewValue}>{shortAddress}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Balance</span>
                <span className={styles.reviewValue}>
                  {balance.toFixed(formData.botChain === 'cardano' ? 2 : 4)} {currency}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Allocation</span>
                <span className={styles.reviewValue}>{allocationSummary}</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Rebalance Threshold</span>
                <span className={styles.reviewValue}>{((formData.tolerance || 0.05) * 100).toFixed(0)}%</span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Trade Range</span>
                <span className={styles.reviewValue}>
                  {formData.minTradeSize} - {formData.maxTradeSize} {currency}
                </span>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Paper Trading</span>
                <span className={styles.reviewValue}>{formData.paperTrading ? 'ENABLED' : 'DISABLED'}</span>
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          {!formData.paperTrading && (
            <div className={styles.riskWarning}>
              <AlertTriangle size={20} />
              <div>
                <strong>LIVE TRADING ENABLED</strong>
                <p>
                  This agent will execute real trades with real funds. Ensure you understand the risks
                  involved with automated trading. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      <div className={styles.stepFooter}>
        {!deploymentResult?.success && (
          <>
            <button className={styles.backButton} onClick={onBack} disabled={isDeploying}>
              <ArrowLeft size={16} />
              BACK
            </button>
            <button
              className={styles.deployButton}
              onClick={onDeploy}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 size={16} className={styles.spinning} />
                  DEPLOYING...
                </>
              ) : (
                <>
                  <Rocket size={16} />
                  DEPLOY AGENT
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
