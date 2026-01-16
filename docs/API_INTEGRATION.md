# API Integration Layer - Complete Guide

## Overview

This document describes the comprehensive API integration layer built for the HUD dashboard. The system provides a seamless bridge between the UI and production backend, with intelligent mock data fallbacks for development.

## Architecture

```
┌─────────────────┐
│  HUD Dashboard  │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Hooks   │  ← useAgentList, useBotHealth, etc.
    └────┬─────┘
         │
  ┌──────▼──────────┐
  │  Agent Service  │  ← Environment-aware API layer
  └──────┬──────────┘
         │
    ┌────▼─────┐
    │ Backend  │  ← Retry logic, error handling
    │ API      │
    └──────────┘
```

## Components

### 1. Type System (`/app/features/agents/types.ts`)

**Adapter Types** - Map production API responses to HUD formats:

```typescript
interface DeployedBotResponse {
  id: string;
  bot_name: string;
  status: 'configured' | 'running' | 'stopped' | 'error';
  bot_mode: 'standard' | 'prediction' | 'perps' | 'tMode';
  bot_chain: 'cardano' | 'solana' | 'base';
  wallet_address: string;
  last_activity: string;
}

// Mapping helpers
const modeToRole = {
  standard: 'Balanced',
  tMode: 'AI Trading',
  prediction: 'Predictor',
  perps: 'Leveraged'
};

const statusToAgentStatus = {
  running: 'running',
  configured: 'stopped',
  stopped: 'stopped',
  error: 'error'
};
```

### 2. Agent Service (`/app/features/agents/api/agentService.ts`)

**Environment-based Toggle:**
```typescript
const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
  process.env.NEXT_PUBLIC_DATA_MODE !== 'backend';
```

**Features:**
- Automatic retry logic with exponential backoff
- Safe JSON parsing with fallbacks
- Development-mode error logging
- Mock data simulation with delays
- Type-safe production API integration

**Key Methods:**

| Method | Mock | Production Endpoint |
|--------|------|---------------------|
| `getAll()` | Returns mock agents | `GET /api/bot/admin/deployed-bots` |
| `getById(id)` | Returns mock agent | `GET /api/bot/user/:id/status` + `/config` |
| `getSummary()` | Calculated from mock | `GET /api/bot/summary` |
| `getConfig(id)` | Transforms mock settings | `GET /api/bot/config/:id` |
| `updateConfig(id, config)` | Updates mock | `PUT /api/bot/config/:id` |
| `startBot(id)` | Updates mock status | `POST /api/bot/start` |
| `stopBot(id)` | Updates mock status | `POST /api/bot/stop` |

### 3. React Hooks (`/app/hooks/`)

#### Agent Hooks

**`useAgentList()`** - Primary hook for agent management
```typescript
const { agents, listItems, isLoading, error, refetch } = useAgentList();
```

**`useAgent(agentId)`** - Single agent fetch
```typescript
const { agent, isLoading, error, refetch } = useAgent('agent-1');
```

**Utility hooks:**
- `useAgentsByStatus(status)` - Filter by status
- `useRunningAgentsCount()` - Count running agents
- `useAgentPerformanceSummary()` - Aggregate performance metrics

#### Risk Configuration

**`useRiskConfig(botId)`** - Manage risk settings
```typescript
const { config, isLoading, error, updateConfig, refetch } = useRiskConfig('bot-1');

await updateConfig({
  portfolioRisk: {
    maxOpenPositions: 15,
    maxSinglePositionPct: 20,
    maxDailyLossPct: 5,
  }
});
```

**Endpoints:**
- Mock: Returns default config with local state
- Backend: `GET /api/risk/config/:botId`
- Update: `PATCH /api/risk/config/:botId`

#### Wallet Balance

**`useWalletBalance(address, pollInterval)`** - Fetch wallet balance with polling
```typescript
const { balance, isLoading, error, refetch } = useWalletBalance(
  'addr1q9s6m9d8yedfcf...',
  30000 // Poll every 30s
);

// balance: { lovelace: string, tokens: Record<string, string> }
```

**Utility hooks:**
- `useAdaBalance(address)` - Human-readable ADA amount
- `useTokenBalance(address, tokenUnit)` - Specific token balance

