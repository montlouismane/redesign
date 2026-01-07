import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Wallet } from 'lucide-react';
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
    const router = useRouter();

    const navItems = [
        { key: 'dashboard', label: 'Dashboard', onClick: () => setView('dashboard') },
        { key: 'portfolio', label: 'Portfolio', onClick: () => setView('portfolio') },
        { key: 'aiAgents', label: 'AI Agents', onClick: () => router.push('/squad') },
        {
            key: 'aiChat',
            label: 'AI Chat',
            onClick: () => {
                setIsChatDockOpen(false);
                setView('chatFull');
            },
        },
        { key: 'settings', label: 'Settings', onClick: () => setView('settings') },
    ];

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

            <nav className={styles.nav} aria-label="Primary">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`${styles.navLink} ${(view === 'dashboard' && item.key === 'dashboard') ||
                            (view === 'portfolio' && item.key === 'portfolio') ||
                            (view === 'chatFull' && item.key === 'aiChat') ||
                            (view === 'settings' && item.key === 'settings')
                            ? styles.isActive
                            : ''
                            }`}
                        onClick={() => {
                            closeModal();
                            item.onClick?.();
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className={styles.topRight}>
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
            </div>
            <UiStyleToggle className={styles.uiStyleToggle} />
        </header>
    );
};
