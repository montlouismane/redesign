'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  HelpCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAgent, useDeleteAgent } from '../../features/agents';
import { useAgentSettings } from '../../features/agents/hooks/useAgentSettings';
import type { AgentMode } from '../../features/agents/types';
import {
  AgentProfile,
  ModeSelector,
  RiskWarning,
  StandardSettingsForm,
  TModeSettingsForm,
  PredictionSettingsForm,
  PerpetualsSettingsForm,
  DeleteConfirmation,
} from '../../features/agents/components';
import { ClassicFinanceHeader } from '../ClassicFinanceHeader';

interface StrategyDetailPageProps {
  strategyId: string;
}

export function StrategyDetailPage({ strategyId }: StrategyDetailPageProps) {
  const router = useRouter();
  const [view, setView] = useState<string>('strategies');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Load agent data
  const { agent, isLoading, updateAgent, setStatus, refetch } = useAgent(strategyId);

  // Form state management
  const {
    formValues,
    name,
    mode,
    isDirty,
    errors,
    updateField,
    updateName,
    updateMode,
    getUpdatePayload,
    reset,
    validate,
    riskWarning,
  } = useAgentSettings(agent);

  // Delete confirmation
  const {
    confirmationState: deleteState,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    error: deleteError,
  } = useDeleteAgent();

  // Handle navigation with unsaved changes warning
  const handleNavigation = useCallback((path: string) => {
    if (isDirty) {
      setPendingNavigation(path);
      setShowUnsavedWarning(true);
    } else {
      router.push(path);
    }
  }, [isDirty, router]);

  // Handle back button
  const handleBack = useCallback(() => {
    handleNavigation('/');
  }, [handleNavigation]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!agent || !validate()) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = getUpdatePayload();
      if (Object.keys(payload).length > 0) {
        await updateAgent(payload);
        await refetch();
        reset();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  }, [agent, validate, getUpdatePayload, updateAgent, refetch, reset]);

  // Handle cancel (discard changes)
  const handleCancel = useCallback(() => {
    reset();
  }, [reset]);

  // Handle status toggle
  const handleToggleStatus = useCallback(async () => {
    if (!agent) return;
    const newStatus = agent.status === 'running' ? 'stopped' : 'running';
    await setStatus(newStatus);
    await refetch();
  }, [agent, setStatus, refetch]);

  // Handle delete
  const handleDeleteRequest = useCallback(() => {
    if (agent) {
      requestDelete(agent.id, agent.name);
    }
  }, [agent, requestDelete]);

  const handleDeleteConfirm = useCallback(async () => {
    const success = await confirmDelete();
    if (success) {
      router.push('/');
    }
  }, [confirmDelete, router]);

  // Confirm navigation away with unsaved changes
  const confirmNavigation = useCallback(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  }, [pendingNavigation, router]);

  const cancelNavigation = useCallback(() => {
    setShowUnsavedWarning(false);
    setPendingNavigation(null);
  }, []);

  // Render settings based on mode
  const renderSettings = () => {
    if (!formValues) return null;

    const commonProps = {
      errors,
      disabled: isSaving,
    };

    switch (mode) {
      case 'standard':
        return (
          <StandardSettingsForm
            settings={formValues.standard}
            onChange={(field, value) => updateField('standard', field, value)}
            {...commonProps}
          />
        );
      case 't-mode':
        return (
          <TModeSettingsForm
            settings={formValues.tMode}
            onChange={(field, value) => updateField('tMode', field, value)}
            {...commonProps}
          />
        );
      case 'prediction':
        return (
          <PredictionSettingsForm
            settings={formValues.prediction}
            onChange={(field, value) => updateField('prediction', field, value)}
            {...commonProps}
          />
        );
      case 'perpetuals':
        return (
          <PerpetualsSettingsForm
            settings={formValues.perpetuals}
            onChange={(field, value) => updateField('perpetuals', field, value)}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <ClassicFinanceHeader view={view} setView={setView} />
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg font-medium">Loading strategy...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!agent) {
    return (
      <div className="min-h-screen bg-[#f0f2f5]">
        <ClassicFinanceHeader view={view} setView={setView} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-72px)] gap-4">
          <AlertTriangle className="w-16 h-16 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Strategy Not Found</h2>
          <p className="text-gray-600">The strategy you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-[#c47c48] text-white font-bold rounded-xl hover:bg-[#a66a3d] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <ClassicFinanceHeader view={view} setView={setView} />

      {/* Sub-header with back button and actions */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
            {isDirty && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                Unsaved Changes
              </span>
            )}
            {saveSuccess && (
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                <CheckCircle className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#c47c48] text-white font-bold rounded-lg hover:bg-[#a66a3d] transition-colors disabled:opacity-50 shadow-md"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left column - Profile and Status */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Strategy Profile
                </h2>
                <Tooltip content="Basic information about your strategy">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>
              <AgentProfile
                name={name}
                avatar={agent.avatar}
                status={agent.status}
                createdAt={agent.createdAt}
                onNameChange={updateName}
                isEditable={!isSaving}
              />

              {/* Status toggle */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Strategy Status</span>
                  <StatusBadge status={agent.status} />
                </div>
                <button
                  onClick={handleToggleStatus}
                  disabled={isSaving || agent.status === 'error'}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                    agent.status === 'running'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {agent.status === 'running' ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause Strategy
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Strategy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Danger Zone Card */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider">
                  Danger Zone
                </h2>
                <Tooltip content="Permanent actions that cannot be undone">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Deleting this strategy will permanently remove all associated data and cannot be reversed.
              </p>
              <button
                onClick={handleDeleteRequest}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Delete Strategy
              </button>
            </div>
          </div>

          {/* Right column - Settings */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Mode Selection Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Strategy Mode
                </h2>
                <Tooltip content="Choose how your strategy operates. Different modes have different risk profiles.">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>
              <ModeSelector
                currentMode={mode}
                onModeChange={updateMode}
                disabled={isSaving}
              />
            </div>

            {/* Risk Warning */}
            {riskWarning && (
              <RiskWarning
                message={riskWarning}
                variant={mode === 'perpetuals' ? 'danger' : 'warning'}
              />
            )}

            {/* Mode Settings Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  {mode.toUpperCase().replace('-', ' ')} Settings
                </h2>
                <Tooltip content="Configure the specific parameters for your selected strategy mode">
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>
              {renderSettings()}
            </div>
          </div>
        </div>
      </main>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={cancelNavigation} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                <p className="text-sm text-gray-600">Your changes haven't been saved yet.</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              If you leave this page now, your changes will be lost. Would you like to save before leaving?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmNavigation}
                className="flex-1 py-3 text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={async () => {
                  await handleSave();
                  confirmNavigation();
                }}
                className="flex-1 py-3 bg-[#c47c48] text-white font-bold rounded-xl hover:bg-[#a66a3d] transition-colors"
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteState.isOpen}
        agentName={deleteState.agentName}
        onConfirm={handleDeleteConfirm}
        onCancel={cancelDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

// Helper Components

function StatusBadge({ status }: { status: string }) {
  // Aligned with production status values
  const styles: Record<string, string> = {
    running: 'bg-emerald-100 text-emerald-700',
    stopped: 'bg-gray-100 text-gray-600',
    error: 'bg-red-100 text-red-600',
    unknown: 'bg-amber-100 text-amber-600',
    timeout: 'bg-orange-100 text-orange-600',
    not_found: 'bg-gray-100 text-gray-500',
  };

  const labels: Record<string, string> = {
    running: 'Running',
    stopped: 'Stopped',
    error: 'Error',
    unknown: 'Unknown',
    timeout: 'Timeout',
    not_found: 'Not Found',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${styles[status] || styles.stopped}`}>
      {labels[status] || 'Unknown'}
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
