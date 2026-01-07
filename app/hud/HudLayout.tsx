import React, { ReactNode } from 'react';
import styles from '../styles/layout.module.css';

interface HudLayoutProps {
    children: ReactNode;
    header: ReactNode;
    background: ReactNode;
    className?: string;
    isCompact?: boolean;
    reduceMotion?: boolean;
}

export const HudLayout = ({
    children,
    header,
    background,
    className = "",
    isCompact = false,
    reduceMotion = false,
}: HudLayoutProps) => {
    return (
        <div className={`${styles.root} ${isCompact ? styles.compactMode : ''} ${className}`}>
            {background}
            <div className={styles.hud}>
                {header}
                <main className={styles.dashboard} aria-label="Dashboard">
                    {children}
                </main>
            </div>
        </div>
    );
};
