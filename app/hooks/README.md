# API Integration Layer - Hooks

This directory contains React hooks for integrating the HUD dashboard with the production backend API.

## Overview

The integration layer provides:
- Environment-based toggle between mock and production data
- Automatic retry logic with exponential backoff
- Proper error handling with fallbacks
- Loading states for all operations
- Type-safe interfaces matching production API

## Environment Variables

```bash
# Control data source
NEXT_PUBLIC_DATA_MODE=backend          # 'demo' or 'backend'
NEXT_PUBLIC_USE_MOCK_DATA=false        # Override: 'true' to force mock data

# API configuration
NEXT_PUBLIC_API_BASE_URL=              # Optional: Backend base URL (defaults to relative paths)
```

## Hooks

### Agent Management

#### `useAgentList()`
Fetches and manages the list of all agents.

```typescript
const { agents, listItems, isLoading, error, refetch } = useAgentList();

// agents: Full Agent[] with all details
// listItems: AgentListItem[] lightweight for sidebar
```

#### `useAgent(agentId: string)`
Fetches a single agent by ID.

```typescript
const { agent, isLoading, error, refetch } = useAgent('agent-1');
```

#### Utility Hooks

```typescript
// Filter agents by status
const { agents, count } = useAgentsByStatus('running');

// Get running agents count
const { count, total } = useRunningAgentsCount();

// Get performance summary
const { totalPnl24h, totalTrades24h, averageWinRate } = useAgentPerformanceSummary();
```

### Risk Configuration

#### `useRiskConfig(botId: string)`
Manages bot risk configuration with CRUD operations.

```typescript
const { config, isLoading, error, updateConfig, refetch } = useRiskConfig('bot-1');

// Update config
await updateConfig({
  edgeAfterCost: {
    enabled: true,
    minNetEdgePct: 1.0,
    logSkipped: true,
  },
});
```

**Config Structure:**
```typescript
interface RiskConfig {
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
    virtualBalances: { cardano: { ADA: number } };
  };
}
```

### Wallet Balance

#### `useWalletBalance(walletAddress: string, pollInterval?: number)`
Fetches wallet balance from indexer with optional polling.

```typescript
const { balance, isLoading, error, refetch } = useWalletBalance(
  'addr1q9s6m9d8yedfcf...',
  30000 // Poll every 30 seconds
);

// balance: { lovelace: string, tokens: Record<string, string> }
```

#### Utility Hooks

```typescript
// Get ADA balance in human-readable format
const { ada, isLoading, error } = useAdaBalance(walletAddress);

// Get specific token balance
const { balance, isLoading, error } = useTokenBalance(
  walletAddress,
  'f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc53541474958'
);
```

### Bot Health

#### `useBotHealth(botId: string, pollInterval?: number)`
Fetches bot health status with automatic polling (default: 15 seconds).

```typescript
const { health, isLoading, error, refetch } = useBotHealth('bot-1', 15000);

// health: BotHealthResponse with status items
```

**Health Response:**
```typescript
interface BotHealthResponse {
  botId: string;
  status: AgentStatus;
  items: BotHealthItem[];
  lastCheck: string;
}

interface BotHealthItem {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error';
  timestamp?: string;
}
```

#### Utility Hooks

```typescript
// Get simplified status
const { status, isHealthy, isLoading } = useBotStatus('bot-1', 15000);

// Get specific health metric
const { metric, isLoading } = useHealthMetric('bot-1', 'API Connection', 15000);
```

## Agent Service

The underlying `agentService` provides:

```typescript
import { agentService } from '@/app/features/agents/api/agentService';

// Core operations
await agentService.getAll();              // List all agents
await agentService.getById(id);           // Get single agent
await agentService.create(payload);       // Create agent
await agentService.update(id, payload);   // Update agent
await agentService.delete(id);            // Delete agent

// Status operations
await agentService.start(id);             // Start agent
await agentService.stop(id);              // Stop agent
await agentService.setStatus(id, status); // Set status

// New operations
await agentService.getSummary();          // Get bot summary
await agentService.getConfig(id);         // Get bot config
await agentService.updateConfig(id, cfg); // Update config
await agentService.startBot(id);          // Start bot (new endpoint)
await agentService.stopBot(id);           // Stop bot (new endpoint)
```