**Endpoints:**
- Mock: Returns realistic mock balance
- Backend: `GET /api/indexer/balance?address=...`

#### Bot Health

**`useBotHealth(botId, pollInterval)`** - Health monitoring with auto-polling
```typescript
const { health, isLoading, error, refetch } = useBotHealth('bot-1', 15000);

// health.items: [
//   { label: 'Bot Status', value: 'RUNNING', status: 'ok' },
//   { label: 'Last Trade', value: '2m ago', status: 'ok' },
//   ...
// ]
```

**Utility hooks:**
- `useBotStatus(botId, pollInterval)` - Simplified status check
- `useHealthMetric(botId, metricLabel, pollInterval)` - Single metric

**Endpoints:**
- Mock: Returns 8 mock health items
- Backend: `GET /api/bot/health?botId=...`

## Configuration

### Environment Variables

```bash
# .env.local

# Data source control
NEXT_PUBLIC_DATA_MODE=backend          # 'demo' | 'backend'
NEXT_PUBLIC_USE_MOCK_DATA=false        # Override to force mock data

# API configuration (optional)
NEXT_PUBLIC_API_BASE_URL=              # Defaults to relative paths
```

### Next.js Rewrites

The system assumes Next.js rewrites are configured to proxy API requests:

```javascript
// next.config.ts
{
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Dev
      },
    ];
  }
}
```

## Error Handling

All components implement robust error handling:

### Retry Logic
```typescript
async function fetchWithRetry(url, options, maxRetries = 3) {
  // Exponential backoff: 1s, 2s, 4s (max 5s)
  // Don't retry 4xx errors (except 429)
  // Retry 5xx and 429 (rate limit)
}
```

### Error States
```typescript
const { data, isLoading, error } = useHook();

if (error) {
  // Error is always an Error instance
  console.error('Operation failed:', error.message);
}
```

### Fallbacks
- Failed API calls return sensible defaults (empty arrays, null values)
- Previous data is retained on polling errors
- Loading state only shown on initial fetch, not polls

## Mock Data

Comprehensive mock data for development:

### Mock Agent
```typescript
{
  id: 'agent-t',
  name: 'Agent T',
  mode: 't-mode',
  status: 'running',
  createdAt: '2025-11-15T10:30:00Z',
  settings: { /* Full settings structure */ },
  performance: {
    pnl24h: 127.45,
    pnl7d: 543.21,
    pnlTotal: 2341.87,
    trades24h: 12,
    winRate: 68,
  }
}
```

### Mock Risk Config
```typescript
{
  edgeAfterCost: { enabled: true, minNetEdgePct: 0.5, logSkipped: true },
  liquidityGuard: { enabled: true, maxImpactPct: 2.0, ... },
  cooldowns: { perAssetEnabled: true, winCooldownMinutes: 30, ... },
  portfolioRisk: { maxOpenPositions: 10, maxSinglePositionPct: 25, ... },
  dryRun: { enabled: false, logToDatabase: true, ... }
}
```

### Mock Balance
```typescript
{
  lovelace: '15234567890', // ~15,234 ADA
  tokens: {
    '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6.4d494e': '1000000',
    // More tokens...
  }
}
```

### Mock Health
```typescript
{
  botId: 'bot-1',
  status: 'running',
  items: [
    { label: 'Bot Status', value: 'RUNNING', status: 'ok' },
    { label: 'Last Trade', value: '2m ago', status: 'ok' },
    { label: 'API Connection', value: 'Connected', status: 'ok' },
    // 5 more items...
  ],
  lastCheck: '2026-01-07T12:34:56Z'
}
```

## Usage Patterns

### HUD Dashboard Integration

```typescript
'use client';

import {
  useAgentList,
  useBotHealth,
  useWalletBalance,
  useAgentPerformanceSummary,
} from '@/app/hooks';

export function HudDashboard() {
  // Fetch all agents
  const { agents, isLoading: agentsLoading } = useAgentList();

  // Monitor first agent health (15s polling)
  const { health } = useBotHealth(agents[0]?.id, 15000);

  // Monitor wallet balance (30s polling)
  const { balance } = useWalletBalance('addr1...', 30000);

  // Get performance summary
  const { totalPnl24h, averageWinRate } = useAgentPerformanceSummary();

  if (agentsLoading) return <LoadingSpinner />;

  return (
    <div>
      <AgentGrid agents={agents} />
      <HealthPanel health={health} />
      <BalanceCard balance={balance} />
      <PerformanceCard pnl={totalPnl24h} winRate={averageWinRate} />
    </div>
  );
}
```

