import type { Agent } from '../types';
import { DEFAULT_AGENT_SETTINGS } from '../constants';

// =============================================================================
// Mock Agents
// Aligned with production patterns (see docs/AGENT_HANDOFF.md)
// - Mode: 'prediction' (singular, not 'predictions')
// - Status: 'stopped' (not 'idle' or 'paused')
// =============================================================================

export const mockAgents: Agent[] = [
  {
    id: 'agent-t',
    name: 'Agent T',
    avatar: null,
    mode: 't-mode',
    status: 'running',
    createdAt: '2025-11-15T10:30:00Z',
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      tMode: {
        riskTolerance: 65,
        maxPositionSize: 2500,
        tokenWhitelist: ['ETH', 'SOL', 'ARB', 'OP'],
        tokenBlacklist: ['SHIB', 'DOGE'],
        rebalanceFrequency: 'daily',
        takeProfitPercent: 20,
        stopLossPercent: 8,
      },
    },
    performance: {
      pnl24h: 127.45,
      pnl7d: 543.21,
      pnl30d: 1876.54,
      pnlTotal: 2341.87,
      trades24h: 12,
      winRate: 68,
    },
  },
  {
    id: 'agent-alpha',
    name: 'Alpha Fund',
    avatar: null,
    mode: 'standard',
    status: 'running',
    createdAt: '2025-10-01T08:00:00Z',
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      standard: {
        targetAllocation: {
          ETH: 40,
          SOL: 25,
          BTC: 20,
          USDC: 15,
        },
        rebalanceThreshold: 3,
        rebalanceFrequency: 'daily',
      },
    },
    performance: {
      pnl24h: 45.32,
      pnl7d: 234.56,
      pnl30d: 892.33,
      pnlTotal: 1567.89,
      trades24h: 3,
      winRate: 72,
    },
  },
  {
    id: 'agent-predictor',
    name: 'Oracle',
    avatar: null,
    mode: 'prediction', // Production uses singular 'prediction'
    status: 'stopped', // Production uses 'stopped' instead of 'idle'
    createdAt: '2025-12-01T14:00:00Z',
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      prediction: {
        marketTypes: ['crypto', 'politics'],
        minConfidence: 75,
        maxExposure: 200,
        maxOpenPositions: 8,
      },
    },
    performance: {
      pnl24h: 0,
      pnl7d: 89.12,
      pnl30d: 312.45,
      pnlTotal: 456.78,
      trades24h: 0,
      winRate: 61,
    },
  },
  {
    id: 'agent-leverage',
    name: 'High Roller',
    avatar: null,
    mode: 'perpetuals',
    status: 'stopped', // Production uses 'stopped' instead of 'paused'
    createdAt: '2025-12-20T16:30:00Z',
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      perpetuals: {
        maxLeverage: 10,
        defaultLeverage: 3,
        pairWhitelist: ['BTC-PERP', 'ETH-PERP', 'SOL-PERP'],
        stopLossPercent: 3,
        takeProfitPercent: 8,
        maxPositionSize: 1000,
        marginType: 'isolated',
      },
    },
    performance: {
      pnl24h: 0,
      pnl7d: -123.45,
      pnl30d: -456.78,
      pnlTotal: 234.56,
      trades24h: 0,
      winRate: 52,
    },
  },
  {
    id: 'agent-conservative',
    name: 'Safe Harbor',
    avatar: null,
    mode: 'standard',
    status: 'running',
    createdAt: '2025-09-15T09:00:00Z',
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      standard: {
        targetAllocation: {
          USDC: 50,
          ETH: 30,
          BTC: 20,
        },
        rebalanceThreshold: 10,
        rebalanceFrequency: 'weekly',
      },
    },
    performance: {
      pnl24h: 12.34,
      pnl7d: 67.89,
      pnl30d: 234.12,
      pnlTotal: 890.12,
      trades24h: 1,
      winRate: 85,
    },
  },
  {
    id: 'agent-error',
    name: 'Broken Bot',
    avatar: null,
    mode: 't-mode',
    status: 'error',
    createdAt: '2025-12-28T11:00:00Z',
    settings: DEFAULT_AGENT_SETTINGS,
    performance: {
      pnl24h: 0,
      pnl7d: -45.67,
      pnl30d: -178.90,
      pnlTotal: -45.67,
      trades24h: 0,
      winRate: 0,
    },
  },
];

// =============================================================================
// Helper to generate unique IDs
// =============================================================================

export function generateAgentId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
