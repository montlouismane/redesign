'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { HorizontalSlider } from './HorizontalSlider';
import { X, Plus, ChevronDown } from 'lucide-react';
import styles from './AllocationEditor.module.css';

// Common tokens for Cardano ecosystem
const COMMON_TOKENS = [
  'ADA', 'AGIX', 'MIN', 'SUNDAE', 'WMT', 'COPI', 'SNEK', 'HOSKY',
  'NMKR', 'INDY', 'DJED', 'SHEN', 'OPTIM', 'ENCS', 'IAG', 'LENFI',
  'MILK', 'FACT', 'GENS', 'BOOK',
] as const;

interface AllocationEditorProps {
  allocations: Record<string, number>;
  onChange: (allocations: Record<string, number>) => void;
  disabled?: boolean;
  maxTokens?: number;
}

/**
 * AllocationEditor - Token allocation management with metallic copper design
 *
 * Features:
 * - Individual token sliders (0-100%)
 * - Real-time total calculation with validation
 * - Add/remove tokens dynamically
 * - Dropdown token selector with search
 * - Visual warning when total ≠ 100%
 * - Production API compatible (percentages 0-100)
 */
export function AllocationEditor({
  allocations,
  onChange,
  disabled = false,
  maxTokens = 10,
}: AllocationEditorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate total allocation
  const totalAllocation = useMemo(() => {
    return Object.values(allocations).reduce((sum, pct) => sum + pct, 0);
  }, [allocations]);

  // Check if total is valid (100%)
  const isValidTotal = Math.abs(totalAllocation - 100) < 0.01;

  // Get tokens not yet allocated
  const availableTokens = useMemo(() => {
    return COMMON_TOKENS.filter(
      (token) => !allocations[token]
    ).filter((token) =>
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allocations, searchQuery]);

  // Update a single token's allocation
  const updateAllocation = useCallback((token: string, percentage: number) => {
    const newAllocations = { ...allocations, [token]: percentage };
    onChange(newAllocations);
  }, [allocations, onChange]);

  // Remove a token from allocations
  const removeToken = useCallback((token: string) => {
    const newAllocations = { ...allocations };
    delete newAllocations[token];
    onChange(newAllocations);
  }, [allocations, onChange]);

  // Add a new token with 0% allocation
  const addToken = useCallback((token: string) => {
    if (!allocations[token] && Object.keys(allocations).length < maxTokens) {
      const newAllocations = { ...allocations, [token]: 0 };
      onChange(newAllocations);
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, [allocations, onChange, maxTokens]);

  // Auto-balance to 100%
  const autoBalance = useCallback(() => {
    const tokens = Object.keys(allocations);
    if (tokens.length === 0) return;

    const equalShare = Math.floor(100 / tokens.length);
    const remainder = 100 - (equalShare * tokens.length);

    const newAllocations: Record<string, number> = {};
    tokens.forEach((token, index) => {
      newAllocations[token] = equalShare + (index === 0 ? remainder : 0);
    });
    onChange(newAllocations);
  }, [allocations, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const allocationEntries = Object.entries(allocations);
  const canAddMore = allocationEntries.length < maxTokens;

  return (
    <div className={styles.allocationEditor} data-disabled={disabled}>
      {/* Header with total */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Token Allocations</span>
        <div className={styles.headerRight}>
          <span
            className={styles.totalBadge}
            data-valid={isValidTotal}
            data-over={totalAllocation > 100}
          >
            {totalAllocation.toFixed(0)}% / 100%
          </span>
          {!isValidTotal && allocationEntries.length > 0 && (
            <button
              className={styles.autoBalanceBtn}
              onClick={autoBalance}
              disabled={disabled}
              title="Auto-balance to 100%"
            >
              Balance
            </button>
          )}
        </div>
      </div>

      {/* Token allocation list */}
      <div className={styles.allocationList}>
        {allocationEntries.length === 0 ? (
          <div className={styles.emptyState}>
            No tokens allocated. Add tokens below to set your target portfolio.
          </div>
        ) : (
          allocationEntries.map(([token, percentage]) => (
            <div key={token} className={styles.allocationRow}>
              <div className={styles.tokenInfo}>
                <span className={styles.tokenSymbol}>{token}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeToken(token)}
                  disabled={disabled}
                  title={`Remove ${token}`}
                >
                  <X size={14} />
                </button>
              </div>
              <div className={styles.sliderWrapper}>
                <HorizontalSlider
                  value={percentage}
                  onChange={(val) => updateAllocation(token, val)}
                  min={0}
                  max={100}
                  step={1}
                  unit="%"
                  disabled={disabled}
                  tickCount={6}
                  showTicks={false}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add token dropdown */}
      {canAddMore && (
        <div className={styles.addTokenSection} ref={dropdownRef}>
          <button
            className={styles.addTokenBtn}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled || availableTokens.length === 0}
          >
            <Plus size={16} />
            <span>Add Token</span>
            <ChevronDown
              size={14}
              className={styles.chevron}
              data-open={isDropdownOpen}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownSearch}>
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  autoFocus
                />
              </div>
              <div className={styles.dropdownList}>
                {availableTokens.length === 0 ? (
                  <div className={styles.dropdownEmpty}>
                    {searchQuery ? 'No matching tokens' : 'All tokens allocated'}
                  </div>
                ) : (
                  availableTokens.map((token) => (
                    <button
                      key={token}
                      className={styles.dropdownItem}
                      onClick={() => addToken(token)}
                    >
                      {token}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation message */}
      {!isValidTotal && allocationEntries.length > 0 && (
        <div className={styles.validationMessage} data-over={totalAllocation > 100}>
          {totalAllocation > 100
            ? `Over-allocated by ${(totalAllocation - 100).toFixed(0)}%`
            : `Under-allocated by ${(100 - totalAllocation).toFixed(0)}%`}
        </div>
      )}
    </div>
  );
}
