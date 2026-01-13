import React from 'react';
import { Bell, Wallet, Settings } from 'lucide-react';
import { UiStyleToggle } from '../../UiStyleToggle';
import { useUiStyle } from '../../UiStyleProvider';
import styles from '../../styles/header.module.css';

interface HudHeaderProps {
    view: string;
    setView: (view: any) => void;
    closeModal: () => void;
    setIsChatDockOpen: (isOpen: boolean) => void;
    onWalletClick?: () => void;
    onNotificationsClick?: () => void;
}

export const HudHeader = ({
    view,
    setView,
    closeModal,
    setIsChatDockOpen,
    onWalletClick,
    onNotificationsClick
}: HudHeaderProps) => {
    return (
        <header className={styles.topbar}>
            <button
                type="button"
                className={styles.brandButton}
                onClick={() => {
                    closeModal();
                    setIsChatDockOpen(false);
                    setView('dashboard');
                }}
                aria-label="Go to Dashboard"
            >
                <img src="/brand/adam-classic-logo.svg" alt="ADAM" className={styles.brandLogo} draggable={false} />
            </button>

            <div className={styles.topRight}>
                <button
                    type="button"
                    className={`${styles.iconBtn} ${view === 'settings' ? styles.isActive : ''}`}
                    aria-label="Settings"
                    onClick={() => {
                        closeModal();
                        setView('settings');
                    }}
                >
                    <Settings size={18} />
                </button>

                <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label="Notifications"
                    onClick={onNotificationsClick}
                >
                    <Bell size={18} />
                </button>

                <button
                    type="button"
                    className={styles.walletBtn}
                    onClick={onWalletClick}
                >
                    <Wallet size={18} className={styles.walletIcon} />
                    <span className={styles.walletAddr}>0x...8a22</span>
                </button>

                <UiStyleToggle className={styles.uiStyleToggle} />
            </div>
        </header>
    );
};
