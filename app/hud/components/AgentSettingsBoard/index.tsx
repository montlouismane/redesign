/**
 * Agent Settings Board Components
 *
 * A comprehensive settings interface for configuring trading agents
 * with different modes (Standard, T-Mode, Prediction, Perpetuals).
 *
 * Main Components:
 * - AgentSettingsBoard: Main container with mode selector
 * - AgentProfileCard: RPG-style character card with stats
 * - TModeSettings, StandardSettings, etc: Mode-specific config
 * - RiskSettings: Shared risk management controls
 * - HelpModal: Contextual help system
 *
 * Usage Example:
 * ```tsx
 * import { AgentSettingsBoard } from '@/app/hud/components/AgentSettingsBoard';
 *
 * function MyComponent() {
 *   const [agent, setAgent] = useState(initialAgent);
 *   const [settings, setSettings] = useState(initialSettings);
 *   const [riskSettings, setRiskSettings] = useState(initialRiskSettings);
 *
 *   return (
 *     <AgentSettingsBoard
 *       agent={agent}
 *       settings={settings}
 *       riskSettings={riskSettings}
 *       onSettingsChange={(partial) => setSettings({ ...settings, ...partial })}
 *       onRiskSettingsChange={(partial) => setRiskSettings({ ...riskSettings, ...partial })}
 *       onModeChange={(mode) => setAgent({ ...agent, mode })}
 *       onNameChange={(name) => setAgent({ ...agent, name })}
 *       onAvatarChange={(file) => uploadAvatar(file)}
 *       onStart={() => startAgent()}
 *       onStop={() => stopAgent()}
 *       onUpdate={() => updateAgent()}
 *       onSave={() => saveAllSettings()}
 *     />
 *   );
 * }
 * ```
 *
 * Note: Controls are placeholder stubs until /app/hud/components/controls/ is implemented.
 * Expected controls:
 * - RotaryDial: Circular dial for percentage/angle values
 * - HorizontalSlider: Linear slider for ranges
 * - VerticalSlider: Vertical slider for time/duration
 * - ToggleSwitch: On/off switch
 * - TagInput: Multi-value tag editor
 */

export { AgentSettingsBoard } from './AgentSettingsBoard';
export type { AgentSettings, RiskConfig, AgentSettingsBoardProps } from './AgentSettingsBoard';

export { AgentProfileCard } from './AgentProfileCard';
export type { Agent, AgentMode, AgentChain, AgentStatus, AgentPerformance, AgentProfileCardProps } from './AgentProfileCard';

export { CollapsibleSection, ControlRow } from './CollapsibleSection';
export type { CollapsibleSectionProps, ControlRowProps } from './CollapsibleSection';

export { HelpModal, HELP_CONTENT } from './HelpModal';
export type { HelpModalProps, HelpItem } from './HelpModal';

export { RiskSettings } from './RiskSettings';
export { TModeSettings } from './ModeSettings/TModeSettings';
export { StandardSettings } from './ModeSettings/StandardSettings';
export { PredictionSettings } from './ModeSettings/PredictionSettings';
export { PerpetualsSettings } from './ModeSettings/PerpetualsSettings';
