'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  agentName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

export function DeleteConfirmation({
  isOpen,
  agentName,
  onConfirm,
  onCancel,
  isDeleting = false,
  error = null,
}: DeleteConfirmationProps) {
  if (!isOpen || !agentName) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md p-6 rounded-xl"
        style={{
          background: 'var(--ui-bg1)',
          border: '1px solid var(--ui-control-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div
            className="p-4 rounded-full"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          >
            <Trash2 size={32} style={{ color: 'rgb(239, 68, 68)' }} />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-xl font-semibold text-center mb-2"
          style={{ color: 'var(--ui-text)' }}
        >
          Delete Agent?
        </h3>

        {/* Message */}
        <p
          className="text-center mb-6"
          style={{ color: 'var(--ui-muted)' }}
        >
          Are you sure you want to delete{' '}
          <span style={{ color: 'var(--ui-text)', fontWeight: 600 }}>
            {agentName}
          </span>
          ? This action cannot be undone.
        </p>

        {/* Error message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm text-center"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'rgb(239, 68, 68)',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
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
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: 'rgb(239, 68, 68)',
              color: 'white',
            }}
          >
            {isDeleting ? (
              'Deleting...'
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
