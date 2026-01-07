/**
 * Agent Settings Board - Usage Example
 *
 * This file demonstrates how to integrate the AgentSettingsBoard
 * into your HUD dashboard or agent management interface.
 */

'use client';

import React, { useState } from 'react';
import { AgentSettingsBoard, type Agent, type AgentSettings, type RiskConfig } from './index';

/**
 * Example: Basic Integration
 *
 * Shows minimal setup with local state management
 */
export function BasicExample() {
  // Mock agent data
  const [agent, setAgent] = useState<Agent>({
    id: 'agent-001',
    name: 'ATLAS',
    avatar: undefined,
    mode: 't-mode',
    chain: 'cardano',
    walletAddress: 'addr1q9s6...5s3',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'running',
    performance: {
      pnl24h: 234.56,
      pnl24hPct: 2.3,
      winRate: 68,
      totalTrades: 1247,
      bestTrade: {
        pair: 'SNEK/ADA',
        profit: 89.23,
      },
    },
  });

  // T-Mode settings
  const [settings, setSettings] = useState<AgentSettings>({
    minBuyConfidence: 65,
    lowTierSize: 40,
    midTierSize: 80,
    highTierSize: 120,
    stopLoss: 10,
    takeProfit: 93,
    priceTrigger: 3.5,
    reEntryCooldown: 30,
    minHoldTime: 30,
    profitUnlock: 20,
    emergencyStop: -6,
    trailingUnlock: 0,
    tokenBlacklist: [],
    paperTradingEnabled: false,
  });

  // Risk settings (shared across all modes)
  const [riskSettings, setRiskSettings] = useState<RiskConfig>({
    edgeGateEnabled: false,
    minNetEdge: 0.5,
    logSkippedEdge: true,
    liquidityGuardEnabled: true,
    maxImpact: 3.0,
    autoDownsize: true,
    skipIlliquid: false,
    perAssetCooldownEnabled: true,
    winCooldown: 15,
    lossCooldown: 60,
    scratchCooldown: 30,
    maxOpenPositions: 10,
    maxSinglePosition: 20,
    maxDailyLoss: 10,
    dryRunEnabled: false,
    logToDatabase: true,
    virtualAda: 10000,
  });

  const handleNameChange = (name: string) => {
    setAgent({ ...agent, name });
    console.log('Agent name changed:', name);
  };

  const handleAvatarChange = async (file: File) => {
    // In production, upload to storage and get URL
    const url = URL.createObjectURL(file);
    setAgent({ ...agent, avatar: url });
    console.log('Avatar uploaded:', file.name);
  };

  const handleStart = () => {
    setAgent({ ...agent, status: 'running' });
    console.log('Agent started');
    // TODO: Call backend API to start agent
  };

  const handleStop = () => {
    setAgent({ ...agent, status: 'stopped' });
    console.log('Agent stopped');
    // TODO: Call backend API to stop agent
  };

  const handleUpdate = () => {
    console.log('Agent updating...');
    // TODO: Call backend API to update agent configuration
  };

  const handleModeChange = (mode: typeof agent.mode) => {
    setAgent({ ...agent, mode });
    console.log('Mode changed to:', mode);
    // TODO: Load mode-specific default settings
  };

  const handleSave = () => {
    console.log('Saving all settings:', { agent, settings, riskSettings });
    // TODO: Persist to backend
    alert('Settings saved successfully!');
  };

  return (
    <div style={{ padding: '20px', background: '#0b0b10', minHeight: '100vh' }}>
      <AgentSettingsBoard
        agent={agent}
        settings={settings}
        riskSettings={riskSettings}
        onSettingsChange={(partial) => setSettings({ ...settings, ...partial })}
        onRiskSettingsChange={(partial) => setRiskSettings({ ...riskSettings, ...partial })}
        onModeChange={handleModeChange}
        onNameChange={handleNameChange}
        onAvatarChange={handleAvatarChange}
        onStart={handleStart}
        onStop={handleStop}
        onUpdate={handleUpdate}
        onSave={handleSave}
      />
    </div>
  );
}

/**
 * Example: Integration with Backend API
 *
 * Shows how to integrate with a real backend service
 */
export function BackendIntegratedExample() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [settings, setSettings] = useState<AgentSettings>({});
  const [riskSettings, setRiskSettings] = useState<RiskConfig>({} as RiskConfig);
  const [loading, setLoading] = useState(true);

  // Load agent data on mount
  React.useEffect(() => {
    async function loadAgent() {
      try {
        // Replace with your API endpoint
        const response = await fetch('/api/agents/atlas');
        const data = await response.json();
        setAgent(data.agent);
        setSettings(data.settings);
        setRiskSettings(data.riskSettings);
      } catch (error) {
        console.error('Failed to load agent:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAgent();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await fetch('/api/agents/atlas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, settings, riskSettings }),
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !agent) {
    return <div>Loading agent settings...</div>;
  }

  return (
    <AgentSettingsBoard
      agent={agent}
      settings={settings}
      riskSettings={riskSettings}
      onSettingsChange={(partial) => setSettings({ ...settings, ...partial })}
      onRiskSettingsChange={(partial) => setRiskSettings({ ...riskSettings, ...partial })}
      onModeChange={(mode) => setAgent({ ...agent, mode })}
      onNameChange={(name) => setAgent({ ...agent, name })}
      onAvatarChange={async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch('/api/agents/atlas/avatar', {
          method: 'POST',
          body: formData,
        });
        const { url } = await response.json();
        setAgent({ ...agent, avatar: url });
      }}
      onStart={async () => {
        await fetch('/api/agents/atlas/start', { method: 'POST' });
        setAgent({ ...agent, status: 'running' });
      }}
      onStop={async () => {
        await fetch('/api/agents/atlas/stop', { method: 'POST' });
        setAgent({ ...agent, status: 'stopped' });
      }}
      onUpdate={async () => {
        await fetch('/api/agents/atlas/update', { method: 'POST' });
      }}
      onSave={handleSave}
    />
  );
}

/**
 * Example: Modal Integration
 *
 * Shows how to use AgentSettingsBoard in a modal/slide panel
 */
export function ModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [agent] = useState<Agent>({
    id: 'agent-001',
    name: 'ATLAS',
    mode: 't-mode',
    chain: 'cardano',
    walletAddress: 'addr1q9s6...5s3',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'running',
    performance: {
      pnl24h: 234.56,
      pnl24hPct: 2.3,
      winRate: 68,
      totalTrades: 1247,
    },
  });

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}>
        Open Agent Settings
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          background: 'rgba(12, 16, 22, 0.95)',
          borderRadius: '4px',
          border: '1px solid rgba(196, 124, 72, 0.22)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <AgentSettingsBoard
          agent={agent}
          settings={{}}
          riskSettings={{} as RiskConfig}
          onSettingsChange={() => {}}
          onRiskSettingsChange={() => {}}
          onModeChange={() => {}}
          onNameChange={() => {}}
          onAvatarChange={() => {}}
          onStart={() => {}}
          onStop={() => {}}
          onUpdate={() => {}}
          onSave={() => {
            alert('Saved!');
            setIsOpen(false);
          }}
        />
      </div>
    </div>
  );
}
