'use client';

import React from 'react';

export const ActiveStrategiesCard = () => {
  const strategies = [
    { name: 'Balanced Income', risk: 'Moderate', date: 'Jan 2025', value: '$400,000', perf: '+6.2%' },
    { name: 'Growth & Income', risk: 'Moderate', date: 'Jan 2025', value: '$400,000', perf: '+6.2%' },
    { name: 'Balanced Income', risk: 'Moderate', date: 'Jan 2025', value: '$400,000', perf: '+6.2%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Active Strategies</h3>
        <span className="px-2 py-0.5 bg-[#dbe4ef] text-[#4a5f7a] text-[10px] font-semibold rounded-full">Running</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden classic-scrollbar">
        <div className="space-y-0">
          {strategies.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between items-center py-2 group cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded transition-all">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-[15px] tracking-tight leading-tight">{s.name}</div>
                  <div className="text-[11px] text-gray-500 font-medium leading-tight">Risk level: {s.risk} · Started {s.date}</div>
                </div>
                <div className="text-right ml-4 shrink-0 flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 text-[15px] tabular-nums tracking-tight">
                    ${parseFloat(s.value.replace(/[^0-9.]/g, '')).toLocaleString()}
                  </span>
                  <span className="text-gray-300 font-bold text-[15px]">·</span>
                  <span className="text-emerald-700 font-bold text-[15px] tabular-nums">{s.perf}</span>
                </div>
              </div>
              {i < strategies.length - 1 && (
                <div className="border-b border-gray-50" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

