'use client';

import React, { useState } from 'react';
import { PieChart, Brain, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import type { AgentMode } from '../types';
import { AGENT_MODES, AGENT_MODE_ORDER, RISK_WARNINGS } from '../constants';

interface ModeSelectorProps {
  currentMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  disabled?: boolean;
  className?: string;
}

const MODE_ICONS: Record<AgentMode, typeof PieChart> = {
  standard: PieChart,
  't-mode': Brain,
  prediction: TrendingUp,
  perpetuals: Zap,
};

const RISK_COLORS: Record<string, string> = {
  low: 'rgb(34, 197, 94)',      // Green
  medium: 'rgb(234, 179, 8)',    // Yellow
  'medium-high': 'rgb(249, 115, 22)', // Orange
  high: 'rgb(239, 68, 68)',      // Red
};

export function ModeSelector({
  currentMode,
  onModeChange,
  disabled = false,
  className = '',
}: ModeSelectorProps) {
  const [pendingMode, setPendingMode] = useState<AgentMode | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleModeClick = (mode: AgentMode) => {
    if (disabled || mode === currentMode) return;

    const modeDef = AGENT_MODES[mode];

    // If risky mode, show confirmation first
    if (modeDef.showRiskWarning) {
      setPendingMode(mode);
      setShowConfirmation(true);
    } else {
      onModeChange(mode);
    }
  };

  const handleConfirm = () => {
    if (pendingMode) {
      onModeChange(pendingMode);
    }
    setShowConfirmation(false);
    setPendingMode(null);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingMode(null);
  };

  return (
    <div className={className}>
      {/* Mode buttons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AGENT_MODE_ORDER.map((mode) => {
          const modeDef = AGENT_MODES[mode];
          const Icon = MODE_ICONS[mode];
          const isSelected = mode === currentMode;
          const riskColor = RISK_COLORS[modeDef.riskLevel];

          return (
            <button
              key={mode}
              onClick={() => handleModeClick(mode)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center gap-2 p-4 rounded-lg
                transition-all duration-200
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
              style={{
                background: isSelected
                  ? `rgba(var(--ui-accent-rgb), 0.15)`
                  : 'var(--ui-control-bg)',
                border: isSelected
                  ? '2px solid rgba(var(--ui-accent-rgb), 0.6)'
                  : '1px solid var(--ui-control-border)',
                boxShadow: isSelected
                  ? '0 0 12px rgba(var(--ui-accent-rgb), 0.2)'
                  : 'none',
              }}
              aria-pressed={isSelected}
            >
              {/* Risk indicator dot */}
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ backgroundColor: riskColor }}
                title={`Risk: ${modeDef.riskLevel}`}
              />

              {/* Icon */}
              <Icon
                size={28}
                color={isSelected ? 'rgb(196, 124, 72)' : 'currentColor'}
                className={isSelected ? '' : 'text-[var(--ui-muted)]'}
              />

              {/* Label */}
              <span
                className="text-sm font-semibold uppercase tracking-wide"
                style={{
                  color: isSelected ? 'var(--ui-text)' : 'var(--ui-muted)',
                }}
              >
                {modeDef.hudLabel}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full"
                  style={{ backgroundColor: 'rgb(var(--ui-accent-rgb))' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mode description */}
      <p
        className="mt-3 text-sm"
        style={{ color: 'var(--ui-muted)' }}
      >
        {AGENT_MODES[currentMode].description}
      </p>

      {/* Risk confirmation modal */}
      {showConfirmation && pendingMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-md p-6 rounded-xl"
            style={{
              background: 'var(--ui-bg1)',
              border: '1px solid var(--ui-control-border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <AlertTriangle size={24} style={{ color: 'rgb(239, 68, 68)' }} />
              </div>
              <h3
                className="text-lg font-semibold"
                style={{ color: 'var(--ui-text)' }}
              >
                Risk Warning
              </h3>
            </div>

            {/* Warning message */}
            <p
              className="mb-6 text-sm leading-relaxed"
              style={{ color: 'var(--ui-muted)' }}
            >
              {RISK_WARNINGS[pendingMode] || RISK_WARNINGS.perpetuals}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
                style={{
                  background: 'var(--ui-control-bg)',
                  border: '1px solid var(--ui-control-border)',
                  color: 'var(--ui-text)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors"
                style={{
                  background: 'rgb(var(--ui-accent-rgb))',
                  color: 'white',
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
