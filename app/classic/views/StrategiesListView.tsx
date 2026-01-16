'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, Loader2, Search, Filter } from 'lucide-react';
import { useAgentList } from '../../features/agents';
import { AGENT_MODES } from '../../features/agents/constants';

interface StrategiesListViewProps {
  className?: string;
}

export function StrategiesListView({ className = '' }: StrategiesListViewProps) {
  const router = useRouter();
  const { agents, isLoading } = useAgentList();

  const handleStrategyClick = (id: string) => {
    router.push(`/classic/strategies/${id}`);
  };

  const handleCreateClick = () => {
    router.push('/classic/strategies/new');
  };

  // Get status badge style
  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      running: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      paused: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
      idle: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
      error: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
    };
    return styles[status] || styles.idle;
  };

  // Get risk label for agent mode
  const getRiskLabel = (mode: string): { label: string; color: string } => {
    const modeDef = AGENT_MODES[mode as keyof typeof AGENT_MODES];
    if (!modeDef) return { label: 'Moderate', color: 'text-blue-600' };
    const riskMap: Record<string, { label: string; color: string }> = {
      low: { label: 'Low Risk', color: 'text-emerald-600' },
      medium: { label: 'Moderate Risk', color: 'text-blue-600' },
      'medium-high': { label: 'Elevated Risk', color: 'text-amber-600' },
      high: { label: 'High Risk', color: 'text-red-600' },
    };
    return riskMap[modeDef.riskLevel] || { label: 'Moderate', color: 'text-blue-600' };
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format percentage
  const formatPnl = (pnl: number): string => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(1)}%`;
  };

  return (
    <div className={`max-w-[1200px] mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategies</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your automated trading strategies</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c47c48] text-white font-bold rounded-xl hover:bg-[#a66a3d] transition-colors shadow-lg"
        >
          <Plus size={20} />
          New Strategy
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search strategies..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#c47c48] focus:ring-2 focus:ring-[#c47c48]/20"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Strategy List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-4">
            <p className="text-lg">No strategies yet</p>
            <p className="text-sm">Create your first strategy to get started</p>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#c47c48] text-white font-bold rounded-xl hover:bg-[#a66a3d] transition-colors"
            >
              <Plus size={18} />
              Create Strategy
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {agents.map((agent) => {
              const statusStyle = getStatusStyle(agent.status);
              const risk = getRiskLabel(agent.mode);
              const modeDef = AGENT_MODES[agent.mode as keyof typeof AGENT_MODES];

              return (
                <button
                  key={agent.id}
                  onClick={() => handleStrategyClick(agent.id)}
                  className="w-full flex items-center gap-6 p-5 hover:bg-gray-50 transition-colors text-left group"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-[#c47c48]/20 to-[#c47c48]/10 rounded-xl flex items-center justify-center text-[#c47c48] font-bold text-lg shrink-0">
                    {agent.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{agent.name}</h3>
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="font-medium">{modeDef?.classicLabel || 'Standard'}</span>
                      <span>·</span>
                      <span className={risk.color}>{risk.label}</span>
                      <span>·</span>
                      <span>Created {formatDate(agent.createdAt)}</span>
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="text-right shrink-0">
                    <div className={`text-xl font-bold tabular-nums ${
                      agent.pnl24h >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {formatPnl(agent.pnl24h)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">24h Performance</div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight
                    size={20}
                    className="text-gray-300 group-hover:text-[#c47c48] group-hover:translate-x-1 transition-all shrink-0"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {!isLoading && agents.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{agents.length}</div>
            <div className="text-sm text-gray-500">Total Strategies</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {agents.filter(a => a.status === 'running').length}
            </div>
            <div className="text-sm text-gray-500">Currently Running</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">
              {agents.filter(a => a.pnl24h > 0).length}
            </div>
            <div className="text-sm text-gray-500">Profitable (24h)</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`text-2xl font-bold ${
              agents.reduce((sum, a) => sum + a.pnl24h, 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {formatPnl(agents.reduce((sum, a) => sum + a.pnl24h, 0) / agents.length)}
            </div>
            <div className="text-sm text-gray-500">Avg. Performance</div>
          </div>
        </div>
      )}
    </div>
  );
}
