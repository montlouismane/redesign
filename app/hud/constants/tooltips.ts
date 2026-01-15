/**
 * Tooltip content for HUD settings
 * Organized by section for easy maintenance
 */

export const TOOLTIPS = {
  // =====================
  // RISK MANAGEMENT
  // =====================
  riskManagement: {
    // Edge Gate Section
    edgeGate: {
      main: 'Only enter trades when expected profit exceeds round-trip costs (slippage + fees). Prevents losing money on transaction costs. Not applicable in Standard mode or Loans mode.',
      minNetEdge: 'The minimum profit margin (after costs) required before entering a trade. Higher values = more conservative.',
      logSkippedTrades: 'When enabled, records trades rejected by the edge gate. Useful for analyzing missed opportunities and tuning your edge threshold.',
    },

    // Liquidity Guard Section
    liquidityGuard: {
      main: 'Prevents trades that would move the market price too much (slippage). Protects against getting a worse price than expected due to low liquidity. Critical for all trading modes.',
      maxPriceImpact: 'Maximum acceptable price movement caused by your trade. Lower = safer but may miss opportunities.',
      autoDownsize: 'When a trade would exceed the impact limit, automatically reduce the trade size instead of skipping entirely. Uses binary search to find the largest safe size.',
      binarySearchIterations: 'Number of steps to find optimal trade size. More iterations = more precise but slower. 8 is a good balance for most cases.',
      skipIlliquidAssets: 'Cache and skip assets that repeatedly fail liquidity checks. Prevents wasting time checking the same illiquid assets.',
    },

    // Cooldowns Section
    cooldowns: {
      main: 'Waiting period after trades before re-entering the same asset. Applied per-asset only (not global). Helps prevent emotional revenge trading. Never blocks exits (stop-losses, take-profits).',
      winCooldown: 'Wait time after a profitable trade. Shorter cooldowns let you capitalize on momentum, longer cooldowns prevent overtrading.',
      scratchCooldown: 'Wait time after a break-even trade (neither profit nor loss). Usually set between win and loss cooldowns.',
      lossCooldown: 'Wait time after a losing trade. Helps prevent revenge trading and gives time for analysis. Recommended to be the longest of the three.',
    },

    // Portfolio Risk Section
    portfolioRisk: {
      main: 'Set guardrails to prevent over-exposure and excessive losses. These limits help protect your portfolio from catastrophic drawdowns.',
      maxOpenPositions: 'Maximum number of different assets the bot can hold simultaneously. For Standard mode, this limits portfolio assets. For T-Mode/Prediction, this limits concurrent trades.',
      maxSinglePosition: 'Maximum percentage of your portfolio that can be allocated to a single asset. Lower = more diversified, higher = more concentrated.',
      maxDailyLoss: 'If your portfolio drops by this percentage in a single day, trading will pause until the next day. Does not block exit trades (closing positions).',
      consecutiveLossPause: 'Automatically pause trading after a streak of consecutive losing trades. A single winning trade resets the counter.',
      lossThreshold: 'Number of consecutive losing trades required to trigger a pause. E.g., 5 means pause after 5 losses in a row.',
      recoveryMode: 'How trading resumes after a pause. Time-based: auto-resume after set duration. After win: resume only after a winning trade. Manual: you must explicitly unpause.',
      recoveryTime: 'Duration to wait before automatically resuming trading. Set to at least 60 minutes for meaningful cooldown.',
    },

    // Partial Exits Section
    partialExits: {
      main: 'Take profits incrementally as your position grows, rather than selling all at once. Targets execute in order on the way up. Stop-loss always has highest priority.',
      atProfit: 'When your position reaches this profit percentage, sell the specified amount. E.g., 10% means when position is up 10% from entry, trigger this target.',
      sellPercent: 'Percentage of your CURRENT position to sell when this target is hit. Note: This is % of remaining position, not original.',
      trailingStopAfter: 'After this target is hit, activate a trailing stop for the remaining position. The trailing stop follows the price up and triggers when price drops by the trail distance.',
    },
  },

  // =====================
  // MODE-SPECIFIC SETTINGS
  // =====================
  modes: {
    // T-Mode
    tMode: {
      minBuyConfidence: 'AI confidence threshold for entering trades. Signals below this confidence are ignored.',
      priceTrigger: 'Minimum price move before re-evaluation. Prevents excessive checking.',
      sizeTiers: 'ADA amounts used based on confidence bands. Low/Mid/High tiers map to confidence levels above your Min Confidence.',
      reEntryCooldown: 'Wait time before the bot can buy the same token again after a purchase.',
      deterministicSells: 'Uses Stop Loss %, Take Profit %, and Price Trigger % from entry. No AI/API sell analysis.',
      horizonBias: 'Prefer short / swing / long horizons. When set, the API overwrites the top-level direction with that horizon\'s action.',
      adaReserve: 'ADA to keep untouched. Prevents depleting ADA for fees and safety.',
      maxSellsPerCycle: 'Throttle exits per cycle to limit churn.',
    },

    // Prediction Mode
    prediction: {
      minConfidence: 'Minimum AI confidence threshold to execute a trade. 0.60 = 60%. Higher = fewer, stronger trades.',
      riskTolerance: 'Overall risk appetite for position sizing.',
      reviewInterval: 'Minutes between market evaluation cycles.',
      maxPosition: 'Maximum allocation per market as percentage of portfolio.',
      minBuyAda: 'Minimum trade size in ADA. Platform minimum is typically 40 ADA.',
      minAdaFloor: 'Minimum ADA to always keep in wallet. Buys won\'t violate this floor.',
      constraintDetection: 'Enable constraint/arbitrage detection across markets.',
      maxDailyTrades: 'Maximum number of trades per day (fee protection).',
      maxDailyFees: 'Maximum platform + network fees per day.',
      allowEmergencyLiquidation: 'Allow bot to sell positions to free up balance when cash-locked.',
      allowLimitOrders: 'Use limit orders instead of market orders. May not fill immediately.',
    },

    // Perpetuals
    perpetuals: {
      maxLeverage: 'Upper cap on leverage per position. Higher = larger notional but higher liquidation risk.',
      maxPositionSize: 'Cap on ADA collateral per trade. Limits per-position exposure.',
      riskLimit: 'Maximum share of equity used as collateral. If utilization exceeds this, new opens are blocked.',
      stopLoss: 'Default protective stop distance per position.',
      takeProfit: 'Default profit target per position.',
      defaultHoldWindow: 'Expected average hold time informing edge calculations.',
      edgeDiscount: 'Positive bias in basis points (1 bp = 0.01%) to encourage borderline trades.',
      priceMoveTrigger: 'Minimum price change before re-evaluating a position to avoid churn.',
      minimumCollateral: 'Exchange floor (~$20 USD) or higher to avoid tiny positions.',
      maxConcurrentPositions: 'Maximum number of simultaneous positions across all assets.',
      maxOpensPerCycle: 'Limit new opens per evaluation cycle.',
    },

    // Standard Mode
    standard: {
      rebalanceTolerance: 'Drift threshold before rebalancing. Lower = more frequent small trades.',
      slippageTolerance: 'Max price deviation per swap. Lower = safer prices but more swap failures.',
      minTradeSize: 'Smallest trade the bot will execute. Prevents fee-inefficient micro trades.',
      maxTradeSize: 'Largest single trade to cap per-trade risk/slippage.',
      nativeReserve: 'Minimum native coin to keep untouched for fees and safety.',
      rebalanceInterval: 'How often the bot checks for rebalancing opportunities.',
    },
  },

  // =====================
  // SAFETY CONTROLS
  // =====================
  safety: {
    recentBuyGuard: {
      main: 'Protect recent buys from premature sells during a hold window after purchase.',
      holdWindow: 'Duration after a buy during which sells are gated unless profit/risk thresholds are met.',
      profitUnlock: 'Allow sells inside the hold once price is up at least this much from buy.',
      emergencyStop: 'If price drops this much during hold, sell a partial to cut risk.',
    },
    paperTrading: {
      main: 'Simulate trades using real market data without executing on-chain transactions.',
      warning: 'Paper trading is enabled. The bot will simulate trades but will NOT execute any real transactions.',
    },
  },
} as const;

// =====================
// DISABLED STATE REASONS
// =====================
export const DISABLED_REASONS: Record<string, Record<string, string>> = {
  standard: {
    edgeGate: 'Not applicable in Standard mode (no edge concept in rebalancing)',
    cooldowns: 'Cooldowns are not used in Standard mode',
    partialExits: 'Partial exits are not applicable in Standard mode',
  },
  arbitrage: {
    edgeGate: 'Redundant in Arbitrage mode (spread is the edge)',
    cooldowns: 'Must be disabled for arbitrage (timing-critical)',
    portfolioRisk: 'Arbitrage uses different risk controls (position limits are auto-managed)',
    partialExits: 'Partial exits are not applicable in Arbitrage mode',
  },
  loans: {
    all: 'Not applicable in Loans mode',
    edgeGate: 'Not applicable in Loans mode',
    liquidityGuard: 'Not applicable in Loans mode',
    cooldowns: 'Not applicable in Loans mode',
    portfolioRisk: 'Not applicable in Loans mode',
    partialExits: 'Not applicable in Loans mode',
  },
};

// Type exports for strict typing
export type TooltipSection = keyof typeof TOOLTIPS;
export type RiskManagementTooltip = keyof typeof TOOLTIPS.riskManagement;
