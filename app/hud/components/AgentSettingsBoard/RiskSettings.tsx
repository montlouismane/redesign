'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ControlRow } from './CollapsibleSection';
import { RiskConfig } from './AgentSettingsBoard';
import { MetallicDial } from '../controls/MetallicDial';
import { HorizontalSlider } from '../controls/HorizontalSlider';
import { TimeAdjuster } from '../controls/TimeAdjuster';
import { HudToggle } from '../controls/HudToggle';
import { InfoTooltip } from '../controls/InfoTooltip';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { TOOLTIPS, DISABLED_REASONS } from '../../constants/tooltips';
import styles from './AgentSettingsBoard.module.css';
import type { AgentMode } from './AgentProfileCard';

export interface RiskSettingsProps {
  settings: RiskConfig;
  onChange: (settings: Partial<RiskConfig>) => void;
  /** Current trading mode - some settings are disabled in Standard mode */
  mode?: AgentMode;
}

/**
 * Partial Profit Taking Section - Carousel Layout
 */
function PartialProfitTakingSection({ settings, onChange, mode }: RiskSettingsProps) {
  const isDisabled = mode === 'standard';
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [editingTrailId, setEditingTrailId] = useState<string | null>(null);

  const targets = settings.partialExits?.targets ?? [];
  const cardWidth = 336; // 320px card + 16px gap

  // Check scroll state
  const updateScrollState = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    // Check if content overflows (needs scrolling)
    setNeedsScroll(scrollWidth > clientWidth + 10);
  };

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState);
      // Also check on resize
      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        resizeObserver.disconnect();
      };
    }
  }, [targets.length]);

  const scrollTo = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <div className={`${styles.section} ${isDisabled ? styles.sectionDisabled : ''}`}>
      <div className={styles.sectionHeader}>
        <div className={styles.cardTitle}>
          Partial Profit Taking
          <InfoTooltip text={isDisabled ? DISABLED_REASONS.standard.partialExits : TOOLTIPS.riskManagement.partialExits.main} />
        </div>
        <HudToggle
          value={isDisabled ? false : (settings.partialExits?.enabled ?? false)}
          onChange={(value) => {
            if (isDisabled) return;
            onChange({
              partialExits: {
                ...settings.partialExits,
                enabled: value,
                targets: targets.length > 0 ? targets : [
                  { id: '1', pnlPct: 10, sellPct: 50, trailingAfter: false },
                  { id: '2', pnlPct: 20, sellPct: 25, trailingAfter: true, trailingDistancePct: 5 }
                ]
              }
            });
          }}
          disabled={isDisabled}
        />
      </div>
      <div className={styles.sectionContent}>
        {/* Carousel with navigation */}
        <div className={styles.tpCarousel}>
          {needsScroll && (
            <button
              className={styles.tpCarouselBtn}
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className={styles.tpCarouselTrack}>
            <div ref={carouselRef} className={styles.tpTargetList}>
              {targets.map((target, index) => (
                <div key={target.id} className={styles.tpTarget}>
                  <div className={styles.tpTargetHeader}>
                    <span className={styles.tpTargetLabel}>Take Profit #{index + 1}</span>
                    <button
                      className={styles.tpDeleteBtn}
                      onClick={() => {
                        const newTargets = targets.filter(t => t.id !== target.id);
                        onChange({
                          partialExits: {
                            ...settings.partialExits,
                            enabled: settings.partialExits?.enabled ?? false,
                            targets: newTargets
                          }
                        });
                      }}
                      title="Remove target"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className={styles.tpTargetInputs}>
                    <ControlRow
                      label="At Profit"
                      helper="Trigger %"
                      tooltip={TOOLTIPS.riskManagement.partialExits.atProfit}
                    >
                      <MetallicDial
                        value={target.pnlPct}
                        onChange={(value) => {
                          const newTargets = targets.map(t =>
                            t.id === target.id ? { ...t, pnlPct: value } : t
                          );
                          onChange({
                            partialExits: {
                              ...settings.partialExits,
                              enabled: settings.partialExits?.enabled ?? false,
                              targets: newTargets
                            }
                          });
                        }}
                        min={1} max={100} step={1} unit="%"
                        size={90}
                      />
                    </ControlRow>
                    <ControlRow
                      label="Sell Amount"
                      helper="% of position"
                      tooltip={TOOLTIPS.riskManagement.partialExits.sellPercent}
                    >
                      <MetallicDial
                        value={target.sellPct}
                        onChange={(value) => {
                          const newTargets = targets.map(t =>
                            t.id === target.id ? { ...t, sellPct: value } : t
                          );
                          onChange({
                            partialExits: {
                              ...settings.partialExits,
                              enabled: settings.partialExits?.enabled ?? false,
                              targets: newTargets
                            }
                          });
                        }}
                        min={1} max={100} step={1} unit="%"
                        size={90}
                      />
                    </ControlRow>
                  </div>

                  <div className={styles.tpTrailingRow}>
                    <div className={styles.tpTrailingToggle}>
                      <span className={styles.tpTrailingLabel}>
                        Trailing Stop
                        <InfoTooltip text={TOOLTIPS.riskManagement.partialExits.trailingStopAfter} size={12} />
                      </span>
                      <HudToggle
                        value={target.trailingAfter ?? false}
                        onChange={(value) => {
                          const newTargets = targets.map(t =>
                            t.id === target.id ? { ...t, trailingAfter: value } : t
                          );
                          onChange({
                            partialExits: {
                              ...settings.partialExits,
                              enabled: settings.partialExits?.enabled ?? false,
                              targets: newTargets
                            }
                          });
                        }}
                      />
                    </div>
                    {target.trailingAfter && (
                      <div className={styles.tpTrailingDistance}>
                        <div className={styles.compactAdjuster}>
                          {editingTrailId === target.id ? (
                            <input
                              type="number"
                              className={styles.compactInput}
                              defaultValue={target.trailingDistancePct ?? 5}
                              min={1}
                              max={20}
                              autoFocus
                              onBlur={(e) => {
                                const newVal = Math.min(20, Math.max(1, parseInt(e.target.value) || 5));
                                const newTargets = targets.map(t =>
                                  t.id === target.id ? { ...t, trailingDistancePct: newVal } : t
                                );
                                onChange({
                                  partialExits: {
                                    ...settings.partialExits,
                                    enabled: settings.partialExits?.enabled ?? false,
                                    targets: newTargets
                                  }
                                });
                                setEditingTrailId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                } else if (e.key === 'Escape') {
                                  setEditingTrailId(null);
                                }
                              }}
                            />
                          ) : (
                            <span
                              className={styles.compactValue}
                              onClick={() => setEditingTrailId(target.id)}
                              title="Click to edit"
                            >
                              {target.trailingDistancePct ?? 5}
                              <span className={styles.compactUnit}>%</span>
                            </span>
                          )}
                          <div className={styles.compactButtons}>
                            <button
                              className={styles.compactBtn}
                              onClick={() => {
                                const newVal = Math.max(1, (target.trailingDistancePct ?? 5) - 1);
                                const newTargets = targets.map(t =>
                                  t.id === target.id ? { ...t, trailingDistancePct: newVal } : t
                                );
                                onChange({
                                  partialExits: {
                                    ...settings.partialExits,
                                    enabled: settings.partialExits?.enabled ?? false,
                                    targets: newTargets
                                  }
                                });
                              }}
                            >
                              −
                            </button>
                            <button
                              className={styles.compactBtn}
                              onClick={() => {
                                const newVal = Math.min(20, (target.trailingDistancePct ?? 5) + 1);
                                const newTargets = targets.map(t =>
                                  t.id === target.id ? { ...t, trailingDistancePct: newVal } : t
                                );
                                onChange({
                                  partialExits: {
                                    ...settings.partialExits,
                                    enabled: settings.partialExits?.enabled ?? false,
                                    targets: newTargets
                                  }
                                });
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Card */}
              {targets.length < 5 && (
                <button
                  className={styles.tpAddCard}
                  onClick={() => {
                    const newTarget = {
                      id: String(Date.now()),
                      pnlPct: (targets[targets.length - 1]?.pnlPct ?? 10) + 10,
                      sellPct: 25,
                      trailingAfter: false
                    };
                    onChange({
                      partialExits: {
                        ...settings.partialExits,
                        enabled: settings.partialExits?.enabled ?? false,
                        targets: [...targets, newTarget]
                      }
                    });
                    // Scroll to new card after adding
                    setTimeout(() => {
                      if (carouselRef.current) {
                        carouselRef.current.scrollTo({
                          left: carouselRef.current.scrollWidth,
                          behavior: 'smooth'
                        });
                      }
                    }, 50);
                  }}
                >
                  <Plus size={24} />
                  Add Target
                </button>
              )}
            </div>
          </div>

          {needsScroll && (
            <button
              className={styles.tpCarouselBtn}
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Summary */}
        {targets.length > 0 && (
          <div className={styles.tpSummary}>
            <span className={styles.tpSummaryLabel}>
              Total sell at targets:
            </span>
            <span className={
              targets.reduce((sum, t) => sum + t.sellPct, 0) > 100
                ? styles.tpSummaryWarning
                : styles.tpSummaryValue
            }>
              {targets.reduce((sum, t) => sum + t.sellPct, 0)}%
              {targets.reduce((sum, t) => sum + t.sellPct, 0) < 100 && (
                <span style={{ opacity: 0.7, marginLeft: '8px' }}>
                  ({100 - targets.reduce((sum, t) => sum + t.sellPct, 0)}% held for final TP/SL)
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Risk Settings Component
 *
 * Shared risk management configuration across all trading modes.
 * Uses unified board layout for seamless panel feel.
 *
 * Sections:
 * - Recent Buy Guard: Hold time, profit unlock, emergency stop (global)
 * - Edge-After-Cost Gate: Net edge validation before trades (disabled in Standard)
 * - Liquidity Guard: Market impact and liquidity checks
 * - Cooldowns: Per-asset trade spacing rules (disabled in Standard)
 * - Portfolio Risk: Overall position and loss limits
 * - Dry Run: Testing mode with virtual funds
 * - Partial Profit Taking (disabled in Standard)
 */
export function RiskSettings({ settings, onChange, mode }: RiskSettingsProps) {
  // Standard mode disables Edge Gate, Cooldowns, and Partial Exits
  const isStandardMode = mode === 'standard';

  return (
    <div className={styles.unifiedBoard}>
      {/* Angular frame overlay */}
      <div className={styles.panelFrame}>
        <div className={styles.frameLines} />
        <div className={styles.frameAccents}>
          <div className={`${styles.accent} ${styles.accentTL}`} />
          <div className={`${styles.accent} ${styles.accentTR}`} />
          <div className={`${styles.accent} ${styles.accentBL}`} />
          <div className={`${styles.accent} ${styles.accentBR}`} />
        </div>
      </div>

      {/* Recent Buy Guard (Full Width) - Primary risk settings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>
            Recent Buy Guard
            <InfoTooltip text={TOOLTIPS.safety.recentBuyGuard.main} />
          </div>
        </div>
        <div className={styles.sectionContent}>
          {/* 4 controls = 4-col (responsive: 2x2 on smaller) */}
          <div className={styles.grid4col}>
            <ControlRow
              label="Min Hold Time"
              helper="Hold period after buy"
              tooltip={TOOLTIPS.safety.recentBuyGuard.holdWindow}
            >
              <TimeAdjuster
                value={settings.minHoldTime ?? 30}
                onChange={(value) => onChange({ minHoldTime: value })}
                min={1} max={120} step={1} unit="min" size="large"
              />
            </ControlRow>
            <ControlRow
              label="Profit Unlock"
              helper="Bypasses hold time"
              tooltip={TOOLTIPS.safety.recentBuyGuard.profitUnlock}
            >
              <MetallicDial
                value={settings.profitUnlock ?? 20}
                onChange={(value) => onChange({ profitUnlock: value })}
                min={0} max={50} safeMin={10} safeMax={30} unit="%"
                size={140}
              />
            </ControlRow>
            <ControlRow
              label="Emergency Stop"
              helper="Loss % triggers sell"
              tooltip={TOOLTIPS.safety.recentBuyGuard.emergencyStop}
            >
              <MetallicDial
                value={settings.emergencyStop ?? 6}
                onChange={(value) => onChange({ emergencyStop: value })}
                min={0} max={50} safeMin={3} safeMax={15} unit="%"
                size={140}
              />
            </ControlRow>
            <ControlRow label="Trailing Unlock" helper="% from peak">
              <MetallicDial
                value={settings.trailingUnlock ?? 0}
                onChange={(value) => onChange({ trailingUnlock: value })}
                min={0} max={20} step={1} unit="%"
                size={140}
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Row: Edge-After-Cost Gate & Liquidity Guard */}
      <div className={styles.sectionRow}>
        {/* Edge-After-Cost Gate */}
        <div className={`${styles.section} ${isStandardMode ? styles.sectionDisabled : ''}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>
              Edge-After-Cost Gate
              <InfoTooltip text={isStandardMode ? DISABLED_REASONS.standard.edgeGate : TOOLTIPS.riskManagement.edgeGate.main} />
            </div>
            <HudToggle
              value={isStandardMode ? false : (settings.edgeGateEnabled ?? false)}
              onChange={(value) => {
                if (isStandardMode) return;
                onChange({ edgeGateEnabled: value });
              }}
              disabled={isStandardMode}
            />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              <ControlRow
                label="Min Net Edge"
                helper="Minimum profit margin required"
                tooltip={TOOLTIPS.riskManagement.edgeGate.minNetEdge}
              >
                <MetallicDial
                  value={settings.minNetEdge ?? 0.5}
                  onChange={(value) => onChange({ minNetEdge: value })}
                  min={0}
                  max={10}
                  step={0.1}
                  unit="%"
                />
              </ControlRow>
              <ControlRow
                label="Log Skips"
                helper="Record skipped trades"
                tooltip={TOOLTIPS.riskManagement.edgeGate.logSkippedTrades}
              >
                <HudToggle
                  value={settings.logSkippedEdge ?? true}
                  onChange={(value) => onChange({ logSkippedEdge: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Liquidity Guard */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>
              Liquidity Guard
              <InfoTooltip text={TOOLTIPS.riskManagement.liquidityGuard.main} />
            </div>
            <HudToggle
              value={settings.liquidityGuardEnabled ?? true}
              onChange={(value) => onChange({ liquidityGuardEnabled: value })}
            />
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
              <ControlRow
                label="Max Impact"
                helper="Max slippage impact"
                tooltip={TOOLTIPS.riskManagement.liquidityGuard.maxPriceImpact}
              >
                <MetallicDial
                  value={settings.maxImpact ?? 3.0}
                  onChange={(value) => onChange({ maxImpact: value })}
                  min={0.5} max={20} step={0.5} unit="%"
                />
              </ControlRow>
              <ControlRow
                label="Auto Downsize"
                helper="Reduce size if impact high"
                tooltip={TOOLTIPS.riskManagement.liquidityGuard.autoDownsize}
              >
                <HudToggle
                  value={settings.autoDownsize ?? true}
                  onChange={(value) => onChange({ autoDownsize: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Cooldown Rules (Full Width) */}
      <div className={`${styles.section} ${isStandardMode ? styles.sectionDisabled : ''}`}>
        <div className={styles.sectionHeader}>
          <div className={styles.cardTitle}>
            Cooldown Rules
            <InfoTooltip text={isStandardMode ? DISABLED_REASONS.standard.cooldowns : TOOLTIPS.riskManagement.cooldowns.main} />
          </div>
          <HudToggle
            value={isStandardMode ? false : (settings.perAssetCooldownEnabled ?? true)}
            onChange={(value) => {
              if (isStandardMode) return;
              onChange({ perAssetCooldownEnabled: value });
            }}
            disabled={isStandardMode}
          />
        </div>
        <div className={styles.sectionContent}>
          {/* 3 controls = 3-col (responsive: 2+1 centered on smaller) */}
          <div className={styles.grid3col}>
            <ControlRow
              label="Win Cooldown"
              helper="Wait after profitable trade"
              tooltip={TOOLTIPS.riskManagement.cooldowns.winCooldown}
            >
              <TimeAdjuster
                value={settings.winCooldown ?? 15}
                onChange={(value) => onChange({ winCooldown: value })}
                min={0} max={60} step={5} unit="min" size="large"
              />
            </ControlRow>
            <ControlRow
              label="Loss Cooldown"
              helper="Wait after losing trade"
              tooltip={TOOLTIPS.riskManagement.cooldowns.lossCooldown}
            >
              <TimeAdjuster
                value={settings.lossCooldown ?? 60}
                onChange={(value) => onChange({ lossCooldown: value })}
                min={0} max={120} step={5} unit="min" size="large"
              />
            </ControlRow>
            <ControlRow
              label="Scratch Cooldown"
              helper="Wait after break-even"
              tooltip={TOOLTIPS.riskManagement.cooldowns.scratchCooldown}
            >
              <TimeAdjuster
                value={settings.scratchCooldown ?? 30}
                onChange={(value) => onChange({ scratchCooldown: value })}
                min={0} max={60} step={5} unit="min" size="large"
              />
            </ControlRow>
          </div>
        </div>
      </div>

      {/* Row: Portfolio Risk & Simulation Mode */}
      <div className={styles.sectionRow}>
        {/* Portfolio Risk */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>
              Portfolio Risk
              <InfoTooltip text={TOOLTIPS.riskManagement.portfolioRisk.main} />
            </div>
          </div>
          <div className={styles.sectionContent}>
            <ControlRow
              label="Max Open Positions"
              helper="Concurrent position limit"
              tooltip={TOOLTIPS.riskManagement.portfolioRisk.maxOpenPositions}
            >
              <TimeAdjuster
                value={settings.maxOpenPositions ?? 10}
                onChange={(value) => onChange({ maxOpenPositions: value })}
                min={1} max={50} step={1} unit="" size="large"
              />
            </ControlRow>
            <div className={styles.denseGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px', marginTop: '16px' }}>
              <ControlRow
                label="Max Position %"
                tooltip={TOOLTIPS.riskManagement.portfolioRisk.maxSinglePosition}
              >
                <MetallicDial
                  value={settings.maxSinglePosition ?? 20}
                  onChange={(value) => onChange({ maxSinglePosition: value })}
                  min={1} max={100} unit="%"
                />
              </ControlRow>
              <ControlRow
                label="Max Daily Loss"
                tooltip={TOOLTIPS.riskManagement.portfolioRisk.maxDailyLoss}
              >
                <MetallicDial
                  value={settings.maxDailyLoss ?? 10}
                  onChange={(value) => onChange({ maxDailyLoss: value })}
                  min={1} max={50} unit="%"
                />
              </ControlRow>
            </div>
          </div>
        </div>

        {/* Simulation Mode */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.cardTitle}>
              Simulation Mode
              <InfoTooltip text={TOOLTIPS.safety.paperTrading.main} />
            </div>
            <HudToggle
              value={settings.dryRunEnabled ?? false}
              onChange={(value) => onChange({ dryRunEnabled: value })}
            />
          </div>
          <div className={styles.sectionContent}>
            <ControlRow label="Starting Capital">
              <HorizontalSlider
                value={settings.virtualAda ?? 10000}
                onChange={(value) => onChange({ virtualAda: value })}
                min={100} max={50000} step={100} unit="ADA"
              />
            </ControlRow>
            <div style={{ marginTop: '16px' }}>
              <ControlRow label="Log to DB">
                <HudToggle
                  value={settings.logToDatabase ?? true}
                  onChange={(value) => onChange({ logToDatabase: value })}
                />
              </ControlRow>
            </div>
          </div>
        </div>
      </div>

      {/* Partial Profit Taking (Full Width) */}
      <PartialProfitTakingSection settings={settings} onChange={onChange} mode={mode} />
    </div>
  );
}
