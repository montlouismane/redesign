'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
import { useAgentList } from '../../features/agents';
import { AGENT_MODES } from '../../features/agents/constants';

export const ActiveStrategiesCard = () => {
  const router = useRouter();
  const { agents, isLoading } = useAgentList();

  const handleStrategyClick = (id: string) => {
    router.push(`/classic/strategies/${id}`);
  };

  const handleCreateClick = () => {
    router.push('/classic/strategies/new');
  };

  // Get risk label for agent mode
  const getRiskLabel = (mode: string): string => {
    const modeDef = AGENT_MODES[mode as keyof typeof AGENT_MODES];
    if (!modeDef) return 'Moderate';
    const riskMap: Record<string, string> = {
      low: 'Low',
      medium: 'Moderate',
      'medium-high': 'Elevated',
      high: 'High',
    };
    return riskMap[modeDef.riskLevel] || 'Moderate';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format percentage
  const formatPnl = (pnl: number): string => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">Active Strategies</h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#dbe4ef] text-[#4a5f7a] text-[10px] font-semibold rounded-full">
            {agents.filter(a => a.status === 'running').length} Running
          </span>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#c47c48] hover:text-[#a66a3d] hover:bg-orange-50 rounded transition-colors"
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden classic-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <p className="text-sm">No strategies yet</p>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-1 px-3 py-2 bg-[#c47c48] text-white text-sm font-bold rounded-lg hover:bg-[#a66a3d] transition-colors"
            >
              <Plus size={16} />
              Create Strategy
            </button>
          </div>
        ) : (
          <div className="space-y-0">
            {agents.map((agent, i) => (
              <div key={agent.id}>
                <button
                  onClick={() => handleStrategyClick(agent.id)}
                  className="w-full flex justify-between items-center py-2 group cursor-pointer hover:bg-gray-50 -mx-1 px-1 rounded transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-[15px] tracking-tight leading-tight flex items-center gap-2">
                      {agent.name}
                      <ChevronRight
                        size={14}
                        className="text-gray-300 group-hover:text-[#c47c48] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium leading-tight">
                      Risk: {getRiskLabel(agent.mode)} · Started {formatDate(agent.createdAt)}
                    </div>
                  </div>
                  <div className="text-right ml-4 shrink-0 flex items-center gap-1.5">
                    <span className={`font-bold text-[15px] tabular-nums ${
                      agent.pnl24h >= 0 ? 'text-emerald-700' : 'text-red-600'
                    }`}>
                      {formatPnl(agent.pnl24h)}
                    </span>
                  </div>
                </button>
                {i < agents.length - 1 && (
                  <div className="border-b border-gray-50" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
