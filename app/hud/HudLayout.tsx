import React, { ReactNode } from 'react';
import styles from '../styles/layout.module.css';

interface HudLayoutProps {
    children: ReactNode;
    header: ReactNode;
    background: ReactNode;
    className?: string;
    isCompact?: boolean;
    reduceMotion?: boolean;
    isModalOpen?: boolean;
}

export const HudLayout = ({
    children,
    header,
    background,
    className = "",
    isCompact = false,
    reduceMotion = false,
    isModalOpen = false,
}: HudLayoutProps) => {
    return (
        <div className={`${styles.root} ${isCompact ? styles.compactMode : ''} ${isModalOpen ? styles.scrollLocked : ''} ${className}`}>
            {background}
            <div className={styles.hud}>
                {header}
                <div className={styles.scrollContainer}>
                    <main className={styles.dashboard} aria-label="Dashboard">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};
