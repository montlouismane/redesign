'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { HorizontalSlider } from './HorizontalSlider';
import { X, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import styles from './AllocationCarousel.module.css';

// Common tokens for Cardano ecosystem
const COMMON_TOKENS = [
  'ADA', 'AGIX', 'MIN', 'SUNDAE', 'WMT', 'COPI', 'SNEK', 'HOSKY',
  'NMKR', 'INDY', 'DJED', 'SHEN', 'OPTIM', 'ENCS', 'IAG', 'LENFI',
  'MILK', 'FACT', 'GENS', 'BOOK',
] as const;

interface AllocationCarouselProps {
  allocations: Record<string, number>;
  onChange: (allocations: Record<string, number>) => void;
  disabled?: boolean;
  maxTokens?: number;
}

/**
 * AllocationCarousel - Horizontal scrolling carousel for token allocations
 *
 * Features:
 * - 320px cards in horizontal carousel with snap scrolling
 * - Navigation arrows when content overflows
 * - Add Token as final dashed card (200px)
 * - Real-time total calculation with color-coded validation
 * - Auto-balance button to distribute evenly to 100%
 */
export function AllocationCarousel({
  allocations,
  onChange,
  disabled = false,
  maxTokens = 10,
}: AllocationCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cardWidth = 336; // 320px card + 16px gap

  // Calculate total allocation
  const totalAllocation = useMemo(() => {
    return Object.values(allocations).reduce((sum, pct) => sum + pct, 0);
  }, [allocations]);

  const isValidTotal = Math.abs(totalAllocation - 100) < 0.01;
  const allocationEntries = Object.entries(allocations);
  const canAddMore = allocationEntries.length < maxTokens;

  // Available tokens not yet allocated
  const availableTokens = useMemo(() => {
    return COMMON_TOKENS.filter(
      (token) => !allocations[token]
    ).filter((token) =>
      token.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allocations, searchQuery]);

  // Update scroll state
  const updateScrollState = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    setNeedsScroll(scrollWidth > clientWidth + 10);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState);
      const resizeObserver = new ResizeObserver(updateScrollState);
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        resizeObserver.disconnect();
      };
    }
  }, [allocationEntries.length, updateScrollState]);

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

  const scrollTo = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const updateAllocation = useCallback((token: string, percentage: number) => {
    onChange({ ...allocations, [token]: percentage });
  }, [allocations, onChange]);

  const removeToken = useCallback((token: string) => {
    const newAllocations = { ...allocations };
    delete newAllocations[token];
    onChange(newAllocations);
  }, [allocations, onChange]);

  const addToken = useCallback((token: string) => {
    if (!allocations[token] && allocationEntries.length < maxTokens) {
      onChange({ ...allocations, [token]: 0 });
      // Auto-scroll to show new card
      setTimeout(() => {
        carouselRef.current?.scrollTo({
          left: carouselRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }, 50);
    }
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, [allocations, allocationEntries.length, maxTokens, onChange]);

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

  return (
    <div className={styles.allocationCarousel} data-disabled={disabled}>
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

      {/* Carousel with navigation */}
      <div className={styles.carousel}>
        {needsScroll && (
          <button
            className={styles.carouselBtn}
            onClick={() => scrollTo('left')}
            disabled={!canScrollLeft}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        <div className={styles.carouselTrack}>
          <div ref={carouselRef} className={styles.cardList}>
            {/* Token Cards */}
            {allocationEntries.map(([token, percentage]) => (
              <div key={token} className={styles.tokenCard}>
                <div className={styles.tokenHeader}>
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
                <div className={styles.tokenContent}>
                  <label className={styles.sliderLabel}>Allocation</label>
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
            ))}

            {/* Add Token Card - Shows selector inside when active */}
            {canAddMore && (
              <div
                className={`${styles.tokenCard} ${styles.addTokenCard}`}
                ref={dropdownRef}
                data-selecting={isDropdownOpen}
              >
                {!isDropdownOpen ? (
                  <button
                    className={styles.addTokenBtn}
                    onClick={() => {
                      setIsDropdownOpen(true);
                      // Auto-scroll to show the card
                      setTimeout(() => {
                        carouselRef.current?.scrollTo({
                          left: carouselRef.current.scrollWidth,
                          behavior: 'smooth'
                        });
                      }, 50);
                    }}
                    disabled={disabled || availableTokens.length === 0}
                  >
                    <Plus size={24} />
                    <span>Add Token</span>
                  </button>
                ) : (
                  <>
                    <div className={styles.tokenHeader}>
                      <span className={styles.tokenSymbol} style={{ opacity: 0.5 }}>Select Token</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className={styles.selectorContent}>
                      <input
                        type="text"
                        placeholder="Search tokens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                        autoComplete="off"
                        autoFocus
                      />
                      <div className={styles.tokenList}>
                        {availableTokens.length === 0 ? (
                          <div className={styles.dropdownEmpty}>
                            {searchQuery ? 'No matching tokens' : 'All tokens allocated'}
                          </div>
                        ) : (
                          availableTokens.slice(0, 6).map((token) => (
                            <button
                              key={token}
                              className={styles.tokenOption}
                              onClick={() => addToken(token)}
                            >
                              {token}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Empty state */}
            {allocationEntries.length === 0 && !canAddMore && (
              <div className={styles.emptyState}>
                No tokens allocated.
              </div>
            )}
          </div>
        </div>

        {needsScroll && (
          <button
            className={styles.carouselBtn}
            onClick={() => scrollTo('right')}
            disabled={!canScrollRight}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

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
