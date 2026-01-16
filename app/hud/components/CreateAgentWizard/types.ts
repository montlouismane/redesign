/**
 * Types for the Create Agent Wizard
 */

export type WizardStep = 'chain' | 'name' | 'seedphrase' | 'fund' | 'configure' | 'deploy' | 'complete';

export type BotChain = 'cardano' | 'solana' | 'base';
export type BotMode = 'standard' | 't-mode' | 'perpetuals' | 'prediction';

export interface CustomToken {
  policyId: string;
  assetName: string;
  decimals: number;
}

export interface PortfolioTarget {
  token: string;
  percentage: number;
  customToken?: CustomToken;
  customMint?: string;  // Solana
  customAddress?: string;  // Base/EVM
}

export interface WalletInfo {
  seedPhrase: string;
  address: string;
}

export interface WalletBalance {
  balance: number;
  funded: boolean;
  checking: boolean;
  autoProgressing: boolean;
}

export interface FormData {
  botChain: BotChain;
  botName: string;
  targets: PortfolioTarget[];
  minAdaReserve: number;
  tolerance: number;
  minTradeSize: number;
  maxTradeSize?: number;
  botMode: BotMode;
  // T-mode specific
  tModeMinMcap?: number;
  tModeBlacklist?: string[];
  // Prediction settings
  predictionMinAdaFloor?: number;
  predictionMinConfidence?: number;
  predictionMaxPositionPct?: number;
  predictionReviewIntervalMin?: number;
  predictionRiskTolerance?: 'conservative' | 'moderate' | 'aggressive';
  predictionMinPositionPct?: number;
  predictionMinBuyAda?: number;
  predictionAllowLimitOrders?: boolean;
  // Perpetuals-specific fields
  maxLeverage?: number;
  maxPositionSizeAda?: number;
  allowedAssets?: string[];
  riskLimitPercent?: number;
  autoStopLoss?: boolean;
  stopLossPercent?: number;
  takeProfitPercent?: number;
  // Paper trading
  paperTrading?: boolean;
}

export interface DeploymentResult {
  success: boolean;
  agentId?: string;
  userId?: string;
  status?: string;
  message?: string;
  error?: string;
  slotInfo?: {
    allowedSlots: number;
    deployedCount: number;
    availableSlots: number;
  };
  canAddSlot?: boolean;
}

export interface WizardContextValue {
  currentStep: WizardStep;
  setCurrentStep: (step: WizardStep) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  walletInfo: WalletInfo | null;
  setWalletInfo: (info: WalletInfo | null) => void;
  walletBalance: WalletBalance;
  setWalletBalance: (balance: WalletBalance) => void;
  walletId: string | null;
  setWalletId: (id: string | null) => void;
  deploymentResult: DeploymentResult | null;
  setDeploymentResult: (result: DeploymentResult | null) => void;
  isCreatingWallet: boolean;
  setIsCreatingWallet: (creating: boolean) => void;
  isDeploying: boolean;
  setIsDeploying: (deploying: boolean) => void;
  seedPhraseConfirmed: boolean;
  setSeedPhraseConfirmed: (confirmed: boolean) => void;
  connectedAddress: string;
}

// Step configuration for the wizard stepper
export const WIZARD_STEPS: { key: WizardStep; label: string; shortLabel: string }[] = [
  { key: 'chain', label: 'Select Network', shortLabel: 'NETWORK' },
  { key: 'name', label: 'Name Strategy', shortLabel: 'NAME' },
  { key: 'seedphrase', label: 'Backup Phrase', shortLabel: 'BACKUP' },
  { key: 'fund', label: 'Fund Wallet', shortLabel: 'FUND' },
  { key: 'configure', label: 'Configure', shortLabel: 'CONFIG' },
  { key: 'deploy', label: 'Deploy', shortLabel: 'DEPLOY' },
];
