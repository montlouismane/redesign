'use client';

import React from 'react';

export const RecentActivityCard = () => {
  const activities = [
    { date: 'Today', type: 'Buy', strategy: 'Balanced Income', amount: '$2,000', result: 'Completed', icon: '↑' },
    { date: 'Yesterday', type: 'Sell', strategy: 'Growth & Income', amount: 'N/A', result: 'Completed', icon: '↓' },
    { date: 'Yesterday', type: 'Rebalance', strategy: 'Growth & Income', amount: 'N/A', result: 'Completed', icon: '⇄' },
    { date: 'Yesterday', type: 'Buy', strategy: 'Growth & Income', amount: '$2,000', result: 'Completed', icon: '↑' },
    { date: 'Dec 22', type: 'Buy', strategy: 'Balanced Income', amount: '$5,000', result: 'Completed', icon: '↑' },
    { date: 'Dec 21', type: 'Sell', strategy: 'Balanced Income', amount: '$1,200', result: 'Completed', icon: '↓' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      <div className="p-6 pb-2">
        <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Recent Activity</h3>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto classic-scrollbar">
        <div className="px-6 pb-6">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="text-gray-400 font-bold border-b border-gray-100">
                <th className="py-3 uppercase tracking-widest text-[9px]">Date</th>
                <th className="py-3 uppercase tracking-widest text-[9px]">Type</th>
                <th className="py-3 uppercase tracking-widest text-[9px]">Asset/Strategy</th>
                <th className="py-3 uppercase tracking-widest text-[9px]">Amount</th>
                <th className="py-3 uppercase tracking-widest text-[9px]">Result</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {activities.map((r, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="py-3 text-gray-500 font-bold">{r.date}</td>
                  <td className="py-3">
                    <span className="flex items-center gap-2 font-bold text-gray-900">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] shadow-sm ${
                        r.type === 'Buy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                        r.type === 'Sell' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {r.icon}
                      </span> 
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-gray-900">{r.strategy}</td>
                  <td className="py-3 text-gray-500 font-bold tabular-nums tracking-tight">{r.amount}</td>
                  <td className="py-3">
                    <span className="text-gray-900 font-bold border border-gray-200 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wide bg-white shadow-sm">
                      {r.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

