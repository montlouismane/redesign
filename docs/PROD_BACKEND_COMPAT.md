# Production Backend Compatibility Guide

This document defines the **non-negotiable integration rules** that both the **HUD** and **Classic** dashboard styles must follow to plug seamlessly into the production backend (`_prod_build/adam-main/dashboard/server.js`).

## Core Principles

1. **Always use relative URLs** - Never hardcode backend hosts in UI code
2. **Proxy via Next.js rewrites** - `/api/*` and `/socket.io/*` are proxied to the backend service
3. **Identity via headers** - Use `x-user-address` header for user identification
4. **No route collisions** - Don't create Next.js routes under `/api/*` unless explicitly preserved from proxy

## Backend Service Architecture

- **Service**: Express + Socket.IO server
- **Default Port**: `3001` (dev) / Kubernetes service DNS (prod)
- **Socket.IO Path**: `/socket.io` (fixed, non-configurable)
- **Health Endpoint**: `GET /api/health` (returns `{ status: 'healthy', ... }`)

## API Routing Rules

### Development
- Next.js rewrites `/api/*` → `http://localhost:3001/api/*`
- Next.js rewrites `/socket.io/*` → `http://localhost:3001/socket.io/*`

### Production
- If `NEXT_PUBLIC_API_URL` is set: proxy to that base URL
- Otherwise: proxy to Kubernetes service `dashboard-api-service:3001` (in-cluster) or relative paths (same-origin)

### Preserved Routes
Some Next.js API routes should **not** be proxied (handled by Next.js itself):
- `/api/portfolio/equity` (current TapTools proxy in Next.js)
- `/api/solana/*` (if we add Solana-specific Next.js handlers)

## Authentication & Identity

### Wallet-Based Identity
The system determines user identity from their **wallet address** (Cardano stake address, Solana address, or EVM address). This address is used to:
- Fetch user's bots/agents (`/api/bot/user-bots?walletAddress=...`)
- Fetch user's wallets (`/api/bot/wallets/all?userAddress=...`)
- Identify user for portfolio operations, analytics, etc.

**Implementation Pattern:**
- Use `WalletContext` (`app/contexts/WalletContext.tsx`) to manage current wallet identity
- Falls back to `NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS` env var in demo mode
- Persists to localStorage for user convenience
- In backend mode, wallet address is used for all API calls

### Header Pattern: `x-user-address`
Most backend endpoints expect/require a user identity header:

```typescript
headers: {
  'x-user-address': userAddress, // Cardano stake address or wallet address
  'Content-Type': 'application/json'
}
```

**Where it's required:**
- Admin endpoints (`/api/admin/*`, `/api/k8s/*`, `/api/observability/*`)
- Bot operations (`/api/bot/user/:id/start`, `/api/bot/user/:id/stop`, etc.)
- Portfolio operations (`/api/bot/user/:id/save-portfolio-simple`)
- Draft operations (`/api/bot/draft`)

**Where it's optional:**
- Read-only endpoints (`/api/taptools/*`, `/api/analytics/pnl`)
- Health checks (`/api/health`)

### Implementation Pattern
Always use a centralized helper to inject `x-user-address`:

```typescript
import { apiCall, withUserAddress } from '@/lib/backend/api';
import { useWalletAddress } from '@/app/contexts/WalletContext';

// In a component:
const walletAddress = useWalletAddress(); // Gets address from context
const res = await apiCall('/api/bot/user-bots', {
  headers: withUserAddress({}, walletAddress)
});
```

**Or use the hook:**
```typescript
import { useUserAgents } from '@/app/hooks/useUserAgents';

// Automatically uses wallet context and injects x-user-address header
const { agents, isLoading } = useUserAgents();
```

## Key Backend Endpoints (Reference)

### Bot Management (`/api/bot/*`)
- `GET /api/bot/user-bots?walletAddress=...` - List user's bots (requires `x-user-address` header)
- `GET /api/bot/wallets/all?userAddress=...` - List user's wallets (requires `x-user-address` header)
- `GET /api/bot/user/:id/status` - Bot status
- `GET /api/bot/user/:id/logs?lines=100` - Bot logs
- `POST /api/bot/user/:id/start` - Start bot (requires `x-user-address` header)
- `POST /api/bot/user/:id/stop` - Stop bot (requires `x-user-address` header)
- `POST /api/bot/user/:id/redeploy` - Redeploy bot (requires `x-user-address` header)
- `POST /api/bot/user/:id/save-portfolio-simple` - Save portfolio config (requires `x-user-address` header)

### TapTools Proxy (`/api/taptools/*`)
- `GET /api/taptools/portfolio?address=...` - Wallet positions
- `GET /api/taptools/trade-history?address=...&perPage=20` - Trade history
- `GET /api/taptools/token-price?unit=...` - Token price (ADA)
- `POST /api/taptools/token/prices` - Batch token prices

