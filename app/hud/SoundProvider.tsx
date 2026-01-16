'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type SoundContextValue = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'adam_settings';

export function SoundProvider({ children, defaultEnabled = true }: { children: ReactNode; defaultEnabled?: boolean }) {
  const [enabled, setEnabledState] = useState<boolean>(defaultEnabled);

  // Read persisted value once on mount from the existing settings storage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (typeof settings.soundEffectsEnabled === 'boolean') {
          setEnabledState(settings.soundEffectsEnabled);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for storage changes (when settings are updated elsewhere)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (typeof settings.soundEffectsEnabled === 'boolean') {
            setEnabledState(settings.soundEffectsEnabled);
          }
        } catch {
          // ignore
        }
      }
    };

    // Also listen for custom event from same-tab updates
    const handleCustomEvent = (e: CustomEvent<{ soundEffectsEnabled: boolean }>) => {
      if (typeof e.detail?.soundEffectsEnabled === 'boolean') {
        setEnabledState(e.detail.soundEffectsEnabled);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('soundSettingChanged', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('soundSettingChanged', handleCustomEvent as EventListener);
    };
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('soundSettingChanged', { detail: { soundEffectsEnabled: next } }));
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      window.dispatchEvent(new CustomEvent('soundSettingChanged', { detail: { soundEffectsEnabled: next } }));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled, toggle }), [enabled, setEnabled, toggle]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  // Return default enabled=true if outside provider (for backwards compatibility)
  if (!ctx) return { enabled: true, setEnabled: () => {}, toggle: () => {} };
  return ctx;
}

export function useSoundEnabled() {
  const { enabled } = useSound();
  return enabled;
}
