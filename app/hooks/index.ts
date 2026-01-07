// Agent Management Hooks
export {
  useAgentList,
  useAgent,
  useAgentsByStatus,
  useRunningAgentsCount,
  useAgentPerformanceSummary,
  type AgentListState,
} from './useAgentList';

// Risk Configuration Hook
export {
  useRiskConfig,
  type RiskConfigState,
} from './useRiskConfig';

// Wallet Balance Hooks
export {
  useWalletBalance,
  useAdaBalance,
  useTokenBalance,
  type WalletBalanceState,
} from './useWalletBalance';

// Bot Health Hooks
export {
  useBotHealth,
  useBotStatus,
  useHealthMetric,
  type BotHealthState,
} from './useBotHealth';

// Legacy hooks (re-export for backwards compatibility)
export { useUserAgents, type AgentInfo, type UserAgentsState } from './useUserAgents';
export { useAgentPnL } from './useAgentPnL';
export { useEquitySeries } from './useEquitySeries';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useAgentWebSocket } from './useAgentWebSocket';
