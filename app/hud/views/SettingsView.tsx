import React from 'react';
import { HudPanel } from '../components/HudPanel';
import { UiStyleToggle } from '../../UiStyleToggle';
import { HudToggle } from '../components/controls/HudToggle';
import { SegmentSelector } from '../components/controls/SegmentSelector';
import styles from '../../styles/modal.module.css';
import settingsStyles from './SettingsView.module.css';

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
    updateSetting: (key: keyof SettingsViewProps['settings'], val: unknown) => void;
    onClose: () => void;
}

export const SettingsView = ({ settings, updateSetting, onClose }: SettingsViewProps) => {
    return (
        <div className={`${styles.modalOverlay} ${styles.isOpen}`} onClick={onClose}>
            <div className={styles.modalShell} onClick={(e) => e.stopPropagation()}>
                <HudPanel
                    title="SYSTEM CONSTANTS"
                    variant="glass"
                    accentVariant="both"
                    isCloseVariant={true}
                    onExpandClick={onClose}
                >
                    <div className={settingsStyles.content}>
                        {/* Left Column */}
                        <div className={settingsStyles.column}>
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
                                    disabled={true}
                                    comingSoon={true}
                                />
                                <SettingRow
                                    label="Theme Mode"
                                    desc="Toggle between Dark and Light appearances."
                                    value={settings.theme === 'light'}
                                    onChange={(v) => updateSetting('theme', v ? 'light' : 'dark')}
                                    disabled={true}
                                    comingSoon={true}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className={settingsStyles.column}>
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

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>
                                        Display Currency
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                                        Show values in USD or Token/Native units.
                                    </div>
                                    <SegmentSelector
                                        value={settings.displayCurrency}
                                        onChange={(v) => updateSetting('displayCurrency', v)}
                                        options={[
                                            { value: 'USD', label: 'USD' },
                                            { value: 'token', label: 'TOKEN' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </HudPanel>
            </div>
        </div>
    );
};

// Helper component
const SettingRow = ({
    label,
    desc,
    value,
    onChange,
    disabled = false,
    comingSoon = false,
}: {
    label: string;
    desc: string;
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    comingSoon?: boolean;
}) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto'
    }}>
        <div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                {label}
                {comingSoon && (
                    <span style={{
                        fontSize: 9,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 2,
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                    }}>
                        COMING SOON
                    </span>
                )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{desc}</div>
        </div>
        <HudToggle
            value={value}
            onChange={onChange}
            disabled={disabled}
        />
    </div>
);
