/**
 * Utility functions to improve numeric input UX
 */

import React from 'react';

/**
 * Handles numeric input changes with proper validation and constraints
 */
export function handleNumericInputChange(
  value: string,
  min: number = 0,
  max: number = Infinity,
  allowDecimals: boolean = false
): number {
  if (value === '') {
    return min;
  }

  const numericValue = allowDecimals ? parseFloat(value) : parseInt(value);

  if (isNaN(numericValue)) {
    return min;
  }

  return Math.max(min, Math.min(max, numericValue));
}

/**
 * Creates enhanced onChange handler for numeric inputs
 */
export function createNumericInputHandler(
  onChange: (value: number) => void,
  min: number = 0,
  max: number = Infinity,
  allowDecimals: boolean = false
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = handleNumericInputChange(e.target.value, min, max, allowDecimals);
    onChange(value);
  };
}

/**
 * Creates enhanced onFocus handler that selects all text for easy editing
 */
export function createSelectAllOnFocus() {
  return (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.select();
    }, 0);
  };
}

/**
 * Creates enhanced input props for better numeric input UX
 */
export function createNumericInputProps(
  value: number,
  onChange: (value: number) => void,
  options: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
  } = {}
) {
  const { min = 0, max = Infinity, allowDecimals = false } = options;

  return {
    type: 'number' as const,
    value: value,
    onChange: createNumericInputHandler(onChange, min, max, allowDecimals),
    onFocus: createSelectAllOnFocus(),
    min: min,
    max: max,
    step: allowDecimals ? 0.1 : 1
  };
}
