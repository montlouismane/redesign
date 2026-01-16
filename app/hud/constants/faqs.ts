/**
 * FAQ content for HUD settings
 * Ported from production build ui/content/faqs.ts
 */

export type FaqSection = {
  title: string;
  body: string; // markdown supported
};

export type FaqCategory = 'standard' | 't-mode' | 'arbitrage' | 'perpetuals' | 'prediction';

export const FAQS: Record<FaqCategory, FaqSection[]> = {
  standard: [
    {
      title: 'What is Standard Mode?',
      body: 'Standard Mode automatically rebalances your portfolio to your target allocations. The bot periodically swaps assets back to your chosen percentage split.',
    },
    {
      title: 'Can I include tokenized stocks (xStocks) in my portfolio?',
      body: [
        '- **Yes on Solana**: Add xStocks (e.g., AAPLx, NVDAx) as tokens in Standard mode on Solana. The bot trades them via Jupiter like any SPL token.',
        '- **Base (feature-flag)**: If enabled by your admin, bridged xStocks on Base can be added and traded via 0x.',
        '- **Setup**: Ensure your wallet has SOL/USDC (Solana) or ETH/USDC (Base) to fund swaps.',
        '- **Slippage & Tolerance**: xStocks liquidity can vary. Consider slightly higher slippage and conservative trade sizes.',
        '- **Compliance**: xStocks may have issuer restrictions by jurisdiction. You are responsible for using them legally.',
      ].join('\n'),
    },
    {
      title: 'How to configure asset allocation?',
      body: 'Add tokens and set their target % under Asset Allocation. Ensure the total equals 100%. The bot keeps actual allocations near these targets.',
    },
    {
      title: 'Advanced settings explained',
      body: [
        '- **Slippage Tolerance (%)**: Max price deviation per swap. Lower = safer prices but more swap failures.',
        '- **Rebalance Tolerance (%)**: Drift from targets before rebalancing. Lower = more frequent small trades.',
        '- **Min Trade Size (native)**: Smallest trade the bot will execute. Prevents fee-inefficient micro trades.',
        '- **Max Trade Size (native)**: Largest single trade to cap per-trade risk/slippage.',
        '- **Native Reserve**: Minimum native coin to keep untouched for fees and safety.',
        '- **Rebalance Interval (minutes)**: How often the bot checks for rebalancing opportunities.',
        '',
        '> Note: "native" refers to the chain you\'re running on (SOL for Solana, ETH for Base, ADA for Cardano).',
      ].join('\n'),
    },
    {
      title: 'Funding AGENT and healthy UTxOs',
      body: 'If you see fee-token messages like "[BABEL] No AGENT source UTxO large enough" or INSUFFICIENT_FEE_TOKEN, fund your trading wallet with AGENT in at least two separate transactions. One should be ~1000 AGENT, the second can be any extra amount. Splitting ensures reliable Babel fee coverage.',
    },
    {
      title: 'Common swap logs and what they mean',
      body: [
        '- `[SWAP] quantityAda must be greater than 0` — Set a positive trade amount.',
        '- `[SWAP] unit must be a valid asset unit` — Use policyId.assetName for Cardano tokens.',
        '- `LIQUIDITY_POOL_NOT_FOUND` — Reduce size or increase slippage tolerance.',
        '- `[BABEL] No AGENT source UTxO large enough` — Fund wallet with AGENT.',
        '- `INSUFFICIENT_FEE_TOKEN` — Wallet AGENT balance too low; fund and retry.',
      ].join('\n'),
    },
  ],

  't-mode': [
    {
      title: 'What is T-Mode and how does it work?',
      body: 'T-Mode actively trades across many tokens, scanning by volume, momentum, or both, and uses AI to decide buys/sells. It aims for short-term gains in trending assets.',
    },
    {
      title: 'T-Mode settings and their impact',
      body: [
        '- **Min Market Cap**: Skip tokens below this cap. Higher = larger, safer tokens.',
        '- **Buy Min Confidence (%)**: AI buy signals below this confidence are ignored.',
        '- **Size Tiers (Low/Mid/High ADA)**: ADA amounts based on confidence bands (minimum 40 ADA).',
        '- **Re-entry Cooldown (min)**: Wait time before buying the same token again.',
        '- **Deterministic Sells**: Uses Stop Loss %, Take Profit %, and Price Trigger % from entry.',
        '- **Horizon Bias**: Prefer short / swing / long horizons.',
        '- **ADA Reserve**: ADA to keep untouched for fees/safety.',
        '- **Max Sells Per Cycle**: Throttle exits per cycle to limit churn.',
      ].join('\n'),
    },
    {
      title: 'How are buy sizes determined?',
      body: 'Buys are confidence-gated. When confidence >= your Min Confidence, the bot maps confidence to Low/Mid/High tiers and buys the configured ADA amount (never below 40 ADA, while respecting ADA reserve).',
    },
    {
      title: 'Horizon details (when Include Horizons is enabled)',
      body: [
        '- **short_term**: horizon ~4-24 hours; rationale highlights fast-moving signals.',
        '- **swing_term**: horizon ~24-336 hours; blends technical + sentiment signals.',
        '- **long_term**: horizon 336+ hours; reflects higher-timeframe trend and fundamentals.',
      ].join('\n'),
    },
    {
      title: 'Funding AGENT and healthy UTxOs',
      body: 'T-Mode also uses Babel fees. Send your trading wallet AGENT in at least two separate transactions; one should be ~1000 AGENT. Healthy UTxOs make fees more reliable.',
    },
    {
      title: 'Why do some buys get skipped?',
      body: [
        '- Confidence below your Buy Min Confidence',
        '- Budget exhausted or token within re-entry cooldown',
        '- Would drop ADA below reserve floor',
        '- Below minimum (40 ADA) after adjustments',
      ].join('\n'),
    },
    {
      title: 'How are sells decided?',
      body: 'Sells are deterministic. Once price has moved at least your Price Trigger % from entry, the bot exits fully on Stop Loss % or Take Profit %. No sell-side AI calls are made.',
    },
    {
      title: 'Recent Buy Guard (churn prevention)',
      body: [
        '- **Hold Window (min)**: During this period after a buy, sells are gated unless thresholds are met.',
        '- **Profit Unlock (%)**: Allow sells inside the hold once price is up this much.',
        '- **Emergency Reduce (%)**: If price drops this much, sell partial to cut risk.',
        '- **Consecutive Sells**: Require N back-to-back SELL signals during hold to act.',
      ].join('\n'),
    },
    {
      title: 'Examples',
      body: [
        '- **Buy tiers**: Min Confidence=65 -> 65-74=Low, 75-84=Mid, >=85=High',
        '- **Deterministic sells**: Entry 1.00; TP 10% => 1.10; SL 5% => 0.95',
      ].join('\n'),
    },
    {
      title: 'Troubleshooting (what logs mean)',
      body: [
        '- `[BUY CYCLE] Skipping ... confidence below Min Confidence` — Adjust Buy Min Confidence.',
        '- `[BUY CYCLE] Skipping ... buy cooldown active` — Re-entry Cooldown not elapsed.',
        '- `[SELL CYCLE] HOLD ... moved X% < trigger Y%` — Price hasn\'t moved enough.',
        '- `[SELL CYCLE] Executed deterministic TP/SL` — Full exit on threshold.',
      ].join('\n'),
    },
  ],

  arbitrage: [
    {
      title: 'What is Arbitrage Mode?',
      body: 'Arbitrage Mode looks for price differences across DEXes and executes buy/sell legs to capture spread, subject to profit and slippage thresholds.',
    },
    {
      title: 'Funding AGENT and healthy UTxOs',
      body: 'Arbitrage relies on Babel fees. Fund your wallet with AGENT in at least two separate transactions; make one ~1000 AGENT. This ensures reliable multi-leg fee coverage.',
    },
    {
      title: 'Basic parameters (typical)',
      body: [
        '- **Min Profit (%)**: Minimum net spread required after fees.',
        '- **Max Slippage (%)**: Per-leg slippage cap to avoid adverse fills.',
        '- **Scan Interval (s)**: How often to scan for opportunities.',
        '- **Max Concurrent Trades**: Limit on simultaneous arbitrage executions.',
      ].join('\n'),
    },
  ],

  perpetuals: [
    {
      title: 'What is Perpetuals Mode?',
      body: 'Perpetuals Mode trades perpetual futures with leverage. The bot can long or short supported assets on a margin platform (like Strike). It uses some of your ADA as collateral to open larger positions. High risk/high reward—start conservative.',
    },
    {
      title: 'Trading style presets',
      body: [
        'The buttons "Conservative", "Balanced", "Aggressive" pre-fill settings:',
        '',
        '- **Conservative**: Fewer trades; ~6h holds, min collateral ~$40, 1.5% price trigger.',
        '- **Balanced**: Middle-ground; ~4h holds, min collateral ~$25, 1% trigger.',
        '- **Aggressive**: More frequent; ~2h holds, min collateral ~$20, 0.5% trigger.',
      ].join('\n'),
    },
    {
      title: 'Key settings and what they do',
      body: [
        '- **Allowed Assets**: Only checked assets will be traded (ADA, SNEK, WMTX, IAG, BTC beta).',
        '- **Max Leverage**: Upper cap on leverage per position.',
        '- **Max Position Size (ADA)**: Cap on ADA collateral per trade.',
        '- **Risk Limit (%)**: Max share of equity used as collateral.',
        '- **Stop Loss (%)**: Default protective stop distance.',
        '- **Default Hold Window (hrs)**: Expected average hold time.',
        '- **Price Move Trigger (%)**: Minimum price change before re-evaluating.',
        '- **Minimum Collateral (USD)**: Exchange floor (~$20) or higher.',
      ].join('\n'),
    },
    {
      title: 'What happens if T is down?',
      body: 'If enabled, the bot opens one minimal position per enabled asset using Strike fees and pool dominance, with SL/TP at entry. When T returns, it resumes control automatically.',
    },
    {
      title: 'How are SL/TP chosen in fallback?',
      body: 'From your configured Stop Loss (%) and Take Profit (%) (or ATR-based if enabled). Fallback opens always include SL/TP.',
    },
    {
      title: 'When does the fallback close a position?',
      body: 'On your SL/TP, or on price-trigger cycles if net-of-fees profit exceeds Profit-close min net (bps).',
    },
    {
      title: 'Is "Default Hold Window (hrs)" a hard limit?',
      body: 'No. It sets the planning horizon for fee and edge calculations. Actual time caps use PERP_MAX_HOLD_HOURS. Positions may close earlier or later based on conditions.',
    },
    {
      title: 'How are SL/TP chosen if the AI doesn\'t specify?',
      body: 'They are seeded from volatility: SL ~ ATR%, TP ~ ATR%. A trailing stop tightens as price moves. Updates obey hysteresis and pacing to reduce churn.',
    },
    {
      title: 'What is update hysteresis and pacing?',
      body: 'The bot only changes levels if the change is significant enough and enough time has elapsed. Each position has a max update count.',
    },
    {
      title: 'Why didn\'t it take a small profit?',
      body: 'Closes honor net-of-fees break-even: profit must exceed opening fees + hourly borrow + fixed costs before taking profit.',
    },
    {
      title: 'After a Stop Loss, why won\'t it reopen immediately?',
      body: 'A soft cooldown is applied per asset and side. If the edge is very strong, the bot may override and reopen sooner.',
    },
    {
      title: 'Does recent performance affect direction?',
      body: 'A small directional bias is derived from the last 25 outcomes per asset. It nudges decisions but is capped to avoid overfitting.',
    },
    {
      title: 'Why are new opens blocked?',
      body: [
        'Risk utilization exceeded your Risk Limit. Utilization = total collateral / equity.',
        '',
        'Actions:',
        '- Raise Risk Limit (%) moderately (e.g., 15-20%), or',
        '- Use smaller collateral (lower Max Position Size), or',
        '- Lower Minimum Collateral (USD) if set high.',
      ].join('\n'),
    },
    {
      title: 'Why did my open fail with reason=RISK_CAP?',
      body: [
        'This is a per-trade sizing guard. It blocks opens when max loss at your Stop Loss would exceed your Per-Trade Risk Cap (%) of wallet equity.',
        '',
        'Remedies:',
        '- Lower "Minimum Collateral (USD)"',
        '- Reduce "Stop Loss (%)" (e.g., 5% -> 3%)',
        '- Increase Per-Trade Risk Cap (%) cautiously',
        '- Add ADA to wallet equity',
      ].join('\n'),
    },
    {
      title: 'How do Stop Loss (%) and Take Profit (%) interact?',
      body: 'Stop Loss: Default invalidation distance. Lower SL increases allowed collateral but risks getting stopped more easily.\n\nTake Profit: Default profit target. Larger TP targets bigger moves (fewer fills); smaller TP realizes profits sooner.',
    },
    {
      title: 'Does "Max Position Size (ADA)" cap collateral or total position?',
      body: 'It caps ADA collateral per trade. Notional exposure = collateral x leverage.\n\nExample: maxPositionSizeAda=300; leverage=5x -> collateral <= 300 ADA; notional ~ 1,500 ADA.',
    },
    {
      title: '"Minimum collateral" errors',
      body: 'Strike enforces a USD floor per position. Too many small opens can fail this check. Consider higher per-trade collateral or fewer concurrent opens.',
    },
    {
      title: 'Babel Fees',
      body: [
        'Transactions may be rewritten via Babel Fees. If a trade fails:',
        '',
        '- `[BABEL] No AGENT source UTxO large enough` — Fund wallet with AGENT.',
        '- `INSUFFICIENT_FEE_TOKEN` — Wallet AGENT balance too low.',
        '- `TANK_MIN_ADA` — Shared Tank needs ADA top-up; contact ops.',
      ].join('\n'),
    },
    {
      title: 'Supported assets',
      body: 'ADA, SNEK, WMTX, IAG, BTC (beta).',
    },
  ],

  prediction: [
    {
      title: 'What does Prediction Mode do?',
      body: 'Prediction Mode uses AI (via T-Backend and Bodega data) to predict asset movements. Roughly every 2 hours, the bot analyzes assets and buys only when confidence meets your threshold.\n\nIt\'s selective—expect fewer, higher-conviction trades when confidence is high.',
    },
    {
      title: 'Prediction Mode settings explained',
      body: [
        '- **Min Confidence**: Required AI confidence (0-1). 0.60 = 60%. Higher = fewer, stronger trades.',
        '- **Max Position %**: Max share of portfolio per prediction trade.',
        '- **Min ADA Floor**: Minimum ADA to keep. Buys won\'t violate this floor.',
        '- **Allow limit orders**: Use limit orders instead of market. May not fill; default off.',
      ].join('\n'),
    },
    {
      title: 'Common prediction logs and what they mean',
      body: [
        '- `[PREDICTION] No markets available` — No asset met filters; will retry later.',
        '- `HOLD ... low confidence` — Below Min Confidence; lower threshold to allow more trades.',
        '- `BUY skipped ... overweight ...` — Would exceed Max Position %; reduce exposure or raise cap.',
        '- `BUY skipped ... cooldown active` — Cooldown window; will resume later.',
        '- `BUY gated by ADA floor` — Would breach ADA Floor; bot may attempt funding sell first.',
      ].join('\n'),
    },
  ],
};

// Helper to get FAQ count per category
export function getFaqCount(category: FaqCategory): number {
  return FAQS[category].length;
}

// Get all categories
export function getFaqCategories(): FaqCategory[] {
  return Object.keys(FAQS) as FaqCategory[];
}
