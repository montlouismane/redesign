# Agent Management System - Implementation Plan

## Overview

Build a unified agent/strategy management system that serves both UI modes:
- **HUD Mode**: "Agents" - slide-over panel, fluid animations, gamer aesthetic
- **Classic Mode**: "Strategies" - dedicated page, trustworthy, TradFi familiar

Same underlying data and logic, different presentation layers.

---

## Status: Phases 1-4 Complete

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Data Foundation | ✅ Complete | Types, hooks, API service layer |
| Phase 2: Shared UI Components | ✅ Complete | All settings forms, modals |
| Phase 3: HUD Mode Slide-Over | ✅ Complete | Animated panel with auto-save |
| Phase 4: Classic Mode Pages | ✅ Complete | Full-page strategy management |
| Phase 5: Navigation & State Sync | Pending | Deep linking, cross-mode sync |
| Phase 6: Polish & Edge Cases | Pending | Loading states, mobile, a11y |

---

## Agent Modes

Each agent can operate in one of four modes:

| Mode | Description | Risk Level |
|------|-------------|------------|
| **Standard** | Simple portfolio balancing | Low |
| **T-Mode** | AI advanced analytics, picks tokens based on market dynamics | Medium |
| **Predictions** | Trades on prediction markets | Medium-High |
| **Perpetuals** | Leverage trading | High |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SHARED LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  app/features/agents/                                            │
│  ├── types.ts                 # Agent, AgentMode, Settings types │
│  ├── constants.ts             # Mode definitions, defaults       │
│  ├── api/                                                        │
│  │   ├── agentService.ts      # API layer (placeholders for BE)  │
│  │   └── mockData.ts          # Sample agents for development    │
│  ├── hooks/                                                      │
│  │   ├── useAgent.ts          # Single agent CRUD + state        │
│  │   ├── useAgentList.ts      # All agents for sidebar           │
│  │   ├── useAgentSettings.ts  # Settings form state + validation │
│  │   ├── useCreateAgent.ts    # Create new agent                 │
│  │   └── useDeleteAgent.ts    # Delete with confirmation         │
│  └── components/                                                 │
│      ├── AgentProfile.tsx     # Avatar, name, status badge       │
│      ├── ModeSelector.tsx     # 4-mode toggle buttons            │
│      ├── RiskWarning.tsx      # Warning banners for risky modes  │
│      ├── CreateAgentModal.tsx # New agent wizard                 │
│      ├── DeleteConfirmation.tsx # "Are you sure?" modal          │
│      ├── ui/FormField.tsx     # Shared form primitives           │
│      └── settings/                                               │
│          ├── StandardSettings.tsx                                │
│          ├── TModeSettings.tsx                                   │
│          ├── PredictionsSettings.tsx                             │
│          └── PerpetualsSettings.tsx                              │
├─────────────────────────────────────────────────────────────────┤
│                     PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  HUD Mode (app/hud/)                 Classic Mode (app/classic/) │
│  ├── panels/                         ├── components/             │
│  │   └── AgentsPanel.tsx             │   └── ActiveStrategies... │
│  │       (sidebar list + new btn)    │       (dashboard card)    │
│  ├── components/                     └── views/                  │
│  │   └── HudAgentManager.tsx             ├── StrategiesListView  │
│  │       (render-props wrapper)          ├── StrategyDetailPage  │
│  └── views/                              └── StrategyNewPage     │
│      └── AgentDetailSlide.tsx        └── strategies/             │
│          (slide-over panel)              ├── [id]/page.tsx       │
│                                          └── new/page.tsx        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Data Foundation ✅ COMPLETE
**Goal:** Establish types, mock data, and core hooks

- [x] **1.1** Define TypeScript types for Agent, AgentMode, and all settings interfaces
- [x] **1.2** Create constants file with mode definitions, labels, icons, and default settings
- [x] **1.3** Build `useAgentList` hook - returns all agents with status/performance summary
- [x] **1.4** Build `useAgent(id)` hook - single agent state, update methods
- [x] **1.5** Build `useAgentSettings` hook - form state, validation, save/cancel logic
- [x] **1.6** Create mock data for 6 sample agents across all modes
- [x] **1.7** Create API service layer with placeholders for backend integration
- [x] **1.8** Build `useCreateAgent` hook - create new agent with defaults
- [x] **1.9** Build `useDeleteAgent` hook - hard delete with confirmation state

