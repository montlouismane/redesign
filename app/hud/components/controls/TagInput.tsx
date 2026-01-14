'use client';

import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useControlSound } from './useControlSound';
import styles from './controls.module.css';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * TagInput - Multi-value text input with tag chips
 *
 * Features:
 * - Text input for adding new tags
 * - Add tag on Enter or comma
 * - Click X to remove tag
 * - Visual chip display
 *
 * Usage:
 * <TagInput
 *   tags={blacklist}
 *   onChange={(tags) => setBlacklist(tags)}
 *   placeholder="Add token symbol..."
 * />
 */
export function TagInput({
  tags,
  onChange,
  placeholder = 'Add tag...',
  disabled = false,
}: TagInputProps) {
  const { playTick } = useControlSound('toggle');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toUpperCase();

    if (!trimmed) return;
    if (tags.includes(trimmed)) return;

    playTick();
    onChange([...tags, trimmed]);
    setInputValue('');
  };

  const handleRemoveTag = (index: number) => {
    playTick();
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      handleRemoveTag(tags.length - 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    // Split by common delimiters
    const newTags = pastedText
      .split(/[,\s\n]+/)
      .map((tag) => tag.trim().toUpperCase())
      .filter((tag) => tag && !tags.includes(tag));

    if (newTags.length > 0) {
      playTick();
      onChange([...tags, ...newTags]);
    }
  };

  return (
    <div className={styles.tagInput} data-disabled={disabled}>
      <div className={styles.tagInputContainer}>
        {/* Tag chips */}
        {tags.map((tag, index) => (
          <div key={`${tag}-${index}`} className={styles.tagChip}>
            <span className={styles.tagChipLabel}>{tag}</span>
            <button
              className={styles.tagChipRemove}
              onClick={() => handleRemoveTag(index)}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          className={styles.tagInputField}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
