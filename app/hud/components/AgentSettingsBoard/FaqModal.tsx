'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { FAQS, FaqCategory, FaqSection } from '../../constants/faqs';
import styles from './FaqModal.module.css';

export interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: FaqCategory;
}

/**
 * FAQ Modal Component
 *
 * Displays mode-specific FAQs in a collapsible format
 * Styled to match HUD aesthetic with glass morphism and copper accents
 */
export function FaqModal({ isOpen, onClose, mode }: FaqModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = FAQS[mode] || [];
  const modeTitle = getModeTitle(mode);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Edge lines */}
        <span className={`${styles.edgeLine} ${styles.edgeTop}`} />
        <span className={`${styles.edgeLine} ${styles.edgeRight}`} />
        <span className={`${styles.edgeLine} ${styles.edgeBottom}`} />
        <span className={`${styles.edgeLine} ${styles.edgeLeft}`} />
        {/* Corner outlines */}
        <span className={`${styles.cornerLine} ${styles.cornerTL}`} />
        <span className={`${styles.cornerLine} ${styles.cornerTR}`} />
        <span className={`${styles.cornerLine} ${styles.cornerBL}`} />
        <span className={`${styles.cornerLine} ${styles.cornerBR}`} />
        {/* Glow edge */}
        <div className={styles.glowEdge} />

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <HelpCircle size={18} />
            {modeTitle} FAQ
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close FAQ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {faqs.length === 0 ? (
            <div className={styles.emptyState}>
              No FAQs available for this mode.
            </div>
          ) : (
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <FaqItem
                  key={index}
                  faq={faq}
                  isExpanded={expandedIndex === index}
                  onToggle={() => toggleExpanded(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerText}>
            {faqs.length} question{faqs.length !== 1 ? 's' : ''}
          </span>
          <button className={styles.closeButtonSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface FaqItemProps {
  faq: FaqSection;
  isExpanded: boolean;
  onToggle: () => void;
}

function FaqItem({ faq, isExpanded, onToggle }: FaqItemProps) {
  return (
    <div className={`${styles.faqItem} ${isExpanded ? styles.expanded : ''}`}>
      <button className={styles.faqHeader} onClick={onToggle}>
        <span className={styles.faqTitle}>{faq.title}</span>
        <span className={styles.chevron}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>
      {isExpanded && (
        <div className={styles.faqBody}>
          <FaqContent content={faq.body} />
        </div>
      )}
    </div>
  );
}

interface FaqContentProps {
  content: string;
}

/**
 * Renders FAQ content with basic markdown-like formatting
 * Supports: bullet lists, bold text, headers, blockquotes
 */
function FaqContent({ content }: FaqContentProps) {
  const lines = content.split('\n');

  return (
    <div className={styles.faqContentWrapper}>
      {lines.map((line, i) => {
        // Empty line
        if (line.trim() === '') {
          return <div key={i} className={styles.spacer} />;
        }

        // Blockquote
        if (line.startsWith('>')) {
          return (
            <blockquote key={i} className={styles.blockquote}>
              {formatInlineText(line.slice(1).trim())}
            </blockquote>
          );
        }

        // Bullet point
        if (line.startsWith('- ')) {
          return (
            <div key={i} className={styles.bulletItem}>
              <span className={styles.bullet}>•</span>
              <span>{formatInlineText(line.slice(2))}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={i} className={styles.paragraph}>
            {formatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Format inline text (bold, code)
 */
function formatInlineText(text: string): React.ReactNode {
  // Simple bold text replacement: **text** -> <strong>text</strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

/**
 * Get display title for mode
 */
function getModeTitle(mode: FaqCategory): string {
  const titles: Record<FaqCategory, string> = {
    standard: 'Standard Mode',
    't-mode': 'T-Mode',
    arbitrage: 'Arbitrage',
    perpetuals: 'Perpetuals',
    prediction: 'Prediction',
  };
  return titles[mode] || mode;
}

export default FaqModal;
