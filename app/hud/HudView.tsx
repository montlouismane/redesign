'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStyle } from '../UiStyleProvider'; // Import from app root
import { ThreeBackground } from './components/ThreeBackground';
import { VideoBackground } from './components/VideoBackground';
import { HudHeader } from './components/HudHeader';
import { HudLayout } from './HudLayout';
import { HudPanel } from './components/HudPanel';
import { ChatDock } from './components/ChatDock';
import { FloatingChatFab } from './components/FloatingChatFab';
import { ShortcutsModal } from './components/ShortcutsModal';
import { HudAgentManager } from './components/HudAgentManager';
import { PerformanceExpanded } from './components/PerformanceExpanded';
import { FundsExpanded } from './components/FundsExpanded';
import { RefreshCw } from 'lucide-react';
import { HudToggle } from './components/controls';

// Views
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { ChatFullView } from './views/ChatFullView';
import { PortfolioView } from './views/PortfolioView';

// Types & Utils
import { PanelKey, PortfolioRange, HoldingRow, TradeRow } from './types';
import { formatPct, formatUSD } from './utils';

// Hooks
import { useEquitySeries, type PortfolioRange as EquityRange } from '../hooks/useEquitySeries';
import { useKeyboardShortcuts, type ShortcutAction } from '../hooks/useKeyboardShortcuts';

