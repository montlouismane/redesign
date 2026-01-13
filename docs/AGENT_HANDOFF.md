# Agent System - Backend Integration Guide

This document provides everything the backend team needs to connect the new Agent Management UI to the existing production API.

---

## Quick Start

1. Open `app/features/agents/api/agentService.ts`
2. Replace mock implementations with real `fetch()` calls using the patterns below
3. The UI will work without any other changes

---

## Production API Alignment

The new UI is designed to integrate with the existing `/api/bot` endpoints. This section maps UI operations to production endpoints.

---

## Authentication

**Required Header:**
```
x-user-address: [wallet_address]
```

The wallet address is the primary user identifier throughout the system.

**Optional Headers:**
```
x-api-key: [api_key]              // Service-to-service calls
x-bot-auto-token: [token]         // Bot auto-scaling token
```

---

## Endpoint Mapping

### List All Bots (Agents)

**Production Pattern:**
```
GET /api/bot/user/:userId/status
Header: x-user-address: [wallet_address]
```

**Response:**
```json
{
  "status": "running",
  "pid": 12345,
  "running": true,
  "startTime": "2025-01-06T12:00:00Z",
  "uptime": 3600000,
  "responseTime": 45,
  "cached": false
}
```

**Note:** The production system manages bots per-user. To list all bots for a user, query the `deployed_bots` table or use:
```
GET /api/bot/admin/deployed-bots  (admin only)
```

---

### Get Bot Configuration

**Production Pattern:**
```
GET /api/bot/user/:userId/config
Header: x-user-address: [wallet_address]
```

**Response:**
```json
{
  "botMode": "standard",
  "botChain": "cardano",
  "portfolioSettings": {
    "targets": {
      "ADA": 0.5,
      "AGIX": 0.3,
      "MIN": 0.2
    },
    "tolerance": 0.05,
    "minAdaReserve": 50,
    "slippage": 0.01,
    "rebalanceIntervalMinutes": 60
  }
}
```

---

### Update Bot Configuration

**Production Pattern:**
```
POST /api/bot/user/:userId/update-portfolio
Header: x-user-address: [wallet_address]
Content-Type: application/json
```

**Request Body:**
```json
{
  "targets": {
    "ADA": 0.5,
    "ETH": 0.3,
    "SOL": 0.2
  },
  "tolerance": 0.05,
  "minAdaReserve": 50,
  "slippage": 0.01
}
```

**Alternative (full settings):**
```
POST /api/bot/user/:userId/save-portfolio-simple
```

**Request Body:**
```json
{
  "portfolioSettings": { ... },
  "botMode": "standard",
  "botChain": "cardano"
}
```

---

### Deploy New Bot (Create Agent)

**Production Pattern:**
```
POST /api/bot/deploy
Header: x-user-address: [wallet_address]
Content-Type: application/json
```

**Request Body:**
```json
{
  "userAddress": "addr1q...",
  "botMode": "standard",
  "botChain": "cardano",
  "portfolioSettings": {
    "targets": { "ADA": 1.0 },
    "tolerance": 0.05,
    "minAdaReserve": 50
  },
  "walletId": "uuid",
  "seed": "..."
}
```

**Response:**
```json
{
  "success": true,
  "deploymentId": "dashboard-local-standard",
  "status": "deploying"
}
```

---

### Start/Stop Bot

**Start:**
```
POST /api/bot/user/:userId/start
Header: x-user-address: [wallet_address]
```

**Stop:**
```
POST /api/bot/user/:userId/stop
Header: x-user-address: [wallet_address]
```

**Response:**
```json
{
  "success": true,
  "status": "running"
}
```

---

### Delete Bot

**Production Pattern:**
```
DELETE /api/bot/user/:userId
Header: x-user-address: [wallet_address]
```

**Note:** This stops the bot and removes the K8s deployment. Wallet data may be preserved separately.

---

## Bot Modes

The production system supports these modes:

| Mode | UI Label (HUD) | UI Label (Classic) | Description |
|------|----------------|-------------------|-------------|
| `standard` | STANDARD | Standard | Portfolio balance / rebalancing |
| `t-mode` | T-MODE | Advanced AI | AI-driven high-frequency trading |
| `perpetuals` | PERPS | Leverage | Strike Finance perpetuals |
| `prediction` | PREDICT | Predictions | Bodega prediction markets |
| `arbitrage` | - | - | Cross-DEX arbitrage (not in new UI) |
| `loans` | - | - | Surf/Fluid lending (not in new UI) |

