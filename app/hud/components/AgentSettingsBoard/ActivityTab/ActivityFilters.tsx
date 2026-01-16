'use client';

import React from 'react';
import type { ActivityFiltersState, EventTypeFilter, TimeRangeFilter } from './types';
import styles from '../AgentSettingsBoard.module.css';

interface ActivityFiltersProps {
  filters: ActivityFiltersState;
  onChange: (filters: ActivityFiltersState) => void;
}

const EVENT_TYPE_OPTIONS: { value: EventTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Events' },
  { value: 'decision', label: 'Decisions' },
  { value: 'trade', label: 'Trades' },
  { value: 'error', label: 'Errors' },
  { value: 'warning', label: 'Alerts' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
];

const TIME_RANGE_OPTIONS: { value: TimeRangeFilter; label: string }[] = [
  { value: 'hour', label: 'Last Hour' },
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'all', label: 'All Time' },
];

/**
 * ActivityFilters - Filter controls for activity logs
 * Provides Event Type and Time Range dropdowns
 */
export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      eventType: e.target.value as EventTypeFilter,
    });
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      timeRange: e.target.value as TimeRangeFilter,
    });
  };

  return (
    <div className={styles.filtersSection}>
      <div className={styles.filtersSectionTitle}>Filters</div>
      <div className={styles.filtersGrid}>
        <div className={styles.filterRow}>
          <label className={styles.filterLabel}>Event Type</label>
          <select
            className={styles.filterSelect}
            value={filters.eventType}
            onChange={handleEventTypeChange}
          >
            {EVENT_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterRow}>
          <label className={styles.filterLabel}>Time Range</label>
          <select
            className={styles.filterSelect}
            value={filters.timeRange}
            onChange={handleTimeRangeChange}
          >
            {TIME_RANGE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
