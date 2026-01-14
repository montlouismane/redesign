'use client';

import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import type { Agent } from './AgentProfileCard';
import styles from './ShareCardModal.module.css';

type Timeframe = '24h' | '7d' | '30d' | 'all';

interface ShareCardModalProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for generating and downloading agent performance share cards
 * Uses template image as background with dynamic stats overlay
 */
export function ShareCardModal({ agent, isOpen, onClose }: ShareCardModalProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: 'all', label: 'ALL TIME' },
  ];

  // Calculate estimated PnL for timeframes based on 24h data
  const getRealizedPnl = (tf: Timeframe): number => {
    const pnl24h = agent.performance.pnl24h;
    switch (tf) {
      case '24h': return pnl24h;
      case '7d': return pnl24h * 5.5;
      case '30d': return pnl24h * 18;
      case 'all': return pnl24h * 30;
      default: return pnl24h;
    }
  };

  // Calculate percentage based on a mock starting balance
  const getRealizedPnlPct = (tf: Timeframe): number => {
    const pnl = getRealizedPnl(tf);
    // Assume starting balance of ~$10k for percentage calculation
    const mockBalance = 10000;
    return (pnl / mockBalance) * 100;
  };

  const formatPnl = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPnlShort = (value: number): string => {
    const sign = value >= 0 ? '+' : '-';
    const absVal = Math.abs(value);
    if (absVal >= 1000) {
      return `${sign}$${(absVal / 1000).toFixed(1)}k`;
    }
    return `${sign}$${absVal.toFixed(0)}`;
  };

  const formatPct = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getModeLabel = (): string => {
    switch (agent.mode) {
      case 't-mode': return 'T-Mode';
      case 'perpetuals': return 'Perpetuals';
      case 'prediction': return 'Prediction';
      default: return 'Standard';
    }
  };

  const getChainLabel = (): string => {
    switch (agent.chain) {
      case 'cardano': return 'Cardano';
      case 'solana': return 'Solana';
      case 'base': return 'Base';
      default: return 'Unknown';
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/share-card/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          agentAvatar: agent.avatar || null,
          mode: agent.mode,
          chain: agent.chain,
          timeframe: selectedTimeframe,
          realizedPnl: getRealizedPnl(selectedTimeframe),
          realizedPnlPct: getRealizedPnlPct(selectedTimeframe),
          winRate: agent.performance.winRate,
          pnl24h: agent.performance.pnl24h,
          pnl7d: agent.performance.pnl24h * 5.5,
          trades: agent.performance.totalTrades,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share card');
      }

      const data = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = data.imageUrl;
      link.download = `${agent.name.replace(/\s+/g, '-').toLowerCase()}-winning-session.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Share card generation error:', err);
      setError('Failed to generate share card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const realizedPnl = getRealizedPnl(selectedTimeframe);
  const realizedPnlPct = getRealizedPnlPct(selectedTimeframe);
  const isPositive = realizedPnl >= 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Share Performance</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Card Preview - Uses actual template as background */}
        {/* All positioning uses percentages so preview matches generated image */}
        <div className={styles.previewContainer}>
          <div className={styles.cardPreview}>
            {/* Agent Info - positioned at 12.5% from top */}
            <div className={styles.agentInfo}>
              <div className={styles.agentAvatar}>
                {agent.avatar ? (
                  <img src={agent.avatar} alt={agent.name} />
                ) : (
                  <span>{agent.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.agentMeta}>
                <span className={styles.agentName}>{agent.name}</span>
                <span className={styles.agentMode}>{getModeLabel()} • {getChainLabel()}</span>
              </div>
            </div>

            {/* Realized PnL - positioned at 52% from top */}
            <div className={styles.pnlSection}>
              <div className={`${styles.pnlValue} ${isPositive ? styles.positive : styles.negative}`}>
                {formatPnl(realizedPnl)}
              </div>
              <div className={`${styles.pnlPct} ${isPositive ? styles.positive : styles.negative}`}>
                {formatPct(realizedPnlPct)}
              </div>
            </div>

            {/* Stats Row - positioned at 71% from top */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{agent.performance.winRate}%</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{formatPnlShort(agent.performance.pnl24h)}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{formatPnlShort(agent.performance.pnl24h * 5.5)}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>{agent.performance.totalTrades}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className={styles.timeframeSection}>
          <label className={styles.timeframeLabel}>Highlight Timeframe</label>
          <div className={styles.timeframeSelector}>
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                className={`${styles.timeframeBtn} ${selectedTimeframe === tf.value ? styles.active : ''}`}
                onClick={() => setSelectedTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.error}>{error}</div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                Generating...
              </>
            ) : (
              <>
                <Download size={16} />
                Generate & Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