**Critical Rule:** Only ONE active trading loop per bot. Standard mode runs portfolio balance; specialized modes have their own loops.

---

## Bot Status Values

```typescript
type BotStatus =
  | 'running'    // Bot is active and trading
  | 'stopped'    // Bot has been stopped
  | 'error'      // Bot encountered an error
  | 'unknown'    // Status cannot be determined
  | 'timeout'    // Health check timed out
  | 'not_found'; // Bot doesn't exist
```

---

## Error Response Format

Production uses this pattern:
```json
{
  "error": "error_code_snake_case",
  "details": "Human readable message",
  "hint": "Debugging hint (optional)"
}
```

**Common Error Codes:**
- `message_required`
- `wallet_and_botId_required`
- `chat_failed`
- `db_unavailable`
- `deployment_failed`

---

## Agent T Chat Integration

For the chat/AI features, use the existing assistant endpoint:

```
POST /api/assistant/chat
Header: x-user-address: [wallet_address]
Header: api-key: [t_backend_key]
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What's my portfolio performance?",
  "context": {
    "user": {
      "walletAddress": "addr1q...",
      "botId": "addr1q..."
    },
    "status": { ... },
    "settings": { ... }
  },
  "session_id": "optional-session-id",
  "output": "structured"
}
```

**Response:**
```json
{
  "reply": "Your portfolio is up 5.2% today...",
  "reply_json": { ... },
  "meta": {
    "output": "structured",
    "elapsedMs": 1234
  }
}
```

---

## Telemetry Endpoints

**Trade History:**
```
GET /api/bot/user/:userId/telemetry/trades
Header: x-user-address: [wallet_address]
```

**PnL Calendar:**
```
GET /api/assistant/telemetry/pnl-calendar/:wallet
Params: ?mode=all|perps|spot|prediction|tmode|arb &month=YYYY-MM &chain=cardano
```

**Bot Logs:**
```
GET /api/bot/user/:userId/logs
Params: ?lines=300
```

---

## Implementation Notes

### Mapping UI Agent to Production Bot

The new UI uses `Agent` with an `id` field. In production:
- `botId` = `userAddress` (wallet address is the unique identifier)
- Each user can have one bot per mode (not multiple bots of the same mode)

### Settings Structure Difference

**UI Model (new):**
```typescript
{
  settings: {
    standard: StandardSettings;
    tMode: TModeSettings;
    predictions: PredictionsSettings;
    perpetuals: PerpetualsSettings;
  }
}
```

**Production Model:**
```typescript
{
  botMode: 'standard',
  portfolioSettings: {
    targets: Record<string, number>;
    tolerance: number;
    minAdaReserve: number;
    slippage: number;
  }
}
```

The API service layer should transform between these formats.

---

## Environment Variables

```bash
# Production backend URL (defaults to relative path)
NEXT_PUBLIC_API_URL=https://your-backend.com

# T Backend for Agent chat
T_BACKEND_API_URL=https://t-backend.fluxpointstudios.com
T_BACKEND_KEY=your_api_key
```

---

## Rate Limiting

- Chat endpoint: 300 requests per 15 minutes
- Other endpoints: No documented limits (use reasonable throttling)

---

## Files to Modify

| File | Purpose |
|------|---------|
| `app/features/agents/api/agentService.ts` | Replace mock calls with production endpoints |
| `app/features/agents/types.ts` | May need to add production-specific types |

---

## Database Reference

**Key Tables:**
```sql
-- Bot deployments
deployed_bots (
  id,                    -- Primary key (botId = userAddress)
  user_address,          -- Wallet address
  wallet_id,             -- Wallet identifier
  bot_mode,              -- standard|t-mode|perpetuals|prediction
  bot_chain,             -- cardano|solana|base
  status,                -- running|stopped|error
  last_checked,          -- Timestamp
  platform_settings      -- JSON config
)

-- Trading telemetry
spot_outcomes (...)      -- Spot, prediction, arbitrage trades
perp_outcomes (...)      -- Perpetuals trades
```

---

## Questions?

Contact the frontend team if you need:
- Changes to the data model transformation
- Additional endpoint support
- WebSocket integration for real-time updates
