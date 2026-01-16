# Agent Settings Board

A comprehensive HUD-style settings interface for configuring AI trading agents across multiple trading modes.

## Overview

The Agent Settings Board provides a complete configuration system with:

- **RPG-style character card** - Agent profile with avatar, stats, and performance metrics
- **Mode selector** - Switch between Standard, T-Mode, Prediction, and Perpetuals strategies
- **Dynamic settings forms** - Mode-specific configuration options
- **Shared risk management** - Portfolio-wide risk controls
- **Collapsible sections** - Organized settings groups with expand/collapse
- **Help system** - Contextual help for each setting
- **HUD aesthetic** - Copper accents, glass morphism, dark theme

## File Structure

```
AgentSettingsBoard/
├── index.tsx                      # Main exports
├── AgentSettingsBoard.tsx         # Main container component
├── AgentProfileCard.tsx           # Character card with stats
├── CollapsibleSection.tsx         # Expandable section wrapper
├── HelpModal.tsx                  # Contextual help modal
├── RiskSettings.tsx               # Shared risk management
├── ModeSettings/
│   ├── TModeSettings.tsx          # T-Mode configuration
│   ├── StandardSettings.tsx       # Standard mode configuration
│   ├── PredictionSettings.tsx     # Prediction market configuration
│   └── PerpetualsSettings.tsx     # Perpetuals/futures configuration
├── AgentSettingsBoard.module.css  # Component styles
├── example.tsx                    # Usage examples
└── README.md                      # This file
```

## Installation

Components are ready to use. Simply import from the index:

```tsx
import { AgentSettingsBoard } from '@/app/hud/components/AgentSettingsBoard';
```

## Usage

### Basic Example

```tsx
import { AgentSettingsBoard } from '@/app/hud/components/AgentSettingsBoard';
import { useState } from 'react';

function MyDashboard() {
  const [agent, setAgent] = useState({
    id: 'agent-001',
    name: 'ATLAS',
    mode: 't-mode',
    chain: 'cardano',
    walletAddress: 'addr1q9s6...5s3',
    createdAt: '2024-01-15T10:30:00Z',
    status: 'running',
    performance: {
      pnl24h: 234.56,
      pnl24hPct: 2.3,
      winRate: 68,
      totalTrades: 1247,
      bestTrade: { pair: 'SNEK/ADA', profit: 89.23 }
    }
  });

  const [settings, setSettings] = useState({
    minBuyConfidence: 65,
    lowTierSize: 40,
    // ... other settings
  });

  const [riskSettings, setRiskSettings] = useState({
    edgeGateEnabled: false,
    liquidityGuardEnabled: true,
    maxOpenPositions: 10,
    // ... other risk settings
  });

  return (
    <AgentSettingsBoard
      agent={agent}
      settings={settings}
      riskSettings={riskSettings}
      onSettingsChange={(partial) => setSettings({ ...settings, ...partial })}
      onRiskSettingsChange={(partial) => setRiskSettings({ ...riskSettings, ...partial })}
      onModeChange={(mode) => setAgent({ ...agent, mode })}
      onNameChange={(name) => setAgent({ ...agent, name })}
      onAvatarChange={(file) => uploadAvatar(file)}
      onStart={() => startAgent()}
      onStop={() => stopAgent()}
      onUpdate={() => updateAgent()}
      onSave={() => saveSettings()}
    />
  );
}
```

## Component API

### AgentSettingsBoard

Main container component that orchestrates all settings sections.

**Props:**

```typescript
interface AgentSettingsBoardProps {
  agent: Agent;                                    // Agent data
  settings: AgentSettings;                         // Mode-specific settings
  riskSettings: RiskConfig;                        // Risk management config
  onSettingsChange: (partial: AgentSettings) => void;
  onRiskSettingsChange: (partial: RiskConfig) => void;
  onModeChange: (mode: AgentMode) => void;
  onNameChange: (name: string) => void;
  onAvatarChange: (file: File) => void;
  onStart: () => void;
  onStop: () => void;
  onUpdate: () => void;
  onSave: () => void;
}
```

### AgentProfileCard

Character card showing agent identity, status, and performance.

**Features:**
- Avatar upload (PNG/JPG, 128x128)
- Editable name field
- Status indicator (running/stopped/error)
- Wallet address with copy button
- Performance stats (24h PnL, win rate, trades)
- Action buttons (Start/Pause, Update, Settings scroll)

**Props:**

```typescript
interface AgentProfileCardProps {
  agent: Agent;
  onNameChange: (name: string) => void;
  onAvatarChange: (file: File) => void;
  onStart: () => void;
  onStop: () => void;
  onUpdate: () => void;
  onScrollToSettings?: () => void;
}
```

