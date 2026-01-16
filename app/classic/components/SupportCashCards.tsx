'use client';

import React from 'react';

export const CashTransfersCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col transition-all hover:shadow-md">
      <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-3">Cash & Transfers</h3>
      <div className="text-center py-3 bg-gray-50/50 rounded-xl border border-gray-100 mb-4">
        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Available cash</div>
        <div className="text-[28px] font-bold text-gray-900 mt-0.5 tracking-tighter leading-none">$125,000</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="py-2 bg-[#c47c48] hover:bg-[#8b572a] text-white font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] text-[10px] tracking-wide uppercase">
          Add funds
        </button>
        <button className="py-2 bg-[#c47c48] hover:bg-[#8b572a] text-white font-bold rounded-lg shadow-sm transition-all active:scale-[0.98] text-[10px] tracking-wide uppercase">
          Withdraw
        </button>
      </div>
    </div>
  );
};

export const SupportGuidanceCard = ({ 
  onChat, 
  onSchedule, 
  onHowItWorks 
}: { 
  onChat?: () => void; 
  onSchedule?: () => void; 
  onHowItWorks?: () => void;
}) => {
  const actions = [
    { title: 'Chat with Agent', sub: 'Instant support', icon: '💬', onClick: onChat },
    { title: 'Schedule a call', sub: 'Pick a time', icon: '📅', onClick: onSchedule },
    { title: 'How it works', sub: 'Education', icon: '🎓', onClick: onHowItWorks },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col transition-all hover:shadow-md">
      <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-3">Support & Guidance</h3>
      <div className="mb-4">
        <div className="font-bold text-gray-900 text-[14px]">Need help?</div>
        <div className="text-[11px] text-gray-500 mt-0.5 leading-tight font-medium">Learn more about how we manage your portfolio safely.</div>
      </div>
      <div className="space-y-3">
        {actions.map((a, i) => (
          <button 
            key={i} 
            onClick={a.onClick}
            className="flex items-center gap-2.5 w-full group text-left transition-all hover:translate-x-1"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors shadow-sm">
              <span className="text-base grayscale group-hover:grayscale-0 transition-all">{a.icon}</span>
            </div>
            <div>
              <div className="text-[12px] font-bold text-gray-900 group-hover:text-[#c47c48] transition-colors">{a.title}</div>
              <div className="text-[10px] text-gray-400 font-medium">{a.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

