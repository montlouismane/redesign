export type PanelKey = 'agents' | 'performance' | 'market' | 'trades' | 'allocation' | 'system' | 'funds';
export type PortfolioRange = '1H' | '24H' | '7D' | '30D' | 'ALL';
export type AgentRuntimeState = 'running' | 'idle' | 'alert' | 'stopped';

export type PortfolioSeriesPoint = { time: number; value: number };

export type AgentRow = {
  id: string;
  chip: string;
  name: string;
  role: string;
  chain: string;
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

export interface FundsPanelProps {
  walletAddress?: string;
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  openModal: (key: PanelKey) => void;
  isLoaded: boolean;
  reduceMotion?: boolean;
  chain?: 'cardano' | 'solana' | 'base';
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
