'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { PerpetualsSettings as PerpetualsSettingsType } from '../../types';
import { COMMON_PERP_PAIRS, RISK_WARNINGS } from '../../constants';
import { FormField, Slider, Select, TokenList, NumberInput } from '../ui/FormField';

interface PerpetualsSettingsProps {
  settings: PerpetualsSettingsType;
  onChange: <K extends keyof PerpetualsSettingsType>(
    field: K,
    value: PerpetualsSettingsType[K]
  ) => void;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  className?: string;
}

export function PerpetualsSettings({
  settings,
  onChange,
  errors = {},
  disabled = false,
  className = '',
}: PerpetualsSettingsProps) {
  const marginTypeOptions = [
    { value: 'isolated', label: 'Isolated' },
    { value: 'cross', label: 'Cross' },
  ];

  const showHighLeverageWarning = settings.maxLeverage > 10;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* High leverage warning */}
      {showHighLeverageWarning && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertTriangle
            size={20}
            className="flex-shrink-0 mt-0.5"
            style={{ color: 'rgb(239, 68, 68)' }}
          />
          <p className="text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
            {RISK_WARNINGS.highLeverage}
          </p>
        </div>
      )}

      {/* Max Leverage */}
      <FormField
        label="Max Leverage"
        error={errors.maxLeverage}
        tooltip="Maximum leverage allowed for any position"
      >
        <Slider
          value={settings.maxLeverage}
          onChange={(val) => {
            onChange('maxLeverage', val);
            // Ensure default doesn't exceed max
            if (settings.defaultLeverage > val) {
              onChange('defaultLeverage', val);
            }
          }}
          min={1}
          max={100}
          step={1}
          disabled={disabled}
          formatValue={(v) => `${v}x`}
        />
      </FormField>

      {/* Default Leverage */}
      <FormField
        label="Default Leverage"
        error={errors.defaultLeverage}
        tooltip="Leverage used for new positions by default"
      >
        <Slider
          value={settings.defaultLeverage}
          onChange={(val) => onChange('defaultLeverage', val)}
          min={1}
          max={settings.maxLeverage}
          step={1}
          disabled={disabled}
          formatValue={(v) => `${v}x`}
        />
      </FormField>

      {/* Take Profit / Stop Loss row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Take Profit"
          error={errors.takeProfitPercent}
          tooltip="Automatically close position when profit reaches this %"
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
          tooltip="Automatically close position when loss reaches this %"
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

      {/* Max Position Size */}
      <FormField
        label="Max Position Size"
        error={errors.maxPositionSize}
        tooltip="Maximum USD value for any single position (before leverage)"
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

      {/* Margin Type */}
      <FormField
        label="Margin Type"
        error={errors.marginType}
        tooltip="Isolated: each position has separate margin. Cross: margin is shared."
      >
        <Select
          value={settings.marginType}
          onChange={(val) =>
            onChange('marginType', val as PerpetualsSettingsType['marginType'])
          }
          options={marginTypeOptions}
          disabled={disabled}
        />
      </FormField>

      {/* Pair Whitelist */}
      <FormField
        label="Trading Pairs"
        error={errors.pairWhitelist}
        tooltip="Perpetual pairs this agent is allowed to trade"
      >
        <TokenList
          tokens={settings.pairWhitelist}
          onChange={(tokens) => onChange('pairWhitelist', tokens)}
          suggestions={[...COMMON_PERP_PAIRS]}
          placeholder="Add trading pair..."
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
