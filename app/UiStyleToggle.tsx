'use client';

import { Paintbrush } from 'lucide-react';
import { useUiStyle } from './UiStyleProvider';

export function UiStyleToggle({ className = '' }: { className?: string }) {
  const { style, toggle } = useUiStyle();

  return (
    <button
      type="button"
      onClick={toggle}
      className={
        'ui-control font-terminal flex items-center gap-2 rounded-full px-3 py-2 transition-colors ' +
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--ui-accentHot-rgb),0.25)] ' +
        className
      }
      aria-label="Toggle UI style"
      title="Toggle UI style"
    >
      <Paintbrush size={16} className="text-[rgb(var(--ui-accent-rgb))]" />
      <span className="ui-control-muted text-[10px] tracking-[0.18em] uppercase">Style</span>
      <span className="text-[11px] font-semibold tracking-[0.08em]">{style === 'classic' ? 'ADAM' : 'HUD'}</span>
    </button>
  );
}