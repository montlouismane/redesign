// Agent Management System - Type Definitions
// Aligned with production backend patterns (see docs/AGENT_HANDOFF.md)

// =============================================================================
// Core Types
// =============================================================================

// Production uses 'prediction' (singular), not 'predictions'
export type AgentMode = 'standard' | 't-mode' | 'prediction' | 'perpetuals';

// Production status values from /api/bot/user/:userId/status
export type AgentStatus = 'running' | 'stopped' | 'error' | 'unknown' | 'timeout' | 'not_found';

// =============================================================================
// Settings Interfaces
// =============================================================================

export interface StandardSettings {
  /** Token symbol -> target percentage (e.g., { ETH: 60, SOL: 40 }) */
  targetAllocation: Record<string, number>;
  /** Rebalance when allocation drifts by this percentage (1-20) */
  rebalanceThreshold: number;
  /** How often to check for rebalancing */
  rebalanceFrequency: 'hourly' | 'daily' | 'weekly';
}

export interface TModeSettings {
  /** Risk tolerance 0-100 (0 = conservative, 100 = aggressive) */
  riskTolerance: number;
  /** Maximum position size in USD */
  maxPositionSize: number;
  /** Allowed tokens (empty = all allowed) */
  tokenWhitelist: string[];
  /** Blocked tokens */
  tokenBlacklist: string[];
  /** How often to rebalance */
  rebalanceFrequency: 'hourly' | 'daily' | 'weekly';
  /** Take profit percentage */
  takeProfitPercent: number;
  /** Stop loss percentage */
  stopLossPercent: number;
}

// Named to match production mode 'prediction' (singular)
export interface PredictionSettings {
  /** Types of prediction markets to trade */
  marketTypes: ('crypto' | 'sports' | 'politics' | 'other')[];
  /** Minimum AI confidence threshold to enter position (0-100) */
  minConfidence: number;
  /** Maximum USD exposure per prediction */
  maxExposure: number;
  /** Maximum number of open positions */
  maxOpenPositions: number;
}

export interface PerpetualsSettings {
  /** Maximum leverage allowed (1-100x) */
  maxLeverage: number;
  /** Default leverage for new positions */
  defaultLeverage: number;
  /** Allowed trading pairs (e.g., ['BTC-PERP', 'ETH-PERP']) */
  pairWhitelist: string[];
  /** Auto stop loss percentage */
  stopLossPercent: number;
  /** Auto take profit percentage */
  takeProfitPercent: number;
  /** Maximum position size in USD */
  maxPositionSize: number;
  /** Margin type */
  marginType: 'isolated' | 'cross';
}

export interface AgentSettings {
  standard: StandardSettings;
  tMode: TModeSettings;
  prediction: PredictionSettings;
  perpetuals: PerpetualsSettings;
}

// =============================================================================
// Performance Metrics
// =============================================================================

export interface AgentPerformance {
  /** Profit/loss in last 24 hours (USD) */
  pnl24h: number;
  /** Profit/loss in last 7 days (USD) */
  pnl7d: number;
  /** Profit/loss in last 30 days (USD) */
  pnl30d: number;
  /** Total profit/loss since creation (USD) */
  pnlTotal: number;
  /** Number of trades in last 24 hours */
  trades24h: number;
  /** Win rate percentage (0-100) */
  winRate: number;
}

// =============================================================================
// Agent Entity
// =============================================================================

export interface Agent {
  /** Unique identifier */
  id: string;
  /** User-customizable name */
  name: string;
  /** Avatar URL (null for default) */
  avatar: string | null;
  /** Current operating mode */
  mode: AgentMode;
  /** Current status */
  status: AgentStatus;
  /** ISO date string */
  createdAt: string;
  /** Mode-specific settings */
  settings: AgentSettings;
  /** Performance metrics */
  performance: AgentPerformance;
}

// =============================================================================
// API Payloads
// =============================================================================

export interface CreateAgentPayload {
  name: string;
  mode: AgentMode;
  avatar?: string | null;
  /** Optional initial settings - defaults applied if not provided */
  settings?: Partial<AgentSettings>;
}

