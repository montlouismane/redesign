/**
 * HUD Control Components
 *
 * A tactile control library for the agent settings panel.
 * Inspired by analog synthesizer controls and RPG character management UIs.
 *
 * Control-to-Value-Type Mapping:
 * - RotaryDial: Percentages (0-100%) - Circular 270° motion
 * - HorizontalSlider: Currency amounts (ADA/SOL) - Linear horizontal
 * - VerticalSlider: Time durations (minutes) - Linear vertical
 * - ToggleSwitch: Binary on/off states - Mechanical toggle
 * - SegmentSelector: Mode selection - Tab picker
 * - TagInput: Token lists - Multi-value text entry
 *
 * All numeric controls feature:
 * - Clickable value display for manual input
 * - +/- stepper buttons for fine adjustment
 * - Safe zone indicators (green highlight)
 * - Spring animations via @react-spring/web
 * - Audio feedback via Web Audio API
 */

// Core Controls
export { RotaryDial } from './RotaryDial';
export { MetallicDial } from './MetallicDial';
export { HorizontalSlider } from './HorizontalSlider';
export { VerticalSlider } from './VerticalSlider';
export { MetallicSlider } from './MetallicSlider';
export { ToggleSwitch } from './ToggleSwitch';
export { SegmentSelector } from './SegmentSelector';

// Input Components
export { ValueInput } from './ValueInput';
export { TagInput } from './TagInput';
export { AllocationEditor } from './AllocationEditor';

// Layout Components
export { CollapsibleSection } from './CollapsibleSection';

// Hooks
export { useClickSound } from './useClickSound';
