'use client';

import React, { useMemo } from 'react';
import { HudPanel } from '../components/HudPanel';
import DynamicAllocationChart, { ChartItem } from '../../components/DynamicAllocationChart';
import { ScrollHintArea } from '../../ScrollHintArea';
import { PanelKey, HoldingRow } from '../types';
import { formatPct, formatUSD } from '../utils';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface PortfolioBentoProps {
    holdings: HoldingRow[];
    totalValue: number;
    solPct: number;
    adaPct: number;
    otherPct: number;
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
}

export const PortfolioBento = ({
    holdings,
    totalValue,
    solPct,
    adaPct,
    otherPct,
    openModal,
    isLoaded,
    reduceMotion = false
}: PortfolioBentoProps) => {
    // Calculate P&L (mock logic reusing existing data)
    const pnl24h = totalValue * 0.084; // +8.4% from HudView mock
    const pnlPct = 8.4;
    const isPositive = pnlPct >= 0;

    // Hover State for interaction between List and Chart
    const [hoveredAsset, setHoveredAsset] = React.useState<string | null>(null);

    // Prepare Chart Data from Holdings
    const chartData = useMemo<ChartItem[]>(() => {
        // Take top 5 holdings
        const topHoldings = holdings.slice(0, 5);

        // Calculate remaining percentage
        const topValue = topHoldings.reduce((acc, h) => acc + parseFloat(h.value.replace(/[$,]/g, '')), 0);
        const remainingValue = Math.max(0, totalValue - topValue);

        const items: ChartItem[] = topHoldings.map(h => ({
            id: h.symbol, // Use symbol as ID
            label: h.symbol,
            value: Math.round((parseFloat(h.value.replace(/[$,]/g, '')) / totalValue) * 100),
            color: h.color
        }));

        // If significant remaining value, add "Other" category ?? 
        // User requested "each token", but typically we can't show infinite.
        // Existing behavior showed "Other". If we want strict "each token" for the list provided, we just map them.
        // If the list is long, we might need grouping. 
        // Given only 5-9 items usually in mock, let's just map the top 5 effectively.
        // If there's extra, strict math might show a gap or we can normalize.
        // Let's normalize the top 5 to 100% OR just show them as is (gap implied).
        // Since DynamicAllocationChart handles partial arcs, showing actual % is better transparency.

        return items;
    }, [holdings, totalValue]);

    return (
        <HudPanel
            title="PORTFOLIO OVERVIEW"
            accentVariant="both"
            shapeVariant="b"
            isCloseVariant={false}
            onExpandClick={() => openModal('allocation')} // Using allocation modal for deep dive
            onDoubleClick={() => openModal('allocation')}
            style={{
                animationDelay: reduceMotion ? '0ms' : '200ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div className="flex flex-col h-full p-4 gap-4">
                {/* Top Section: Big Numbers + Chart */}
                <div className="flex justify-between items-start min-h-[140px]">
                    <div className="flex flex-col justify-between h-full py-1">
                        <div>
                            <div className="text-white/40 text-[10px] tracking-widest font-mono mb-1 uppercase flex items-center gap-1">
                                <Wallet className="w-3 h-3" /> Net Worth
                            </div>
                            <div className="text-3xl font-mono text-white tracking-tight">
                                {formatUSD(totalValue)}
                            </div>
                        </div>

                        <div>
                            <div className="text-white/40 text-[10px] tracking-widest font-mono mb-1 uppercase">24h Change</div>
                            <div className={`flex items-center gap-1 font-mono ${isPositive ? 'text-green-400' : 'text-rose-400'}`}>
                                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span className="text-lg">{isPositive ? '+' : ''}{formatUSD(pnl24h)}</span>
                                <span className="text-sm opacity-70 ml-1">({pnlPct}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Compact Chart */}
                    <div className="relative group">
                        <DynamicAllocationChart
                            data={chartData}
                            size="medium" // Reuse existing size
                            className="scale-90 origin-top-right transform"
                            externalHover={hoveredAsset}
                            onHover={setHoveredAsset}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5 w-full shrink-0" />

                {/* Bottom Section: Holdings List */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex justify-between items-end mb-2 shrink-0">
                        <div className="text-white/40 text-[10px] tracking-widest font-mono uppercase">Top Assets</div>
                        <button
                            onClick={(e) => { e.stopPropagation(); openModal('market'); }}
                            className="text-[10px] text-white/40 hover:text-[#cb9b4a] transition-colors uppercase font-mono tracking-widest"
                        >
                            View All
                        </button>
                    </div>

                    <ScrollHintArea className="flex-1 -mx-2 px-2">
                        <div className="flex flex-col gap-1 pb-2">
                            {holdings.slice(0, 5).map(h => {
                                const isHovered = hoveredAsset === h.symbol;

                                return (
                                    <div
                                        key={h.symbol}
                                        className={`flex items-center justify-between p-2 rounded transition-all cursor-pointer border border-transparent
                                            ${isHovered ? 'bg-white/10 border-white/10' : 'hover:bg-white/5 hover:border-white/5'}
                                        `}
                                        onClick={() => openModal('market')}
                                        onMouseEnter={() => setHoveredAsset(h.symbol)}
                                        onMouseLeave={() => setHoveredAsset(null)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 rounded-full opacity-60 transition-opacity" style={{
                                                backgroundColor: h.color,
                                                opacity: isHovered ? 1 : 0.6
                                            }} />
                                            <div>
                                                <div className="text-white text-sm font-medium leading-none mb-1 transition-transform" style={{
                                                    transform: isHovered ? 'translateX(2px)' : 'none'
                                                }}>{h.name}</div>
                                                <div className="text-white/30 text-[10px] uppercase font-mono">{h.symbol}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white text-sm font-mono leading-none mb-1">{h.value}</div>
                                            <div className={`text-[10px] font-mono ${h.changePct >= 0 ? 'text-green-400/80' : 'text-rose-400/80'}`}>
                                                {h.changePct > 0 ? '+' : ''}{formatPct(h.changePct)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollHintArea>
                </div>
            </div>
        </HudPanel>
    );
};
