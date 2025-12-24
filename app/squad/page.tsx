'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Bell,
  Cpu,
  TrendingUp,
  Activity,
  ChevronRight,
  Maximize2,
  Plus,
  Search,
  ShieldCheck,
  Server,
} from 'lucide-react';
import AgentDetailModal from './AgentDetailModal';
import type { Agent } from './types';
import { UiStyleToggle } from '../UiStyleToggle';
import { useUiStyle } from '../UiStyleProvider';

// --- VISUAL PRIMITIVES ---

type BentoCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  onExpand?: () => void;
};

// The "Tabbed" Bento Card (The Wallet View Design)
// This mimics the "Folder" look from your reference with a distinct metallic header
const BentoCard = ({ title, children, className = '', onExpand }: BentoCardProps) => (
  <div
    className={`relative flex flex-col ui-bento-surface backdrop-blur-md border border-[var(--ui-panel-border)] rounded-2xl shadow-2xl overflow-hidden group ${className}`}
  >
    {/* The "Tab" Header - Metallic Gradient Background */}
    <div className="h-12 ui-bento-front border-b border-[var(--ui-divider)] flex justify-between items-center px-4 shrink-0">
      <div className="flex items-center gap-2">
        {/* Decorative 'LED' line */}
        <div className="h-4 w-1 bg-[rgb(var(--ui-accentHot-rgb))] rounded-full shadow-[0_0_10px_rgba(var(--ui-accentHot-rgb),0.45)]"></div>
        <span className="text-sm font-bold tracking-wider text-gray-200 font-mono uppercase">
          {title}
        </span>
      </div>

      {/* Expand Icon - Visible on Hover */}
      {typeof onExpand === 'function' ? (
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Expand ${title}`}
          className="opacity-50 group-hover:opacity-100 hover:text-[#2DD4BF] transition-all"
        >
          <Maximize2 size={16} />
        </button>
      ) : null}
    </div>

    {/* Card Body */}
    <div className="flex-1 p-4 overflow-hidden relative">{children}</div>
  </div>
);

type AgentItemProps = Agent & {
  isSelected: boolean;
  onSelect: (id: string) => void;
  onManage: (id: string) => void;
};

// The Agent Roster Item
const AgentItem = ({
  id,
  name,
  job,
  chain,
  status,
  avatarColor,
  isSelected,
  onSelect,
  onManage,
}: AgentItemProps) => (
  <div
    role="button"
    tabIndex={0}
    aria-pressed={isSelected}
    onClick={() => onSelect(id)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(id);
      }
    }}
    className={
      'group relative p-3 rounded-xl transition-all duration-300 cursor-pointer border outline-none ' +
      (isSelected
        ? 'bg-[#2A303C]/60 border-[#D97706]/40'
        : 'border-transparent hover:bg-[#2A303C]/50 hover:border-[#D97706]/30')
    }
  >
    <div className="flex items-center gap-3">
      {/* Avatar (Placeholder for NFT) */}
      <div
        className={`w-10 h-10 rounded-lg ${avatarColor} flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 transition-transform`}
      >
        <Cpu size={20} className="text-white relative z-10" />
        {/* Glow behind avatar */}
        <div className="absolute inset-0 bg-white/20 blur-md"></div>
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-200 truncate">{name}</h3>
          {/* Status Dot */}
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'active'
                ? 'bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF]'
                : 'bg-gray-600'
            }`}
          ></div>
        </div>
        <div className="text-[10px] text-gray-500 font-mono truncate flex items-center gap-1">
          <span className="uppercase text-[#D97706]">{job}</span>
          <span className="text-gray-600">{'\u2022'}</span>
          <span>{chain}</span>
        </div>
      </div>
    </div>

    {/* "MANAGE" Overlay - Appears on Hover */}
    <div className="absolute inset-0 bg-[#0F1115]/80 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onManage(id);
        }}
        className="flex items-center gap-2 text-[#D97706] font-bold text-xs tracking-widest border border-[#D97706] px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(217,119,6,0.2)] hover:bg-[#D97706]/10"
      >
        MANAGE <ChevronRight size={12} />
      </button>
    </div>
  </div>
);

// --- MAIN LAYOUT ---

