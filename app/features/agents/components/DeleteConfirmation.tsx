'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  agentName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

const HOLD_DURATION = 1500; // 1.5 seconds to confirm delete

export function DeleteConfirmation({
  isOpen,
  agentName,
  onConfirm,
  onCancel,
  isDeleting = false,
  error = null,
}: DeleteConfirmationProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdStartRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const hasTriggeredRef = useRef(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHoldProgress(0);
      setIsHolding(false);
      holdStartRef.current = null;
      hasTriggeredRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isOpen]);

  // Animation loop for hold progress
  const updateProgress = useCallback(() => {
    if (holdStartRef.current === null || hasTriggeredRef.current) return;

    const elapsed = Date.now() - holdStartRef.current;
    const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
    setHoldProgress(progress);

    if (progress >= 100 && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setIsHolding(false);
      onConfirm();
    } else if (progress < 100) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [onConfirm]);

  // Start holding
  const handleHoldStart = useCallback(() => {
    if (isDeleting || hasTriggeredRef.current) return;
    setIsHolding(true);
    holdStartRef.current = Date.now();
    animationRef.current = requestAnimationFrame(updateProgress);
  }, [isDeleting, updateProgress]);

  // Stop holding
  const handleHoldEnd = useCallback(() => {
    setIsHolding(false);
    holdStartRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    // Reset progress with animation
    setHoldProgress(0);
  }, []);

  if (!isOpen || !agentName) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 1000 }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md p-6"
        style={{
          background: 'var(--ui-bg1)',
          border: '1px solid var(--ui-control-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          borderRadius: '1px',
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
            disabled={isDeleting || isHolding}
            className="flex-1 px-4 py-3 font-medium transition-colors"
            style={{
              background: 'var(--ui-control-bg)',
              border: '1px solid var(--ui-control-border)',
              color: 'var(--ui-text)',
              borderRadius: '1px',
            }}
          >
            Cancel
          </button>

          {/* Hold-to-delete button */}
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 font-medium transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 relative overflow-hidden select-none"
            style={{
              background: isDeleting ? 'rgb(200, 60, 60)' : 'rgb(239, 68, 68)',
              color: 'white',
              cursor: isDeleting ? 'wait' : 'pointer',
              borderRadius: '1px',
            }}
          >
            {/* Progress fill overlay */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${holdProgress}%`,
                background: 'rgba(0, 0, 0, 0.3)',
                transition: holdProgress === 0 ? 'width 0.2s ease-out' : 'none',
                pointerEvents: 'none',
              }}
            />

            {/* Button content */}
            <div className="relative z-10 flex items-center gap-2">
              {isDeleting ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 size={18} />
                  {isHolding ? 'Hold...' : 'Hold to Delete'}
                </>
              )}
            </div>

            {/* Progress indicator text */}
            {!isDeleting && (
              <span
                className="relative z-10 text-xs opacity-70"
                style={{ fontSize: '10px' }}
              >
                {isHolding
                  ? `${Math.round(holdProgress)}%`
                  : 'Press & hold 1.5s'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