### Risk Configuration Panel

```typescript
import { useRiskConfig } from '@/app/hooks';
import { useState } from 'react';

export function RiskConfigPanel({ botId }: { botId: string }) {
  const { config, isLoading, updateConfig } = useRiskConfig(botId);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (updates: Partial<RiskConfig>) => {
    setIsSaving(true);
    try {
      await updateConfig(updates);
      alert('Configuration saved!');
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSave({ /* updated values */ });
    }}>
      {/* Form fields bound to config values */}
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Agent Control Panel

```typescript
import { useAgent } from '@/app/hooks';
import { agentService } from '@/app/features/agents/api/agentService';

export function AgentControls({ agentId }: { agentId: string }) {
  const { agent, refetch } = useAgent(agentId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStart = async () => {
    setIsUpdating(true);
    try {
      await agentService.startBot(agentId);
      await refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStop = async () => {
    setIsUpdating(true);
    try {
      await agentService.stopBot(agentId);
      await refetch();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h2>{agent?.name}</h2>
      <p>Status: {agent?.status}</p>
      <button onClick={handleStart} disabled={isUpdating}>
        Start
      </button>
      <button onClick={handleStop} disabled={isUpdating}>
        Stop
      </button>
    </div>
  );
}
```

## Testing

### Development Mode
```bash
# Mock data (default)
npm run dev

# With backend API
NEXT_PUBLIC_DATA_MODE=backend npm run dev

# Force mock even with backend mode
NEXT_PUBLIC_USE_MOCK_DATA=true NEXT_PUBLIC_DATA_MODE=backend npm run dev
```

### Production Mode
```bash
# Ensure environment variables are set
NEXT_PUBLIC_DATA_MODE=backend
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

npm run build
npm start
```

## Migration Checklist

- [x] Create adapter types for production API responses
- [x] Add environment-based toggle to agentService
- [x] Implement retry logic with exponential backoff
- [x] Create useRiskConfig hook with CRUD operations
- [x] Create useWalletBalance hook with polling
- [x] Create useBotHealth hook with auto-polling
- [x] Create useAgentList and utility hooks
- [x] Add comprehensive mock data
- [x] Add error handling with fallbacks
- [x] Add loading states to all hooks
- [x] Document all endpoints and types
- [ ] Test with production backend
- [ ] Add integration tests
- [ ] Monitor error rates in production
- [ ] Add telemetry/analytics

## Production Endpoints Reference

### Bot Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bot/summary` | Bot summary statistics |
| GET | `/api/bot/config/:id` | Bot configuration |
| PUT | `/api/bot/config/:id` | Update bot configuration |
| POST | `/api/bot/start` | Start bot |
| POST | `/api/bot/stop` | Stop bot |
| GET | `/api/bot/user/:id/status` | Bot status (legacy) |
| GET | `/api/bot/admin/deployed-bots` | List all bots (admin) |

### Risk & Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/risk/config/:botId` | Get risk configuration |
| PATCH | `/api/risk/config/:botId` | Update risk configuration |
| GET | `/api/bot/health?botId=...` | Bot health status |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/indexer/balance?address=...` | Wallet balance |

## Performance Considerations

- **Polling intervals**: Default 15s for health, 30s for balance
- **Retry delays**: 1s, 2s, 4s (exponential backoff, max 5s)
- **Loading states**: Only shown on initial fetch, not on polls
- **Error retention**: Previous data kept on polling errors
- **Mock delays**: 300ms to simulate network latency

## Security Notes

- All production endpoints require proper authentication
- Wallet addresses are used for user identification
- `x-user-address` header injected via `withUserAddress()` helper
- Never expose API keys or sensitive data in client-side code
- Mock data should never be used in production

## Support

For issues or questions:
1. Check environment variables are set correctly
2. Review browser console for error logs (development mode)
3. Test with mock data to isolate API issues
4. Verify Next.js rewrites are configured
5. Check backend service is running and accessible
