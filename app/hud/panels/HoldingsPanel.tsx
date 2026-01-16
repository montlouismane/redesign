import React from 'react';
import styles from '../../styles/holdings.module.css';
import { HudPanel } from '../components/HudPanel';
import { ScrollHintArea } from '../../ScrollHintArea';
import { PanelKey, HoldingRow } from '../types';
import { formatPct } from '../utils';
import { PANEL_TITLES } from '../constants';

export interface HoldingsPanelProps {
    holdings: HoldingRow[];
    displayCurrency: string;
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
}

export const HoldingsPanel = ({
    holdings,
    displayCurrency,
    openModal,
    isLoaded,
    reduceMotion = false
}: HoldingsPanelProps) => {
    return (
        <HudPanel
            className={styles.panelMarket}
            style={{
                animationDelay: reduceMotion ? '0ms' : '200ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.market}
            aria-label="Holdings"
            onDoubleClick={() => openModal('market')}
            onExpandClick={() => openModal('market')}
            accentVariant="vertical"
            shapeVariant="a"
            disableBodyClick={true}
        >
            <ScrollHintArea className="flex-1">
                <div className={styles.marketList}>
                    {holdings.map((h) => (
                        <div key={h.symbol} className={styles.marketCard} style={{ flexShrink: 0 }}>
                            <div className={styles.mLeft}>
                                <div className={styles.mTicker}>{h.symbol}</div>
                                <div className={`${styles.mSub} ${styles.mono}`}>{h.name}</div>
                            </div>
                            <div className={styles.mRight}>
                                <div className={`${styles.mPrice} ${styles.mono}`}>
                                    {displayCurrency === 'token'
                                        ? (parseFloat(h.value.replace(/[$,]/g, '')) * 2.5).toFixed(2) + ' ' + h.symbol
                                        : h.value
                                    }
                                </div>
                                <div className={`${styles.mChg} ${h.changePct >= 0 ? styles.pos : styles.neg}`}>
                                    {formatPct(h.changePct)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollHintArea>
        </HudPanel>
    );
};
