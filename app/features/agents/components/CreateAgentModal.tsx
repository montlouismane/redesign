'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { AgentMode } from '../types';
import { AGENT_MODES, AGENT_MODE_ORDER } from '../constants';
import { ModeSelector } from './ModeSelector';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, mode: AgentMode) => Promise<void>;
  isCreating?: boolean;
  error?: string | null;
}

export function CreateAgentModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
  error = null,
}: CreateAgentModalProps) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState<AgentMode>('standard');
  const [nameError, setNameError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    if (trimmed.length > 32) {
      setNameError('Name must be 32 characters or less');
      return;
    }

    setNameError(null);
    await onCreate(trimmed, mode);
  };

  const handleClose = () => {
    if (isCreating) return;
    setName('');
    setMode('standard');
    setNameError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden"
        style={{
          background: 'var(--ui-bg1)',
          border: '1px solid var(--ui-control-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          fontFamily: 'var(--font-jetbrains-mono)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid var(--ui-control-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(var(--ui-accent-rgb), 0.15)' }}
            >
              <Plus size={20} style={{ color: 'rgb(var(--ui-accent-rgb))' }} />
            </div>
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--ui-text)' }}
            >
              Create New Agent
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 rounded-lg transition-colors hover:bg-black/10 hover:scale-110 active:scale-95"
            style={{
              color: 'rgb(var(--ui-accent-rgb))',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'rgb(239, 68, 68)',
              }}
            >
              {error}
            </div>
          )}

          {/* Name input */}
          <div className="space-y-2">
            <label
              htmlFor="agent-name"
              className="block text-sm font-medium"
              style={{ color: 'var(--ui-text)' }}
            >
              Agent Name
            </label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(null);
              }}
              placeholder="Enter agent name..."
              maxLength={32}
              disabled={isCreating}
              className="w-full px-4 py-3 rounded-lg text-base outline-none transition-colors"
              style={{
                background: 'var(--ui-control-bg)',
                border: nameError
                  ? '1px solid rgb(239, 68, 68)'
                  : '1px solid var(--ui-control-border)',
                color: 'var(--ui-text)',
              }}
              autoFocus
            />
            {nameError && (
              <p className="text-xs" style={{ color: 'rgb(239, 68, 68)' }}>
                {nameError}
              </p>
            )}
            <p className="text-xs" style={{ color: 'var(--ui-muted)' }}>
              {name.length}/32 characters
            </p>
          </div>

          {/* Mode selector */}
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: 'var(--ui-text)' }}
            >
              Starting Mode
            </label>
            <ModeSelector
              currentMode={mode}
              onModeChange={setMode}
              disabled={isCreating}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{
                background: 'var(--ui-control-bg)',
                border: '1px solid var(--ui-control-border)',
                color: 'var(--ui-text)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{
                background: 'rgb(var(--ui-accent-rgb))',
                color: 'white',
              }}
            >
              {isCreating ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
