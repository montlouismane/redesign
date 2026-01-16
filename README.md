# ADAM Dashboard

Next.js 16 trading agent management dashboard with HUD-style interface.

## Tech Stack

- **Framework:** Next.js 16.1.0 (App Router)
- **Runtime:** React 19.2.3
- **Language:** TypeScript 5.x (Strict)
- **Styling:** Tailwind CSS 4.x + CSS Modules
- **3D:** Three.js 0.160.0 (@react-three/fiber)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local`:

```env
# Data Mode: 'demo' uses mock data, 'backend' uses real API
NEXT_PUBLIC_DATA_MODE=demo

# Force mock data (overrides DATA_MODE)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Default wallet for demo mode
NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS=stake1...

# TapTools API (server-side only)
TAPTOOLS_API_KEY=your_key_here
```

---

# Backend Integration Guide

This section documents all hooks and components that need backend wiring.

## Architecture Overview

```
app/
├── hud/                    # Main HUD interface
│   ├── components/         # Reusable HUD components
│   ├── panels/             # Dashboard panels
│   ├── views/              # Full-page views
│   └── constants/          # Tooltips, FAQs
├── features/agents/        # Agent management module
│   ├── api/                # Service layer + mock data
│   ├── hooks/              # Data fetching hooks
│   └── types.ts            # Type definitions
├── hooks/                   # Global hooks
├── api/                    # Next.js API routes
└── contexts/               # React contexts
```

---

## 1. Core Data Hooks

### Agent Management

| Hook | Location | Purpose | Backend Endpoint |
|------|----------|---------|------------------|
| `useAgent(id)` | `features/agents/hooks/` | Fetch single agent | `GET /api/bot/user/:userId/status` + `/config` |
| `useAgentList()` | `features/agents/hooks/` | Fetch all user agents | `GET /api/bot/admin/deployed-bots` |
| `useCreateAgent()` | `features/agents/hooks/` | Deploy new agent | `POST /api/bot/deploy` |
| `useDeleteAgent()` | `features/agents/hooks/` | Delete agent | `DELETE /api/bot/user/:userId` |
| `useAgentSettings(agent)` | `features/agents/hooks/` | Form state management | N/A (local state) |

### Portfolio & Analytics

| Hook | Location | Purpose | Backend Endpoint |
|------|----------|---------|------------------|
| `useUserAgents(wallet?)` | `hooks/` | User's agents list | `GET /api/bot/user-bots?walletAddress=...` |
| `useEquitySeries(range)` | `hooks/` | Portfolio equity curve | `GET /api/portfolio/equity` |
| `useAgentPnL(wallet, ids)` | `hooks/` | Agent P&L data | `GET /api/analytics/pnl-by-agent` |
| `useBotHealth(botId)` | `hooks/` | Health monitoring | `GET /api/bot/health?botId=...` |
| `useWalletBalance(addr)` | `hooks/` | Wallet balance | `GET /api/indexer/balance?address=...` |
| `useRiskConfig(botId)` | `hooks/` | Risk settings CRUD | `GET/PATCH /api/risk/config/:botId` |

### Activity & Transactions

| Hook | Location | Purpose | Backend Endpoint |
|------|----------|---------|------------------|
| `useActivityData(agentId)` | `AgentSettingsBoard/ActivityTab/` | Activity logs | `GET /api/bot/:botId/activity` |
| - | - | Transactions | `GET /api/bot/:botId/transactions` |

---

## 2. Required API Endpoints

### Agent CRUD

```typescript
// List user's agents
GET /api/bot/user-bots?walletAddress={address}
Headers: x-user-address: {address}
Response: { bots: Agent[] }

// Get agent status
GET /api/bot/user/:userId/status
Response: ProductionBotStatus

// Get agent config
GET /api/bot/user/:userId/config
Response: ProductionBotConfig

// Deploy new agent
POST /api/bot/deploy
Body: ProductionDeployRequest
Response: ProductionDeployResponse

// Update agent settings
POST /api/bot/user/:userId/update-portfolio
Body: UpdateAgentPayload
Response: Agent

// Start/Stop agent
POST /api/bot/user/:userId/start
POST /api/bot/user/:userId/stop
Response: Agent

// Delete agent
DELETE /api/bot/user/:userId
Response: 204 No Content
```

### Health & Monitoring

```typescript
// Bot health (polled every 15s)
GET /api/bot/health?botId={id}
Headers: x-user-address: {address}
Response: {
  health: [
    { label: "Bot Status", value: "Online", status: "success" },
    { label: "Uptime", value: "5d 14h 22m", status: "success" },
    { label: "ADA Balance", value: "1,234.56", status: "success" },
    // ... more metrics
  ]
}

