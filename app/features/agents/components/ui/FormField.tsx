'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  tooltip,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label row */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium"
          style={{ color: 'var(--ui-text)' }}
        >
          {label}
        </label>
        {tooltip && (
          <div className="group relative">
            <HelpCircle
              size={14}
              className="cursor-help"
              style={{ color: 'var(--ui-muted)' }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg text-xs max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
              style={{
                background: 'var(--ui-bg1)',
                border: '1px solid var(--ui-control-border)',
                color: 'var(--ui-text)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              {tooltip}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {children}

      {/* Error or hint */}
      {error ? (
        <p className="text-xs" style={{ color: 'rgb(239, 68, 68)' }}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs" style={{ color: 'var(--ui-muted)' }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Slider component
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  formatValue = (v) => String(v),
  className = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-1 h-2">
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'var(--ui-control-bg)' }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${percentage}%`,
            background: 'rgb(var(--ui-accent-rgb))',
          }}
        />
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-md pointer-events-none"
          style={{
            left: `calc(${percentage}% - 8px)`,
            background: 'rgb(var(--ui-accent-rgb))',
            border: '2px solid white',
          }}
        />
      </div>
      {showValue && (
        <span
          className="text-sm font-medium min-w-[3rem] text-right"
          style={{ color: 'var(--ui-text)' }}
        >
          {formatValue(value)}
        </span>
      )}
    </div>
  );
}

// Number input
interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  disabled = false,
  className = '',
}: NumberInputProps) {
  return (
    <div
      className={`flex items-center rounded-lg overflow-hidden ${className}`}
      style={{
        background: 'var(--ui-control-bg)',
        border: '1px solid var(--ui-control-border)',
      }}
    >
      {prefix && (
        <span
          className="px-3 text-sm"
          style={{ color: 'var(--ui-muted)' }}
        >
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const num = Number(e.target.value);
          if (!isNaN(num)) {
            if (min !== undefined && num < min) onChange(min);
            else if (max !== undefined && num > max) onChange(max);
            else onChange(num);
          }
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
        style={{ color: 'var(--ui-text)' }}
      />
      {suffix && (
        <span
          className="px-3 text-sm"
          style={{ color: 'var(--ui-muted)' }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

// Select dropdown
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function Select({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2 rounded-lg text-sm outline-none cursor-pointer ${className}`}
      style={{
        background: 'var(--ui-control-bg)',
        border: '1px solid var(--ui-control-border)',
        color: 'var(--ui-text)',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// Multi-select chips
interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  values,
  onChange,
  options,
  disabled = false,
  className = '',
}: MultiSelectProps) {
  const toggleValue = (val: string) => {
    if (disabled) return;
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((opt) => {
        const isSelected = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleValue(opt.value)}
            disabled={disabled}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: isSelected
                ? 'rgba(var(--ui-accent-rgb), 0.2)'
                : 'var(--ui-control-bg)',
              border: isSelected
                ? '1px solid rgba(var(--ui-accent-rgb), 0.5)'
                : '1px solid var(--ui-control-border)',
              color: isSelected ? 'rgb(var(--ui-accent-rgb))' : 'var(--ui-muted)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Token list input
interface TokenListProps {
  tokens: string[];
  onChange: (tokens: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TokenList({
  tokens,
  onChange,
  suggestions = [],
  placeholder = 'Add token...',
  disabled = false,
  className = '',
}: TokenListProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tokens.includes(s)
  );

  const addToken = (token: string) => {
    const upper = token.toUpperCase().trim();
    if (upper && !tokens.includes(upper)) {
      onChange([...tokens, upper]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeToken = (token: string) => {
    if (disabled) return;
    onChange(tokens.filter((t) => t !== token));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addToken(inputValue);
    }
  };

  return (
    <div className={className}>
      {/* Selected tokens */}
      {tokens.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tokens.map((token) => (
            <span
              key={token}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                background: 'rgba(var(--ui-accent-rgb), 0.15)',
                color: 'rgb(var(--ui-accent-rgb))',
              }}
            >
              {token}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeToken(token)}
                  className="hover:opacity-70"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'var(--ui-control-bg)',
            border: '1px solid var(--ui-control-border)',
            color: 'var(--ui-text)',
          }}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 py-1 rounded-lg max-h-40 overflow-y-auto z-10"
            style={{
              background: 'var(--ui-bg1)',
              border: '1px solid var(--ui-control-border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {filteredSuggestions.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addToken(s)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-black/10"
                style={{ color: 'var(--ui-text)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
