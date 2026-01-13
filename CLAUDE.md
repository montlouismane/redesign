# CLAUDE.md - Project Context & Memory

> [!IMPORTANT]
> This file serves as the persistent memory for this project. Read this file at the start of every session.

## Tech Stack
- **Framework:** Next.js 16.1.0 (App Router)
- **Library:** React 19.2.3
- **Language:** TypeScript 5.x (Strict Mode)
- **Styling:** Tailwind CSS 4.x
- **3D:** Three.js 0.160.0 (@react-three/fiber)
- **State:** (Migration planned to Zustand/Jotai)
- **Package Manager:** npm

## Architectural Guidelines
- **Mobile First:** All new components *must* be mobile-responsive. Use Tailwind breakpoints (sm, md, lg, xl).
- **Component Splitting:** Avoid monolithic components. Large UIs (like `HudDashboard`) must be broken down.
- **Performance:**
  - Use `dynamic()` imports for heavy panels.
  - Optimize 3D scenes for mobile (throttle FPS).
  - Use `next/image` and `next/font`.

## Backend Integration Rules (Critical)
- **Relative URLs:** NEVER hardcode backend hosts. Use relative paths (`/api/*`) which are proxied.
- **Identity:** Always inject `x-user-address` header for authenticated calls.
- **Data Mode:** Check `NEXT_PUBLIC_DATA_MODE`. If `demo`, use mock data/Next.js routes. If `backend`, use full API integration.
- **Detailed Docs:** See `docs/PROD_BACKEND_COMPAT.md` and `docs/AGENT_HANDOFF.md` for specific API mappings.

## Workflows
- **Spec-Driven:** For complex features, creating a `@SPEC.md` using `.agent/SPEC_TEMPLATE.md` is mandatory.
- **Ralph Loop:** For background iteration, use the `npm run ralph` script to commit progress automatically.

## Lessons Learned (Memory)
- **Do not use `usafe-eval` in production CSP.**
- **`HudDashboard.tsx` is too large (2.5k lines).** Do not add to it; refactor from it.
- **Always check for existing KIs (Knowledge Items) before starting fresh research.**
- **On Windows, use PowerShell for multiline JSX file edits.** Bash heredocs fail when JSX contains single quotes (e.g., `'quality' | 'performance'`). Use PowerShell's `-replace` operator or `sed` for simple single-line replacements.
- **Complete state migrations atomically.** When refactoring state (e.g., consolidating settings), update ALL references in the same pass. Half-migrated state (interface updated but JSX still using old props) causes subtle type errors.

## HUD Architecture (Critical - Updated Jan 2026)

### File Structure - USE THESE FILES:
| Purpose | Correct File | DEPRECATED (don't use) |
|---------|--------------|------------------------|
| Main HUD component | `app/hud/HudView.tsx` | `app/HudDashboard.tsx` |
| Grid layout CSS | `app/styles/layout.module.css` | `app/HudDashboard.module.css` |
| Header/Nav CSS | `app/styles/header.module.css` | - |
| Header component | `app/hud/components/HudHeader.tsx` | - |

### Component Hierarchy:
```
app/page.tsx
  └── app/hud/HudView.tsx (main orchestrator)
        ├── app/hud/HudLayout.tsx (grid container)
        ├── app/hud/components/HudHeader.tsx
        └── app/hud/views/DashboardView.tsx (panels)
```

### Key Lessons from Mobile Responsiveness Work:
1. **The old `app/HudDashboard.tsx` (2.5k lines) is DEPRECATED** - it's not imported anywhere
2. **Styles are split**: `layout.module.css` (grid) + `header.module.css` (topbar/nav)
3. **Make incremental changes** - test build after EACH step, not all at once
4. **Three.js background**: Lives in `app/hud/components/ThreeBackground.tsx`, renders via HudLayout
5. **meshsdk conflict**: `@meshsdk/react` causes webpack "Cannot redefine property: chunk" error - stub out `useWalletTransaction.ts` if needed

### Rollback Commands:
```bash
git checkout app/hud/components/HudHeader.tsx
git checkout app/styles/header.module.css
git checkout app/styles/layout.module.css
```
