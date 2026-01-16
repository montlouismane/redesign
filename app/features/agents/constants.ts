import type {
  AgentMode,
  AgentStatus,
  StandardSettings,
  TModeSettings,
  PredictionSettings,
  PerpetualsSettings,
  AgentSettings,
} from './types';

// =============================================================================
// Mode Definitions
// =============================================================================

export interface ModeDefinition {
  id: AgentMode;
  /** Label for HUD mode UI */
  hudLabel: string;
  /** Label for Classic mode UI */
  classicLabel: string;
  /** Short description */
  description: string;
  /** Risk level indicator */
  riskLevel: 'low' | 'medium' | 'medium-high' | 'high';
  /** Lucide icon name */
  icon: string;
  /** Whether to show risk warning when selecting */
  showRiskWarning: boolean;
}

export const AGENT_MODES: Record<AgentMode, ModeDefinition> = {
  standard: {
    id: 'standard',
    hudLabel: 'STANDARD',
    classicLabel: 'Standard',
    description: 'Simple portfolio balancing to maintain target allocations',
    riskLevel: 'low',
    icon: 'PieChart',
    showRiskWarning: false,
  },
  't-mode': {
    id: 't-mode',
    hudLabel: 'T-MODE',
    classicLabel: 'Advanced AI',
    description: 'AI-driven analytics engine that picks tokens based on market dynamics',
    riskLevel: 'medium',
    icon: 'Brain',
    showRiskWarning: false,
  },
  prediction: {
    id: 'prediction',
    hudLabel: 'PREDICT',
    classicLabel: 'Predictions',
    description: 'Trade on prediction markets across crypto, sports, and more',
    riskLevel: 'medium-high',
    icon: 'TrendingUp',
    showRiskWarning: true,
  },
  perpetuals: {
    id: 'perpetuals',
    hudLabel: 'PERPS',
    classicLabel: 'Leverage',
    description: 'Leverage trading with perpetual futures - highest risk',
    riskLevel: 'high',
    icon: 'Zap',
    showRiskWarning: true,
  },
};

export const AGENT_MODE_ORDER: AgentMode[] = ['standard', 't-mode', 'prediction', 'perpetuals'];

// =============================================================================
// Status Definitions
// =============================================================================

export interface StatusDefinition {
  id: AgentStatus;
  label: string;
  /** CSS color variable or hex */
  color: string;
  /** Whether agent is actively trading */
  isActive: boolean;
}

// Production status values aligned with /api/bot/user/:userId/status
export const AGENT_STATUSES: Record<AgentStatus, StatusDefinition> = {
  running: {
    id: 'running',
    label: 'Running',
    color: 'rgba(53, 255, 155, 0.92)', // Green
    isActive: true,
  },
  stopped: {
    id: 'stopped',
    label: 'Stopped',
    color: 'rgba(156, 163, 175, 0.92)', // Gray
    isActive: false,
  },
  error: {
    id: 'error',
    label: 'Error',
    color: 'rgba(255, 59, 59, 0.92)', // Red
    isActive: false,
  },
  unknown: {
    id: 'unknown',
    label: 'Unknown',
    color: 'rgba(196, 124, 72, 0.92)', // Copper
    isActive: false,
  },
  timeout: {
    id: 'timeout',
    label: 'Timeout',
    color: 'rgba(255, 177, 66, 0.92)', // Orange
    isActive: false,
  },
  not_found: {
    id: 'not_found',
    label: 'Not Found',
    color: 'rgba(156, 163, 175, 0.92)', // Gray
    isActive: false,
  },
};

// =============================================================================
// Default Settings
// =============================================================================

export const DEFAULT_STANDARD_SETTINGS: StandardSettings = {
  targetAllocation: {
    ETH: 50,
    SOL: 30,
    USDC: 20,
  },
  rebalanceThreshold: 5,
  rebalanceFrequency: 'daily',
};

export const DEFAULT_TMODE_SETTINGS: TModeSettings = {
  riskTolerance: 50,
  maxPositionSize: 1000,
  tokenWhitelist: [],
  tokenBlacklist: [],
  rebalanceFrequency: 'daily',
  takeProfitPercent: 15,
  stopLossPercent: 10,
};

export const DEFAULT_PREDICTION_SETTINGS: PredictionSettings = {
  marketTypes: ['crypto'],
  minConfidence: 70,
  maxExposure: 100,
  maxOpenPositions: 5,
};

export const DEFAULT_PERPETUALS_SETTINGS: PerpetualsSettings = {
  maxLeverage: 5,
  defaultLeverage: 2,
  pairWhitelist: ['BTC-PERP', 'ETH-PERP'],
  stopLossPercent: 5,
  takeProfitPercent: 10,
  maxPositionSize: 500,
  marginType: 'isolated',
};

export const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  standard: DEFAULT_STANDARD_SETTINGS,
  tMode: DEFAULT_TMODE_SETTINGS,
  prediction: DEFAULT_PREDICTION_SETTINGS,
  perpetuals: DEFAULT_PERPETUALS_SETTINGS,
};

// =============================================================================
// Validation Constants
// =============================================================================

export const VALIDATION = {
  name: {
    minLength: 1,
    maxLength: 32,
  },
  riskTolerance: {
    min: 0,
    max: 100,
  },
  leverage: {
    min: 1,
    max: 100,
  },
  percentage: {
    min: 0,
    max: 100,
  },
  positionSize: {
    min: 1,
    max: 1000000,
  },
} as const;

// =============================================================================
// Risk Warning Messages
// =============================================================================

export const RISK_WARNINGS: Record<string, string> = {
  prediction:
    'Prediction markets can be highly volatile. Only invest what you can afford to lose.',
  perpetuals:
    'Leverage trading carries extreme risk. You can lose more than your initial investment. Make sure you understand the risks before proceeding.',
  highLeverage:
    'Leverage above 10x significantly increases liquidation risk. Consider using lower leverage.',
};

// =============================================================================
// Rebalance Frequency Options
// =============================================================================

export const REBALANCE_FREQUENCIES = [
  { value: 'hourly', label: 'Hourly', hudLabel: '1H' },
  { value: 'daily', label: 'Daily', hudLabel: '1D' },
  { value: 'weekly', label: 'Weekly', hudLabel: '1W' },
] as const;

// =============================================================================
// Prediction Market Types
// =============================================================================

export const PREDICTION_MARKET_TYPES = [
  { value: 'crypto', label: 'Crypto', hudLabel: 'CRYPTO' },
  { value: 'sports', label: 'Sports', hudLabel: 'SPORTS' },
  { value: 'politics', label: 'Politics', hudLabel: 'POLITICS' },
  { value: 'other', label: 'Other', hudLabel: 'OTHER' },
] as const;

// =============================================================================
// Common Token Lists
// =============================================================================

export const COMMON_TOKENS = [
  'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'ARB', 'OP', 'MATIC', 'AVAX', 'LINK',
  'UNI', 'AAVE', 'CRV', 'MKR', 'SNX', 'DOGE', 'SHIB', 'PEPE', 'WIF', 'BONK',
] as const;

export const COMMON_PERP_PAIRS = [
  'BTC-PERP', 'ETH-PERP', 'SOL-PERP', 'ARB-PERP', 'OP-PERP',
  'DOGE-PERP', 'AVAX-PERP', 'LINK-PERP', 'MATIC-PERP', 'SUI-PERP',
] as const;
