'use client';

import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import {
  X,
  Cpu,
  Save,
  Terminal,
  Settings,
  Shield,
  Activity,
  Power,
  RotateCw,
  Zap,
  Target,
} from 'lucide-react';
import type { Agent } from './types';

// --- SUB-COMPONENTS ---

// 1. The "Kill Switch" (Tactical Slider)
type KillSwitchProps = {
  isRunning: boolean;
  onToggle: () => void;
};

const KillSwitch = ({ isRunning, onToggle }: KillSwitchProps) => (
  <div
    onClick={onToggle}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    }}
    className={`relative h-14 rounded-full border border-[#2A303C] p-1 cursor-pointer transition-all duration-500 flex items-center ${
      isRunning
        ? 'bg-[#0F1115] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]'
        : 'bg-[#181B21]'
    }`}
  >
    {/* The Sliding Handle */}
    <div
      className={`absolute h-11 w-1/2 rounded-full shadow-lg flex items-center justify-center gap-2 font-bold tracking-widest text-xs transition-all duration-500 z-10 ${
        isRunning
          ? 'left-[calc(50%-4px)] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white'
          : 'left-1 bg-[#2A303C] text-gray-400 border border-gray-600'
      }`}
    >
      {isRunning ? (
        <>
          <Activity size={14} className="animate-pulse" /> ACTIVE
        </>
      ) : (
        <>
          <Power size={14} /> STOPPED
        </>
      )}
    </div>

    {/* Text Labels Background */}
    <div className="w-full flex justify-between px-8 text-[10px] font-mono font-bold text-gray-600 uppercase">
      <span>Offline</span>
      <span className={isRunning ? 'text-[#D97706] opacity-100' : 'opacity-50'}>Live</span>
    </div>
  </div>
);

// 2. Visual Slider Input
type RangeSliderProps = {
  label: string;
  value: number;
  min?: number;
  max: number;
  unit?: string;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const RangeSlider = ({ label, value, min = 0, max, unit = '' }: RangeSliderProps) => {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const pctClamped = clamp(pct, 0, 100);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
        <span className="text-sm font-mono text-[#2DD4BF]">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative h-2 bg-[#0F1115] rounded-full overflow-hidden border border-[#2A303C]">
        {/* Fill */}
        <div className="absolute top-0 left-0 h-full bg-[#2DD4BF]" style={{ width: `${pctClamped}%` }}></div>
        {/* Handle (Visual only for mock) */}
        <div className="absolute top-0 h-full w-2 bg-white blur-[1px]" style={{ left: `${pctClamped}%` }}></div>
      </div>
    </div>
  );
};

// 3. Selection Card (For Mode/Strategy)
type SelectCardProps = {
  icon: ComponentType<{ size?: number }>;
  title: string;
  desc: string;
  active: boolean;
  onClick?: () => void;
};

const SelectCard = ({ icon: Icon, title, desc, active, onClick }: SelectCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all ${
      active
        ? 'bg-[#D97706]/10 border-[#D97706] relative overflow-hidden'
        : 'bg-[#181B21] border-[#2A303C] hover:border-gray-500'
    }`}
  >
    {active && <div className="absolute top-0 left-0 w-1 h-full bg-[#D97706]"></div>}
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-[#D97706] text-white' : 'bg-[#2A303C] text-gray-400'}`}> 
        <Icon size={18} />
      </div>
      <div>
        <h4 className={`text-sm font-bold ${active ? 'text-white' : 'text-gray-300'}`}>{title}</h4>
        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  </button>
);

// --- MAIN MODAL ---

type AgentDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  agent?: Agent | null;
};

