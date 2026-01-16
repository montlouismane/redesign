import React from 'react';
import styles from '../../styles/system.module.css';
import { HudPanel } from '../components/HudPanel';
import { RefreshCw } from 'lucide-react';
import { SystemPanelProps } from '../types';
import { PANEL_TITLES } from '../constants';
import { ScrollHintArea } from '../../ScrollHintArea';
import { HudToggle } from '../components/controls';

export const SystemPanel = ({
    systemStatus,
    openModal,
    isLoaded,
    reduceMotion = false,
    isTradingActive,
    onTradingToggle,
    onUpdate
}: SystemPanelProps) => {
    return (
        <HudPanel
            className={styles.panelSystem}
            style={{
                animationDelay: reduceMotion ? '0ms' : '500ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.system}
            aria-label="System status"
            onDoubleClick={() => openModal('system')}
            onExpandClick={() => openModal('system')}
            accentVariant="vertical"
            shapeVariant="a"
            disableBodyClick={true}
        >
            {/* Master Controls - All Agents */}
            <div className="flex flex-col px-3 py-2 mb-2 border-b border-white/10 gap-2">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                    {/* Left side: Status + Label */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2.5 h-2.5 rounded-full ${isTradingActive ? 'bg-[#35ff9b]' : 'bg-[#f59e0b]'
                                } ${isTradingActive && !reduceMotion ? 'animate-pulse' : ''}`}
                        />
                        <span className="text-[10px] text-white/60 uppercase tracking-widest font-mono">
                            {isTradingActive ? 'ALL AGENTS ACTIVE' : 'ALL AGENTS PAUSED'}
                        </span>
                    </div>

                    {/* Right side: Update button + Toggle */}
                    <div className="flex items-center gap-2">
                        {/* Sync All Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdate(); }}
                            className="p-1.5 rounded text-white/40 hover:text-[#c47c48] hover:bg-[#c47c48]/10
                                       border border-transparent hover:border-[#c47c48]/30 transition-all"
                            title="Sync All Agent Status"
                            aria-label="Sync All Agent Status"
                        >
                            <RefreshCw size={14} />
                        </button>

                        {/* Master Trading Toggle */}
                        <div onClick={(e) => e.stopPropagation()}>
                            <HudToggle
                                value={isTradingActive}
                                onChange={onTradingToggle}
                                size="small"
                                activeColor="green"
                            />
                        </div>
                    </div>
                </div>

                {/* Clarifying label */}
                <div className="text-[9px] text-white/30 font-mono tracking-wide">
                    Toggle controls all deployed agents
                </div>
            </div>

            {/* System Status List */}
            <ScrollHintArea className={styles.sysList}>
                {systemStatus.map((s, idx) => (
                    <div key={idx} className={styles.sysRow}>
                        <div className={`${styles.sysDot} ${styles[s.tone]} ${s.pulse && !reduceMotion ? styles.pulse : ''}`} />
                        <div className={`${styles.sysName} ${styles.mono}`}>{s.label}</div>
                        <div className={`${styles.mono} ${styles[s.tone]}`} style={{ fontSize: 11, fontWeight: 700 }}>
                            {s.status}
                        </div>
                    </div>
                ))}
            </ScrollHintArea>
        </HudPanel>
    );
};
