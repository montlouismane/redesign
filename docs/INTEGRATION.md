## Integration handoff: New ADAM UI â†’ Existing production system

This repo is the **new UI layer**. The goal is to let a backend team plug it into the existing production system (see the legacy copy in `adam-reference/` locally) with minimal UI changes.

### Guiding principle
Keep **all backend coupling** behind a small â€œUI Data Contractâ€ layer:
- Browser/UI calls **only** `GET/POST /api/*` endpoints exposed by this app (or an API gateway that implements the same contract).
- Those endpoints proxy to:
  - production backend
  - TapTools
  - T backend

This makes swapping the backend source (local, staging, prod) a configuration change, not a UI refactor.

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

**Note on `1H`:** TapTools wallet trended value is **4h cadence**, so the UIâ€™s `1H` view is currently a synthesized series built from the latest segment.

---

## Recommended â€œnext contractâ€ endpoints (for seamless implementation)

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
- Decide where `/api/*` runs:
  - Keep in this Next.js app (route handlers), or
  - Implement the same contract in the production backend/API gateway.
- Keep secrets server-side (TapTools `x-api-key`, T backend `api-key`).
- Confirm wallet identity source of truth:
  - stake key aggregation preferred.
- Add caching (short TTL) for TapTools-heavy endpoints.
- Ensure response shapes match the contract so UI remains unchanged.