// Wallet balance (polled)
GET /api/indexer/balance?address={address}
Response: { balance: "15234567890", formatted: "15,234.57 ADA" }
```

### Activity & Transactions

```typescript
// Activity logs
GET /api/bot/:botId/activity?limit={n}&offset={n}
Response: {
  entries: ActivityLogEntry[],
  total: number
}

// ActivityLogEntry shape:
{
  id: string,
  timestamp: string,      // ISO date
  level: 'info' | 'success' | 'warning' | 'error',
  message: string,
  details?: string
}

// Transactions
GET /api/bot/:botId/transactions?limit={n}&offset={n}
Response: {
  transactions: TransactionEntry[],
  total: number
}

// TransactionEntry shape:
{
  id: string,
  txHash: string,
  timestamp: string,
  pair: string,           // e.g., "ADA/SNEK"
  positionType: 'long' | 'short',
  entryPrice: number,
  exitPrice?: number,
  size: number,
  pnl?: number,
  pnlPercentage?: number,
  status: 'open' | 'closed' | 'pending'
}
```

### Risk Configuration

```typescript
// Get risk config
GET /api/risk/config/:botId
Response: RiskConfig

// Update risk config
PATCH /api/risk/config/:botId
Body: Partial<RiskConfig>
Response: RiskConfig

// RiskConfig shape (see types below)
```

### Analytics

```typescript
// P&L by agent
GET /api/analytics/pnl-by-agent?walletId={addr}&agentIds={ids}&range={range}
Response: {
  agents: [{
    id: string,
    name: string,
    pnl: number,
    pnlPercentage: number,
    trades: number
  }],
  combined: { totalPnl, totalPnlPercentage, totalTrades }
}
```

---

## 3. Type Definitions

### Agent Types

```typescript
// features/agents/types.ts

type AgentMode = 'standard' | 't-mode' | 'prediction' | 'perpetuals';
type AgentStatus = 'running' | 'stopped' | 'error' | 'unknown';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  mode: AgentMode;
  status: AgentStatus;
  walletAddress: string;
  createdAt: string;
  settings: AgentSettings;
  performance: AgentPerformance;
}

interface AgentSettings {
  standard: {
    targetAllocation: Record<string, number>;
    rebalanceThreshold: number;
    frequency: 'hourly' | 'daily' | 'weekly';
  };
  tMode: {
    riskTolerance: number;      // 0-100
    maxPositionSize: number;    // ADA
    whitelist: string[];
    blacklist: string[];
  };
  prediction: {
    marketTypes: string[];
    minConfidence: number;      // 0-100
    maxExposure: number;        // percentage
    maxPositions: number;
  };
  perpetuals: {
    maxLeverage: number;
    defaultLeverage: number;
    pairWhitelist: string[];
    stopLoss: number;           // percentage
    takeProfit: number;         // percentage
  };
}

interface AgentPerformance {
  totalPnL: number;
  pnl24h: number;
  pnl7d: number;
  winRate: number;
  totalTrades: number;
}
```

### Risk Config Types

```typescript
// From RiskSettings.tsx

interface RiskConfig {
  // Edge Gate
  edgeGateEnabled: boolean;
  minNetEdge: number;
  logSkippedEdge: boolean;

  // Liquidity Guard
  liquidityGuardEnabled: boolean;
  maxImpact: number;
  autoDownsize: boolean;
  skipIlliquid: boolean;

  // Cooldowns
  perAssetCooldownEnabled: boolean;
  winCooldown: number;          // minutes
  lossCooldown: number;
  scratchCooldown: number;

  // Portfolio Risk
  maxOpenPositions: number;
  maxSinglePosition: number;    // percentage
  maxDailyLoss: number;         // percentage

  // Safety Controls
  minHoldTime: number;          // seconds
  profitUnlock: number;         // percentage
  emergencyStop: number;        // percentage
  trailingUnlock: number;       // percentage

  // Partial Profit Taking
  partialExits: {
    enabled: boolean;
    targets: Array<{
      id: string;
      pnlPct: number;
      sellPct: number;
      trailingAfter?: boolean;
      trailingDistancePct?: number;
    }>;
  };

