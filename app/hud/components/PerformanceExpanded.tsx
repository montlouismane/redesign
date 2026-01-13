'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, AreaSeries } from 'lightweight-charts';
import { formatUSD, formatPct } from '../utils';
import { useAgentPnL } from '../../hooks/useAgentPnL';
import { AgentPnLFilter } from './AgentPnLFilter';

import { PortfolioRange } from '../types';

interface PerformanceExpandedProps {
    data: { time: number; value: number }[];
    summary: {
        endValue: number;
        changePct: number;
    };
    activeRange: PortfolioRange;
    setActiveRange: (range: PortfolioRange) => void;
}

export const PerformanceExpanded = ({ data, summary, activeRange, setActiveRange }: PerformanceExpandedProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    // Use the agent P&L hook for real data
    const {
        agentsPnL,
        combinedPnL,
        selectedIds,
        selectAgent,
        deselectAgent,
        selectAllAgents,
        clearSelection,
        isLoading,
    } = useAgentPnL({ range: activeRange === 'ALL' ? '30D' : activeRange as any }); // Fallback ALL to 30D for stats if API doesn't support ALL yet

    // Calculate derived stats from combined P&L
    const changeValue = summary.endValue - (summary.endValue / (1 + (summary.changePct / 100)));

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'Orbitron, system-ui, sans-serif',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.03)', visible: true },
                horzLines: { color: 'rgba(255, 255, 255, 0.06)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            rightPriceScale: {
                visible: true,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                scaleMargins: {
                    top: 0.02,
                    bottom: 0.02,
                },
            },
            timeScale: {
                visible: true,
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                rightOffset: 2,
            },
            crosshair: {
                mode: 1, // CrosshairMode.Normal
                vertLine: {
                    color: 'rgba(196, 124, 72, 0.5)',
                    width: 1,
                    style: 0,
                    labelBackgroundColor: 'rgba(196, 124, 72, 0.9)',
                },
                horzLine: {
                    color: 'rgba(196, 124, 72, 0.5)',
                    width: 1,
                    style: 0,
                    labelBackgroundColor: 'rgba(196, 124, 72, 0.9)',
                },
            },
        });

        // Use copper color for selected agents, or muted for none
        const hasSelection = selectedIds.length > 0;
        const lineColor = hasSelection ? 'rgba(196, 124, 72, 0.95)' : 'rgba(100, 100, 100, 0.5)';
        const topColor = hasSelection ? 'rgba(196, 124, 72, 0.3)' : 'rgba(100, 100, 100, 0.1)';

        const newSeries = chart.addSeries(AreaSeries, {
            lineColor,
            topColor,
            bottomColor: 'rgba(0, 0, 0, 0)',
            lineWidth: 2,
        });

        if (data && data.length > 0) {
            newSeries.setData(data.map(d => ({
                time: d.time as any,
                value: d.value
            })));
        }

        chart.timeScale().fitContent();
        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [data, selectedIds.length]);

    return (
        <div className="h-full flex flex-col p-3 md:p-6">
            {/* Header: Agent Filter + Range Selector - Stack on mobile */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-start gap-3 md:gap-0 mb-4 md:mb-6">
                {/* Agent Filter */}
                <AgentPnLFilter
                    agents={agentsPnL}
                    selectedIds={selectedIds}
                    onSelectAgent={selectAgent}
                    onDeselectAgent={deselectAgent}
                    onSelectAll={selectAllAgents}
                    onClearSelection={clearSelection}
                    isLoading={isLoading}
                    className="flex-1 md:mr-6"
                />

                {/* Range Selector */}
                <div className="flex border border-white/10 rounded overflow-hidden bg-black/20 shrink-0 self-start md:self-auto">
                    {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            className={`
                                px-2 md:px-4 py-1.5 md:py-2 text-[10px] md:text-[11px] font-mono tracking-widest min-w-[40px] md:min-w-[50px] transition-all
                                ${activeRange === t
                                    ? 'text-white bg-white/10'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                                }
                            `}
                            onClick={() => setActiveRange(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Combined P&L Stats for Selected Agents - Stack on mobile */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0 mb-4 md:mb-6">
                <div>
                    <div className="text-white/50 text-[10px] md:text-xs tracking-widest mb-2">
                        COMBINED P&L ({combinedPnL.agentCount} AGENT{combinedPnL.agentCount !== 1 ? 'S' : ''})
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        <div>
                            <div className="text-white/40 text-[10px] md:text-xs">24H</div>
                            <div className={`text-base md:text-xl font-mono ${combinedPnL.pnl24h >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                {combinedPnL.pnl24h >= 0 ? '+' : ''}{formatUSD(combinedPnL.pnl24h)}
                            </div>
                        </div>
                        <div>
                            <div className="text-white/40 text-[10px] md:text-xs">7D</div>
                            <div className={`text-base md:text-xl font-mono ${combinedPnL.pnl7d >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                {combinedPnL.pnl7d >= 0 ? '+' : ''}{formatUSD(combinedPnL.pnl7d)}
                            </div>
                        </div>
                        <div>
                            <div className="text-white/40 text-[10px] md:text-xs">TOTAL</div>
                            <div className={`text-base md:text-xl font-mono ${combinedPnL.pnlTotal >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                {combinedPnL.pnlTotal >= 0 ? '+' : ''}{formatUSD(combinedPnL.pnlTotal)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-left md:text-right">
                    <div className="text-white/50 text-[10px] md:text-xs tracking-widest mb-1">TRADES (24H)</div>
                    <div className="text-base md:text-xl font-mono text-white">{combinedPnL.trades24h}</div>
                    <div className="text-[10px] md:text-xs text-white/40">Win Rate: {combinedPnL.winRate}%</div>
                </div>
            </div>

            {/* Main Stats - 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="p-3 md:p-4 bg-white/5 rounded border border-white/10">
                    <div className="text-white/40 text-[10px] md:text-xs mb-1">NET VALUE</div>
                    <div className="text-lg md:text-2xl font-mono text-white">{formatUSD(summary.endValue)}</div>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded border border-white/10">
                    <div className="text-white/40 text-[10px] md:text-xs mb-1">CHANGE ({activeRange})</div>
                    <div className={`text-lg md:text-2xl font-mono ${summary.changePct >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                        {summary.changePct >= 0 ? '+' : ''}{formatPct(summary.changePct)}
                    </div>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded border border-white/10">
                    <div className="text-white/40 text-[10px] md:text-xs mb-1">WIN RATE</div>
                    <div className="text-lg md:text-2xl font-mono text-blue-400">{combinedPnL.winRate}%</div>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded border border-white/10">
                    <div className="text-white/40 text-[10px] md:text-xs mb-1">ACTIVE AGENTS</div>
                    <div className="text-lg md:text-2xl font-mono text-amber-400">{combinedPnL.agentCount}</div>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-[200px] md:min-h-0 bg-white/2 rounded border border-white/10 relative">
                <div ref={chartContainerRef} className="absolute inset-2 md:inset-4" />
                <div className="absolute top-2 md:top-4 left-2 md:left-4 text-[10px] md:text-xs font-mono text-white/20">
                    EQUITY CURVE (USD) — {selectedIds.length === agentsPnL.length ? 'ALL AGENTS' : `${selectedIds.length} SELECTED`}
                </div>
            </div>
        </div>
    );
};
