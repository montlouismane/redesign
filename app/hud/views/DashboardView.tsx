import React from 'react';
import styles from '../../styles/layout.module.css';
import { AgentsPanel, AgentsPanelProps } from '../panels/AgentsPanel';
import { PerformancePanel, PerformancePanelProps } from '../panels/PerformancePanel';
import { PortfolioBento } from '../panels/PortfolioBento';
import { HoldingsPanelProps } from '../panels/HoldingsPanel';
import { TradesPanel, TradesPanelProps } from '../panels/TradesPanel';
import { AllocationPanelProps } from '../panels/AllocationPanel';
import { SystemPanel } from '../panels/SystemPanel';
import { FundsPanel } from '../panels/FundsPanel';
import { FundsPanelProps, SystemPanelProps } from '../types';

interface DashboardViewProps {
    agentsProps: AgentsPanelProps;
    performanceProps: PerformancePanelProps;
    holdingsProps: HoldingsPanelProps;
    tradesProps: TradesPanelProps;
    allocationProps: AllocationPanelProps;
    systemProps: SystemPanelProps;
    fundsProps: FundsPanelProps;
    /** When true, panels fade out to show only the background */
    isOverlayActive?: boolean;
}

export const DashboardView = ({
    agentsProps,
    performanceProps,
    holdingsProps,
    tradesProps,
    allocationProps,
    systemProps,
    fundsProps,
    isOverlayActive = false
}: DashboardViewProps) => {
    // Container class for fade animation
    const containerClass = isOverlayActive
        ? `${styles.dashboardPanels} ${styles.hidden}`
        : styles.dashboardPanels;

    return (
        <div className={containerClass}>
            <AgentsPanel {...agentsProps} />
            <PerformancePanel {...performanceProps} />

            {/* Merged Portfolio Bento (Replaces Market/Holdings) */}
            <PortfolioBento
                holdings={holdingsProps.holdings}
                totalValue={allocationProps.totalValue}
                solPct={allocationProps.solPct}
                adaPct={allocationProps.adaPct}
                otherPct={allocationProps.otherPct}
                openModal={holdingsProps.openModal}
                isLoaded={holdingsProps.isLoaded}
                reduceMotion={holdingsProps.reduceMotion}
            />

            <div className={styles.bottomWrap}>
                <TradesPanel {...tradesProps} />
                <FundsPanel {...fundsProps} />
            </div>

            <SystemPanel {...systemProps} />
        </div>
    );
};
