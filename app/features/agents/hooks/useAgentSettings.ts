'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  Agent,
  AgentMode,
  AgentSettings,
  StandardSettings,
  TModeSettings,
  PredictionSettings,
  PerpetualsSettings,
  UpdateAgentPayload,
} from '../types';
import { VALIDATION, RISK_WARNINGS } from '../constants';

// =============================================================================
// Types
// =============================================================================

export interface ValidationErrors {
  name?: string;
  [key: string]: string | undefined;
}

interface UseAgentSettingsReturn {
  /** Current form values */
  formValues: AgentSettings;
  /** Agent name (separate from settings) */
  name: string;
  /** Current mode */
  mode: AgentMode;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Validation errors */
  errors: ValidationErrors;
  /** Whether form is valid */
  isValid: boolean;
  /** Update a single field */
  updateField: <K extends keyof AgentSettings>(
    section: K,
    field: keyof AgentSettings[K],
    value: AgentSettings[K][keyof AgentSettings[K]]
  ) => void;
  /** Update the agent name */
  updateName: (name: string) => void;
  /** Update the mode */
  updateMode: (mode: AgentMode) => void;
  /** Get the payload to send to API */
  getUpdatePayload: () => UpdateAgentPayload;
  /** Reset form to original values */
  reset: () => void;
  /** Validate the form */
  validate: () => boolean;
  /** Get risk warning for current mode (if any) */
  riskWarning: string | null;
}

// =============================================================================
// Hook
// =============================================================================

