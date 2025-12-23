# ADAM Dashboard

Next.js 16 App Router dashboard UI for ADAM.

## Run locally

```bash
cd C:\Users\andre\adam-dashboard
npm install
npm run dev
```

## Routes
- `/`: Dashboard (App Router)
- `/squad`: Squad page

## Key files (start here)
- `app/page.tsx`: Dashboard UI (Bento layout + overlays)
- `app/layout.tsx`: Global layout + fonts + `ScrollXReset`
- `app/globals.css`: Global styles / materials / utilities
- `app/squad/page.tsx`: Squad page UI
- `app/squad/AgentDetailModal.tsx`: Squad modal
- `app/ScrollXReset.tsx`: Lock horizontal scroll guard

## Live data (TapTools equity curve)

The Portfolio Performance chart now **fetches an equity curve by stake address** via TapTools.

### Env vars
Create a `.env.local` in the repo root:

```bash
# Server-side (DO NOT expose publicly)
TAPTOOLS_API_KEY=your_taptools_key

# Client-side (safe to expose)
NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS=stake1...
```

### How it works
- The UI (in `app/page.tsx`) calls:
  - `GET /api/portfolio/equity?address=<stake...>&range=<1H|24H|7D|30D|ALL>&quote=USD`
- The server route handler proxies TapTools:
  - `GET https://openapi.taptools.io/api/v1/wallet/value/trended`
  - Auth header: `x-api-key: <TAPTOOLS_API_KEY>`

**Note:** TapTools wallet value trended data is in **4h intervals**; the `1H` tab is synthesized from the most recent segment.

## Agent / reasoning backend
If/when we wire chat + analysis to production, the plan is to call the T backend server-side using an API key.
Docs: `https://docs.fluxpointstudios.com/t-backend-developer-guide`