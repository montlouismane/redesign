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

      {/* Scroll Hint - Double chevron with copper styling */}
      <div
        aria-hidden
        className={`pointer-events-none absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center gap-0.5 z-20 transition-opacity duration-300 ${showHint ? 'opacity-60' : 'opacity-0'}`}
      >
        <ChevronDown
          size={16}
          className="adam-scroll-hint"
          style={{ color: 'rgba(196, 124, 72, 0.8)' }}
        />
        <ChevronDown
          size={16}
          className="adam-scroll-hint -mt-2"
          style={{
            color: 'rgba(196, 124, 72, 0.8)',
            animationDelay: '0.15s',
            opacity: 0.5
          }}
        />
      </div>
    </div>
  );
};

