'use client';

import React from 'react';
import { useEquitySeries, type PortfolioRange } from '../../hooks/useEquitySeries';
import PortfolioChart from '../../components/PortfolioChart';

interface TotalPortfolioValueCardProps {
  range: string;
  setRange: (r: any) => void;
}

const formatUsd = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

// Map Classic range to PortfolioRange
function mapRangeToPortfolioRange(range: string): PortfolioRange {
  if (range === '1M') return '30D';
  if (range === '6M') return '7D';
  if (range === '1Y') return '30D';
  return 'ALL';
}

export const TotalPortfolioValueCard = ({ range, setRange }: TotalPortfolioValueCardProps) => {
  // Use the same equity series hook as HUD dashboard (supports demo/backend mode)
  const portfolioRange = mapRangeToPortfolioRange(range);
  const equitySeries = useEquitySeries(portfolioRange);

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
          <div className="text-[44px] font-bold text-gray-900 tabular-nums leading-none tracking-tight">
            {formatUsd(equitySeries.summary.endValue)}
          </div>
          <div className="flex items-start gap-6 mt-4">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-900">Change ({range})</span>
              <span className={`text-[12px] font-bold tabular-nums ${
                equitySeries.summary.changePct >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {equitySeries.summary.changePct >= 0 ? '+' : ''}{equitySeries.summary.changePct.toFixed(2)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-900">Data source</span>
              <span className="text-[12px] font-bold text-gray-500 tabular-nums">
                {equitySeries.isLive ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div className="flex-1 h-[120px] relative mt-2 -mx-2">
          <PortfolioChart
            series={equitySeries.points}
            range={portfolioRange}
            formatMoney={formatUsd}
            height={120}
            theme="light"
            className="classic-chart"
          />
        </div>
      </div>
    </div>
  );
};
