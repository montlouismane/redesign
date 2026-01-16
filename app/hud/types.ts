export type PanelKey = 'agents' | 'performance' | 'market' | 'trades' | 'allocation' | 'system' | 'funds';
export type PortfolioRange = '1H' | '24H' | '7D' | '30D' | 'ALL';
export type AgentRuntimeState = 'running' | 'idle' | 'alert' | 'stopped';
export type AgentMode = 't-mode' | 'perpetuals' | 'prediction' | 'standard';

export type PortfolioSeriesPoint = { time: number; value: number };

export type AgentRow = {
  id: string;
  chip: string;
  name: string;
  role: string;
  mode: AgentMode;
  runtimeState: AgentRuntimeState;
  pnlPct: number;
};

export type HoldingRow = {
  symbol: string;
  name: string;
  value: string;
  changePct: number;
  color: string;
};

export type TradeRow = {
  type: 'BUY' | 'SELL';
  pair: string;
  time: string;
};

export type SystemStatusItem = {
  label: string;
  status: string;
  tone: 'ok' | 'warn' | 'bad' | 'neutral';
  pulse: boolean;
};

/** Agent wallet info for the Funds panel wallet selector */
export interface AgentWallet {
  id: string;
  name: string;
  address: string;
  chain: 'cardano' | 'solana' | 'base';
  balance: number;
}

export interface FundsPanelProps {
  walletAddress?: string;
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  openModal: (key: PanelKey) => void;
  isLoaded: boolean;
  reduceMotion?: boolean;
  chain?: 'cardano' | 'solana' | 'base';
  /** List of agent wallets for the wallet selector */
  agentWallets?: AgentWallet[];
  /** Currently selected agent wallet ID */
  selectedWalletId?: string;
  /** Callback when agent wallet is changed */
  onWalletChange?: (walletId: string) => void;
}

export interface SystemPanelProps {
  systemStatus: SystemStatusItem[];
  openModal: (key: PanelKey) => void;
  isLoaded: boolean;
  reduceMotion?: boolean;
  isTradingActive: boolean;
  onTradingToggle: () => void;
  onUpdate: () => void;
}
