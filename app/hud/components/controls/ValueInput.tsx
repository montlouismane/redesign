'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './controls.module.css';

interface ValueInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  unit: string;
  onClose: () => void;
}

/**
 * ValueInput - Manual entry overlay for controls
 *
 * Features:
 * - Small popup that appears when clicking value displays
 * - Pre-filled with current value
 * - Enter to confirm, Escape to cancel
 * - Validates against min/max with error state
 *
 * Usage:
 * {showInput && (
 *   <ValueInput
 *     value={value}
 *     onChange={onChange}
 *     min={min}
 *     max={max}
 *     unit={unit}
 *     onClose={() => setShowInput(false)}
 *   />
 * )}
 */
export function ValueInput({
  value,
  onChange,
  min,
  max,
  unit,
  onClose,
}: ValueInputProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const validate = (val: string): number | null => {
    const num = parseFloat(val);

    if (isNaN(num)) {
      setError('Invalid number');
      return null;
    }

    if (num < min) {
      setError(`Minimum: ${min}`);
      return null;
    }

    if (num > max) {
      setError(`Maximum: ${max}`);
      return null;
    }

    setError(null);
    return num;
  };

  const handleSubmit = () => {
    const validated = validate(inputValue);
    if (validated !== null) {
      onChange(validated);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    validate(val);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.valueInputOverlay}`)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.valueInputContainer}>
      <div className={styles.valueInputOverlay} data-error={error !== null}>
        <div className={styles.valueInputHeader}>
          <span className={styles.valueInputTitle}>Enter Value</span>
          <button
            className={styles.valueInputCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className={styles.valueInputBody}>
          <div className={styles.valueInputField}>
            <input
              ref={inputRef}
              type="text"
              className={styles.valueInputInput}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              data-error={error !== null}
            />
            <span className={styles.valueInputUnit}>{unit}</span>
          </div>

          {error && (
            <div className={styles.valueInputError}>{error}</div>
          )}

          <div className={styles.valueInputRange}>
            Range: {min} - {max} {unit}
          </div>
        </div>

        <div className={styles.valueInputFooter}>
          <button
            className={styles.valueInputBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={styles.valueInputBtnPrimary}
            onClick={handleSubmit}
            disabled={error !== null}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
