import React from 'react';
import styles from '../../styles/panel.module.css';

interface HudPanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    onDoubleClick?: () => void;
    onExpandClick?: () => void;
    "aria-label"?: string;
    accentVariant?: 'both' | 'horizontal' | 'vertical' | 'none';
    shapeVariant?: 'a' | 'b';
    isCloseVariant?: boolean;
    variant?: 'default' | 'glass';
    disableBodyClick?: boolean;
    style?: React.CSSProperties;
}

export const HudPanel = ({
    children,
    className = "",
    title,
    onDoubleClick,
    onExpandClick,
    "aria-label": ariaLabel,
    accentVariant = 'both',
    shapeVariant = 'a',
    isCloseVariant = false,
    variant = 'default',
    disableBodyClick = false,
    style
}: HudPanelProps) => {
    const shapeClass = shapeVariant === 'b' ? styles.shapeB : styles.shapeA;
    const variantClass = variant === 'glass' ? styles.panelGlass : '';

    return (
        <section
            className={`${styles.panel} ${shapeClass} ${variantClass} ${className}`}
            style={style}
            onClick={() => {
                if (!isCloseVariant && !disableBodyClick) {
                    onExpandClick?.();
                }
            }}
            onDoubleClick={onDoubleClick}
            aria-label={ariaLabel}
        >
            {/* Frame Decorations */}
            <div className={styles.panelFrame}>
                <div className={styles.frameLines} />
                <div className={styles.frameAccents}>
                    {/* Corner Accents - Always visible for HUD feel */}
                    <div className={`${styles.accent} ${styles.accentTL}`} />
                    <div className={`${styles.accent} ${styles.accentTR}`} />
                    <div className={`${styles.accent} ${styles.accentBL}`} />
                    <div className={`${styles.accent} ${styles.accentBR}`} />

                    {/* Edge Middle Accents - Alternated based on variant */}
                    {(accentVariant === 'both' || accentVariant === 'horizontal') && (
                        <>
                            <div className={`${styles.accent} ${styles.accentTM}`} />
                            <div className={`${styles.accent} ${styles.accentBM}`} />
                        </>
                    )}
                    {(accentVariant === 'both' || accentVariant === 'vertical') && (
                        <>
                            <div className={`${styles.accent} ${styles.accentLM}`} />
                            <div className={`${styles.accent} ${styles.accentRM}`} />
                        </>
                    )}
                </div>

                {onExpandClick && (
                    <button
                        type="button"
                        className={`${styles.plusDetail} ${isCloseVariant ? styles.isCloseVariant : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpandClick();
                        }}
                        aria-label={isCloseVariant ? "Close Panel" : "Expand Panel"}
                    >
                        <span className={styles.plusItem}>+</span>
                        <span className={styles.plusItem}>+</span>
                        <span className={styles.plusItem}>+</span>
                    </button>
                )}

                <div className={styles.panelInnerGlow} />
            </div>

            <div className={styles.panelContent}>
                {title && (
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>{title}</div>
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};
