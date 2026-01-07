import React from 'react';
import { HudPanel } from '../components/HudPanel';
import PortfolioChart from '../../components/PortfolioChart'; // Assuming moved or imported
import styles from '../../styles/layout.module.css';
import { PortfolioRange } from '../types';

interface PortfolioViewProps {
    equityPoints: any[];
    activeRange: PortfolioRange;
    setActiveRange: (r: PortfolioRange) => void;
    equityIsLive: boolean; // demo vs live
    equitySummary: any;
    formatMoney: (v: number) => string;
    formatPct: (v: number) => string;
    onClose: () => void;
}

export const PortfolioView = ({
    equityPoints,
    activeRange,
    setActiveRange,
    equityIsLive,
    equitySummary,
    formatMoney,
    formatPct,
    onClose
}: PortfolioViewProps) => {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <HudPanel
                title="PORTFOLIO PERFORMANCE"
                variant="glass"
                accentVariant="both"
                isCloseVariant={true}
                onExpandClick={onClose}
                style={{ flex: 1 }}
            >
                <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--text)' }}>
                                {formatMoney(equitySummary.endValue)}
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                                <div style={{
                                    color: equitySummary.changePct >= 0 ? 'var(--ok)' : 'var(--danger)',
                                    fontSize: 14,
                                    fontWeight: 500
                                }}>
                                    {formatPct(equitySummary.changePct)}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                                    {activeRange} CHANGE
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 2 }}>
                            {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveRange(t)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: 12,
                                        background: activeRange === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: activeRange === t ? 'var(--text)' : 'rgba(255,255,255,0.4)',
                                        border: 'none',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        fontWeight: activeRange === t ? 600 : 400
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, minHeight: 0 }}>
                        {/* Assuming PortfolioChart is available and handles sizing */}
                        <PortfolioChart
                            series={equityPoints}
                            range={activeRange}
                            formatMoney={formatMoney}
                            height={500} // Fixed height or auto?
                        />
                    </div>
                </div>
            </HudPanel>
        </div>
    );
};