**Files created:**
- `app/features/agents/types.ts`
- `app/features/agents/constants.ts`
- `app/features/agents/api/agentService.ts`
- `app/features/agents/api/mockData.ts`
- `app/features/agents/hooks/*.ts` (5 hooks)
- `app/features/agents/index.ts`

---

### Phase 2: Shared UI Components ✅ COMPLETE
**Goal:** Build reusable components that work in both modes

- [x] **2.1** `AgentProfile` - displays avatar, editable name, status badge, created date
- [x] **2.2** `ModeSelector` - 4 large buttons for mode switching with confirmation for risky modes
- [x] **2.3** `StandardSettings` - portfolio balance slider, rebalance threshold, frequency
- [x] **2.4** `TModeSettings` - risk tolerance, max position, token whitelist, rebalance freq
- [x] **2.5** `PredictionsSettings` - market types, confidence threshold, max exposure
- [x] **2.6** `PerpetualsSettings` - leverage limit, stop loss, take profit, pair whitelist
- [x] **2.7** `RiskWarning` component for high-risk modes
- [x] **2.8** `CreateAgentModal` - new agent wizard (name, starting mode)
- [x] **2.9** `DeleteConfirmation` - "Are you sure?" modal with agent name

**Files created:**
- `app/features/agents/components/AgentProfile.tsx`
- `app/features/agents/components/ModeSelector.tsx`
- `app/features/agents/components/RiskWarning.tsx`
- `app/features/agents/components/CreateAgentModal.tsx`
- `app/features/agents/components/DeleteConfirmation.tsx`
- `app/features/agents/components/ui/FormField.tsx`
- `app/features/agents/components/settings/*.tsx` (4 forms)

---

### Phase 3: HUD Mode - Slide-Over Panel ✅ COMPLETE
**Goal:** Implement the fluid, animated agent detail experience

- [x] **3.1** Enhance `AgentsPanel.tsx` - make agent cards clickable, show selection state
- [x] **3.2** Create `AgentDetailSlide.tsx` - slide-over container with close button
- [x] **3.3** Implement slide animation (React Spring) - panel slides from left
- [x] **3.4** Add copper glow edge effect on the slide panel
- [x] **3.5** Integrate shared components (AgentProfile, ModeSelector, Settings)
- [x] **3.6** Style settings forms for HUD aesthetic (dark, glowing accents)
- [x] **3.7** Auto-save behavior with 1 second debounce
- [x] **3.8** Keyboard shortcut: Escape to close
- [x] **3.9** Wire up "Deploy New Agent" button to open CreateAgentModal
- [x] **3.10** Add delete button with confirmation modal
- [x] **3.11** Create `HudAgentManager` render-props wrapper for state management

**Files created:**
- `app/hud/views/AgentDetailSlide.tsx`
- `app/hud/views/AgentDetailSlide.module.css`
- `app/hud/components/HudAgentManager.tsx`

**Files modified:**
- `app/hud/panels/AgentsPanel.tsx` - added onAgentClick, onDeployClick props
- `app/hud/HudView.tsx` - integrated HudAgentManager

---

### Phase 4: Classic Mode - Strategy Page ✅ COMPLETE
**Goal:** Implement the trustworthy, full-page strategy management

- [x] **4.1** Create route structure: `app/classic/strategies/[id]/page.tsx`
- [x] **4.2** Build `StrategyDetailPage` with back navigation, header, sections
- [x] **4.3** Update `ActiveStrategiesCard` to use real agent data and link to pages
- [x] **4.4** Integrate shared components with Classic styling
- [x] **4.5** Add explicit Save/Cancel buttons (no auto-save)
- [x] **4.6** Add unsaved changes warning on navigation
- [x] **4.7** Help tooltips on complex settings
- [x] **4.9** Create route: `app/classic/strategies/new/page.tsx`
- [x] **4.10** Create `StrategyNewPage` with mode selection wizard
- [x] **4.11** Add delete button with confirmation modal
- [x] **4.12** Create `StrategiesListView` for Strategies tab

**Files created:**
- `app/classic/strategies/[id]/page.tsx`
- `app/classic/strategies/new/page.tsx`
- `app/classic/views/StrategyDetailPage.tsx`
- `app/classic/views/StrategyNewPage.tsx`
- `app/classic/views/StrategiesListView.tsx`

