export const HUD_TOKENS = {
    colors: {
        bg0: '#07070a',
        bg1: '#0b0b10',
        text: '#e8e8ee',
        muted: '#a7a7b5',
        accent: 'rgb(196, 124, 72)',
        accentHot: 'rgb(213, 139, 106)',
        black: '#000000',
        white: '#ffffff',

        // Transparent / Alpha variants
        accentAlpha: (opacity: number) => `rgba(196, 124, 72, ${opacity})`,
        accentHotAlpha: (opacity: number) => `rgba(213, 139, 106, ${opacity})`,
    },

    typography: {
        fontBody: 'var(--font-orbitron)',
        fontDisplay: 'var(--font-orbitron)',
        // Standard sizes
        sizeXS: '10px',
        sizeS: '12px',
        sizeM: '14px',
        sizeL: '16px',
        sizeXL: '20px',
        size2XL: '24px',
        size3XL: '32px',
        size4XL: '48px',
    },

    spacing: {
        unit: 4,
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
        // Corresponding to common panel padding
        panelPad: 18,
    },

    layout: {
        panelRadius: 12,
        cutS: 19,
        cutL: 33,
        // Border widths
        borderThin: 1,
        borderThick: 2,
    },

    animation: {
        durationFast: 0.2,
        durationNormal: 0.3,
        durationSlow: 0.5,

        // Easing curves (approximate to common CSS eases)
        easeOutExpo: [0.19, 1, 0.22, 1],
        easeInOutCubic: [0.65, 0, 0.35, 1],
    },

    zIndices: {
        base: 0,
        panel: 10,
        accent: 15,
        overlay: 50,
        modal: 100,
        tooltip: 200,
    }
} as const;

// Helper to get font string
export const getFont = (variant: 'body' | 'display' = 'body') => {
    return variant === 'display' ? HUD_TOKENS.typography.fontDisplay : HUD_TOKENS.typography.fontBody;
};
