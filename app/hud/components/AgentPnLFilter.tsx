'use client';

import React from 'react';
import { Check, Users } from 'lucide-react';
import type { AgentPnLData } from '../../hooks/useAgentPnL';
import { useControlSound } from './controls/useControlSound';

interface AgentPnLFilterProps {
  agents: AgentPnLData[];
  selectedIds: string[];
  onSelectAgent: (agentId: string) => void;
  onDeselectAgent: (agentId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
  className?: string;
}

export function AgentPnLFilter({
  agents,
  selectedIds,
  onSelectAgent,
  onDeselectAgent,
  onSelectAll,
  onClearSelection,
  isLoading = false,
  className = '',
}: AgentPnLFilterProps) {
  const allSelected = agents.length > 0 && selectedIds.length === agents.length;
  const noneSelected = selectedIds.length === 0;
  const { playTick } = useControlSound('toggle');

  const toggleAgent = (agentId: string) => {
    const isCurrentlySelected = selectedIds.includes(agentId);
    playTick(isCurrentlySelected ? 'down' : 'up');
    if (isCurrentlySelected) {
      onDeselectAgent(agentId);
    } else {
      onSelectAgent(agentId);
    }
  };

  const formatPnL = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`${className}`}>
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <div className="text-white/50 text-[10px] md:text-xs tracking-widest flex items-center gap-2">
          <Users size={14} />
          <span className="hidden sm:inline">FILTER BY AGENT</span>
          <span className="sm:hidden">AGENTS</span>
        </div>
        <div className="flex gap-1 md:gap-2">
          <button
            onClick={onSelectAll}
            disabled={allSelected || isLoading}
            className={`px-2 md:px-3 py-1.5 md:py-1 text-[10px] md:text-xs rounded transition-colors min-h-[32px] md:min-h-0 ${
              allSelected
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            All
          </button>
          <button
            onClick={onClearSelection}
            disabled={noneSelected || isLoading}
            className={`px-2 md:px-3 py-1.5 md:py-1 text-[10px] md:text-xs rounded transition-colors min-h-[32px] md:min-h-0 ${
              noneSelected
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Agent chips */}
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-8 md:h-8 w-20 md:w-24 bg-white/5 rounded animate-pulse"
              />
            ))}
          </>
        ) : (
          agents.map((agent) => {
            const isSelected = selectedIds.includes(agent.id);
            const pnlColor = agent.pnl24h >= 0 ? 'text-green-400' : 'text-rose-400';

            return (
              <button
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                className={`
                  flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-2 md:py-1.5 rounded-lg text-[10px] md:text-xs font-mono
                  border transition-all duration-200 min-h-[36px] md:min-h-0
                  ${
                    isSelected
                      ? 'bg-[#c47c48]/20 border-[#c47c48]/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Selection indicator */}
                <div
                  className={`
                    w-4 h-4 rounded border flex items-center justify-center shrink-0
                    transition-colors duration-200
                    ${
                      isSelected
                        ? 'bg-[#c47c48] border-[#c47c48]'
                        : 'border-white/30'
                    }
                  `}
                >
                  {isSelected && <Check size={10} className="text-white" />}
                </div>

                {/* Agent name */}
                <span className={`${isSelected ? 'text-white' : ''} truncate max-w-[60px] md:max-w-none`}>
                  {agent.name}
                </span>

                {/* P&L indicator - hide on very small screens */}
                <span className={`${pnlColor} ${isSelected ? '' : 'opacity-50'} hidden xs:inline md:inline`}>
                  {formatPnL(agent.pnl24h)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Selection summary */}
      {selectedIds.length > 0 && selectedIds.length < agents.length && (
        <div className="mt-2 md:mt-3 text-[10px] md:text-xs text-white/40">
          Showing P&L for {selectedIds.length} of {agents.length} agents
        </div>
      )}
    </div>
  );
}