export default function SquadCommandLayout() {
  const { style: uiStyle } = useUiStyle();
  const isHud = uiStyle === 'hud';

  const agents = useMemo<Agent[]>(
    () => [
      {
        id: 'agent-1',
        name: 'Alpha Sniper',
        job: 'T-Mode',
        chain: 'Solana',
        status: 'active',
        avatarColor: 'bg-indigo-600',
      },
      {
        id: 'agent-2',
        name: 'Snek Accumulator',
        job: 'Grid Bot',
        chain: 'Cardano',
        status: 'active',
        avatarColor: 'bg-yellow-600',
      },
      {
        id: 'agent-3',
        name: 'Base Runner',
        job: 'Perpetuals',
        chain: 'Base',
        status: 'inactive',
        avatarColor: 'bg-blue-600',
      },
    ],
    [],
  );

  const [activeAgent, setActiveAgent] = useState<string>(agents[0]?.id ?? 'agent-1');
  const [isAgentDetailOpen, setIsAgentDetailOpen] = useState(false);
  const [detailAgentId, setDetailAgentId] = useState<string | null>(null);

  const detailAgent = agents.find((a) => a.id === (detailAgentId ?? activeAgent));

  const openAgentDetail = (id: string) => {
    setActiveAgent(id);
    setDetailAgentId(id);
    setIsAgentDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--ui-bg0)] text-[var(--ui-text)] font-terminal flex flex-col overflow-hidden">
      {/* ---------------- ZONE 1: TOP NAVIGATION ---------------- */}
      <header
        className={
          'h-16 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50 font-adam-header ' +
          (isHud
            ? 'bg-[rgba(7,7,10,0.72)] border-b border-[rgba(var(--ui-accent-rgb),0.18)]'
            : 'bg-[#181B21]/90 border-b border-[#2A303C]')
        }
      >
        {/* Logo Area */}
        <Link href="/" className="flex items-center gap-3 w-[240px]" aria-label="Go to Dashboard">
          <div className="w-9 h-9 bg-gradient-to-br from-[rgb(var(--ui-accentHot-rgb))] to-[rgba(var(--ui-accent-rgb),0.65)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--ui-accentHot-rgb),0.26)]">
            <span className="font-bold text-white text-xl">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">ADAM</span>
        </Link>

        {/* Global Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-white text-sm font-medium border-b-2 border-[rgb(var(--ui-accentHot-rgb))] py-5">
            Command Center
          </a>
          <a
            href="#"
            className="text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Market Intel
          </a>
          <a
            href="#"
            className="text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Academy
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <UiStyleToggle />
          <button className="p-2 text-gray-400 hover:text-white transition-colors relative" type="button">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[rgb(var(--ui-accentHot-rgb))] rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 bg-[#0F1115] border border-[#2A303C] pl-2 pr-4 py-1.5 rounded-full hover:border-[#D97706]/50 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 scale-75 group-hover:scale-90 transition-transform"></div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-mono uppercase leading-tight">
                Connected
              </span>
              <span className="text-xs font-bold text-gray-300 font-mono">0x...8a22</span>
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- MAIN CONTENT WRAPPER ---------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---------------- ZONE 2: AGENT ROSTER (LEFT SIDEBAR) ---------------- */}
        <aside className="w-[280px] bg-[#13151A] border-r border-[#2A303C] flex flex-col shrink-0 z-40">
          <div className="p-4 border-b border-[#2A303C]/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-600" size={14} />
              <input
                type="text"
                placeholder="Search Agents..."
                className="w-full bg-[#0F1115] border border-[#2A303C] rounded-lg py-2 pl-9 pr-4 text-xs text-gray-300 focus:border-[#D97706] focus:outline-none transition-colors placeholder:text-gray-700"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">
              Active Squad
            </div>

            {agents.map((agent) => (
              <AgentItem
                key={agent.id}
                {...agent}
                isSelected={activeAgent === agent.id}
                onSelect={setActiveAgent}
                onManage={openAgentDetail}
              />
            ))}

            {/* Add New Agent Slot */}
            <button
              type="button"
              className="w-full mt-4 border border-dashed border-[#2A303C] rounded-xl p-4 flex flex-col items-center justify-center text-gray-600 hover:text-[#D97706] hover:border-[#D97706]/50 hover:bg-[#D97706]/5 transition-all group"
            >
              <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase">Deploy New Agent</span>
            </button>
          </div>

          <div className="p-4 border-t border-[#2A303C]">
            <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-mono">
              <span>System Capacity</span>
              <span>3/5 Slots</span>
            </div>
            <div className="w-full bg-[#2A303C] h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#D97706] w-3/5 h-full"></div>
            </div>
          </div>
        </aside>

        {/* ---------------- ZONE 3: BENTO MAIN STAGE ---------------- */}
        <main className="flex-1 p-6 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#1F2937]/20 via-[#0F1115] to-[#0F1115]">
          {/* Background Grid Pattern (Subtle) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 relative z-10 h-[calc(100vh-140px)] min-h-[600px]">
            {/* --- TOP ROW --- */}

            {/* 1. Main Performance Anchor (2/3 width) */}
            <BentoCard title="Portfolio Performance" className="col-span-12 lg:col-span-8">
              <div className="absolute top-4 right-4 flex gap-2">
                {/* Timeframes */}
                {['1H', '24H', '7D', '30D'].map((t) => (
                  <button
                    type="button"
                    key={t}
                    className={`text-[10px] px-2 py-1 rounded ${
                      t === '24H'
                        ? 'bg-[#D97706]/20 text-[#D97706]'
                        : 'text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Mock Chart Area */}
              <div className="h-full flex flex-col justify-end pb-4">
                <div className="text-4xl font-bold text-white mb-1">$12,403.92</div>
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-[#2DD4BF] text-sm font-mono flex items-center gap-1">
                    <TrendingUp size={14} /> +8.4%
                  </span>
                  <span className="text-gray-500 text-xs">vs last 24h</span>
                </div>

                {/* Visual representation of chart */}
                <div className="w-full h-48 bg-gradient-to-t from-[#D97706]/10 to-transparent border-t border-[#D97706]/20 relative">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path
                      d="M0,150 Q150,100 300,120 T600,50 T900,80 T1200,20"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="2"
                    />
                    <path
                      d="M0,150 Q150,100 300,120 T600,50 T900,80 T1200,20 V200 H0 Z"
                      fill="url(#gradient)"
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </BentoCard>

            {/* 2. Portfolio Assets (1/3 width) */}
            <BentoCard title="Assets" className="col-span-12 lg:col-span-4">
              <div className="space-y-1">
                {/* Asset Row */}
                {[
                  { tick: 'ADA', name: 'Cardano', amt: '4,200', val: '$1,920', icon: 'bg-blue-600' },
                  { tick: 'SNEK', name: 'Snek', amt: '1.2M', val: '$840', icon: 'bg-yellow-500' },
                  { tick: 'SOL', name: 'Solana', amt: '142', val: '$15,400', icon: 'bg-purple-500' },
                ].map((asset, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#2A303C]/50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full ${asset.icon} flex items-center justify-center text-white text-[10px] font-bold`}
                      >
                        {asset.tick[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-200">{asset.tick}</div>
                        <div className="text-[10px] text-gray-500">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right group-hover:hidden">
                      <div className="text-sm font-mono text-gray-200">{asset.val}</div>
                      <div className="text-[10px] text-gray-500">{asset.amt}</div>
                    </div>
                    {/* Hidden Actions on Hover */}
                    <div className="hidden group-hover:flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1 bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded text-[10px] font-bold"
                      >
                        SWAP
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 rounded text-[10px] font-bold"
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* --- BOTTOM ROW --- */}

            {/* 3. Recent Trades */}
            <BentoCard title="Recent Activity" className="col-span-12 md:col-span-4">
              <div className="space-y-3 mt-2">
                {[
                  { type: 'BUY', pair: 'SNEK/ADA', price: '0.0021', time: '2m ago' },
                  { type: 'SELL', pair: 'SOL/USDC', price: '142.50', time: '15m ago' },
                  { type: 'BUY', pair: 'WIF/SOL', price: '2.31', time: '42m ago' },
                  { type: 'BUY', pair: 'SNEK/ADA', price: '0.0019', time: '1h ago' },
                ].map((trade, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs border-b border-[#2A303C] pb-2 last:border-0"
                  >
                    <div className="flex gap-2 items-center">
                      <span
                        className={`font-bold ${
                          trade.type === 'BUY' ? 'text-[#2DD4BF]' : 'text-[#D97706]'
                        }`}
                      >
                        {trade.type}
                      </span>
                      <span className="text-gray-400">{trade.pair}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-300 font-mono">{trade.price}</div>
                      <div className="text-[10px] text-gray-600">{trade.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* 4. Asset Allocation (Pie) */}
            <BentoCard title="Allocation" className="col-span-12 md:col-span-4">
              <div className="h-full flex items-center justify-center relative">
                {/* CSS Donut Chart */}
                <div className="w-32 h-32 rounded-full border-[12px] border-[#2A303C] border-t-[#D97706] border-r-[#2DD4BF] rotate-45 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45">
                    <span className="text-gray-500 text-[10px] uppercase">Top Asset</span>
                    <span className="text-white font-bold">SOL</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="absolute bottom-0 w-full flex justify-center gap-4 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#D97706]"></div>SOL
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#2DD4BF]"></div>ADA
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#2A303C]"></div>Other
                  </span>
                </div>
              </div>
            </BentoCard>

            {/* 5. System Status */}
            <BentoCard title="System Health" className="col-span-12 md:col-span-4">
              <div className="space-y-4 mt-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Server size={14} className="text-[#2DD4BF]" />
                    <span className="text-xs text-gray-300">Adam Core</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded border border-[#2DD4BF]/20">
                    OPERATIONAL
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[#D97706]" />
                    <span className="text-xs text-gray-300">Data Feeds</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded border border-[#2DD4BF]/20">
                    SYNCED (12ms)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-300">Execution Guard</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded border border-[#2DD4BF]/20">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#2A303C]">
                  <div className="text-[10px] text-gray-500 mb-1">Last Error Log</div>
                  <div className="text-[10px] text-red-400 font-mono truncate">
                    None since reboot (42h ago)
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </main>
      </div>

      <AgentDetailModal
        isOpen={isAgentDetailOpen}
        onClose={() => setIsAgentDetailOpen(false)}
        agent={detailAgent}
      />
    </div>
  );
}