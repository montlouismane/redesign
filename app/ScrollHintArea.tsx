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

  const hasFlex1 = className.includes('flex-1');
  const hasAbsolute = className.includes('absolute') && className.includes('inset-0');
  
  // Extract positioning classes for wrapper, keep rest for inner div
  const positioningClasses = hasAbsolute 
    ? 'absolute inset-0' 
    : (hasFlex1 ? 'flex-1 flex flex-col relative' : 'relative h-full');
  const wrapperClasses = `min-h-0 ${positioningClasses}`;
  const scrollClasses = className
    .replace('flex-1', '')
    .replace('absolute', '')
    .replace('inset-0', '')
    .trim();
  
  return (
    <div className={`relative min-h-0 flex-1 flex flex-col`} style={{ minHeight: 0, flex: '1 1 auto' }}>
      <div 
        ref={ref} 
        className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide w-full transition-all duration-300 ${className}`}
        style={{ 
          minHeight: 0,
          maskImage: showHint 
            ? 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)'
            : 'linear-gradient(to bottom, black 100%, transparent 100%)',
          WebkitMaskImage: showHint 
            ? 'linear-gradient(to bottom, black 0%, black 75%, transparent 100%)'
            : 'linear-gradient(to bottom, black 100%, transparent 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in'
        }}
      >
        {children}
      </div>

      {showHint ? (
        <div aria-hidden className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center z-20">
          <div className="h-7 w-9 rounded-sm bg-black/40 border border-white/20 flex items-center justify-center shadow-lg">
            <ChevronDown size={16} className="text-white adam-scroll-hint" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

