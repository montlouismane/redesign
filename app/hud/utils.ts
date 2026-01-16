export function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

export function formatPct(x: number) {
    const s = (x >= 0 ? '+' : '') + x.toFixed(2) + '%';
    return s;
}

export function formatUSD(x: number) {
    // Simple formatter, can be enhanced
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(x);
}