  // Dry Run
  dryRunEnabled: boolean;
  logToDatabase: boolean;
  virtualAda: number;
}
```

---

## 4. Component → Hook Mapping

### AgentSettingsBoard

```
AgentSettingsBoard/
├── AgentProfileCard     → agent prop (from useAgent)
├── StandardSettings     → settings.standard
├── TModeSettings        → settings.tMode
├── PredictionSettings   → settings.prediction
├── PerpetualsSettings   → settings.perpetuals
├── RiskSettings         → useRiskConfig(agentId)
└── ActivityTab          → useActivityData(agentId)
```

**Callbacks to implement:**
- `onStart()` → `POST /api/bot/user/:id/start`
- `onStop()` → `POST /api/bot/user/:id/stop`
- `onSave()` → `POST /api/bot/user/:id/update-portfolio`
- `onDelete()` → `DELETE /api/bot/user/:id`

### Dashboard Panels

| Panel | Data Hook | Refresh |
|-------|-----------|---------|
| AgentsPanel | `useAgentList()`, `useAgentPnL()` | On mount, manual |
| PerformancePanel | `useEquitySeries(range)` | On range change |
| SystemPanel | `useBotHealth(botId)` | Poll 15s |
| AllocationPanel | Portfolio data | On agent change |

---

## 5. Authentication

All API requests should include:

```typescript
headers: {
  'Content-Type': 'application/json',
  'x-user-address': walletAddress  // User's connected wallet
}
```

The `WalletContext` provides the current wallet address:

```typescript
import { useWalletAddress } from '@/contexts/WalletContext';

const { walletAddress } = useWalletAddress();
```

---

## 6. Mock Data Toggle

The service layer supports mock data for development:

```typescript
// features/agents/api/agentService.ts

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Mock data defined in mockData.ts
// 6 sample agents with various modes and statuses
```

To test with mock data:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

---

## 7. File Locations

```
# Hooks (implement backend calls here)
app/features/agents/hooks/
├── useAgent.ts           # Single agent fetch
├── useAgentList.ts       # Agent list fetch
├── useCreateAgent.ts     # Deploy new agent
└── useDeleteAgent.ts     # Delete agent

app/hooks/
├── useUserAgents.ts      # User's agents
├── useEquitySeries.ts    # Portfolio chart
├── useAgentPnL.ts        # P&L analytics
├── useBotHealth.ts       # Health monitoring
├── useWalletBalance.ts   # Wallet balance
└── useRiskConfig.ts      # Risk settings

# Service Layer
app/features/agents/api/
├── agentService.ts       # API calls + retry logic
└── mockData.ts           # Mock data for dev

# API Routes (Next.js)
app/api/
└── portfolio/equity/     # TapTools proxy (implemented)

# Types
app/features/agents/types.ts
```

---

## 8. Integration Checklist

### High Priority
- [ ] `GET /api/bot/user-bots` - Agent list
- [ ] `GET /api/bot/user/:id/status` - Agent status
- [ ] `GET /api/bot/user/:id/config` - Agent config
- [ ] `POST /api/bot/user/:id/start|stop` - Control agent
- [ ] `GET /api/bot/health` - Health monitoring
- [ ] `GET /api/bot/:id/activity` - Activity logs
- [ ] `GET /api/bot/:id/transactions` - Trade history

### Medium Priority
- [ ] `POST /api/bot/deploy` - Create agent
- [ ] `DELETE /api/bot/user/:id` - Delete agent
- [ ] `GET/PATCH /api/risk/config/:id` - Risk settings
- [ ] `GET /api/analytics/pnl-by-agent` - P&L data

### Already Implemented
- [x] `GET /api/portfolio/equity` - TapTools equity curve

---

## Design System

### Asymmetric Octagonal Corners

The HUD uses cut corners with asymmetric sizing:
- **Small cuts (TL, BR):** 6-14px
- **Large cuts (TR, BL):** 12-28px
- **Corner line widths:** 1px (small), 2px (large)

```css
--cut-s: 6px;
--cut-l: 12px;
--tl: var(--cut-s);
--tr: var(--cut-l);
--br: var(--cut-s);
--bl: var(--cut-l);

clip-path: polygon(
  var(--tl) 0,
  calc(100% - var(--tr)) 0,
  100% var(--tr),
  100% calc(100% - var(--br)),
  calc(100% - var(--br)) 100%,
  var(--bl) 100%,
  0 calc(100% - var(--bl)),
  0 var(--tl)
);
```

### Colors

```css
--copper: #c47c48;
--glass: rgba(12, 16, 22, 0.90);
--border: rgba(196, 124, 72, 0.3);
--text: rgba(232, 232, 238, 0.9);
--textMuted: #a7a7b5;
```

---

## Questions?

Contact the frontend team for clarification on any component or data flow.
