'use client';

import React from 'react';

export const AssetAllocationCard = () => {
  const data = [
    { label: 'Stocks', val: '55%', amount: '$687,500', color: 'bg-blue-600' },
    { label: 'Bonds', val: '30%', amount: '$375,000', color: 'bg-slate-400' },
    { label: 'Cash', val: '10%', amount: '$125,000', color: 'bg-slate-200' },
    { label: 'Alternatives', val: '5%', amount: '$62,500', color: 'bg-orange-600' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col transition-all hover:shadow-md">
      <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-6">Asset Allocation</h3>
      <div className="flex-1 flex items-center justify-between gap-8">
        <div className="relative w-44 h-44 flex-shrink-0">
          {/* Mockup Donut Chart using borders/gradients for simplicity */}
          <div className="absolute inset-0 rounded-full border-[14px] border-blue-600 border-r-slate-400 border-b-slate-200 border-l-[#c47c48] rotate-[35deg] shadow-sm"></div>
          <div className="absolute inset-4 rounded-full border border-gray-100 flex items-center justify-center bg-white shadow-inner">
            <div className="text-center">
              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total</div>
              <div className="text-lg font-bold text-gray-900 tracking-tight leading-none">100%</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center group cursor-default">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color === 'bg-orange-600' ? 'bg-[#c47c48]' : item.color} shadow-sm group-hover:scale-110 transition-transform`}></div>
                <span className="text-[12px] font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-bold text-gray-900 tabular-nums leading-none">{item.val} ({item.amount})</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

