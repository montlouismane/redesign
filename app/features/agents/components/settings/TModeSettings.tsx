'use client';

import React from 'react';
import type { TModeSettings as TModeSettingsType } from '../../types';
import { REBALANCE_FREQUENCIES, COMMON_TOKENS } from '../../constants';
import { FormField, Slider, Select, TokenList, NumberInput } from '../ui/FormField';

interface TModeSettingsProps {
  settings: TModeSettingsType;
  onChange: <K extends keyof TModeSettingsType>(
    field: K,
    value: TModeSettingsType[K]
  ) => void;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  className?: string;
}

export function TModeSettings({
  settings,
  onChange,
  errors = {},
  disabled = false,
  className = '',
}: TModeSettingsProps) {
  const frequencyOptions = REBALANCE_FREQUENCIES.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Risk Tolerance */}
      <FormField
        label="Risk Tolerance"
        error={errors.riskTolerance}
        tooltip="Higher values allow more aggressive trading strategies"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>
            Conservative
          </span>
          <div className="flex-1">
            <Slider
              value={settings.riskTolerance}
              onChange={(val) => onChange('riskTolerance', val)}
              min={0}
              max={100}
              step={1}
              disabled={disabled}
              formatValue={(v) => `${v}%`}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>
            Aggressive
          </span>
        </div>
      </FormField>

      {/* Max Position Size */}
      <FormField
        label="Max Position Size"
        error={errors.maxPositionSize}
        tooltip="Maximum USD value for any single position"
      >
        <NumberInput
          value={settings.maxPositionSize}
          onChange={(val) => onChange('maxPositionSize', val)}
          min={1}
          max={1000000}
          prefix="$"
          disabled={disabled}
        />
      </FormField>

      {/* Take Profit / Stop Loss row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Take Profit"
          error={errors.takeProfitPercent}
          tooltip="Automatically sell when profit reaches this percentage"
        >
          <NumberInput
            value={settings.takeProfitPercent}
            onChange={(val) => onChange('takeProfitPercent', val)}
            min={1}
            max={1000}
            suffix="%"
            disabled={disabled}
          />
        </FormField>

        <FormField
          label="Stop Loss"
          error={errors.stopLossPercent}
          tooltip="Automatically sell when loss reaches this percentage"
        >
          <NumberInput
            value={settings.stopLossPercent}
            onChange={(val) => onChange('stopLossPercent', val)}
            min={1}
            max={99}
            suffix="%"
            disabled={disabled}
          />
        </FormField>
      </div>

      {/* Rebalance Frequency */}
      <FormField
        label="Rebalance Frequency"
        error={errors.rebalanceFrequency}
        tooltip="How often the AI analyzes and adjusts positions"
      >
        <Select
          value={settings.rebalanceFrequency}
          onChange={(val) =>
            onChange('rebalanceFrequency', val as TModeSettingsType['rebalanceFrequency'])
          }
          options={frequencyOptions}
          disabled={disabled}
        />
      </FormField>

      {/* Token Whitelist */}
      <FormField
        label="Token Whitelist"
        error={errors.tokenWhitelist}
        hint={settings.tokenWhitelist.length === 0 ? 'Empty = all tokens allowed' : undefined}
        tooltip="Only trade these tokens. Leave empty to allow all."
      >
        <TokenList
          tokens={settings.tokenWhitelist}
          onChange={(tokens) => onChange('tokenWhitelist', tokens)}
          suggestions={[...COMMON_TOKENS]}
          placeholder="Add allowed token..."
          disabled={disabled}
        />
      </FormField>

      {/* Token Blacklist */}
      <FormField
        label="Token Blacklist"
        error={errors.tokenBlacklist}
        tooltip="Never trade these tokens, regardless of other settings"
      >
        <TokenList
          tokens={settings.tokenBlacklist}
          onChange={(tokens) => onChange('tokenBlacklist', tokens)}
          suggestions={[...COMMON_TOKENS]}
          placeholder="Add blocked token..."
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
