import React from 'react';
import styles from '../../styles/modal.module.css';
import { HudPanel } from './HudPanel';
import { SHORTCUT_DESCRIPTIONS } from '../../hooks/useKeyboardShortcuts';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ShortcutsModal = ({ isOpen, onClose }: ShortcutsModalProps) => {
    if (!isOpen) return null;

    return (
        <div
            className={`${styles.modalOverlay} ${isOpen ? styles.isOpen : ''}`}
            aria-hidden={!isOpen}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className={styles.modalShell}>
                <HudPanel
                    className={styles.modalPanel}
                    title="KEYBOARD SHORTCUTS"
                    onExpandClick={onClose}
                    accentVariant="none"
                    isCloseVariant={true}
                    variant="glass"
                >
                    <div className={styles.modalBody}>
                        <div className={styles.subPanel}>
                            <div className={styles.subTitle}>SHORTCUTS</div>
                            <div className={styles.subNote}>Press ? to open this panel anytime</div>
                            <div style={{ height: 20 }} />
                            <div className={styles.shortcutsList}>
                                {SHORTCUT_DESCRIPTIONS.map((shortcut, idx) => (
                                    <div key={idx} className={styles.shortcutRow}>
                                        <div className={styles.shortcutKey}>
                                            <kbd className={styles.kbd}>{shortcut.key}</kbd>
                                        </div>
                                        <div className={styles.shortcutAction}>{shortcut.action}</div>
                                        <div className={styles.shortcutContext}>{shortcut.context}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ height: 20 }} />
                            <div className={styles.subNote} style={{ fontSize: '11px', opacity: 0.7 }}>
                                Keyboard shortcuts can be toggled in Settings (S)
                            </div>
                        </div>
                    </div>
                </HudPanel>
            </div>
        </div>
    );
};
