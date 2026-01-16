'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateAgentWizard } from './CreateAgentWizard';
import styles from './HudCreateAgentModal.module.css';

interface HudCreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HudCreateAgentModal({
    isOpen,
    onClose,
}: HudCreateAgentModalProps) {
    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.wizardModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.glowEdge} />

                {/* Close Button */}
                <button onClick={onClose} className={styles.closeButton}>
                    <X size={20} />
                </button>

                {/* Wizard Content */}
                <CreateAgentWizard
                    onComplete={onClose}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}
