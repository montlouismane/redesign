'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

type ChartPoint = { x: number; y: number; time: number; value: number };

interface TotalPortfolioValueCardProps {
  range: string;
  setRange: (r: any) => void;
}

const formatUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export const TotalPortfolioValueCard = ({ range, setRange }: TotalPortfolioValueCardProps) => {
  // Demo data for now, would normally fetch like RevolutChart
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate demo points
    const pts: ChartPoint[] = [];
    for (let i = 0; i <= 50; i++) {
      pts.push({
        x: i * 2,
        y: 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10,
        time: Date.now() - (50 - i) * 3600000,
        value: 1250000 + Math.sin(i * 0.2) * 50000,
      });
    }
    setPoints(pts);
  }, [range]);

  const pathD = points.length > 0
    ? `M${points[0].x},${100 - points[0].y} ` + points.map((p) => `L${p.x},${100 - p.y}`).join(' ')
    : '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col group transition-all hover:shadow-md relative overflow-hidden">
      {/* Top Row: Title & Range Buttons */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[23px] font-bold text-gray-900 tracking-[0.15em]">Total Portfolio Value</h3>
        <div className="flex gap-1 p-0.5 bg-gray-100 rounded-md shrink-0 scale-90 origin-right">
          {['1M', '6M', '1Y', 'All'].map(t => (
            <button 
              key={t} 
              onClick={() => setRange(t)}
              className={`px-3 py-1 text-[10px] font-bold rounded-sm transition-all ${
                range === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center">
        {/* Left Side: Metrics */}
        <div className="w-[45%] shrink-0 pt-2">
          <div className="text-[44px] font-bold text-gray-900 tabular-nums leading-none tracking-tight">$1,250,000</div>
          <div className="flex items-start gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-900">Today's change</span>
              <span className="text-[12px] font-bold text-emerald-600 tabular-nums">+$3,450 (+0.28%)</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-900">Since inception</span>
              <span className="text-[12px] font-bold text-emerald-600 tabular-nums">+12.4% since start</span>
            </div>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div className="flex-1 h-[120px] relative mt-2">
          <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="classicFillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c47c48" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#c47c48" stopOpacity="0" />
              </linearGradient>
            </defs>
            {pathD && (
              <>
                <path
                  d={pathD + " L100,100 L0,100 Z"}
                  fill="url(#classicFillGradient)"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#c47c48"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
          
          {/* Date Labels */}
          <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span>Jan</span>
            <span>Apr</span>
            <span>Jul</span>
            <span>Oct</span>
          </div>
        </div>
      </div>
    </div>
  );
};