### Mode Settings Components

Each trading mode has its own settings component:

- **TModeSettings** - Signal-based momentum trading
- **StandardSettings** - Portfolio rebalancing
- **PredictionSettings** - Prediction market betting
- **PerpetualsSettings** - Perpetuals/futures trading

All follow the same pattern:

```typescript
interface ModeSettingsProps {
  settings: AgentSettings;
  onChange: (partial: AgentSettings) => void;
}
```

### RiskSettings

Shared risk management controls across all modes.

**Sections:**
- Edge Gate - Net edge validation
- Liquidity Guard - Market impact checks
- Cooldowns - Trade spacing rules
- Portfolio Risk - Position and loss limits
- Dry Run - Testing mode

### CollapsibleSection

Expandable container for settings groups.

```typescript
interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}
```

### ControlRow

Standardized layout for controls with labels.

```typescript
interface ControlRowProps {
  label: string;
  helper?: string;
  children: React.ReactNode;
}
```

## Type Definitions

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  avatar?: string;
  mode: 'standard' | 't-mode' | 'prediction' | 'perpetuals';
  chain: 'cardano' | 'solana' | 'base';
  walletAddress: string;
  createdAt: string;
  status: 'running' | 'stopped' | 'error';
  performance: {
    pnl24h: number;
    pnl24hPct: number;
    winRate: number;
    totalTrades: number;
    bestTrade?: {
      pair: string;
      profit: number;
    };
  };
}
```

### AgentSettings

Mode-specific settings (varies by mode):

```typescript
// T-Mode Settings
interface TModeSettings {
  minBuyConfidence: number;        // 10-100%, default 65
  lowTierSize: number;             // 40-1000 ADA, default 40
  midTierSize: number;             // 40-2000 ADA, default 80
  highTierSize: number;            // 40-5000 ADA, default 120
  stopLoss: number;                // 0.1-50%, default 10
  takeProfit: number;              // 1-100%, default 93
  priceTrigger: number;            // 0.5-10%, default 3.5
  reEntryCooldown: number;         // 1-1440 min, default 30
  minHoldTime: number;             // 1-120 min, default 30
  profitUnlock: number;            // 0-50%, default 20
  emergencyStop: number;           // -50 to 0%, default -6
  trailingUnlock: number;          // 0-20%, default 0
  tokenBlacklist: string[];
  paperTradingEnabled: boolean;
}
```

### RiskConfig

```typescript
interface RiskConfig {
  // Edge Gate
  edgeGateEnabled: boolean;
  minNetEdge: number;              // 0-10%, default 0.5
  logSkippedEdge: boolean;

  // Liquidity Guard
  liquidityGuardEnabled: boolean;
  maxImpact: number;               // 0.5-20%, default 3.0
  autoDownsize: boolean;
  skipIlliquid: boolean;

  // Cooldowns
  perAssetCooldownEnabled: boolean;
  winCooldown: number;             // 0-1440 min, default 15
  lossCooldown: number;            // 0-1440 min, default 60
  scratchCooldown: number;         // 0-1440 min, default 30

  // Portfolio Risk
  maxOpenPositions: number;        // 1-50, default 10
  maxSinglePosition: number;       // 1-100%, default 20
  maxDailyLoss: number;            // 1-50%, default 10

  // Dry Run
  dryRunEnabled: boolean;
  logToDatabase: boolean;
  virtualAda: number;              // 100-100000, default 10000
}
```

## Control Integration

**Current State:** Controls are placeholder stubs showing expected values.

**Expected Controls:**

Once `/app/hud/components/controls/` is available, replace placeholders with:

```tsx
import { RotaryDial } from '@/app/hud/components/controls/RotaryDial';
import { HorizontalSlider } from '@/app/hud/components/controls/HorizontalSlider';
import { VerticalSlider } from '@/app/hud/components/controls/VerticalSlider';
import { ToggleSwitch } from '@/app/hud/components/controls/ToggleSwitch';
import { TagInput } from '@/app/hud/components/controls/TagInput';
```

**Control Types:**

- **RotaryDial** - Circular dial for percentages, angles (0-360°)
- **HorizontalSlider** - Linear slider for ranges (sizes, amounts)
- **VerticalSlider** - Vertical slider for time/duration
- **ToggleSwitch** - Binary on/off switch
- **TagInput** - Multi-value string array editor

## Styling

Component uses HUD aesthetic with:

- Copper accent color: `#c47c48`
- Dark backgrounds with glass morphism
- Border glow effects on hover
- Smooth transitions and animations
- Custom scrollbars (hidden)
- Responsive layout

### CSS Variables

