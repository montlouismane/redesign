import React from 'react';
import styles from '../../styles/agents.module.css';
import { HudPanel } from '../components/HudPanel';
import { ScrollHintArea } from '../../ScrollHintArea';
import { AgentRow, PanelKey } from '../types';
import { formatPct } from '../utils';
import { PANEL_TITLES } from '../constants';

export interface AgentsPanelProps {
    agents: AgentRow[];
    selectedAgentId: string;
    setSelectedAgentId: (id: string) => void;
    openModal: (key: PanelKey) => void;
    isLoaded: boolean;
    reduceMotion?: boolean;
    /** Called when clicking an agent to open settings detail */
    onAgentClick?: (id: string) => void;
    /** Called when clicking Deploy New Agent button */
    onDeployClick?: () => void;
}

export const AgentsPanel = ({
    agents,
    selectedAgentId,
    setSelectedAgentId,
    openModal,
    isLoaded,
    reduceMotion = false,
    onAgentClick,
    onDeployClick,
}: AgentsPanelProps) => {
    return (
        <HudPanel
            className={`${styles.panelAgents} ${isLoaded ? styles.panelLoaded : ''}`}
            style={{
                animationDelay: reduceMotion ? '0ms' : '0ms',
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
                transition: reduceMotion ? 'none' : 'opacity 0.4s ease-out, transform 0.4s ease-out'
            }}
            title={PANEL_TITLES.agents}
            aria-label="Agent Roster"
            onDoubleClick={() => openModal('agents')}
            onExpandClick={() => openModal('agents')}
            accentVariant="vertical"
            shapeVariant="a"
            disableBodyClick={true}
        >
            <div className={styles.agentsTop}>
                <div className={styles.muted} style={{ letterSpacing: '.12em', fontSize: 11, marginLeft: 12, marginRight: 12 }}>
                    Active agents
                </div>
            </div>

            <ScrollHintArea className="flex-1">
                <div className={styles.agentList}>
                    {agents.map((a) => {
                        const isActive = a.id === selectedAgentId;
                        const dotTone =
                            a.runtimeState === 'running'
                                ? styles.dotRunning
                                : a.runtimeState === 'idle'
                                    ? styles.dotIdle
                                    : a.runtimeState === 'alert'
                                        ? styles.dotAlert
                                        : styles.dotStopped;
                        const pnlTone = a.pnlPct > 0 ? styles.pos : styles.neg;
                        return (
                            <React.Fragment key={a.id}>
                                <div
                                    className={`${styles.agentItem} ${isActive ? styles.isActive : ''}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedAgentId(a.id);
                                        if (onAgentClick) onAgentClick(a.id);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setSelectedAgentId(a.id);
                                        }
                                    }}
                                >
                                    <div className={styles.agentIcon}>{a.chip}</div>
                                    <div>
                                        <div className={styles.agentName}>
                                            <span className={`${styles.dot} ${dotTone}`} aria-hidden="true" />
                                            {a.name}
                                        </div>
                                        <div className={styles.agentSub}>
                                            {a.role} · {a.chain}
                                        </div>
                                    </div>
                                    <div className={styles.agentRight}>
                                        <div className={`${styles.agentPnl} ${pnlTone}`}>{formatPct(a.pnlPct)}</div>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    <button
                        type="button"
                        className={styles.deployBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDeployClick) onDeployClick();
                        }}
                    >
                        Deploy New Agent
                    </button>
                </div>
            </ScrollHintArea>
        </HudPanel>
    );
};
