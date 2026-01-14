'use client';

import React, { useState, useRef } from 'react';
import { Copy, Check, Upload, Share2 } from 'lucide-react';
import { useControlSound } from '../controls/useControlSound';
import styles from './AgentSettingsBoard.module.css';
import { ShareCardModal } from './ShareCardModal';

export type AgentMode = 'standard' | 't-mode' | 'prediction' | 'perpetuals';
export type AgentChain = 'cardano' | 'solana' | 'base';
export type AgentStatus = 'running' | 'stopped' | 'error';

export interface AgentPerformance {
  pnl24h: number;
  pnl24hPct: number;
  winRate: number;
  totalTrades: number;
  bestTrade?: {
    pair: string;
    profit: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  mode: AgentMode;
  chain: AgentChain;
  walletAddress: string;
  createdAt: string;
  status: AgentStatus;
  performance: AgentPerformance;
}

export interface AgentProfileCardProps {
  agent: Agent;
  onNameChange: (name: string) => void;
  onAvatarChange: (file: File) => void;
  onStart: () => void;
  onStop: () => void;
  onUpdate: () => void;
  onScrollToSettings?: () => void;
}

/**
 * RPG-style character card for agent profile
 * Features:
 * - Avatar upload with fallback to initials
 * - Editable name field
 * - Runtime state indicator
 * - Wallet address with copy button
 * - Performance stats (24h PnL, win rate, trades)
 * - Action buttons (Start/Pause, Update, Scroll to Settings)
 */
export function AgentProfileCard({
  agent,
  onNameChange,
  onAvatarChange,
  onStart,
  onStop,
  onUpdate,
  onScrollToSettings,
}: AgentProfileCardProps) {
  const { playTick } = useControlSound('toggle');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(agent.name);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (nameValue.trim() !== agent.name) {
      onNameChange(nameValue.trim());
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(agent.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      onAvatarChange(file);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    return agent.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = () => {
    switch (agent.status) {
      case 'running':
        return '#35ff9b';
      case 'error':
        return '#ff3b3b';
      case 'stopped':
      default:
        return '#666675';
    }
  };

  const formatPnl = (value: number, isPercent = false) => {
    const sign = value >= 0 ? '+' : '';
    return isPercent
      ? `${sign}${value.toFixed(2)}%`
      : `${sign}$${Math.abs(value).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.profileLayout}>
        {/* Avatar Section */}
        <div className={styles.avatarSection}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className={styles.fileInput}
            onChange={handleFileChange}
            aria-label="Upload avatar"
          />
          <button
            className={styles.avatarButton}
            onClick={handleAvatarClick}
            aria-label="Change avatar"
          >
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={`${agent.name} avatar`}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {getInitials()}
              </div>
            )}
          </button>
          <button className={styles.uploadBtn} onClick={handleAvatarClick}>
            <Upload size={14} />
            Upload
          </button>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.header}>
            {isEditingName ? (
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSubmit();
                  if (e.key === 'Escape') {
                    setNameValue(agent.name);
                    setIsEditingName(false);
                  }
                }}
                className={styles.nameInput}
                autoFocus
              />
            ) : (
              <h2
                className={styles.agentName}
                onClick={() => setIsEditingName(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(true)}
              >
                {agent.name}
              </h2>
            )}
            <div className={styles.statusBadge} style={{
              '--status-color': getStatusColor()
            } as React.CSSProperties}>
              <span className={styles.statusDot} />
              {agent.status.toUpperCase()}
            </div>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Mode:</span>
            <span className={styles.metaValue}>
              {agent.mode === 't-mode' ? 'T-Mode' :
               agent.mode === 'perpetuals' ? 'Perpetuals' :
               agent.mode === 'prediction' ? 'Prediction' : 'Standard'}
            </span>
          </div>

          <div className={styles.walletRow}>
            <span className={styles.walletLabel}>Wallet:</span>
            <code className={styles.walletAddress}>{agent.walletAddress}</code>
            <button
              className={styles.copyBtn}
              onClick={handleCopyAddress}
              aria-label="Copy wallet address"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          <div className={styles.createdRow}>
            <span className={styles.createdLabel}>Created:</span>
            <span className={styles.createdValue}>{formatDate(agent.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>24H PnL</div>
            <div className={`${styles.statValue} ${agent.performance.pnl24h >= 0 ? styles.positive : styles.negative}`}>
              {formatPnl(agent.performance.pnl24h)} ({formatPnl(agent.performance.pnl24hPct, true)})
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Win Rate</div>
            <div className={styles.statValue}>{agent.performance.winRate}%</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Trades</div>
            <div className={styles.statValue}>{agent.performance.totalTrades.toLocaleString()}</div>
          </div>
          {agent.performance.bestTrade && (
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Best Trade</div>
              <div className={`${styles.statValue} ${styles.positive}`}>
                {formatPnl(agent.performance.bestTrade.profit)} ({agent.performance.bestTrade.pair})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionsRow}>
        {agent.status === 'running' ? (
          <button className={`${styles.actionBtn} ${styles.pauseBtn}`} onClick={() => { playTick('down'); onStop(); }}>
            <span className={styles.btnIcon}>⏸</span>
            PAUSE
          </button>
        ) : (
          <button className={`${styles.actionBtn} ${styles.startBtn}`} onClick={() => { playTick('up'); onStart(); }}>
            <span className={styles.btnIcon}>▶</span>
            START
          </button>
        )}
        <button className={`${styles.actionBtn} ${styles.updateBtn}`} onClick={onUpdate}>
          <span className={styles.btnIcon}>↻</span>
          UPDATE
        </button>
        <button className={`${styles.actionBtn} ${styles.shareBtn}`} onClick={() => setShareModalOpen(true)}>
          <Share2 size={12} />
          SHARE
        </button>
      </div>

      {/* Share Modal */}
      <ShareCardModal
        agent={agent}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