### Analytics (`/api/analytics/*`)
- `GET /api/analytics/pnl?walletId=...&mode=all&month=YYYY-MM` - PnL calendar
- `GET /api/analytics/pnl-details?walletId=...&day=YYYY-MM-DD&mode=all` - Daily PnL details

### Observability (`/api/observability/*`) - Admin Only
- `GET /api/observability/summary` - Error aggregation summary
- `GET /api/observability/group/:fingerprint` - Error group details
- Requires `x-user-address` header + admin allowlist check

### Assistant/Chat (`/api/assistant/*`, `/api/agentT/*`)
- `POST /api/chat` - Chat with Agent T
- `GET /api/assistant/notifications?wallet=...` - Notifications
- `GET /api/agentT/ui/suggestions?wallet=...&botId=...` - Agent T suggestions

### WebSocket (`/socket.io`)
- Path: `/socket.io` (fixed)
- Transport: **WebSocket only** (no polling fallback - causes 503 errors under load)
- Events: `dashboardUpdate`, `agentPnlUpdate`, `tradeExecuted`
- Connection:
```typescript
io({
  path: '/socket.io',
  transports: ['websocket'],  // MUST be websocket only
  upgrade: false,              // Prevent transport upgrade attempts
  auth: { walletAddress }
})
```

### Risk Configuration (`/api/risk/*`)
- `GET /api/risk/config/:botId` - Get risk settings (requires `x-user-address`)
- `PATCH /api/risk/config/:botId` - Update risk settings (requires `x-user-address`)
- `GET /api/risk/status/:botId` - Risk status (cooldowns, positions)
- `GET /api/risk/cooldowns/:botId` - Active cooldowns
- `DELETE /api/risk/cooldowns/:botId/:tokenUnit` - Clear specific cooldown

**Validation Ranges (enforced client-side):**
| Field | Min | Max |
|-------|-----|-----|
| `edgeAfterCost.minNetEdgePct` | 0 | 10 |
| `liquidityGuard.maxImpactPct` | 0.5 | 20 |
| `liquidityGuard.binarySearchIterations` | 1 | 16 |
| `partialExits.targets[].sellPct` | 0 | 100 |
| `portfolioRisk.maxOpenPositions` | 1 | 50 |
| `portfolioRisk.maxSinglePositionPct` | 1 | 100 |
| `portfolioRisk.maxDailyLossPct` | 1 | 50 |

## Environment Variables

### Required (Backend Mode)
- `NEXT_PUBLIC_API_URL` - Backend base URL (optional; defaults to relative paths)
- `NEXT_PUBLIC_DATA_MODE` - `demo` (default) or `backend`

### Optional (Current Demo Mode)
- `TAPTOOLS_API_KEY` - For `/api/portfolio/equity` Next.js route
- `NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS` - Default address for demo data

## Data Flow Examples

### Demo Mode (Current)
```
HudDashboard → useEquitySeries() → /api/portfolio/equity (Next.js route) → TapTools
```

### Backend Mode (Future)
```
HudDashboard → useEquitySeries() → apiCall('/api/taptools/portfolio') → Next.js rewrite → Backend :3001 → TapTools
```

## Migration Checklist (When Switching to Backend Mode)

- [ ] Set `NEXT_PUBLIC_DATA_MODE=backend` in `.env.local`
- [ ] Ensure `NEXT_PUBLIC_API_URL` points to backend (or leave unset for relative)
- [ ] Update hooks to use `apiCall()` instead of direct `fetch()`
- [ ] Add `x-user-address` header injection via `withUserAddress()`
- [ ] Test Socket.IO connection at `/socket.io`
- [ ] Verify health check: `GET /api/health`

## Handoff Readiness Checklist

The following items have been verified for production compatibility:

- [x] **WebSocket**: Uses `['websocket']` transport only (no polling)
- [x] **Auth Headers**: All hooks use `withUserAddress()` for `x-user-address` injection
- [x] **Risk Validation**: Client-side validation matches production ranges (`lib/validation/riskConfig.ts`)
- [x] **Portfolio Decimals**: Percentage values converted to 0-1 decimals before API calls
- [x] **Relative URLs**: All API calls use `/api/*` paths (proxied via Next.js)
- [x] **No Route Collisions**: Only preserved routes bypass proxy

## References

- Production backend: `_prod_build/adam-main/dashboard/server.js`
- Production UI adapter: `_prod_build/adam-main/ui/lib/dashboard-adapter.ts`
- Production UI API helper: `_prod_build/adam-main/ui/lib/api.ts`
- Production Next config: `_prod_build/adam-main/ui/next.config.js`

