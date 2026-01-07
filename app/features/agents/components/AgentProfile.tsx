'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Pencil, Check, X } from 'lucide-react';
import type { AgentStatus } from '../types';
import { AGENT_STATUSES } from '../constants';

interface AgentProfileProps {
  name: string;
  avatar: string | null;
  status: AgentStatus;
  createdAt: string;
  onNameChange?: (name: string) => void;
  onAvatarChange?: (avatar: string | null) => void;
  isEditable?: boolean;
  className?: string;
}

export function AgentProfile({
  name,
  avatar,
  status,
  createdAt,
  onNameChange,
  onAvatarChange,
  isEditable = true,
  className = '',
}: AgentProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const statusDef = AGENT_STATUSES[status];

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedName(name);
  }, [name]);

  const handleStartEdit = () => {
    if (!isEditable || !onNameChange) return;
    setEditedName(name);
    setIsEditingName(true);
  };

  const handleSave = () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== name && onNameChange) {
      onNameChange(trimmed);
    }
    setIsEditingName(false);
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      const url = URL.createObjectURL(file);
      onAvatarChange(url);
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Avatar */}
      <div
        className="relative flex-shrink-0 w-16 h-16 rounded-full overflow-hidden group cursor-pointer"
        style={{
          background: 'var(--ui-control-bg)',
          border: '1px solid var(--ui-control-border)',
        }}
        onClick={() => isEditable && onAvatarChange && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User
              size={24}
              style={{ color: 'var(--ui-muted)' }}
            />
          </div>
        )}
        {isEditable && onAvatarChange && (
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60"
            aria-label="Change avatar"
          >
            <Pencil size={16} style={{ color: 'white' }} />
          </div>
        )}
      </div>

      {/* Name and metadata */}
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                maxLength={32}
                className="flex-1 px-2 py-1 text-lg font-semibold rounded"
                style={{
                  background: 'var(--ui-control-bg)',
                  border: '1px solid var(--ui-control-border)',
                  color: 'var(--ui-text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                className="p-1 rounded hover:bg-green-500/20"
                aria-label="Save name"
              >
                <Check size={16} style={{ color: 'rgb(34, 197, 94)' }} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 rounded hover:bg-red-500/20"
                aria-label="Cancel"
              >
                <X size={16} style={{ color: 'rgb(239, 68, 68)' }} />
              </button>
            </div>
          ) : (
            <>
              <h2
                className="text-lg font-semibold truncate"
                style={{ color: 'var(--ui-text)' }}
              >
                {name}
              </h2>
              {isEditable && onNameChange && (
                <button
                  onClick={handleStartEdit}
                  className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--ui-muted)' }}
                  aria-label="Edit name"
                >
                  <Pencil size={14} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Status and created date */}
        <div className="flex items-center gap-3 mt-1">
          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusDef.color }}
            />
            <span
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: statusDef.color }}
            >
              {statusDef.label}
            </span>
          </div>

          {/* Separator */}
          <span
            className="text-xs"
            style={{ color: 'var(--ui-muted)', opacity: 0.5 }}
          >
            |
          </span>

          {/* Created date */}
          <span
            className="text-xs"
            style={{ color: 'var(--ui-muted)' }}
          >
            Created {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
