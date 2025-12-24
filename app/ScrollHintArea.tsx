'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

type ScrollHintAreaProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scrollable container without a visible scrollbar.
 * Shows a subtle animated hint when there is more content below.
 */
export const ScrollHintArea = ({ children, className = '' }: ScrollHintAreaProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const canScroll = el.scrollHeight > el.clientHeight + 2;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setShowHint(canScroll && !atBottom);
    };

    update();

    el.addEventListener('scroll', update, { passive: true });
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener('resize', update, { passive: true });
    }

    return () => {
      el.removeEventListener('scroll', update);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="relative h-full min-h-0">
      <div ref={ref} className={`h-full min-h-0 overflow-y-auto scrollbar-hide ${className}`}>{children}</div>

      {showHint ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/45 via-black/20 to-transparent"
          />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="h-7 w-9 rounded-full bg-black/25 border border-white/10 flex items-center justify-center">
              <ChevronDown size={16} className="text-white/65 adam-scroll-hint" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