```css
--copper: #c47c48
--copperLight: #d58b6a
--copperDark: #b36a38
--bg: rgba(0, 0, 0, 0.16)
--border: rgba(196, 124, 72, 0.22)
--text: #e8e8ee
--textMuted: #a7a7b5
--positive: #35ff9b
--negative: #ff3b3b
--glass: rgba(12, 16, 22, 0.95)
```

## Accessibility

- Semantic HTML structure
- ARIA labels for buttons and inputs
- Keyboard navigation support
- Focus indicators
- Minimum 44px touch targets
- Color contrast compliance

## Performance Considerations

- Lazy loading for mode settings components
- Debounced input handlers (recommended for production)
- Optimistic UI updates
- Memoized complex calculations
- Virtual scrolling for long lists (if needed)

## State Management

### Local State (Simple)

Use React useState for simple cases:

```tsx
const [settings, setSettings] = useState(initialSettings);
```

### Context API (Medium)

Share state across components:

```tsx
const SettingsContext = createContext<SettingsState>(null);

<SettingsContext.Provider value={{ settings, setSettings }}>
  <AgentSettingsBoard ... />
</SettingsContext.Provider>
```

### Redux/Zustand (Complex)

For global state management:

```tsx
const settings = useSelector(state => state.agentSettings);
const dispatch = useDispatch();

<AgentSettingsBoard
  settings={settings}
  onSettingsChange={(partial) => dispatch(updateSettings(partial))}
/>
```

## Backend Integration

### REST API Example

```tsx
// Save settings
const handleSave = async () => {
  await fetch('/api/agents/atlas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settings, riskSettings })
  });
};

// Load settings
useEffect(() => {
  fetch('/api/agents/atlas')
    .then(res => res.json())
    .then(data => {
      setSettings(data.settings);
      setRiskSettings(data.riskSettings);
    });
}, []);
```

### WebSocket Example

```tsx
// Real-time updates
useEffect(() => {
  const ws = new WebSocket('ws://api.example.com/agents/atlas');

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    if (update.type === 'performance') {
      setAgent(prev => ({
        ...prev,
        performance: update.data
      }));
    }
  };

  return () => ws.close();
}, []);
```

## Customization

### Custom Themes

Override CSS variables:

```css
.customTheme {
  --copper: #00ff00;
  --bg: rgba(0, 50, 0, 0.2);
}
```

### Additional Modes

Create new mode component following existing pattern:

```tsx
// ModeSettings/CustomMode.tsx
export function CustomModeSettings({ settings, onChange }) {
  return (
    <CollapsibleSection title="Custom Settings">
      <ControlRow label="Custom Setting">
        <CustomControl value={settings.custom} />
      </ControlRow>
    </CollapsibleSection>
  );
}
```

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentProfileCard } from './AgentProfileCard';

test('copies wallet address on click', async () => {
  const agent = { /* mock data */ };
  render(<AgentProfileCard agent={agent} {...handlers} />);

  const copyBtn = screen.getByLabelText('Copy wallet address');
  fireEvent.click(copyBtn);

  expect(navigator.clipboard.writeText).toHaveBeenCalled();
});
```

### Integration Tests

```tsx
test('saves settings on save button click', async () => {
  const handleSave = jest.fn();
  render(<AgentSettingsBoard {...props} onSave={handleSave} />);

  // Make changes
  const slider = screen.getByLabelText('Min Buy Confidence');
  fireEvent.change(slider, { target: { value: 75 } });

  // Click save
  const saveBtn = screen.getByText('Save Changes');
  fireEvent.click(saveBtn);

  expect(handleSave).toHaveBeenCalled();
});
```

## Troubleshooting

### Controls Not Showing

If controls appear as placeholders, check that control components exist at:
`/app/hud/components/controls/`

### Styles Not Applied

Ensure CSS module is imported:
```tsx
import styles from './AgentSettingsBoard.module.css';
```

### Performance Issues

For large settings forms, consider:
- Debouncing input handlers
- Memoizing expensive calculations
- Code splitting mode components

## Future Enhancements

- [ ] Undo/redo functionality
- [ ] Settings presets/templates
- [ ] Bulk import/export
- [ ] Settings diff viewer
- [ ] Validation schema
- [ ] Real-time validation
- [ ] Settings history/audit log
- [ ] Multi-agent batch editing

## Contributing

When adding new features:

1. Follow existing component patterns
2. Maintain HUD aesthetic
3. Add TypeScript types
4. Update this README
5. Add usage examples
6. Test accessibility
7. Document safe ranges

## License

Part of Adam Dashboard project. See main project license.

## Support

For issues or questions, refer to main project documentation or create an issue in the repository.
