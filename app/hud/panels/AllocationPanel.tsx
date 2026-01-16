import { useMemo } from 'react';
import styles from '../../styles/allocation.module.css';
import { HudPanel } from '../components/HudPanel';
import DynamicAllocationChart, { ChartItem } from '../../components/DynamicAllocationChart';
import { PanelKey } from '../types';
import { PANEL_TITLES } from '../constants';

export interface AllocationPanelProps {
    solPct: number;
    adaPct: number;
    otherPct: number;
    totalValue: number;
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
}

export const AllocationPanel = ({
    solPct,
    adaPct,
    otherPct,
    // totalValue is available for future use (e.g., showing total in legend)
    openModal,
    isLoaded,
    reduceMotion = false
}: AllocationPanelProps) => {
    // Convert percentages to ChartItem array format
    const chartData = useMemo<ChartItem[]>(() => [
        { id: 'sol', label: 'SOL', value: solPct, color: 'rgba(203, 161, 53, .95)' },
        { id: 'ada', label: 'ADA', value: adaPct, color: 'rgba(45, 212, 191, .92)' },
        { id: 'other', label: 'Other', value: otherPct, color: 'rgba(42, 48, 60, .92)' },
    ], [solPct, adaPct, otherPct]);

    return (
        <HudPanel
            style={{
                animationDelay: reduceMotion ? '0ms' : '400ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.allocation}
            aria-label="Asset allocation"
            onDoubleClick={() => openModal('allocation')}
            onExpandClick={() => openModal('allocation')}
            accentVariant="horizontal"
            shapeVariant="b"
            disableBodyClick={true}
        >
            <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
                <div className={styles.allocWrap}>
                    <DynamicAllocationChart
                        data={chartData}
                        size="medium"
                    />
                    <div className={styles.legend}>
                        {chartData.map((item) => (
                            <div key={item.id} className={styles.legendItem}>
                                <div className={styles.liLeft}>
                                    <span className={styles.swatch} style={{ background: item.color }} />
                                    <span className={styles.mono}>{item.label}</span>
                                </div>
                                <div className={`${styles.liRight} ${styles.mono}`}>{item.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </HudPanel>
    );
};