**Files modified:**
- `app/classic/components/ActiveStrategiesCard.tsx` - uses real agent data
- `app/classic/ClassicFinanceDashboard.tsx` - added strategies view

---

### Phase 5: Navigation & State Sync
**Goal:** Ensure seamless experience across the app

- [ ] **5.1** Update HUD sidebar to highlight selected agent
- [ ] **5.2** Update Classic sidebar to highlight current strategy
- [ ] **5.3** Deep linking support - `/hud?agent=agent-t` opens slide-over
- [ ] **5.4** Mode switch preservation - if viewing agent, stay on equivalent view
- [ ] **5.5** Real-time status updates in sidebar while editing

**Deliverable:** Navigation feels polished and connected

---

### Phase 6: Polish & Edge Cases
**Goal:** Production-ready quality

- [ ] **6.1** Loading states for all async operations
- [ ] **6.2** Error states and retry logic
- [ ] **6.3** Empty state - no agents yet, CTA to create first
- [ ] **6.4** Mobile responsive layouts for both modes
- [ ] **6.5** Keyboard accessibility audit
- [ ] **6.6** Animation performance optimization (will-change, GPU layers)
- [ ] **6.7** Unit tests for hooks
- [ ] **6.8** Integration tests for settings forms

**Deliverable:** Ship-ready agent management system

---

## Data Model

```typescript
// app/features/agents/types.ts

type AgentMode = 'standard' | 't-mode' | 'predictions' | 'perpetuals';
type AgentStatus = 'running' | 'idle' | 'error' | 'paused';

interface Agent {
  id: string;
  name: string;
  avatar: string | null;
  mode: AgentMode;
  status: AgentStatus;
  createdAt: string;            // ISO date

  settings: {
    standard: StandardSettings;
    tMode: TModeSettings;
    predictions: PredictionsSettings;
    perpetuals: PerpetualsSettings;
  };

  performance: {
    pnl24h: number;
    pnl7d: number;
    pnlTotal: number;
    trades24h: number;
    winRate: number;
  };
}
```

See `app/features/agents/types.ts` for complete type definitions.

---

## Mode Labels by UI Style

| Internal | HUD Label | Classic Label |
|----------|-----------|---------------|
| `standard` | STANDARD | Standard |
| `t-mode` | T-MODE | Advanced AI |
| `predictions` | PREDICT | Predictions |
| `perpetuals` | PERPS | Leverage |

---

## Resolved Decisions

1. **Agent Creation Flow** - ✅ HUD opens CreateAgentModal, Classic navigates to `/classic/strategies/new`
2. **Agent Deletion** - ✅ Hard delete with "Are you sure?" confirmation modal
3. **Backend Integration** - ✅ API service layer with placeholders. Dev team will connect to real endpoints.
4. **Auto-save vs Manual** - ✅ HUD uses auto-save (1s debounce), Classic uses explicit Save/Cancel
5. **Navigation** - ✅ Classic uses Next.js routes, HUD uses slide-over panel

## Open Questions

1. **Settings History** - Should we track settings changes over time? (audit log)
2. **Agent Limits** - Is there a max number of agents per user?
3. **Default Agent** - Should new users start with a pre-configured agent?

---

## Backend Integration Guide

See `docs/AGENT_HANDOFF.md` for complete backend integration instructions.

**Quick summary:** The `agentService.ts` is now aligned with production API patterns:
- Uses `/api/bot` base path (production endpoint)
- Includes `x-user-address` authentication header
- Mode name is `prediction` (singular, matching production)
- Status values match production: `running`, `stopped`, `error`, `unknown`, `timeout`, `not_found`
- Transformation helpers convert between UI format and production `portfolioSettings` format

Set `USE_MOCK_DATA = false` in `agentService.ts` to switch to production backend.

---

## Success Criteria

- [x] User can view all agents in sidebar (both modes)
- [x] User can click agent to see/edit settings (slide-over in HUD, page in Classic)
- [x] User can create new agents via existing "+ New" button
- [x] User can delete agents with confirmation ("Are you sure?" modal)
- [x] User can switch agent modes with appropriate warnings
- [x] User can customize all settings for each mode
- [x] Settings persist (mock for now, ready for API)
- [x] Experience feels native to each UI mode
- [x] API service layer ready for dev team to connect real endpoints
- [ ] Deep linking and navigation polish (Phase 5)
- [ ] Mobile responsive and accessible (Phase 6)
