# API Integration Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          HUD Dashboard UI                            │
│  (HudDashboard.tsx, AgentCards, HealthPanel, RiskPanel, etc.)      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Import hooks
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        React Hooks Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ useAgentList │  │ useRiskConfig│  │ useBotHealth │             │
│  │ useAgent     │  │              │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │useWalletBal. │  │  Utilities   │                                │
│  │              │  │  (filtering, │                                │
│  └──────────────┘  │   counting)  │                                │
│                     └──────────────┘                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Call service methods
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Agent Service Layer                             │
│                    (agentService.ts)                                 │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Environment Toggle (USE_MOCK_DATA)                         │   │
│  │  ├─ True:  Mock data with simulated delays                  │   │
│  │  └─ False: Production API with retry logic                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Retry Logic (fetchWithRetry)                               │   │
│  │  ├─ Exponential backoff: 1s, 2s, 4s                         │   │
│  │  ├─ Max 3 retries                                            │   │
│  │  ├─ Don't retry 4xx (except 429)                             │   │
│  │  └─ Retry 5xx and 429                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Error Handling                                              │   │
│  │  ├─ Safe JSON parsing                                        │   │
│  │  ├─ Development logging                                      │   │
│  │  ├─ Graceful fallbacks                                       │   │
│  │  └─ Type-safe responses                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌──────────────────┐         ┌──────────────────┐
    │   Mock Data      │         │  Production API  │
    │   (mockData.ts)  │         │  (via fetch)     │
    └──────────────────┘         └─────────┬────────┘
                                           │
                                           │ Next.js rewrites
                                           ▼
                                ┌──────────────────────┐
                                │  Backend Service     │
                                │  (Express + DB)      │
                                │  Port 3001           │
                                └──────────────────────┘
```

## Data Flow Diagram

### Demo Mode (Mock Data)
```
User Action
    │
    ▼
Hook Call (useAgentList)
    │
    ▼
agentService.getAll()
    │
    ├─ Check USE_MOCK_DATA === true
    │
    ▼
Return Mock Data
    │
    ├─ Simulate 300ms delay
    │
    ▼
Hook Updates State
    │
    ▼
UI Re-renders
```

### Backend Mode (Production API)
```
User Action
    │
    ▼
Hook Call (useAgentList)
    │
    ▼
agentService.getAll()
    │
    ├─ Check USE_MOCK_DATA === false
    │
    ▼
fetchWithRetry()
    │
    ├─ Attempt 1: fetch('/api/bot/admin/deployed-bots')
    │   │
    │   ├─ Success? → Parse JSON → Return
    │   │
    │   └─ 5xx Error? → Wait 1s → Retry
    │
    ├─ Attempt 2: fetch('/api/bot/admin/deployed-bots')
    │   │
    │   ├─ Success? → Parse JSON → Return
    │   │
    │   └─ 5xx Error? → Wait 2s → Retry
    │
    ├─ Attempt 3: fetch('/api/bot/admin/deployed-bots')
    │   │
    │   ├─ Success? → Parse JSON → Return
    │   │
    │   └─ Error? → Log → Return fallback
    │
    ▼
Hook Updates State
    │
    ▼
UI Re-renders
```

## Polling Flow

```
Component Mounts
    │
    ▼
useBotHealth('bot-1', 15000)
    │
    ├─ Initial fetch
    │   └─ setIsLoading(true)
    │   └─ Fetch data
    │   └─ setHealth(data)
    │   └─ setIsLoading(false)
    │
    ├─ Set interval (15000ms)
    │
    ▼
Every 15 seconds:
    │
    ├─ Fetch data (background)
    │   └─ Keep isLoading = false
    │   └─ Update health
    │   └─ On error: keep previous data
    │
    ▼
Component Unmounts
    │
    └─ Clear interval
```

## Type Transformation Flow

### Production API → UI Types

```
Backend Response:
{
  id: "user123",
  bot_name: "Atlas",
  status: "configured",     ─┐
  bot_mode: "tMode",        ─┤
  bot_chain: "cardano",     ─┤
  wallet_address: "addr1...",│
  last_activity: "2026-01-07"│
}                            │
                             │
                             │ Transform via adapter
                             │
                             ▼
UI Agent:
{
  id: "user123",
  name: "Atlas",
  status: "stopped",        ◄── statusToAgentStatus['configured']
  mode: "t-mode",           ◄── modeToAgentMode['tMode']
  createdAt: "2026-01-07T00:00:00Z",
  settings: { /* full settings */ },
  performance: { /* metrics */ }
}
```

## Hook State Management

```typescript
// Each hook maintains:
{
  data: T | null,           // The actual data
  isLoading: boolean,       // Loading state
  error: Error | null,      // Error state
  refetch: () => Promise    // Manual refresh function
}

