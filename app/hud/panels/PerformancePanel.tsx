import React from 'react';
import styles from '../../styles/performance.module.css';
import { HudPanel } from '../components/HudPanel';
import PortfolioChart from '../../components/PortfolioChart';
import { PanelKey, PortfolioRange, PortfolioSeriesPoint } from '../types';
import { formatPct, formatUSD } from '../utils';
import { PANEL_TITLES } from '../constants';

export interface PerformancePanelProps {
    activeRange: PortfolioRange;
    setActiveRange: (range: PortfolioRange) => void;
    equityPoints: PortfolioSeriesPoint[];
    equitySummary: { endValue: number; changePct: number };
    equityIsLive: boolean;
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
    formatMoney: (v: number) => string;
}

export const PerformancePanel = ({
    activeRange,
    setActiveRange,
    equityPoints,
    equitySummary,
    equityIsLive,
    openModal,
    isLoaded,
    reduceMotion = false,
    formatMoney
}: PerformancePanelProps) => {
    return (
        <HudPanel
            className={styles.panelPerformance}
            style={{
                animationDelay: reduceMotion ? '0ms' : '100ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.performance}
            aria-label="Portfolio performance"
            onDoubleClick={() => openModal('performance')}
            onExpandClick={() => openModal('performance')}
            accentVariant="horizontal"
            shapeVariant="a"
            disableBodyClick={true}
        >
            <div className={styles.perfTop}>
                <div className={styles.seg} role="tablist" aria-label="Performance range">
                    {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`${styles.segBtn} ${activeRange === t ? styles.isOn : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveRange(t as PortfolioRange);
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className={styles.muted} style={{ fontSize: 11, letterSpacing: '.12em' }}>
                    HOVER FOR VALUES · <span style={{ color: equityIsLive ? 'var(--ok)' : 'var(--warning)' }}>{equityIsLive ? 'LIVE' : 'DEMO'}</span>
                </div>
            </div>

            <PortfolioChart
                series={equityPoints}
                range={activeRange}
                formatMoney={formatMoney}
            />

            <div className={styles.kpis}>
                <div className={styles.kpi}>
                    <div className={styles.kpiKey}>CURRENT</div>
                    <div className={styles.kpiVal}>{formatMoney(equitySummary.endValue)}</div>
                </div>
                <div className={styles.kpi}>
                    <div className={styles.kpiKey}>CHANGE ({activeRange})</div>
                    <div className={`${styles.kpiVal} ${equitySummary.changePct >= 0 ? styles.pos : styles.neg}`}>
                        {formatPct(equitySummary.changePct)}
                    </div>
                </div>
                <div className={styles.kpi}>
                    <div className={styles.kpiKey}>MODE</div>
                    <div className={styles.kpiVal} style={{ color: equityIsLive ? 'var(--ok)' : 'var(--warning)' }}>{equityIsLive ? 'LIVE' : 'DEMO'}</div>
                </div>
            </div>
        </HudPanel>
    );
};
