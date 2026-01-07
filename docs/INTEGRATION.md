## Integration handoff: New ADAM UI → Existing production system

This repo is the **new UI layer**. The goal is to let a backend team plug it into the existing production system (see the production build in `_prod_build/adam-main/`) with minimal UI changes.

### Guiding principle
Keep **all backend coupling** behind a small "UI Data Contract" layer:
- Browser/UI calls **only** relative paths: `/api/*` and `/socket.io/*`
- Next.js rewrites proxy these to:
  - Production backend (Express + Socket.IO on port `3001`)
  - TapTools (via backend proxy)
  - Agent T backend (via backend proxy)

This makes swapping the backend source (local, staging, prod) a configuration change, not a UI refactor.

### Production Backend Compatibility
**See `docs/PROD_BACKEND_COMPAT.md` for the complete integration rules:**
- Always use relative URLs (no hardcoded hosts)
- Use `x-user-address` header for identity
- Socket.IO path is `/socket.io` (fixed)
- Key backend endpoints and routing patterns

---

## Current implemented contract (1 endpoint)

### 1) Equity curve (Portfolio Performance)

**Route:** `GET /api/portfolio/equity`

**Query params:**
- `address` (required): Cardano **stake address** (`stake1...`)
- `range`: `1H | 24H | 7D | 30D | ALL`
- `quote`: `ADA | USD | EUR | ETH | BTC` (default is `USD`)

**Response shape (high-level):**
- `points`: array of `{ time: <unixSeconds>, value: <number> }`
- `summary`: `{ startValue, endValue, change, changePct, ... }`

**Upstream (TapTools):**
- Base: `https://openapi.taptools.io/api/v1`
- Endpoint: `GET /wallet/value/trended`
- Auth: header `x-api-key`
- Docs: [TapTools API](https://openapi.taptools.io/)

**Note on `1H`:** TapTools wallet trended value is **4h cadence**, so the UI's `1H` view is currently a synthesized series built from the latest segment.

---

## Recommended "next contract" endpoints (for seamless implementation)

These are not implemented yet, but the UI layout expects them eventually:

### Portfolio
- `GET /api/portfolio/positions?address=<stake...>`
  - holdings + USD value + price
- `GET /api/portfolio/allocation?address=<stake...>`
  - `{ label, valueUsd, percent }[]` for donut
- `GET /api/portfolio/trades?address=<stake...>&limit=...`
  - normalized trades/swaps

### Agents / Squad
- `GET /api/agents` (or `?wallet=<stake...>`)
  - roster list + status + PnL
- `GET /api/agents/:id`
  - details for AgentDetailModal
- `POST /api/agents/:id/action` (start/stop/redeploy)

### Chat / reasoning
- `POST /api/t/chat`
  - server-side proxy to T backend
  - Docs: [T Backend Developer Guide](https://docs.fluxpointstudios.com/t-backend-developer-guide)

---

## Environment configuration

Create `.env.local`:

```bash
TAPTOOLS_API_KEY=...
NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS=stake1...
```

---

## Implementation checklist for backend/dev team

### Current State (Demo Mode)
- `/api/portfolio/equity` is handled by Next.js route handler (proxies TapTools directly)
- All other `/api/*` paths will proxy to production backend when `NEXT_PUBLIC_DATA_MODE=backend`

### When Switching to Backend Mode
- Set `NEXT_PUBLIC_DATA_MODE=backend` in `.env.local`
- Ensure production backend is running (port `3001` in dev, or `NEXT_PUBLIC_API_URL` in prod)
- Backend must implement the endpoints listed in `docs/PROD_BACKEND_COMPAT.md`
- Keep secrets server-side (TapTools `x-api-key`, T backend `api-key`)
- Confirm wallet identity source of truth (stake key aggregation preferred)
- Add caching (short TTL) for TapTools-heavy endpoints
- Ensure response shapes match the contract so UI remains unchanged

### Next.js Route Preservation
Some routes are intentionally handled by Next.js (not proxied):
- `/api/portfolio/equity` - Current TapTools proxy (can migrate to backend later)
- `/api/solana/*` - If we add Solana-specific handlers

All other `/api/*` routes proxy to the backend automatically via `next.config.ts` rewrites.
