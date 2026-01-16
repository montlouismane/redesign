'use client';

import React from 'react';
import type { StandardSettings as StandardSettingsType } from '../../types';
import { REBALANCE_FREQUENCIES, COMMON_TOKENS } from '../../constants';
import { FormField, Slider, Select, TokenList, NumberInput } from '../ui/FormField';

interface StandardSettingsProps {
  settings: StandardSettingsType;
  onChange: <K extends keyof StandardSettingsType>(
    field: K,
    value: StandardSettingsType[K]
  ) => void;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  className?: string;
}

export function StandardSettings({
  settings,
  onChange,
  errors = {},
  disabled = false,
  className = '',
}: StandardSettingsProps) {
  // Calculate total allocation
  const allocations = Object.entries(settings.targetAllocation);
  const totalAllocation = allocations.reduce((sum, [, pct]) => sum + pct, 0);

  const updateAllocation = (token: string, percentage: number) => {
    const newAlloc = { ...settings.targetAllocation, [token]: percentage };
    onChange('targetAllocation', newAlloc);
  };

  const removeToken = (token: string) => {
    const newAlloc = { ...settings.targetAllocation };
    delete newAlloc[token];
    onChange('targetAllocation', newAlloc);
  };

  const addToken = (token: string) => {
    if (!settings.targetAllocation[token]) {
      const newAlloc = { ...settings.targetAllocation, [token]: 0 };
      onChange('targetAllocation', newAlloc);
    }
  };

  const frequencyOptions = REBALANCE_FREQUENCIES.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  // Tokens not in allocation yet
  const availableTokens = COMMON_TOKENS.filter(
    (t) => !settings.targetAllocation[t]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Target Allocation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4
            className="text-sm font-medium"
            style={{ color: 'var(--ui-text)' }}
          >
            Target Allocation
          </h4>
          <span
            className="text-xs font-medium"
            style={{
              color:
                Math.abs(totalAllocation - 100) < 0.01
                  ? 'rgb(34, 197, 94)'
                  : 'rgb(239, 68, 68)',
            }}
          >
            {totalAllocation}% / 100%
          </span>
        </div>

        {errors.targetAllocation && (
          <p
            className="text-xs mb-2"
            style={{ color: 'rgb(239, 68, 68)' }}
          >
            {errors.targetAllocation}
          </p>
        )}

        {/* Allocation sliders */}
        <div className="space-y-3">
          {allocations.map(([token, percentage]) => (
            <div key={token} className="flex items-center gap-3">
              <span
                className="w-16 text-sm font-medium"
                style={{ color: 'var(--ui-text)' }}
              >
                {token}
              </span>
              <div className="flex-1">
                <Slider
                  value={percentage}
                  onChange={(val) => updateAllocation(token, val)}
                  min={0}
                  max={100}
                  step={1}
                  disabled={disabled}
                  formatValue={(v) => `${v}%`}
                />
              </div>
              <button
                type="button"
                onClick={() => removeToken(token)}
                disabled={disabled}
                className="p-1 rounded hover:bg-red-500/20 text-xs"
                style={{ color: 'var(--ui-muted)' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add token */}
        {availableTokens.length > 0 && (
          <div className="mt-3">
            <TokenList
              tokens={[]}
              onChange={(tokens) => {
                if (tokens.length > 0) {
                  addToken(tokens[0]);
                }
              }}
              suggestions={[...availableTokens]}
              placeholder="Add token to allocation..."
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* Rebalance Threshold */}
      <FormField
        label="Rebalance Threshold"
        error={errors.rebalanceThreshold}
        tooltip="Rebalance when any allocation drifts by this percentage from target"
      >
        <Slider
          value={settings.rebalanceThreshold}
          onChange={(val) => onChange('rebalanceThreshold', val)}
          min={1}
          max={20}
          step={1}
          disabled={disabled}
          formatValue={(v) => `${v}%`}
        />
      </FormField>

      {/* Rebalance Frequency */}
      <FormField
        label="Rebalance Frequency"
        error={errors.rebalanceFrequency}
        tooltip="How often to check allocations and rebalance if needed"
      >
        <Select
          value={settings.rebalanceFrequency}
          onChange={(val) =>
            onChange('rebalanceFrequency', val as StandardSettingsType['rebalanceFrequency'])
          }
          options={frequencyOptions}
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
