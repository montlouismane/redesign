'use client';

import React from 'react';

export const StrategyUpdatesCard = () => {
  const updates = [
    'Balanced Income increased bond allocation from 40% to 45% to reduce risk as markets became more volatile.',
    'Growth & Income rebalanced portfolio to lock in gains from recent tech sector performance.',
    'Balanced Income identified potential yield opportunity in emerging market corporate bonds.',
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-full transition-all hover:shadow-md overflow-hidden">
      <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-3">Strategy Updates Today</h3>
      
      <div className="flex-1 min-h-0 overflow-y-auto classic-scrollbar">
        <div className="space-y-3">
          <div className="text-[11px] text-gray-500 leading-tight font-medium bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 mb-3">
            Plain language explanation of actions in managing your portfolio. Our algorithms continuously monitor market conditions.
          </div>
          {updates.map((update, i) => (
            <div key={i} className="flex items-start gap-3 group cursor-default">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
              <div className="flex-1 flex items-center justify-between border-b border-gray-50 pb-2 group-last:border-0">
                <span className="text-[12px] text-gray-800 leading-snug font-bold tracking-tight group-hover:text-gray-900 transition-colors">{update}</span>
                <button className="ml-4 text-[10px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">View details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