// State transitions:
Initial: { data: null, isLoading: true, error: null }
    │
    ├─ Success: { data: T, isLoading: false, error: null }
    │
    └─ Failure: { data: null, isLoading: false, error: Error }

// Polling (subsequent fetches):
    │
    ├─ Success: { data: T (new), isLoading: false, error: null }
    │
    └─ Failure: { data: T (old), isLoading: false, error: Error }
         └─ Keep previous data on error
```

## Environment Configuration Flow

```
Application Start
    │
    ▼
Load Environment Variables
    │
    ├─ NEXT_PUBLIC_DATA_MODE = ?
    │   ├─ 'demo' → USE_MOCK_DATA = true
    │   └─ 'backend' → USE_MOCK_DATA = false
    │
    ├─ NEXT_PUBLIC_USE_MOCK_DATA = ?
    │   └─ 'true' → USE_MOCK_DATA = true (override)
    │
    ▼
Service Layer Initialization
    │
    ├─ USE_MOCK_DATA === true
    │   └─ All methods return mock data
    │
    └─ USE_MOCK_DATA === false
        └─ All methods call production API
```

## API Endpoint Mapping

```
Hook/Service Method              Production Endpoint
─────────────────────────────────────────────────────────────────
useAgentList()                → GET  /api/bot/admin/deployed-bots
useAgent(id)                  → GET  /api/bot/user/:id/status
                                GET  /api/bot/user/:id/config
useRiskConfig(id)             → GET  /api/risk/config/:id
  .updateConfig()             → PATCH /api/risk/config/:id
useWalletBalance(addr)        → GET  /api/indexer/balance?address=...
useBotHealth(id)              → GET  /api/bot/health?botId=...

agentService.getSummary()     → GET  /api/bot/summary
agentService.getConfig(id)    → GET  /api/bot/config/:id
agentService.updateConfig()   → PUT  /api/bot/config/:id
agentService.startBot(id)     → POST /api/bot/start
agentService.stopBot(id)      → POST /api/bot/stop
```

## Component Integration Pattern

```
┌─────────────────────────────┐
│   HudDashboard.tsx          │
│                             │
│  const { agents } =         │
│    useAgentList();          │
│                             │
│  const { health } =         │
│    useBotHealth(id, 15000); │
│                             │
│  return (                   │
│    <div>                    │
│      <AgentCard             │
│        agents={agents}      │
│      />                     │
│      <HealthPanel           │
│        health={health}      │
│      />                     │
│    </div>                   │
│  );                         │
└─────────────────────────────┘
```

## Error Recovery Flow

```
API Call Fails
    │
    ▼
fetchWithRetry() catches error
    │
    ├─ Network error? → Retry with backoff
    │
    ├─ 5xx error? → Retry with backoff
    │
    ├─ 429 rate limit? → Retry with backoff
    │
    ├─ 4xx client error? → Don't retry
    │   └─ Log in development
    │   └─ Return fallback value
    │
    └─ Max retries exceeded?
        └─ Log error
        └─ Return fallback value
            │
            ▼
Hook receives fallback
    │
    ├─ First fetch? → Set data to null/empty
    │
    └─ Polling? → Keep previous data
```

## Performance Optimization

```
┌─────────────────────────────────────────────────────────┐
│  Optimization Strategy                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Loading States                                      │
│     ├─ Initial: Show spinner                            │
│     └─ Polling: Background update (no spinner)          │
│                                                         │
│  2. Error Retention                                     │
│     └─ Keep previous data on polling errors             │
│                                                         │
│  3. Retry Strategy                                      │
│     ├─ Exponential backoff                              │
│     └─ Smart 4xx vs 5xx handling                        │
│                                                         │
│  4. Mock Delays                                         │
│     └─ 300ms simulated latency for realistic UX         │
│                                                         │
│  5. Interval Management                                 │
│     └─ Auto-cleanup on unmount                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Security Layer                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Authentication                                      │
│     └─ x-user-address header for all requests           │
│                                                         │
│  2. Environment Isolation                               │
│     ├─ Mock data only in development                    │
│     └─ Production uses backend authentication           │
│                                                         │
│  3. Error Handling                                      │
│     └─ Never expose sensitive data in errors            │
│                                                         │
│  4. API Keys                                            │
│     └─ All keys server-side only                        │
│                                                         │
│  5. HTTPS                                               │
│     └─ All production API calls over HTTPS              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Development Workflow

```
1. Local Development (Mock)
   ├─ NEXT_PUBLIC_DATA_MODE=demo
   └─ Fast iteration with mock data

2. Backend Testing
   ├─ NEXT_PUBLIC_DATA_MODE=backend
   ├─ Start backend service on :3001
   └─ Test real API integration

3. Staging
   ├─ Production-like environment
   └─ Real backend with test data

4. Production
   ├─ NEXT_PUBLIC_DATA_MODE=backend
   ├─ NEXT_PUBLIC_USE_MOCK_DATA=false
   └─ Real backend with production data
```
