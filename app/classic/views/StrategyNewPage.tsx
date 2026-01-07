'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Rocket,
  HelpCircle,
  Loader2,
  AlertCircle,
  CheckCircle,
  PieChart,
  Brain,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useCreateAgent } from '../../features/agents';
import type { AgentMode } from '../../features/agents/types';
import { AGENT_MODES, AGENT_MODE_ORDER } from '../../features/agents/constants';
import { RiskWarning } from '../../features/agents/components';
import { ClassicFinanceHeader } from '../ClassicFinanceHeader';

// Icon map for mode selection
const MODE_ICONS: Record<AgentMode, typeof PieChart> = {
  standard: PieChart,
  't-mode': Brain,
  prediction: TrendingUp,
  perpetuals: Zap,
};

export function StrategyNewPage() {
  const router = useRouter();
  const [view, setView] = useState<string>('strategies');

  // Form state
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState<AgentMode>('standard');
  const [nameError, setNameError] = useState<string | null>(null);

  // Create agent hook
  const { createAgent, isCreating, error: createError, clearError } = useCreateAgent();

  // Validate name
  const validateName = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setNameError('Strategy name is required');
      return false;
    }
    if (value.length < 3) {
      setNameError('Name must be at least 3 characters');
      return false;
    }
    if (value.length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError(null);
    return true;
  }, []);

  // Handle name change
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (nameError) {
      validateName(value);
    }
    clearError();
  }, [nameError, validateName, clearError]);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: AgentMode) => {
    setSelectedMode(mode);
    clearError();
  }, [clearError]);

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!validateName(name)) return;

    const newAgent = await createAgent(name.trim(), selectedMode);
    if (newAgent) {
      // Navigate to the new strategy's detail page
      router.push(`/classic/strategies/${newAgent.id}`);
    }
  }, [name, selectedMode, validateName, createAgent, router]);

  // Handle back
  const handleBack = useCallback(() => {
    router.push('/');
  }, [router]);

  // Get risk warning for selected mode
  const getRiskWarning = (): string | null => {
    const modeDef = AGENT_MODES[selectedMode];
    if (modeDef.riskLevel === 'high') {
      return 'This mode involves higher risk. Please ensure you understand the implications before proceeding.';
    }
    if (modeDef.riskLevel === 'medium-high') {
      return 'This mode involves elevated risk. Please ensure you understand the implications before proceeding.';
    }
    return null;
  };

  const riskWarning = getRiskWarning();

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <ClassicFinanceHeader view={view} setView={setView} />

      {/* Sub-header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[800px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">Create New Strategy</h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[800px] mx-auto px-8 py-8">
        <div className="space-y-6">
          {/* Introduction Card */}
          <div className="bg-gradient-to-br from-[#1a2a3a] to-[#0f1a26] rounded-2xl p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Rocket className="w-7 h-7 text-[#c47c48]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Deploy a New Strategy</h2>
                <p className="text-gray-300 leading-relaxed">
                  Create an automated strategy that works for you. Choose a mode that matches your risk tolerance
                  and investment goals, then customize the settings to your preferences.
                </p>
              </div>
            </div>
          </div>

          {/* Strategy Name Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Strategy Name
              </h2>
              <Tooltip content="Choose a memorable name to identify this strategy in your dashboard">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onBlur={() => validateName(name)}
                placeholder="e.g., Balanced Growth, Conservative Income..."
                className={`w-full px-4 py-3 text-lg border rounded-xl transition-all focus:outline-none focus:ring-2 ${
                  nameError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-200 focus:border-[#c47c48] focus:ring-[#c47c48]/20'
                }`}
              />
              {nameError && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {nameError}
                </p>
              )}
            </div>
          </div>

          {/* Mode Selection Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Strategy Mode
              </h2>
              <Tooltip content="Each mode has different risk levels and trading approaches. Choose one that matches your investment style.">
                <HelpCircle className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <p className="text-gray-600 mb-6">
              Select a trading mode for your strategy. You can change this later if needed.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENT_MODE_ORDER.map((modeKey) => {
                const modeDef = AGENT_MODES[modeKey];
                const isSelected = selectedMode === modeKey;
                const Icon = MODE_ICONS[modeKey];

                return (
                  <button
                    key={modeKey}
                    onClick={() => handleModeSelect(modeKey)}
                    className={`relative p-5 text-left border-2 rounded-xl transition-all ${
                      isSelected
                        ? 'border-[#c47c48] bg-orange-50/50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-[#c47c48]" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#c47c48]/10' : 'bg-gray-100'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-[#c47c48]' : 'text-gray-500'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">{modeDef.classicLabel}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {modeDef.description}
                        </div>
                        <div className="mt-2">
                          <RiskBadge level={modeDef.riskLevel} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Warning */}
          {riskWarning && (
            <RiskWarning
              message={riskWarning}
              variant={selectedMode === 'perpetuals' ? 'danger' : 'warning'}
            />
          )}

          {/* Error Message */}
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Failed to create strategy</p>
                <p className="text-sm text-red-600 mt-1">{createError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={handleBack}
              disabled={isCreating}
              className="px-6 py-3 text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-[#c47c48] text-white font-bold rounded-xl hover:bg-[#a66a3d] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Create Strategy
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium Risk' },
    'medium-high': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Med-High Risk' },
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
  };

  const style = styles[level] || styles.medium;

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-full ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {content}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}