export function HudView() {
    // --- STATE & CORE ---
    const router = useRouter();
    const { style: currentStyle, setStyle: setGlobalStyle } = useUiStyle();

    // View State
    const [view, setView] = useState<'dashboard' | 'portfolio' | 'chatFull' | 'settings'>('dashboard');
    const [activeRange, setActiveRange] = useState<PortfolioRange>('24H');
    const [modalPanel, setModalPanel] = useState<PanelKey | null>(null);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Data State
    const equitySeries = useEquitySeries(activeRange as EquityRange);
    const equityPoints = equitySeries.points;
    const equitySummary = equitySeries.summary;
    const equityIsLive = equitySeries.isLive;

    // Settings State
    const [settings, setSettings] = useState({
        uiStyle: currentStyle,
        displayCurrency: 'USD',
        animationsEnabled: true,
        theme: 'dark',
        notificationsEnabled: true,
        keyboardShortcutsEnabled: true,
        soundEffectsEnabled: false,
        dataDensity: 'comfortable' as 'comfortable' | 'compact',
        realtimePulseEnabled: true,
        reduceMotion: false,
        backgroundType: 'threejs' as 'threejs' | 'video',
    });

    // Settings Persistence
    useEffect(() => {
        const saved = localStorage.getItem('adam_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings(prev => ({ ...prev, ...parsed, uiStyle: currentStyle }));
            } catch (e) { console.error(e); }
        }
    }, [currentStyle]);

    useEffect(() => {
        localStorage.setItem('adam_settings', JSON.stringify(settings));
        if (settings.theme === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }, [settings]);

    useEffect(() => {
        // Simulate loading delay for animation
        setTimeout(() => setIsLoaded(true), 100);
    }, []);

    const updateSetting = (key: keyof typeof settings, value: unknown) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'uiStyle') setGlobalStyle(value as 'classic' | 'hud');
        // Dispatch event for SoundProvider when sound setting changes
        if (key === 'soundEffectsEnabled') {
            window.dispatchEvent(new CustomEvent('soundSettingChanged', {
                detail: { soundEffectsEnabled: value }
            }));
        }
    };

    const formatMoney = useCallback((x: number) => {
        if (settings.displayCurrency === 'token') {
            return (x * 2.5).toFixed(2) + ' ADA'; // Mock
        }
        return formatUSD(x);
    }, [settings.displayCurrency]);

    // Trading State
    const [isTradingActive, setIsTradingActive] = useState(true);

    const handleTradingToggle = useCallback(() => {
        setIsTradingActive(prev => !prev);
    }, []);

    const handleUpdate = useCallback(() => {
        console.log('[HudView] Update triggered - refreshing agent data...');
        // TODO: Trigger agent data refresh when backend is connected
    }, []);

    // Fund Actions
    const handleDeposit = useCallback(() => {
        console.log('[HudView] Deposit triggered');
        // TODO: Open deposit flow when backend is connected
    }, []);

    const handleWithdraw = useCallback(() => {
        console.log('[HudView] Withdraw triggered');
        // TODO: Open withdraw flow when backend is connected
    }, []);

    // Chat State
    const [isChatDockOpen, setIsChatDockOpen] = useState(false);
    const [chatMode, setChatMode] = useState<'auto' | 'fast' | 'thinking'>('auto');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
        { role: 'assistant', text: "Hi - I'm Agent T. How can I help?" },
    ]);

    const chatStarters = [
        'Draft a plan for my new agent',
        'Explain each trading mode',
        "Review my agent's trades from the past week",
    ] as const;

    const sendChatText = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        setChatMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
        setChatInput('');
        window.setTimeout(() => {
            setChatMessages((prev) => [
                ...prev,
                { role: 'assistant', text: chatMode === 'thinking' ? 'Thinking...' : 'Got it.' },
            ]);
        }, 350);
    };

    const sendChat = () => sendChatText(chatInput);
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Mock file upload
        if (e.target.files?.length) {
            sendChatText(`[File uploaded: ${e.target.files[0].name}]`);
            e.target.value = '';
        }
    };

    // Agent State - now managed by HudAgentManager in the render tree

    // Market/Portfolio Data (Mock)
    const holdings = useMemo<HoldingRow[]>(() => [
        { symbol: 'SOL', name: 'Solana', value: '$4,200', changePct: 5.2, color: '#7c3aed' },
        { symbol: 'ADA', name: 'Cardano', value: '$1,840', changePct: -1.4, color: '#2563eb' },
        { symbol: 'SNEK', name: 'Snek', value: '$920', changePct: 12.8, color: '#eab308' },
        { symbol: 'WIF', name: 'Dogwifhat', value: '$410', changePct: -3.2, color: '#7c2d12' },
        { symbol: 'BONK', name: 'Bonk', value: '$220', changePct: 8.4, color: '#ea580c' },
        { symbol: 'ETH', name: 'Ethereum', value: '$140', changePct: 1.1, color: '#4f46e5' },
        { symbol: 'USDC', name: 'USD Coin', value: '$50', changePct: 0.0, color: '#60a5fa' },
        { symbol: 'XRP', name: 'Ripple', value: '$45', changePct: -0.5, color: '#9ca3af' },
        { symbol: 'DOT', name: 'Polkadot', value: '$32', changePct: 2.3, color: '#db2777' },
    ], []);

    const { totalValue, solPct, adaPct, otherPct } = useMemo(() => {
        const total = holdings.reduce((acc, h) => acc + parseFloat(h.value.replace(/[$,]/g, '')), 0);
        const solVal = parseFloat(holdings.find((h) => h.symbol === 'SOL')?.value.replace(/[$,]/g, '') || '0');
        const adaVal = parseFloat(holdings.find((h) => h.symbol === 'ADA')?.value.replace(/[$,]/g, '') || '0');
        const sPct = Math.round((solVal / total) * 100);
        const aPct = Math.round((adaVal / total) * 100);
        const oPct = 100 - sPct - aPct;
        return { totalValue: total, solPct: sPct, adaPct: aPct, otherPct: oPct };
    }, [holdings]);

    const recentTrades = useMemo<TradeRow[]>(() => [
        { type: 'BUY', pair: 'SNEK/ADA', time: '2m' },
        { type: 'SELL', pair: 'SOL/USDC', time: '12m' },
        { type: 'BUY', pair: 'WIF/SOL', time: '45m' },
    ], []);

    const systemStatus = useMemo(() => [
        { label: 'Execution Engine', status: 'ONLINE', tone: 'ok' as const, pulse: true },
        { label: 'Data Feeds', status: '12ms', tone: 'ok' as const, pulse: false },
        { label: 'AI Logic Core', status: 'TRAINING', tone: 'warn' as const, pulse: false },
    ], []);

    // Modals
    const openModal = useCallback((key: PanelKey) => setModalPanel(key), []);
    const closeModal = useCallback(() => setModalPanel(null), []);

    // Shortcuts
    const handleShortcutAction = useCallback((action: ShortcutAction) => {
        switch (action) {
            case 'openShortcuts': setShowShortcutsModal(true); break;
            case 'openSettings': setView('settings'); break;
            case 'closeModal':
                if (showShortcutsModal) setShowShortcutsModal(false);
                else if (modalPanel) closeModal();
                else if (view === 'chatFull') setView('dashboard');
                else if (isChatDockOpen) setIsChatDockOpen(false);
                break;
            case 'expandPortfolio': openModal('agents'); break;
            case 'expandTrades': openModal('trades'); break;
            case 'expandAllocation': openModal('allocation'); break;
            case 'expandMarket': openModal('market'); break;
            case 'switchRange1H': setActiveRange('1H'); break;
            case 'toggleDataDensity': updateSetting('dataDensity', settings.dataDensity === 'comfortable' ? 'compact' : 'comfortable'); break;
        }
    }, [modalPanel, view, isChatDockOpen, showShortcutsModal, settings.dataDensity]);

    useKeyboardShortcuts({
        enabled: settings.keyboardShortcutsEnabled,
        onAction: handleShortcutAction,
    });

    // --- RENDER HELPERS ---
    const isCompact = settings.dataDensity === 'compact';

    return (
        <HudLayout
            className=""
            isCompact={isCompact}
            reduceMotion={settings.reduceMotion}
            header={
                <HudHeader
                    view={view}
                    setView={setView}
                    closeModal={closeModal}
                    setIsChatDockOpen={setIsChatDockOpen}
                    onNotificationsClick={() => { }}
                    onWalletClick={() => { }}
                />
            }
            background={
                settings.backgroundType === 'video' ? (
                    <VideoBackground animationsEnabled={settings.animationsEnabled} />
                ) : (
                    <ThreeBackground
                        animationsEnabled={settings.animationsEnabled}
                        noiseIntensity={0.9}
                        bloomStrength={0.85}
                    />
                )
            }
        >
            {/* Main View Router */}
            {view === 'dashboard' && (
                <HudAgentManager>
                    {({ agents: managedAgents, selectedAgentId: managedSelectedId, selectAgent, openAgentDetail, openCreateModal, toLegacyAgentRow }) => (
                        <DashboardView
                            agentsProps={{
                                agents: managedAgents.map(toLegacyAgentRow),
                                selectedAgentId: managedSelectedId || '',
                                setSelectedAgentId: selectAgent,
                                isLoaded,
                                reduceMotion: settings.reduceMotion,
                                onAgentClick: openAgentDetail,
                                onDeployClick: openCreateModal,
                            }}
                            performanceProps={{
                                activeRange,
                                setActiveRange,
                                equityPoints,
                                equitySummary,
                                equityIsLive,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion,
                                formatMoney
                            }}
                            holdingsProps={{
                                holdings,
                                displayCurrency: settings.displayCurrency,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion
                            }}
                            tradesProps={{
                                recentTrades,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion
                            }}
                            allocationProps={{
                                solPct,
                                adaPct,
                                otherPct,
                                totalValue,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion
                            }}
                            systemProps={{
                                systemStatus,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion,
                                isTradingActive,
                                onTradingToggle: handleTradingToggle,
                                onUpdate: handleUpdate
                            }}
                            fundsProps={{
                                walletAddress: '0x7a3d...8f2e',
                                balance: totalValue * 0.15, // Mock: 15% of portfolio as available
                                onDeposit: handleDeposit,
                                onWithdraw: handleWithdraw,
                                openModal,
                                isLoaded,
                                reduceMotion: settings.reduceMotion,
                                chain: 'cardano' // Default to Cardano for now, can be dynamic later
                            }}
                        />
                    )}
                </HudAgentManager>
            )}

            {view === 'portfolio' && (
                <PortfolioView
                    equityPoints={equityPoints}
                    equitySummary={equitySummary}
                    equityIsLive={equityIsLive}
                    activeRange={activeRange}
                    setActiveRange={setActiveRange}
                    formatMoney={formatMoney}
                    formatPct={formatPct}
                    onClose={() => setView('dashboard')}
                />
            )}

            {view === 'settings' && (
                <SettingsView
                    settings={settings}
                    updateSetting={updateSetting}
                    onClose={() => setView('dashboard')}
                />
            )}

            {view === 'chatFull' && (
                <ChatFullView
                    onClose={() => setView('dashboard')}
                    messages={chatMessages}
                    input={chatInput}
                    setInput={setChatInput}
                    onSend={sendChat}
                    onSuggestionClick={sendChatText}
                    onFileSelect={handleFileSelect}
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    suggestions={chatStarters}
                />
            )}

            {/* Floating Elements (Modals, Dock) */}
            <ShortcutsModal
                isOpen={showShortcutsModal}
                onClose={() => setShowShortcutsModal(false)}
            />

            {/* Expanded Panel Modals */}
            {modalPanel && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-[4%]"
                    onClick={closeModal}
                >
                    <div
                        className={modalPanel === 'system'
                            ? "w-full h-auto relative max-w-[800px]"
                            : "w-full h-full relative max-w-[1400px] max-h-[900px]"
                        }
                        onClick={e => e.stopPropagation()}
                    >
                        {modalPanel === 'agents' && (
                            <HudPanel
                                title="AGENT ROSTER (EXPANDED)"
                                accentVariant="both"
                                shapeVariant="a"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <div className="p-6 h-full flex flex-col items-center justify-center">
                                    <div className="text-2xl text-white/50 mb-2">Agent Management</div>
                                    <div className="text-sm text-white/30">Click on individual agents in the sidebar to view and edit settings</div>
                                </div>
                            </HudPanel>
                        )}

                        {modalPanel === 'market' && (
                            <HudPanel
                                title="HOLDINGS (EXPANDED)"
                                accentVariant="both"
                                shapeVariant="b"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs text-white/40 border-b border-white/10">
                                                <th className="pb-2">ASSET</th>
                                                <th className="pb-2 text-right">VALUE</th>
                                                <th className="pb-2 text-right">CHANGE</th>
                                                <th className="pb-2 text-right">ALLOCATION</th>
                                            </tr>
                                        </thead>
                                        <tbody className="space-y-2">
                                            {holdings.map(h => (
                                                <tr key={h.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: h.color }} />
                                                            <div>
                                                                <div className="font-bold text-white">{h.name}</div>
                                                                <div className="text-xs text-white/50">{h.symbol}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-right font-mono text-white">{h.value}</td>
                                                    <td className={`py-3 text-right font-mono ${h.changePct >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                                        {formatPct(h.changePct)}
                                                    </td>
                                                    <td className="py-3 text-right text-white/60">
                                                        {Math.round((parseFloat(h.value.replace(/[$,]/g, '')) / totalValue) * 100)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </HudPanel>
                        )}

                        {modalPanel === 'trades' && (
                            <HudPanel
                                title="RECENT TRADES (EXPANDED)"
                                accentVariant="both"
                                shapeVariant="a"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-xs text-white/40 border-b border-white/10">
                                                <th className="pb-2">TYPE</th>
                                                <th className="pb-2">PAIR</th>
                                                <th className="pb-2 text-right">TIME</th>
                                                <th className="pb-2 text-right">STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Mock expanded history */}
                                            {recentTrades.concat(recentTrades).concat(recentTrades).map((t, i) => (
                                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className={`py-3 font-bold ${t.type === 'BUY' ? 'text-green-400' : 'text-rose-400'}`}>{t.type}</td>
                                                    <td className="py-3 text-white">{t.pair}</td>
                                                    <td className="py-3 text-right text-white/60">{t.time} ago</td>
                                                    <td className="py-3 text-right text-emerald-400 text-xs">CONFIRMED</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </HudPanel>
                        )}

                        {modalPanel === 'allocation' && (
                            <HudPanel
                                title="ASSET ALLOCATION (EXPANDED)"
                                accentVariant="both"
                                shapeVariant="b"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                                        {/* Visualization Column */}
                                        <div className="lg:col-span-1 flex flex-col gap-6">
                                            <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-white/50 text-xs tracking-widest mb-4">PORTFOLIO DISTRIBUTION</div>
                                                <div className="flex flex-col gap-4">
                                                    {holdings.map(h => (
                                                        <div key={h.symbol} className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-white font-bold">{h.symbol}</span>
                                                                <span className="text-white/60">
                                                                    {Math.round((parseFloat(h.value.replace(/[$,]/g, '')) / totalValue) * 100)}%
                                                                </span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                                                    style={{
                                                                        width: `${(parseFloat(h.value.replace(/[$,]/g, '')) / totalValue) * 100}%`,
                                                                        backgroundColor: h.color
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-lg bg-white/5 border border-white/10 flex-1">
                                                <div className="text-white/50 text-xs tracking-widest mb-4">TOTAL VALUE</div>
                                                <div className="text-4xl font-mono text-white mb-2">{formatUSD(totalValue)}</div>
                                                <div className="flex gap-2 items-center text-green-400 bg-green-400/10 px-3 py-1 rounded inline-flex self-start">
                                                    <span>+8.4%</span>
                                                    <span className="text-xs opacity-70">24H</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Table Column */}
                                        <div className="lg:col-span-2">
                                            <div className="rounded-lg border border-white/10 overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead className="bg-white/5">
                                                        <tr className="text-xs text-white/40 border-b border-white/10">
                                                            <th className="p-4 font-normal tracking-wider">ASSET</th>
                                                            <th className="p-4 text-right font-normal tracking-wider">BALANCE</th>
                                                            <th className="p-4 text-right font-normal tracking-wider">PRICE</th>
                                                            <th className="p-4 text-right font-normal tracking-wider">VALUE</th>
                                                            <th className="p-4 text-right font-normal tracking-wider">ALLOCATION</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {holdings.map(h => {
                                                            const val = parseFloat(h.value.replace(/[$,]/g, ''));
                                                            const pct = (val / totalValue) * 100;
                                                            return (
                                                                <tr key={h.symbol} className="hover:bg-white/5 transition-colors">
                                                                    <td className="p-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-black" style={{ backgroundColor: h.color }}>
                                                                                {h.symbol[0]}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold text-white tracking-wide">{h.name}</div>
                                                                                <div className="text-xs text-white/40">{h.symbol}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-4 text-right text-white font-mono opacity-80">
                                                                        {(val / (h.symbol === 'SOL' ? 145 : h.symbol === 'ADA' ? 0.45 : 1)).toFixed(2)}
                                                                    </td>
                                                                    <td className="p-4 text-right text-white font-mono opacity-60">
                                                                        --
                                                                    </td>
                                                                    <td className="p-4 text-right text-white font-mono font-bold">
                                                                        {h.value}
                                                                    </td>
                                                                    <td className="p-4 text-right">
                                                                        <div className="inline-flex items-center gap-2 justify-end w-full">
                                                                            <span className="font-mono text-white/60">{Math.round(pct)}%</span>
                                                                            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: h.color }} />
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </HudPanel>
                        )}

                        {modalPanel === 'system' && (
                            <HudPanel
                                title="SYSTEM STATUS (EXPANDED)"
                                accentVariant="both"
                                shapeVariant="a"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                            >
                                <div className="p-4 md:p-6 flex flex-col gap-4">
                                    {/* Master Controls Section */}
                                    <div className="p-4 bg-[#c47c48]/10 border border-[#c47c48]/30 rounded">
                                        <div className="text-[10px] md:text-xs text-[#c47c48] uppercase tracking-widest mb-3 font-mono">
                                            MASTER CONTROLS
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="text-sm text-white font-medium mb-1">Trading Status</div>
                                                <div className="text-xs text-white/50">
                                                    {isTradingActive
                                                        ? 'All agents are actively trading'
                                                        : 'All trading is currently paused'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-white/40">PAUSE</span>
                                                <HudToggle
                                                    value={isTradingActive}
                                                    onChange={handleTradingToggle}
                                                    size="medium"
                                                    activeColor="green"
                                                />
                                                <span className="text-xs text-white/40">ACTIVE</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleUpdate}
                                            className="mt-4 w-full py-2 px-4 flex items-center justify-center gap-2
                                                       bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
                                                       rounded text-white/70 hover:text-white text-xs font-mono transition-all"
                                        >
                                            <RefreshCw size={14} />
                                            SYNC ALL AGENTS
                                        </button>
                                    </div>

                                    {/* System Status Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {systemStatus.map(s => (
                                            <div key={s.label} className="p-3 md:p-4 bg-white/5 border border-white/10 flex justify-between items-center rounded">
                                                <div className="text-white text-sm">{s.label}</div>
                                                <div className={`font-mono text-sm ${s.tone === 'ok' ? 'text-green-400' :
                                                    s.tone === 'warn' ? 'text-amber-400' : 'text-rose-400'
                                                    }`}>{s.status}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* System Logs */}
                                    <div className="p-3 md:p-4 bg-white/5 border border-white/10 rounded">
                                        <div className="text-xs text-white/40 mb-2">SYSTEM LOGS</div>
                                        <div className="font-mono text-xs text-green-400/80">
                                            {">"} Init sequence complete<br />
                                            {">"} Connected to Solana RPC<br />
                                            {">"} Connected to Cardano RPC<br />
                                            {">"} Data stream active...
                                        </div>
                                    </div>
                                </div>
                            </HudPanel>
                        )}

                        {modalPanel === 'performance' && (
                            <HudPanel
                                title="PERFORMANCE ANALYSIS"
                                accentVariant="both"
                                shapeVariant="b"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <PerformanceExpanded
                                    data={equityPoints}
                                    summary={equitySummary}
                                    activeRange={activeRange}
                                    setActiveRange={setActiveRange}
                                />
                            </HudPanel>
                        )}

                        {modalPanel === 'funds' && (
                            <HudPanel
                                title="FUND MANAGEMENT"
                                accentVariant="both"
                                shapeVariant="a"
                                variant="glass"
                                isCloseVariant
                                onExpandClick={closeModal}
                                style={{ height: '100%' }}
                            >
                                <FundsExpanded
                                    walletAddress="0x7a3d8f2e9b1c4a5d6e7f8g9h0i1j2k3l4m5n6o7p"
                                    balance={totalValue * 0.15}
                                    onDeposit={handleDeposit}
                                    onWithdraw={handleWithdraw}
                                />
                            </HudPanel>
                        )}
                    </div>
                </div>
            )}

            <ChatDock
                isOpen={isChatDockOpen}
                setIsOpen={setIsChatDockOpen}
                messages={chatMessages}
                input={chatInput}
                setInput={setChatInput}
                onSend={sendChat}
                onSuggestionClick={sendChatText}
                onFileSelect={handleFileSelect}
                chatMode={chatMode}
                setChatMode={setChatMode}
                onExpand={() => { setIsChatDockOpen(false); setView('chatFull'); }}
                suggestions={chatStarters}
                startPosition={{ x: 0, y: 0 }}
            />

            {!isChatDockOpen && view !== 'chatFull' && (
                <FloatingChatFab onClick={() => setIsChatDockOpen(true)} />
            )}

        </HudLayout>
    );
}