export function useAgentSettings(agent: Agent | null): UseAgentSettingsReturn {
  // Original values (for dirty check)
  const [originalSettings, setOriginalSettings] = useState<AgentSettings | null>(null);
  const [originalName, setOriginalName] = useState<string>('');
  const [originalMode, setOriginalMode] = useState<AgentMode>('standard');

  // Current form values
  const [formValues, setFormValues] = useState<AgentSettings | null>(null);
  const [name, setName] = useState<string>('');
  const [mode, setMode] = useState<AgentMode>('standard');
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Initialize from agent
  useEffect(() => {
    if (agent) {
      setOriginalSettings(agent.settings);
      setOriginalName(agent.name);
      setOriginalMode(agent.mode);
      setFormValues(agent.settings);
      setName(agent.name);
      setMode(agent.mode);
      setErrors({});
    }
  }, [agent]);

  // Compute dirty state
  const isDirty = useMemo(() => {
    if (!formValues || !originalSettings) return false;

    const nameChanged = name !== originalName;
    const modeChanged = mode !== originalMode;
    const settingsChanged = JSON.stringify(formValues) !== JSON.stringify(originalSettings);

    return nameChanged || modeChanged || settingsChanged;
  }, [formValues, originalSettings, name, originalName, mode, originalMode]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate name
    if (!name || name.trim().length < VALIDATION.name.minLength) {
      newErrors.name = 'Name is required';
    } else if (name.length > VALIDATION.name.maxLength) {
      newErrors.name = `Name must be ${VALIDATION.name.maxLength} characters or less`;
    }

    if (!formValues) {
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Validate current mode settings
    switch (mode) {
      case 'standard': {
        const s = formValues.standard;
        const totalAllocation = Object.values(s.targetAllocation).reduce((a, b) => a + b, 0);
        if (Math.abs(totalAllocation - 100) > 0.01) {
          newErrors.targetAllocation = `Allocation must sum to 100% (currently ${totalAllocation}%)`;
        }
        break;
      }

      case 't-mode': {
        const t = formValues.tMode;
        if (t.riskTolerance < VALIDATION.riskTolerance.min || t.riskTolerance > VALIDATION.riskTolerance.max) {
          newErrors.riskTolerance = `Risk tolerance must be between ${VALIDATION.riskTolerance.min} and ${VALIDATION.riskTolerance.max}`;
        }
        if (t.maxPositionSize < VALIDATION.positionSize.min) {
          newErrors.maxPositionSize = `Position size must be at least $${VALIDATION.positionSize.min}`;
        }
        if (t.stopLossPercent <= 0 || t.stopLossPercent >= 100) {
          newErrors.stopLossPercent = 'Stop loss must be between 0% and 100%';
        }
        if (t.takeProfitPercent <= 0 || t.takeProfitPercent >= 1000) {
          newErrors.takeProfitPercent = 'Take profit must be between 0% and 1000%';
        }
        break;
      }

      case 'prediction': {
        const p = formValues.prediction;
        if (p.marketTypes.length === 0) {
          newErrors.marketTypes = 'Select at least one market type';
        }
        if (p.minConfidence < 0 || p.minConfidence > 100) {
          newErrors.minConfidence = 'Confidence must be between 0% and 100%';
        }
        if (p.maxExposure < 1) {
          newErrors.maxExposure = 'Max exposure must be at least $1';
        }
        if (p.maxOpenPositions < 1) {
          newErrors.maxOpenPositions = 'Must allow at least 1 open position';
        }
        break;
      }

      case 'perpetuals': {
        const perp = formValues.perpetuals;
        if (perp.maxLeverage < VALIDATION.leverage.min || perp.maxLeverage > VALIDATION.leverage.max) {
          newErrors.maxLeverage = `Max leverage must be between ${VALIDATION.leverage.min}x and ${VALIDATION.leverage.max}x`;
        }
        if (perp.defaultLeverage > perp.maxLeverage) {
          newErrors.defaultLeverage = 'Default leverage cannot exceed max leverage';
        }
        if (perp.pairWhitelist.length === 0) {
          newErrors.pairWhitelist = 'Select at least one trading pair';
        }
        if (perp.stopLossPercent <= 0 || perp.stopLossPercent >= 100) {
          newErrors.stopLossPercent = 'Stop loss must be between 0% and 100%';
        }
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, mode, formValues]);

  // Check if valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Update a field in a settings section
  const updateField = useCallback(
    <K extends keyof AgentSettings>(
      section: K,
      field: keyof AgentSettings[K],
      value: AgentSettings[K][keyof AgentSettings[K]]
    ) => {
      setFormValues((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value,
          },
        };
      });
      // Clear error for this field
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    []
  );

  const updateName = useCallback((newName: string) => {
    setName(newName);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.name;
      return next;
    });
  }, []);

  const updateMode = useCallback((newMode: AgentMode) => {
    setMode(newMode);
  }, []);

  const getUpdatePayload = useCallback((): UpdateAgentPayload => {
    const payload: UpdateAgentPayload = {};

    if (name !== originalName) {
      payload.name = name;
    }

    if (mode !== originalMode) {
      payload.mode = mode;
    }

    if (formValues && JSON.stringify(formValues) !== JSON.stringify(originalSettings)) {
      payload.settings = formValues;
    }

    return payload;
  }, [name, originalName, mode, originalMode, formValues, originalSettings]);

  const reset = useCallback(() => {
    if (originalSettings) {
      setFormValues(originalSettings);
    }
    setName(originalName);
    setMode(originalMode);
    setErrors({});
  }, [originalSettings, originalName, originalMode]);

  // Get risk warning for current mode
  const riskWarning = useMemo(() => {
    if (mode === 'prediction') return RISK_WARNINGS.prediction;
    if (mode === 'perpetuals') return RISK_WARNINGS.perpetuals;
    return null;
  }, [mode]);

  // Default values if no agent loaded
  const defaultSettings: AgentSettings = {
    standard: { targetAllocation: {}, rebalanceThreshold: 5, rebalanceFrequency: 'daily' },
    tMode: { riskTolerance: 50, maxPositionSize: 1000, tokenWhitelist: [], tokenBlacklist: [], rebalanceFrequency: 'daily', takeProfitPercent: 15, stopLossPercent: 10 },
    prediction: { marketTypes: ['crypto'], minConfidence: 70, maxExposure: 100, maxOpenPositions: 5 },
    perpetuals: { maxLeverage: 5, defaultLeverage: 2, pairWhitelist: [], stopLossPercent: 5, takeProfitPercent: 10, maxPositionSize: 500, marginType: 'isolated' },
  };

  return {
    formValues: formValues ?? defaultSettings,
    name,
    mode,
    isDirty,
    errors,
    isValid,
    updateField,
    updateName,
    updateMode,
    getUpdatePayload,
    reset,
    validate,
    riskWarning,
  };
}
