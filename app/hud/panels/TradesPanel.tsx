import React from 'react';
import styles from '../../styles/trades.module.css';
import { HudPanel } from '../components/HudPanel';
import { ScrollHintArea } from '../../ScrollHintArea';
import { PanelKey, TradeRow } from '../types';
import { PANEL_TITLES } from '../constants';

export interface TradesPanelProps {
    recentTrades: TradeRow[];
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
}

export const TradesPanel = ({
    recentTrades,
    openModal,
    isLoaded,
    reduceMotion = false
}: TradesPanelProps) => {
    return (
        <HudPanel
            style={{
                animationDelay: reduceMotion ? '0ms' : '300ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.trades}
            aria-label="Recent trades"
            onDoubleClick={() => openModal('trades')}
            onExpandClick={() => openModal('trades')}
            accentVariant="vertical"
            shapeVariant="b"
            disableBodyClick={true}
        >
            <ScrollHintArea className="flex-1">
                <div className={styles.tradeTable}>
                    <div className={styles.tradeHead}>
                        <div>TYPE</div>
                        <div>PAIR</div>
                        <div>TIME</div>
                    </div>
                    <div className={styles.tradeBody}>
                        {recentTrades.map((t, idx) => (
                            <div key={idx} className={styles.tradeRow}>
                                <div>
                                    <span className={`${styles.tradeType} ${t.type === 'BUY' ? styles.tradeBuy : styles.tradeSell}`}>{t.type}</span>
                                </div>
                                <div className={styles.mono}>{t.pair}</div>
                                <div className={`${styles.mono} ${styles.muted}`}>{t.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollHintArea>
        </HudPanel>
    );
};
