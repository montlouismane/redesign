'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type UiStyle = 'classic' | 'hud';

type UiStyleContextValue = {
  style: UiStyle;
  setStyle: (style: UiStyle) => void;
  toggle: () => void;
};

const UiStyleContext = createContext<UiStyleContextValue | null>(null);

const STORAGE_KEY = 'adam-ui-style';

export function UiStyleProvider({ children, defaultStyle = 'classic' }: { children: ReactNode; defaultStyle?: UiStyle }) {
  const [style, setStyleState] = useState<UiStyle>(defaultStyle);

  // Read persisted value once on mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'classic' || saved === 'hud') setStyleState(saved);
    } catch {
      // ignore
    }
  }, []);

  // Apply to <html> and persist.
  useEffect(() => {
    document.documentElement.dataset.ui = style;
    try {
      window.localStorage.setItem(STORAGE_KEY, style);
    } catch {
      // ignore
    }
  }, [style]);

  const setStyle = useCallback((next: UiStyle) => setStyleState(next), []);
  const toggle = useCallback(() => setStyleState((prev) => (prev === 'classic' ? 'hud' : 'classic')), []);

  const value = useMemo(() => ({ style, setStyle, toggle }), [style, setStyle, toggle]);

  return <UiStyleContext.Provider value={value}>{children}</UiStyleContext.Provider>;
}

export function useUiStyle() {
  const ctx = useContext(UiStyleContext);
  if (!ctx) throw new Error('useUiStyle must be used within UiStyleProvider');
  return ctx;
}