export interface UpdateAgentPayload {
  name?: string;
  avatar?: string | null;
  mode?: AgentMode;
  settings?: Partial<AgentSettings>;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface AgentListItem {
  id: string;
  name: string;
  avatar: string | null;
  mode: AgentMode;
  status: AgentStatus;
  pnl24h: number;
  createdAt: string;
}

export interface AgentFormState {
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

export interface DeleteConfirmationState {
  isOpen: boolean;
  agentId: string | null;
  agentName: string | null;
}

// =============================================================================
// Production API Types (for backend integration)
// =============================================================================

/**
 * Production bot status response from /api/bot/user/:userId/status
 */
export interface ProductionBotStatus {
  status: AgentStatus;
  pid?: number;
  running: boolean;
  startTime?: string;
  uptime?: number;
  responseTime?: number;
  cached?: boolean;
}

/**
 * Production bot configuration from /api/bot/user/:userId/config
 */
export interface ProductionBotConfig {
  botMode: AgentMode;
  botChain: 'cardano' | 'solana' | 'base';
  portfolioSettings: {
    targets: Record<string, number>;
    tolerance: number;
    minAdaReserve: number;
    slippage: number;
    rebalanceIntervalMinutes?: number;
  };
}

/**
 * Production deploy request body for POST /api/bot/deploy
 */
export interface ProductionDeployRequest {
  userAddress: string;
  botMode: AgentMode;
  botChain: 'cardano' | 'solana' | 'base';
  portfolioSettings: {
    targets: Record<string, number>;
    tolerance: number;
    minAdaReserve: number;
  };
  walletId: string;
  seed?: string;
}

/**
 * Production deploy response
 */
export interface ProductionDeployResponse {
  success: boolean;
  deploymentId: string;
  status: 'deploying' | 'deployed' | 'failed';
}

/**
 * Production error response format
 */
export interface ProductionErrorResponse {
  error: string; // snake_case error code
  details: string;
  hint?: string;
}

/**
 * Production update portfolio request
 */
export interface ProductionUpdatePortfolioRequest {
  targets: Record<string, number>;
  tolerance: number;
  minAdaReserve: number;
  slippage?: number;
}

// =============================================================================
// Production API Adapter Types (HUD Integration)
// =============================================================================

/**
 * Production bot summary response from /api/bot/summary or deployed_bots table
 */
export interface DeployedBotResponse {
  id: string;
  bot_name: string;
  status: 'configured' | 'running' | 'stopped' | 'error';
  bot_mode: 'standard' | 'prediction' | 'perps' | 'tMode';
  bot_chain: 'cardano' | 'solana' | 'base';
  wallet_address: string;
  last_activity: string;
  metadata?: Record<string, unknown>;
}

/**
 * Risk configuration for bot operations
 */
export interface RiskConfig {
  edgeAfterCost: {
    enabled: boolean;
    minNetEdgePct: number;
    logSkipped: boolean;
  };
  liquidityGuard: {
    enabled: boolean;
    maxImpactPct: number;
    autoDownsize: boolean;
    skipIlliquid: boolean;
  };
  cooldowns: {
    perAssetEnabled: boolean;
    winCooldownMinutes: number;
    lossCooldownMinutes: number;
    scratchCooldownMinutes: number;
  };
  portfolioRisk: {
    maxOpenPositions: number;
    maxSinglePositionPct: number;
    maxDailyLossPct: number;
  };
  dryRun: {
    enabled: boolean;
    logToDatabase: boolean;
    virtualBalances: {
      cardano: {
        ADA: number;
      };
    };
  };
}

/**
 * Wallet balance response from indexer
 */
export interface WalletBalanceResponse {
  lovelace: string;
  tokens: Record<string, string>;
}

/**
 * Bot health status item
 */
export interface BotHealthItem {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error';
  timestamp?: string;
}

/**
 * Bot health response
 */
export interface BotHealthResponse {
  botId: string;
  status: AgentStatus;
  items: BotHealthItem[];
  lastCheck: string;
}

// =============================================================================
// Adapter Mapping Helpers
// =============================================================================

/**
 * Map production bot_mode to UI AgentMode
 */
export const modeToAgentMode: Record<string, AgentMode> = {
  standard: 'standard',
  tMode: 't-mode',
  prediction: 'prediction',
  perps: 'perpetuals',
};

/**
 * Map production status to UI AgentStatus
 */
export const statusToAgentStatus: Record<string, AgentStatus> = {
  running: 'running',
  configured: 'stopped',
  stopped: 'stopped',
  error: 'error',
};

/**
 * Map AgentMode to production bot_mode
 */
export const agentModeToMode: Record<AgentMode, string> = {
  'standard': 'standard',
  't-mode': 'tMode',
  'prediction': 'prediction',
  'perpetuals': 'perps',
};

/**
 * Map AgentMode to role label for HUD
 */
export const modeToRole: Record<string, string> = {
  standard: 'Balanced',
  tMode: 'AI Trading',
  prediction: 'Predictor',
  perps: 'Leveraged',
};
