'use client';

import React, { useState } from 'react';
import { Shield, ArrowRight, Download, Copy, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import styles from './steps.module.css';

interface SeedPhraseStepProps {
  seedPhrase: string;
  address: string;
  botName: string;
  onConfirm: () => void;
  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;
}

export function SeedPhraseStep({
  seedPhrase,
  address,
  botName,
  onConfirm,
  confirmed,
  setConfirmed
}: SeedPhraseStepProps) {
  const [showPhrase, setShowPhrase] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const downloadSeedPhrase = () => {
    if (!seedPhrase) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const content = `ADAM Trading Agent - Seed Phrase Backup
Agent Name: ${botName}
Created: ${new Date().toLocaleString()}
Wallet Address: ${address}

SEED PHRASE (KEEP THIS SECURE):
${seedPhrase}

IMPORTANT:
- This seed phrase controls your trading agent's wallet
- Store it securely - it cannot be recovered if lost
- Never share this with anyone
- Support staff will NEVER ask for your seed phrase
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adam-${botName.toLowerCase().replace(/\s+/g, '-')}-backup-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySeedPhrase = () => {
    if (seedPhrase) {
      navigator.clipboard.writeText(seedPhrase);
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const shortAddress = address ? `${address.slice(0, 12)}...${address.slice(-8)}` : '';

  return (
    <div className={styles.stepContainer}>
      <div className={styles.stepHeader}>
        <div className={`${styles.stepIcon} ${styles.warningIcon}`}>
          <Shield size={24} />
        </div>
        <div className={styles.stepInfo}>
          <h3>SECURE YOUR WALLET</h3>
          <p>Save your recovery phrase before proceeding. This is the ONLY way to recover your wallet.</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className={styles.warningBanner}>
        <AlertTriangle size={20} />
        <div>
          <strong>CRITICAL SECURITY INFORMATION</strong>
          <p>Your seed phrase is the master key to your wallet. Write it down and store it in a secure location. Anyone with access to this phrase can control your funds.</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className={styles.addressSection}>
        <label className={styles.inputLabel}>WALLET ADDRESS</label>
        <div className={styles.addressDisplay}>
          <code>{shortAddress}</code>
          <button className={styles.copyButton} onClick={copyAddress}>
            {copiedAddress ? <Check size={14} /> : <Copy size={14} />}
            {copiedAddress ? 'COPIED' : 'COPY'}
          </button>
        </div>
      </div>

      {/* Seed Phrase */}
      <div className={styles.seedSection}>
        <div className={styles.seedHeader}>
          <label className={styles.inputLabel}>RECOVERY PHRASE</label>
          <button className={styles.toggleButton} onClick={() => setShowPhrase(!showPhrase)}>
            {showPhrase ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPhrase ? 'HIDE' : 'REVEAL'}
          </button>
        </div>
        <div className={`${styles.seedDisplay} ${showPhrase ? styles.seedVisible : styles.seedHidden}`}>
          {showPhrase ? (
            <div className={styles.seedWords}>
              {seedPhrase.split(' ').map((word, i) => (
                <span key={i} className={styles.seedWord}>
                  <span className={styles.wordNum}>{i + 1}</span>
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <div className={styles.seedPlaceholder}>
              <Shield size={32} />
              <span>Click REVEAL to view your seed phrase</span>
            </div>
          )}
        </div>

        <div className={styles.seedActions}>
          <button className={styles.actionButton} onClick={copySeedPhrase}>
            {copiedSeed ? <Check size={14} /> : <Copy size={14} />}
            {copiedSeed ? 'COPIED' : 'COPY PHRASE'}
          </button>
          <button className={styles.actionButton} onClick={downloadSeedPhrase}>
            <Download size={14} />
            DOWNLOAD BACKUP
          </button>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <label className={styles.confirmCheckbox}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span className={styles.checkmark} />
        <span>
          I have securely saved my recovery phrase and understand that losing it means losing access to my funds forever.
        </span>
      </label>

      <div className={styles.stepFooter}>
        <button
          className={styles.nextButton}
          onClick={onConfirm}
          disabled={!confirmed}
        >
          CONTINUE TO FUNDING
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
