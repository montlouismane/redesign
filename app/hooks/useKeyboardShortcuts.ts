'use client';

import { useEffect, useCallback, useRef } from 'react';

export type ShortcutAction = 
  | 'openShortcuts'
  | 'openSettings'
  | 'closeModal'
  | 'switchRange1H'
  | 'switchRange24H'
  | 'switchRange7D'
  | 'switchRange30D'
  | 'switchRangeALL'
  | 'expandPortfolio'
  | 'expandTrades'
  | 'expandAllocation'
  | 'expandMarket'
  | 'refreshData'
  | 'toggleDataDensity'
  | 'toggleChartType';

export interface KeyboardShortcutsConfig {
  enabled: boolean;
  onAction: (action: ShortcutAction) => void;
}

const SHORTCUT_MAP: Record<string, ShortcutAction> = {
  '?': 'openShortcuts',
  's': 'openSettings',
  'Escape': 'closeModal',
  '1': 'switchRange1H',
  '2': 'switchRange24H',
  '3': 'switchRange7D',
  '4': 'switchRange30D',
  '5': 'switchRangeALL',
  'p': 'expandPortfolio',
  't': 'expandTrades',
  'a': 'expandAllocation',
  'm': 'expandMarket',
  'r': 'refreshData',
  'd': 'toggleDataDensity',
  ' ': 'toggleChartType', // Space bar
};

export function useKeyboardShortcuts({ enabled, onAction }: KeyboardShortcutsConfig) {
  const onActionRef = useRef(onAction);
  onActionRef.current = onAction;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === 'input' || tag === 'textarea' || (e.target as HTMLElement | null)?.isContentEditable;
      
      // Always allow Escape and ? even when typing
      if (e.key === 'Escape' || e.key === '?') {
        // Continue to process
      } else if (isTypingTarget) {
        return; // Don't process other shortcuts when typing
      }

      const action = SHORTCUT_MAP[e.key];
      if (action) {
        e.preventDefault();
        onActionRef.current(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

export const SHORTCUT_DESCRIPTIONS: Array<{ key: string; action: string; context: string }> = [
  { key: '?', action: 'Open shortcuts cheat sheet', context: 'Global' },
  { key: 'Esc', action: 'Close modal / Exit expanded view', context: 'Global' },
  { key: 'S', action: 'Open Settings panel', context: 'Global' },
  { key: '1-5', action: 'Switch time range (1H/24H/7D/30D/ALL)', context: 'Performance panel' },
  { key: 'P', action: 'Expand Portfolio panel', context: 'Dashboard' },
  { key: 'T', action: 'Expand Trades panel', context: 'Dashboard' },
  { key: 'A', action: 'Expand Allocation panel', context: 'Dashboard' },
  { key: 'M', action: 'Expand Market/Holdings panel', context: 'Dashboard' },
  { key: 'R', action: 'Refresh data', context: 'Global' },
  { key: 'D', action: 'Toggle data density', context: 'Global' },
  { key: 'Space', action: 'Toggle chart type (donut/bar)', context: 'Allocation panel focused' },
];