## Production API Endpoints

### Bot Management
- `GET /api/bot/summary` - Bot summary
- `GET /api/bot/config/:id` - Bot configuration
- `PUT /api/bot/config/:id` - Update configuration
- `POST /api/bot/start` - Start bot
- `POST /api/bot/stop` - Stop bot
- `GET /api/bot/user/:id/status` - Bot status
- `GET /api/bot/user/:id/config` - Bot config (legacy)
- `POST /api/bot/user/:id/start` - Start bot (legacy)
- `POST /api/bot/user/:id/stop` - Stop bot (legacy)

### Risk Configuration
- `GET /api/risk/config/:botId` - Get risk config
- `PATCH /api/risk/config/:botId` - Update risk config

### Wallet & Health
- `GET /api/indexer/balance?address=...` - Wallet balance
- `GET /api/bot/health?botId=...` - Bot health status

## Mock Data

All hooks include realistic mock data for development:

```typescript
// Example mock agent
{
  id: 'agent-1',
  name: 'Atlas',
  mode: 't-mode',
  status: 'running',
  bot_chain: 'cardano',
  wallet_address: 'addr1q9s6m9d8yedfcf...',
  performance: {
    pnl24h: 234.56,
    winRate: 0.68,
    totalTrades: 1247
  }
}
```

## Error Handling

All hooks implement:
- Automatic retry with exponential backoff (max 3 retries)
- Graceful fallbacks on error
- Loading and error states
- Development-mode logging

```typescript
// Errors are captured and returned
const { data, error, isLoading } = useHook();

if (error) {
  console.error('Operation failed:', error.message);
}
```

## Usage Examples

### HUD Dashboard Integration

```typescript
'use client';

import {
  useAgentList,
  useBotHealth,
  useWalletBalance,
  useRiskConfig,
} from '@/app/hooks';

export function HudDashboard() {
  const { agents, isLoading } = useAgentList();
  const { health } = useBotHealth('bot-1', 15000);
  const { balance } = useWalletBalance('addr1...', 30000);
  const { config, updateConfig } = useRiskConfig('bot-1');

  // Use data in UI...
}
```

### Agent Control Panel

```typescript
import { useAgent } from '@/app/hooks';
import { agentService } from '@/app/features/agents/api/agentService';

export function AgentControls({ agentId }: { agentId: string }) {
  const { agent, refetch } = useAgent(agentId);

  const handleStart = async () => {
    await agentService.startBot(agentId);
    await refetch();
  };

  const handleStop = async () => {
    await agentService.stopBot(agentId);
    await refetch();
  };

  return (
    <div>
      <button onClick={handleStart}>Start</button>
      <button onClick={handleStop}>Stop</button>
    </div>
  );
}
```

## Type Safety

All hooks and services are fully typed with TypeScript:

```typescript
import type {
  Agent,
  AgentMode,
  AgentStatus,
  RiskConfig,
  WalletBalanceResponse,
  BotHealthResponse,
} from '@/app/features/agents/types';
```

## Testing

Switch between mock and production data easily:

```bash
# Development with mock data
NEXT_PUBLIC_DATA_MODE=demo npm run dev

# Development with production API
NEXT_PUBLIC_DATA_MODE=backend npm run dev

# Force mock data even in backend mode
NEXT_PUBLIC_USE_MOCK_DATA=true npm run dev
```

## Migration Path

1. Start with mock data: `NEXT_PUBLIC_DATA_MODE=demo`
2. Test UI components with realistic mock data
3. Switch to backend: `NEXT_PUBLIC_DATA_MODE=backend`
4. Verify API integration with production endpoints
5. Deploy with proper environment variables

## Notes

- All hooks use `'use client'` directive for Next.js 13+ App Router
- Polling intervals are configurable per hook
- Mock data persists in memory during development
- Production mode includes retry logic and error handling
- All API calls go through Next.js rewrites for proper proxying