export default function AgentDetailModal({ isOpen, onClose, agent }: AgentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'strategy' | 'risk' | 'identity' | 'logs'>('strategy');
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const t = window.setTimeout(() => {
      setActiveTab('strategy');
      setIsRunning(agent?.status !== 'inactive');
    }, 0);

    return () => window.clearTimeout(t);
  }, [isOpen, agent?.status]);

  if (!isOpen) return null;

  const displayName = agent?.name ?? 'Unknown Agent';
  const chainLabel = (agent?.chain ?? 'Unknown').toUpperCase();
  const avatarColor = agent?.avatarColor ?? 'bg-indigo-600';
  const statusText = isRunning ? 'ONLINE' : 'OFFLINE';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#13151A] border border-[#2A303C] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* --- HEADER --- */}
        <div className="h-20 bg-[#181B21] border-b border-[#2A303C] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className={`w-12 h-12 rounded-xl ${avatarColor} flex items-center justify-center shadow-lg border border-white/10`}
            >
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{displayName}</h2>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="text-[#D97706]">{chainLabel}</span>
                <span>{'\u2022'}</span>
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isRunning ? 'bg-[#2DD4BF] animate-pulse' : 'bg-gray-600'
                    }`}
                  ></span>
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* The Kill Switch */}
            <div className="w-48">
              <KillSwitch isRunning={isRunning} onToggle={() => setIsRunning((v) => !v)} />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#2A303C] rounded-lg text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* --- BODY --- */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-[#0F1115] border-r border-[#2A303C] p-4 space-y-2 shrink-0">
            {[
              { id: 'strategy', label: 'Strategy', icon: Target },
              { id: 'risk', label: 'Risk & Safety', icon: Shield },
              { id: 'identity', label: 'Identity', icon: Settings },
              { id: 'logs', label: 'Terminal', icon: Terminal },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2A303C] text-[#D97706] border border-[#D97706]/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-[#2A303C]/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-[#13151A] custom-scrollbar">
            {activeTab === 'strategy' && (
              <div className="space-y-8">
                {/* Strategy Selector */}
                <div className="grid grid-cols-2 gap-4">
                  <SelectCard
                    icon={Zap}
                    title="Momentum Scalp"
                    desc="Aggressive entry on volume spikes. Tight stops."
                    active={true}
                  />
                  <SelectCard
                    icon={RotateCw}
                    title="Swing Accumulator"
                    desc="DCA into dips over 4h horizons. Patient entries."
                    active={false}
                  />
                </div>

                <div className="w-full h-px bg-[#2A303C]"></div>

                {/* Sliders Section */}
                <div className="grid grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                      Entry Parameters
                    </h3>
                    <RangeSlider label="Min Confidence Score" value={78} max={100} unit="%" />
                    <RangeSlider label="Market Cap Floor" value={450} max={1000} unit="K" />
                    <RangeSlider label="Volume Threshold (15m)" value={12} max={100} unit="K" />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                      Position Sizing
                    </h3>
                    <RangeSlider label="Base Bet Size" value={2.5} max={10} unit=" SOL" />
                    <RangeSlider label="Max Open Positions" value={5} max={10} unit="" />
                    <div className="flex items-center justify-between p-3 bg-[#181B21] border border-[#2A303C] rounded-lg mt-4">
                      <span className="text-sm font-bold text-gray-300">Compound Profits</span>
                      <div className="w-10 h-5 bg-[#D97706] rounded-full relative cursor-pointer">
                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Live System Feed
                  </h3>
                  <button
                    type="button"
                    className="text-[10px] text-[#D97706] border border-[#D97706] px-2 py-1 rounded hover:bg-[#D97706]/10"
                  >
                    EXPORT LOGS
                  </button>
                </div>
                <div className="flex-1 bg-[#0F1115] rounded-xl border border-[#2A303C] p-4 font-mono text-xs overflow-y-auto space-y-2">
                  <div className="text-gray-500">
                    [14:20:01] <span className="text-[#2DD4BF]">SCANNING</span> Snek pool volatility...
                  </div>
                  <div className="text-gray-500">
                    [14:20:03] <span className="text-gray-300">INFO</span> Order book depth analysis complete.
                    Variance: 0.4%
                  </div>
                  <div className="text-gray-500">
                    [14:20:15] <span className="text-[#D97706]">SIGNAL</span> Breakout detected on 5m candle.
                    Confidence: 82%
                  </div>
                  <div className="text-gray-500">
                    [14:20:16] <span className="text-blue-400">EXECUTING</span> Buy Order #88291 submitted to chain.
                  </div>
                  <div className="text-gray-500">
                    [14:20:18] <span className="text-[#2DD4BF]">SUCCESS</span> Filled 2400 SNEK @ 0.0024 ADA
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'risk' || activeTab === 'identity') && (
              <div className="text-sm text-gray-500">
                This section is a placeholder in the mock - we can flesh it out next.
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="h-16 bg-[#181B21] border-t border-[#2A303C] flex items-center justify-end px-6 shrink-0 gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-gray-500 hover:text-white transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all"
          >
            <Save size={16} /> SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}