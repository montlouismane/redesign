'use client';

import { useEffect } from 'react';

/**
 * Chrome (especially at extreme page zoom levels) can end up with a non-zero horizontal scroll offset
 * even when horizontal scrolling is effectively disabled. This component defensively pins scrollLeft to 0.
 */
export function ScrollXReset() {
  useEffect(() => {
    const resetX = () => {
      if (document.documentElement && document.documentElement.scrollLeft !== 0) {
        document.documentElement.scrollLeft = 0;
      }
      if (document.body && document.body.scrollLeft !== 0) {
        document.body.scrollLeft = 0;
      }
    };

    resetX();

    window.addEventListener('resize', resetX, { passive: true });
    window.addEventListener('scroll', resetX, { passive: true });

    // VisualViewport exists on Chrome; it can fire on zoom changes too.
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', resetX, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', resetX);
      window.removeEventListener('scroll', resetX);
      window.visualViewport?.removeEventListener('resize', resetX);
    };
  }, []);

  return null;
}