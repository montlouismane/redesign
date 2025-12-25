'use client';

import React from 'react';
import { Bell, Wallet, LogOut, User, ChevronDown } from 'lucide-react';
import { useUiStyle } from '../UiStyleProvider';
import { UiStyleToggle } from '../UiStyleToggle';

interface ClassicFinanceHeaderProps {
  view: string;
  setView: (view: any) => void;
}

export const ClassicFinanceHeader = ({
  view,
  setView,
}: ClassicFinanceHeaderProps) => {
  const { toggle: toggleUiStyle } = useUiStyle();

  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'portfolios', label: 'Portfolios' },
    { key: 'strategies', label: 'Strategies' },
    { key: 'markets', label: 'Markets' },
    { key: 'support', label: 'Support' },
  ];

  return (
    <header className="h-[72px] shrink-0 bg-[#1a2a3a] flex items-center px-12 z-50 relative shadow-md">
      <div className="w-full max-w-[1920px] mx-auto h-full flex items-center relative">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2.5 relative"
          >
            <div className="relative h-10 flex items-center">
              {/* Base image - convert to white/light base for gradient overlay */}
              <img 
                src="/brand/adam-classic-logo.svg" 
                alt="ADAM" 
                className="h-10 w-auto object-contain relative z-10"
                style={{
                  filter: 'brightness(0) invert(1)',
                }}
              />
              {/* Gradient overlay: illuminated copper (left) to darker copper (right) */}
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(to right, rgb(220, 150, 90) 0%, rgb(205, 135, 75) 25%, rgb(196, 124, 72) 50%, rgb(175, 110, 60) 75%, rgb(160, 100, 55) 100%)',
                  mixBlendMode: 'multiply',
                  WebkitMaskImage: 'url(/brand/adam-classic-logo.svg)',
                  maskImage: 'url(/brand/adam-classic-logo.svg)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'left center',
                  maskPosition: 'left center',
                }}
              />
            </div>
          </button>
        </div>

        {/* Navigation - Shifted to begin about a quarter of the way in */}
        <nav className="hidden lg:flex items-center h-full absolute left-[22%] gap-12">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key as any)}
              className={`h-full text-[18px] tracking-wide transition-all relative px-1 flex items-center ${
                view === item.key ? 'text-white font-extrabold' : 'text-gray-400 font-semibold hover:text-gray-200'
              }`}
            >
              {item.label}
              {view === item.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[4px] bg-[#c47c48] shadow-[0_-2px_10px_rgba(196,124,72,0.3)]" />
              )}
            </button>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-8 ml-auto">
          <div className="flex items-center gap-5 pl-6 border-l border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 font-bold text-xs shadow-inner">
                JD
              </div>
              <div className="hidden xl:block">
                <div className="text-[13px] font-bold text-gray-200">John Doe</div>
              </div>
            </div>
            
            <button className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider">
              Log out
            </button>
            
            <div className="scale-90 opacity-80 hover:opacity-100 transition-opacity">
              <UiStyleToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
