'use client';

import React from 'react';
import type { PredictionSettings as PredictionSettingsType } from '../../types';
import { PREDICTION_MARKET_TYPES } from '../../constants';
import { FormField, Slider, MultiSelect, NumberInput } from '../ui/FormField';

interface PredictionSettingsProps {
  settings: PredictionSettingsType;
  onChange: <K extends keyof PredictionSettingsType>(
    field: K,
    value: PredictionSettingsType[K]
  ) => void;
  errors?: Record<string, string | undefined>;
  disabled?: boolean;
  className?: string;
}

export function PredictionSettingsForm({
  settings,
  onChange,
  errors = {},
  disabled = false,
  className = '',
}: PredictionSettingsProps) {
  const marketTypeOptions = PREDICTION_MARKET_TYPES.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Types */}
      <FormField
        label="Market Types"
        error={errors.marketTypes}
        tooltip="Which prediction market categories to participate in"
      >
        <MultiSelect
          values={settings.marketTypes}
          onChange={(vals) =>
            onChange('marketTypes', vals as PredictionSettingsType['marketTypes'])
          }
          options={marketTypeOptions}
          disabled={disabled}
        />
      </FormField>

      {/* Min Confidence */}
      <FormField
        label="Minimum Confidence"
        error={errors.minConfidence}
        tooltip="Only enter positions when AI confidence exceeds this threshold"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>
            Low
          </span>
          <div className="flex-1">
            <Slider
              value={settings.minConfidence}
              onChange={(val) => onChange('minConfidence', val)}
              min={0}
              max={100}
              step={5}
              disabled={disabled}
              formatValue={(v) => `${v}%`}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--ui-muted)' }}>
            High
          </span>
        </div>
        <p
          className="mt-1 text-xs"
          style={{ color: 'var(--ui-muted)' }}
        >
          {settings.minConfidence < 50
            ? 'Warning: Low confidence threshold may lead to more losses'
            : settings.minConfidence > 80
            ? 'High threshold means fewer but more confident trades'
            : 'Balanced threshold for moderate trade frequency'}
        </p>
      </FormField>

      {/* Max Exposure */}
      <FormField
        label="Max Exposure Per Prediction"
        error={errors.maxExposure}
        tooltip="Maximum USD amount to stake on any single prediction"
      >
        <NumberInput
          value={settings.maxExposure}
          onChange={(val) => onChange('maxExposure', val)}
          min={1}
          max={100000}
          prefix="$"
          disabled={disabled}
        />
      </FormField>

      {/* Max Open Positions */}
      <FormField
        label="Max Open Positions"
        error={errors.maxOpenPositions}
        tooltip="Maximum number of simultaneous open predictions"
      >
        <NumberInput
          value={settings.maxOpenPositions}
          onChange={(val) => onChange('maxOpenPositions', val)}
          min={1}
          max={100}
          disabled={disabled}
        />
      </FormField>
    </div>
  );
}
