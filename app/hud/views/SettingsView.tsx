import React from 'react';
import { HudPanel } from '../components/HudPanel';
import { UiStyleToggle } from '../../UiStyleToggle';
import { X } from 'lucide-react';
import styles from '../../styles/modal.module.css'; // Reuse modal styles for subpanels

interface SettingsViewProps {
    settings: {
        uiStyle: string;
        displayCurrency: string;
        animationsEnabled: boolean;
        theme: string;
        notificationsEnabled: boolean;
        keyboardShortcutsEnabled: boolean;
        soundEffectsEnabled: boolean;
        dataDensity: 'comfortable' | 'compact';
        realtimePulseEnabled: boolean;
        reduceMotion: boolean;
    };
    updateSetting: (key: keyof SettingsViewProps['settings'], val: any) => void;
    onClose: () => void;
}

export const SettingsView = ({ settings, updateSetting, onClose }: SettingsViewProps) => {
    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', paddingBottom: 40 }}>
            <HudPanel
                title="SYSTEM CONSTANTS"
                variant="glass"
                accentVariant="both"
                isCloseVariant={true}
                onExpandClick={onClose}
            >
                <div style={{ padding: 20, display: 'grid', gap: 20 }}>

                    <div className={styles.subPanel}>
                        <div className={styles.subTitle}>INTERFACE MODE</div>
                        <div className={styles.subNote}>Select the global visual style of the ADAM system.</div>
                        <div style={{ height: 16 }} />
                        <UiStyleToggle />
                    </div>

                    <div className={styles.subPanel}>
                        <div className={styles.subTitle}>VISUAL PREFERENCES</div>
                        <div style={{ height: 16 }} />

                        <SettingRow
                            label="Animations & Effects"
                            desc="Enable WebGL background, particles, and heavy transitions."
                            value={settings.animationsEnabled}
                            onChange={(v) => updateSetting('animationsEnabled', v)}
                        />
                        <SettingRow
                            label="Reduced Motion"
                            desc="Simplify transitions and disable parallax."
                            value={settings.reduceMotion}
                            onChange={(v) => updateSetting('reduceMotion', v)}
                        />
                        <SettingRow
                            label="Data Density"
                            desc="Compact mode for higher information density."
                            value={settings.dataDensity === 'compact'}
                            onChange={(v) => updateSetting('dataDensity', v ? 'compact' : 'comfortable')}
                        />
                        <SettingRow
                            label="Theme Mode"
                            desc="Toggle between Dark and Light appearances."
                            value={settings.theme === 'light'}
                            onChange={(v) => updateSetting('theme', v ? 'light' : 'dark')}
                            onLabel="LIGHT"
                            offLabel="DARK"
                        />
                    </div>

                    <div className={styles.subPanel}>
                        <div className={styles.subTitle}>SYSTEM BEHAVIOR</div>
                        <div style={{ height: 16 }} />

                        <SettingRow
                            label="Real-time Pulse"
                            desc="Show live activity indicators."
                            value={settings.realtimePulseEnabled}
                            onChange={(v) => updateSetting('realtimePulseEnabled', v)}
                        />
                        <SettingRow
                            label="Keyboard Shortcuts"
                            desc="Enable hotkeys (press ? for list)."
                            value={settings.keyboardShortcutsEnabled}
                            onChange={(v) => updateSetting('keyboardShortcutsEnabled', v)}
                        />
                        <SettingRow
                            label="Sound Effects"
                            desc="Play UI interaction sounds."
                            value={settings.soundEffectsEnabled}
                            onChange={(v) => updateSetting('soundEffectsEnabled', v)}
                        />
                    </div>

                    <div className={styles.subPanel}>
                        <div className={styles.subTitle}>DATA DISPLAY</div>
                        <div style={{ height: 16 }} />

                        <SettingRow
                            label="Display Currency"
                            desc="Show values in USD or Token/Native units."
                            value={settings.displayCurrency === 'token'}
                            onChange={(v) => updateSetting('displayCurrency', v ? 'token' : 'USD')}
                            onLabel="TOKEN"
                            offLabel="USD"
                        />
                    </div>
                </div>
            </HudPanel>
        </div>
    );
};

// Helper component
const SettingRow = ({
    label,
    desc,
    value,
    onChange,
    onLabel = "ON",
    offLabel = "OFF"
}: {
    label: string,
    desc: string,
    value: boolean,
    onChange: (v: boolean) => void,
    onLabel?: string,
    offLabel?: string
}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</div>
        </div>
        <button
            type="button"
            onClick={() => onChange(!value)}
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 2,
                cursor: 'pointer',
                padding: 2
            }}
        >
            <div style={{
                padding: '4px 8px',
                fontSize: 10,
                background: !value ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: !value ? 'white' : 'rgba(255,255,255,0.4)',
                borderRadius: 1
            }}>{offLabel}</div>
            <div style={{
                padding: '4px 8px',
                fontSize: 10,
                background: value ? 'var(--accent)' : 'transparent',
                color: value ? 'black' : 'rgba(255,255,255,0.4)',
                fontWeight: value ? 'bold' : 'normal',
                borderRadius: 1
            }}>{onLabel}</div>
        </button>
    </div>
);
