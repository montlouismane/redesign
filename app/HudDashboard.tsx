'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Wallet, Mic, Rocket, ChevronDown, ArrowUp, Paperclip, Lightbulb, Minimize2, X } from 'lucide-react';
import { UiStyleToggle } from './UiStyleToggle';
import styles from './HudDashboard.module.css';

type PanelKey = 'agents' | 'performance' | 'market' | 'trades' | 'allocation' | 'system';
type PortfolioRange = '1H' | '24H' | '7D' | '30D' | 'ALL';
type AgentRuntimeState = 'running' | 'idle' | 'alert' | 'stopped';

type PortfolioSeriesPoint = { time: number; value: number };

type AgentRow = {
  id: string;
  chip: string;
  name: string;
  role: string;
  chain: string;
  runtimeState: AgentRuntimeState;
  pnlPct: number;
};

type HoldingRow = {
  symbol: string;
  name: string;
  value: string;
  color: string;
};

type TradeRow = {
  type: 'BUY' | 'SELL';
  pair: string;
  time: string;
};

const PANEL_TITLES: Record<PanelKey, string> = {
  agents: 'Agent Roster',
  performance: 'Portfolio Performance',
  market: 'Holdings',
  trades: 'Recent Trades',
  allocation: 'Asset Allocation',
  system: 'System Status',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getCssColor(host: HTMLElement, varName: string, fallback: string) {
  const v = getComputedStyle(host).getPropertyValue(varName).trim();
  return v || fallback;
}

function sizeCanvasTo(canvas: HTMLCanvasElement, wrap: HTMLElement) {
  const rect = wrap.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: rect.width, h: rect.height };
}

function formatAxisTime(range: PortfolioRange, timeSec: number) {
  const d = new Date(timeSec * 1000);
  if (range === '1H' || range === '24H') {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);
  }
  if (range === '7D' || range === '30D') {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(d);
}

function formatTooltipTime(range: PortfolioRange, timeSec: number) {
  const d = new Date(timeSec * 1000);
  if (range === '1H' || range === '24H') {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);
  }
  if (range === '7D' || range === '30D') {
    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(d);
}

function drawLineChart(args: {
  canvas: HTMLCanvasElement;
  wrap: HTMLElement;
  host: HTMLElement;
  series: PortfolioSeriesPoint[];
  range: PortfolioRange;
}) {
  const sized = sizeCanvasTo(args.canvas, args.wrap);
  if (!sized) return;
  const { ctx, w, h } = sized;

  ctx.clearRect(0, 0, w, h);

  const padL = 44;
  const padR = 18;
  const padT = 18;
  const padB = 34;

  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // grid
  ctx.strokeStyle = getCssColor(args.host, '--gridLine', 'rgba(255,255,255,.06)');
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padT + (plotH * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
  }

  const series = (args.series ?? []).slice().sort((a, b) => a.time - b.time);

  // axes labels (light)
  if (series.length > 1) {
    ctx.fillStyle = 'rgba(232,232,238,.55)';
    ctx.font = '11px Orbitron, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const tickCount = 5;
    for (let i = 0; i < tickCount; i++) {
      const idx = Math.round((i / (tickCount - 1)) * (series.length - 1));
      const x = padL + (plotW * idx) / (series.length - 1);
      ctx.fillText(formatAxisTime(args.range, series[idx]!.time), x, padT + plotH + 10);
    }
  }

  if (series.length === 0) {
    ctx.fillStyle = 'rgba(232,232,238,.35)';
    ctx.font = '12px Orbitron, system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO DATA', padL + plotW / 2, padT + plotH / 2);
    return;
  }

  const values = series.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const span = maxVal - minVal;
  const pad = span === 0 ? Math.max(1, maxVal * 0.01) : span * 0.06;
  const minV = minVal - pad;
  const maxV = maxVal + pad;

  const toXY = (idx: number, v: number) => {
    const n = series.length;
    const x = n <= 1 ? padL + plotW / 2 : padL + (plotW * idx) / (n - 1);
    const t = maxV === minV ? 0.5 : (v - minV) / (maxV - minV);
    const y = padT + plotH - clamp(t, 0, 1) * plotH;
    return { x, y };
  };

  const stroke = getCssColor(args.host, '--chartA', 'rgba(255,178,74,.95)');
  const glow = 'rgba(255,178,74,.30)';
  const fill = 'rgba(255,178,74,.12)';

  // path
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const p = toXY(i, series[i]!.value);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  ctx.restore();

  // fill
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < series.length; i++) {
    const p = toXY(i, series[i]!.value);
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.lineTo(padL, padT + plotH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
  grad.addColorStop(0, fill);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // points
  ctx.save();
  ctx.fillStyle = stroke;
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < series.length; i++) {
    const p = toXY(i, series[i]!.value);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function formatMoney(x: number) {
  return (
    '$' +
    x.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function formatPct(x: number) {
  const s = (x >= 0 ? '+' : '') + x.toFixed(2) + '%';
  return s;
}

function HudPerfChart({
  hostRef,
  series,
  range,
  height,
  redrawKey,
}: {
  hostRef: React.RefObject<HTMLElement | null>;
  series: PortfolioSeriesPoint[];
  range: PortfolioRange;
  height?: number;
  redrawKey?: string | number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const tipKeyRef = useRef<HTMLDivElement | null>(null);
  const tipValRef = useRef<HTMLDivElement | null>(null);

  const redraw = useCallback(() => {
    const host = hostRef.current;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!host || !wrap || !canvas) return;
    drawLineChart({ canvas, wrap, host, series, range });
  }, [hostRef, range, series]);

  useEffect(() => {
    redraw();
  }, [redraw, height, redrawKey]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let ro: ResizeObserver | null = null;
    const onResize = () => redraw();

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize);
      ro.observe(wrap);
    } else {
      window.addEventListener('resize', onResize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', onResize);
    };
  }, [redraw]);

  const hideTip = () => {
    if (!tipRef.current) return;
    tipRef.current.style.display = 'none';
  };

  const showTip = (x: number, y: number, label: string, value: string) => {
    if (!tipRef.current || !wrapRef.current) return;
    if (tipKeyRef.current) tipKeyRef.current.textContent = label.toUpperCase();
    if (tipValRef.current) tipValRef.current.textContent = value;
    tipRef.current.style.display = 'block';

    const rect = wrapRef.current.getBoundingClientRect();
    const tx = Math.max(12, Math.min(rect.width - 220, x + 16));
    const ty = Math.max(12, Math.min(rect.height - 80, y - 10));
    tipRef.current.style.left = `${tx}px`;
    tipRef.current.style.top = `${ty}px`;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    if (!series || series.length === 0) {
      hideTip();
      return;
    }
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const padL = 44;
    const padR = 18;
    const plotW = rect.width - padL - padR;
    const t = (mx - padL) / Math.max(1, plotW);
    const idx = clamp(Math.round(t * (series.length - 1)), 0, series.length - 1);
    const p = series[idx];
    if (!p) return;
    showTip(mx, my, formatTooltipTime(range, p.time), formatMoney(p.value));
  };

  return (
    <div
      ref={wrapRef}
      className={styles.chartWrap}
      style={typeof height === 'number' ? { height } : undefined}
      onMouseMove={onMouseMove}
      onMouseLeave={hideTip}
    >
      <canvas ref={canvasRef} className={styles.chartCanvas} />
      <div ref={tipRef} className={styles.chartTooltip}>
        <div ref={tipKeyRef} className={styles.tKey}>
          TIME
        </div>
        <div ref={tipValRef} className={styles.tVal}>
          $0
        </div>
      </div>
    </div>
  );
}

export function HudDashboard() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const threeControlsRef = useRef<{
    setBloom: (strength: number, radius: number, threshold: number) => void;
    setExposure: (exposure: number) => void;
  } | null>(null);
  const noiseControlsRef = useRef<{ setIntensity: (intensity: number) => void } | null>(null);

  const router = useRouter();
  const [view, setView] = useState<'dashboard' | 'portfolio' | 'chatFull' | 'settings'>('dashboard');
  const [activeRange, setActiveRange] = useState<PortfolioRange>('1H');
  const [equityPoints, setEquityPoints] = useState<PortfolioSeriesPoint[]>([]);
  const [equitySummary, setEquitySummary] = useState<{ endValue: number; changePct: number } | null>(null);
  const [equityIsLive, setEquityIsLive] = useState(false);
  const [modalPanel, setModalPanel] = useState<PanelKey | null>(null);

  const [isChatDockOpen, setIsChatDockOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'auto' | 'fast' | 'thinking'>('auto');
  const [chatModeOpen, setChatModeOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Hi - I'm Agent T. How can I help?" },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputDockRef = useRef<HTMLInputElement>(null);

  const chatStarters = [
    'Draft a plan for my new agent',
    'Explain each trading mode',
    "Review my agent's trades from the past week",
  ] as const;

  const sendChatText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setChatInput('');

    window.setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: chatMode === 'thinking' ? 'Got it - thinking... (Demo UI only)' : chatMode === 'fast' ? 'Got it. (Demo UI only)' : 'Got it. (Demo UI only)',
        },
      ]);
    }, 350);
  };

  const sendChat = () => sendChatText(chatInput);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle file upload - for now, just show a message
    const fileNames = Array.from(files).map((f) => f.name).join(', ');
    sendChatText(`[File uploaded: ${fileNames}]`);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const [agents, setAgents] = useState<AgentRow[]>(() => [
    { id: 'alpha', chip: 'AS', name: 'Alpha Sniper', role: 'Momentum', chain: 'SOL', runtimeState: 'running', pnlPct: 12.4 },
    { id: 'snek', chip: 'SF', name: 'Snek Farmer', role: 'Grid Bot', chain: 'ADA', runtimeState: 'idle', pnlPct: 3.2 },
    { id: 'base', chip: 'BR', name: 'Base Runner', role: 'Perps', chain: 'BASE', runtimeState: 'alert', pnlPct: 0.0 },
  ]);

  const [selectedAgentId, setSelectedAgentId] = useState<string>('alpha');

  const holdings = useMemo<HoldingRow[]>(
    () => [
      { symbol: 'SOL', name: 'Solana', value: '$4,200', color: '#7c3aed' },
      { symbol: 'ADA', name: 'Cardano', value: '$1,840', color: '#2563eb' },
      { symbol: 'SNEK', name: 'Snek', value: '$920', color: '#eab308' },
      { symbol: 'WIF', name: 'Dogwifhat', value: '$410', color: '#7c2d12' },
      { symbol: 'BONK', name: 'Bonk', value: '$220', color: '#ea580c' },
      { symbol: 'ETH', name: 'Ethereum', value: '$140', color: '#4f46e5' },
      { symbol: 'USDC', name: 'USD Coin', value: '$50', color: '#60a5fa' },
      { symbol: 'XRP', name: 'Ripple', value: '$45', color: '#9ca3af' },
      { symbol: 'DOT', name: 'Polkadot', value: '$32', color: '#db2777' },
    ],
    [],
  );

  const recentTrades = useMemo<TradeRow[]>(
    () => [
      { type: 'BUY', pair: 'SNEK/ADA', time: '2m' },
      { type: 'SELL', pair: 'SOL/USDC', time: '12m' },
      { type: 'BUY', pair: 'WIF/SOL', time: '45m' },
      { type: 'BUY', pair: 'BONK/SOL', time: '1h' },
      { type: 'SELL', pair: 'ETH/USDC', time: '2h' },
    ],
    [],
  );

  const systemStatus = useMemo(
    () => [
      { label: 'Execution Engine', status: 'ONLINE', tone: 'ok' as const, pulse: true },
      { label: 'Data Feeds', status: '12ms', tone: 'ok' as const, pulse: false },
      { label: 'AI Logic Core', status: 'TRAINING', tone: 'warn' as const, pulse: false },
    ],
    [],
  );

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? agents[0];

  const openModal = useCallback((key: PanelKey) => setModalPanel(key), []);
  const closeModal = useCallback(() => setModalPanel(null), []);

  const stopAgent = useCallback((agentId: string) => {
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, runtimeState: 'stopped' } : a)));
  }, []);

  // Key bindings: Escape closes modal/chat.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const isTypingTarget =
        tag === 'input' || tag === 'textarea' || (e.target as HTMLElement | null)?.isContentEditable;
      if (isTypingTarget) return;

      if (e.key === 'Escape') {
        if (modalPanel) closeModal();
        else if (view === 'chatFull') setView('dashboard');
        else if (isChatDockOpen) setIsChatDockOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalPanel, closeModal, view, isChatDockOpen]);

  // Equity curve (live via /api/portfolio/equity when env is configured, otherwise demo).
  useEffect(() => {
    const controller = new AbortController();

    const setDemo = () => {
      const now = Math.floor(Date.now() / 1000);
      const dur =
        activeRange === '1H'
          ? 60 * 60
          : activeRange === '24H'
            ? 60 * 60 * 24
            : activeRange === '7D'
              ? 60 * 60 * 24 * 7
              : activeRange === '30D'
                ? 60 * 60 * 24 * 30
                : 60 * 60 * 24 * 120;

      const n = activeRange === '1H' ? 50 : activeRange === '24H' ? 72 : activeRange === '7D' ? 90 : activeRange === '30D' ? 110 : 140;
      const base = 12403.92;
      const pts: PortfolioSeriesPoint[] = [];
      for (let i = 0; i < n; i++) {
        const t = n <= 1 ? 0 : i / (n - 1);
        const time = Math.floor(now - (1 - t) * dur);
        const wave = Math.sin(i * 0.22) * 120 + Math.sin(i * 0.07) * 180;
        const trend = t * 680;
        const value = base + wave + trend;
        pts.push({ time, value });
      }

      const first = pts[0]?.value ?? base;
      const last = pts[pts.length - 1]?.value ?? base;
      const changePct = first === 0 ? 0 : ((last - first) / first) * 100;

      setEquityPoints(pts);
      setEquitySummary({ endValue: last, changePct });
      setEquityIsLive(false);
    };

    const run = async () => {
      const address = process.env.NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS;
      if (!address) {
        setDemo();
        return;
      }

      try {
        const params = new URLSearchParams({
          address,
          range: activeRange,
          quote: 'USD',
        });
        const res = await fetch(`/api/portfolio/equity?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`equity fetch failed: ${res.status}`);

        const data = (await res.json()) as {
          points?: PortfolioSeriesPoint[];
          summary?: { endValue?: number; changePct?: number };
        };

        const series = (data.points ?? []).slice().sort((a, b) => a.time - b.time);
        if (series.length === 0) throw new Error('no series points');

        const first = series[0]!.value;
        const last = series[series.length - 1]!.value;
        const changePct = data.summary?.changePct ?? (first === 0 ? 0 : ((last - first) / first) * 100);

        setEquityPoints(series);
        setEquitySummary({ endValue: data.summary?.endValue ?? last, changePct });
        setEquityIsLive(true);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setDemo();
      }
    };

    run();
    return () => controller.abort();
  }, [activeRange]);

  // Initialize HUD background (Three.js) + procedural noise overlay.
  useEffect(() => {
    let rafId = 0;
    let noiseIntervalId: number | null = null;
    let cancelled = false;

    let removeResize: (() => void) | null = null;
    let removeMouseMove: (() => void) | null = null;

    const cleanupThree: Array<() => void> = [];

    const init = async () => {
      const bgCanvas = bgCanvasRef.current;
      const noiseCanvas = noiseCanvasRef.current;
      const rootEl = rootRef.current;
      if (!bgCanvas || !noiseCanvas || !rootEl) return;

      try {
        const THREE = await import('three');
        const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
        const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
        const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
        if (cancelled) return;

        // ---------- Procedural Noise Overlay ----------
        const nctx = noiseCanvas.getContext('2d', { alpha: true });
        if (!nctx) throw new Error('Could not acquire 2D context for noise canvas');

        const NOISE_TILE = 256;
        const noiseTile = document.createElement('canvas');
        noiseTile.width = NOISE_TILE;
        noiseTile.height = NOISE_TILE;
        const tctx = noiseTile.getContext('2d', { alpha: true });
        if (!tctx) throw new Error('Could not acquire 2D context for noise tile');

        const tileData = tctx.createImageData(NOISE_TILE, NOISE_TILE);
        const regenNoiseTile = (intensity01: number) => {
          const data = tileData.data;
          const intensity = clamp(intensity01, 0, 1);
          for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i + 0] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = Math.floor(v * 0.18 * intensity);
          }
          tctx.putImageData(tileData, 0, 0);
        };

        let noiseIntensity = 0.9;
        regenNoiseTile(noiseIntensity);
        let noiseTick = 0;

        const drawNoise = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = noiseCanvas.width;
          const h = noiseCanvas.height;

          nctx.clearRect(0, 0, w, h);
          nctx.globalAlpha = 1;

          const ox = Math.floor((noiseTick * 13) % NOISE_TILE);
          const oy = Math.floor((noiseTick * 9) % NOISE_TILE);

          for (let y = -NOISE_TILE; y < h + NOISE_TILE; y += NOISE_TILE) {
            for (let x = -NOISE_TILE; x < w + NOISE_TILE; x += NOISE_TILE) {
              nctx.drawImage(noiseTile, x - ox, y - oy);
            }
          }

          // subtle scanline
          nctx.globalAlpha = 0.18 * noiseIntensity;
          nctx.fillStyle = 'rgba(0,0,0,1)';
          for (let y = 0; y < h; y += Math.floor(3 * dpr)) {
            nctx.fillRect(0, y, w, 1);
          }

          noiseTick++;
        };

        noiseControlsRef.current = {
          setIntensity: (intensity: number) => {
            noiseIntensity = intensity;
            regenNoiseTile(noiseIntensity);
          },
        };

        noiseIntervalId = window.setInterval(drawNoise, 50);

        // ---------- Three.js background (stars + bloom) ----------
        const renderer = new THREE.WebGLRenderer({
          canvas: bgCanvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 2500);
        camera.position.set(0, 0, 220);
        scene.add(new THREE.AmbientLight(0xffffff, 0.9));

        const STAR_COUNT = 2200;
        const positions = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
          const i3 = i * 3;
          positions[i3 + 0] = (Math.random() - 0.5) * 980;
          positions[i3 + 1] = (Math.random() - 0.5) * 560;
          positions[i3 + 2] = (Math.random() - 0.5) * 980;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
          color: 0xffb24a,
          size: 1.05,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const stars = new THREE.Points(geo, mat);
        scene.add(stars);

        const positions2 = new Float32Array(STAR_COUNT * 3);
        for (let i = 0; i < STAR_COUNT; i++) {
          const i3 = i * 3;
          positions2[i3 + 0] = (Math.random() - 0.5) * 1100;
          positions2[i3 + 1] = (Math.random() - 0.5) * 680;
          positions2[i3 + 2] = (Math.random() - 0.5) * 1100;
        }
        const geo2 = new THREE.BufferGeometry();
        geo2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));
        const mat2 = new THREE.PointsMaterial({
          color: 0x5ab4ff,
          size: 0.95,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const dust = new THREE.Points(geo2, mat2);
        scene.add(dust);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.22);
        composer.addPass(bloomPass);

        threeControlsRef.current = {
          setBloom: (strength, radius, threshold) => {
            bloomPass.strength = strength;
            bloomPass.radius = radius;
            bloomPass.threshold = threshold;
          },
          setExposure: (exposure) => {
            renderer.toneMappingExposure = exposure;
          },
        };

        // Resize handling (also sizes the noise canvas)
        const resize = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          renderer.setSize(w, h, false);
          composer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          bloomPass.setSize(w, h);

          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          noiseCanvas.width = Math.floor(w * dpr);
          noiseCanvas.height = Math.floor(h * dpr);
        };

        window.addEventListener('resize', resize);
        removeResize = () => window.removeEventListener('resize', resize);

        // Parallax
        let targetParallaxX = 0,
          targetParallaxY = 0;
        let parallaxX = 0,
          parallaxY = 0;
        const onMouseMove = (e: MouseEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          targetParallaxX = nx * 10;
          targetParallaxY = -ny * 6;
        };
        window.addEventListener('mousemove', onMouseMove);
        removeMouseMove = () => window.removeEventListener('mousemove', onMouseMove);

        let t = 0;
        const animate = () => {
          t += 0.0014;

          parallaxX += (targetParallaxX - parallaxX) * 0.05;
          parallaxY += (targetParallaxY - parallaxY) * 0.05;

          camera.position.x = parallaxX;
          camera.position.y = parallaxY;

          stars.rotation.y = t * 0.5;
          stars.rotation.x = t * 0.16;

          dust.rotation.y = -t * 0.3;
          dust.rotation.x = t * 0.09;

          composer.render();
          rafId = requestAnimationFrame(animate);
        };

        resize();
        animate();

        cleanupThree.push(() => {
          try {
            geo.dispose();
            mat.dispose();
            geo2.dispose();
            mat2.dispose();
          } catch {
            // ignore
          }
          try {
            renderer.dispose();
          } catch {
            // ignore
          }
        });
      } catch (err) {
        console.error(err);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (noiseIntervalId) window.clearInterval(noiseIntervalId);
      if (removeResize) removeResize();
      if (removeMouseMove) removeMouseMove();
      cleanupThree.forEach((fn) => fn());
      threeControlsRef.current = null;
      noiseControlsRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root}>
      <canvas ref={bgCanvasRef} className={styles.bg} />
      <canvas ref={noiseCanvasRef} className={styles.noise} />

      <div className={styles.hud}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.brandButton}
            onClick={() => {
              closeModal();
              setIsChatDockOpen(false);
              setView('dashboard');
            }}
            aria-label="Go to Dashboard"
          >
            <img src="/brand/adam-hud-logo.svg" alt="ADAM" className={styles.brandLogo} draggable={false} />
          </button>

          <nav className={styles.nav} aria-label="Primary">
            {(
              [
                { key: 'dashboard', label: 'Dashboard', onClick: () => setView('dashboard') },
                { key: 'portfolio', label: 'Portfolio', onClick: () => setView('portfolio') },
                { key: 'aiAgents', label: 'AI Agents', onClick: () => router.push('/squad') },
                {
                  key: 'aiChat',
                  label: 'AI Chat',
                  onClick: () => {
                    setIsChatDockOpen(false);
                    setView('chatFull');
                  },
                },
                { key: 'settings', label: 'Settings', onClick: () => setView('settings') },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                className={
                  styles.navLink +
                  ' ' +
                  (((view === 'dashboard' && item.key === 'dashboard') ||
                    (view === 'portfolio' && item.key === 'portfolio') ||
                    (view === 'chatFull' && item.key === 'aiChat') ||
                    (view === 'settings' && item.key === 'settings')) as boolean
                    ? styles.isActive
                    : '')
                }
                onClick={() => {
                  closeModal();
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={styles.topRight}>
            <UiStyleToggle className={styles.uiStyleToggle} />

            <button type="button" className={styles.iconBtn} aria-label="Notifications">
              <Bell size={18} />
            </button>

            <button type="button" className={styles.walletBtn}>
              <Wallet size={18} className={styles.walletIcon} />
              <span className={styles.walletAddr}>0x...8a22</span>
            </button>
          </div>
        </header>

        <main className={styles.dashboard} aria-label="Dashboard">
          {/* LEFT: AGENTS */}
          <section
            className={`${styles.panel} ${styles.panelAgents}`}
            aria-label="Agent Roster"
            onDoubleClick={() => openModal('agents')}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Agent Roster</div>
              <div className={styles.panelMeta}>
                <button className={styles.expandBtn} type="button" title="Expand" aria-label="Expand agents" onClick={() => openModal('agents')}>
                  ⤢
                </button>
              </div>
            </div>

            <div className={styles.agentsTop}>
              <div className={styles.muted} style={{ letterSpacing: '.12em', fontSize: 11 }}>
                Active agents
              </div>
            </div>

            <div className={styles.agentList}>
              {agents.map((a) => {
                const isActive = a.id === selectedAgentId;
                const dotTone =
                  a.runtimeState === 'running'
                    ? styles.dotRunning
                    : a.runtimeState === 'idle'
                      ? styles.dotIdle
                      : a.runtimeState === 'alert'
                        ? styles.dotAlert
                        : styles.dotStopped;
                const pnlTone = a.pnlPct > 0 ? styles.pos : styles.neg;
                return (
                  <div
                    key={a.id}
                    className={`${styles.agentItem} ${isActive ? styles.isActive : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onClick={() => setSelectedAgentId(a.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedAgentId(a.id);
                      }
                    }}
                  >
                    <div className={styles.agentIcon}>{a.chip}</div>
                    <div>
                      <div className={styles.agentName}>
                        <span className={`${styles.dot} ${dotTone}`} aria-hidden="true" />
                        {a.name}
                      </div>
                      <div className={styles.agentSub}>
                        {a.role} · {a.chain}
                      </div>
                    </div>
                    <div className={styles.agentRight}>
                      <div className={`${styles.agentPnl} ${pnlTone}`}>{formatPct(a.pnlPct)}</div>
                    </div>
                  </div>
                );
              })}

              <button type="button" className={styles.deployBtn}>
                Deploy New Agent
              </button>
            </div>
          </section>

          {/* CENTER: PERFORMANCE */}
          <section className={`${styles.panel} ${styles.panelPerformance}`} aria-label="Portfolio performance" onDoubleClick={() => openModal('performance')}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Portfolio Performance</div>
              <div className={styles.panelMeta}>
                <button className={styles.expandBtn} type="button" title="Expand" aria-label="Expand performance" onClick={() => openModal('performance')}>
                  ⤢
                </button>
              </div>
            </div>

            <div className={styles.perfTop}>
              <div className={styles.seg} role="tablist" aria-label="Performance range">
                {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.segBtn} ${activeRange === t ? styles.isOn : ''}`}
                    onClick={() => setActiveRange(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className={styles.muted} style={{ fontSize: 11, letterSpacing: '.12em' }}>
                HOVER FOR VALUES · {equityIsLive ? 'LIVE' : 'DEMO'}
              </div>
            </div>

            <HudPerfChart hostRef={rootRef} series={equityPoints} range={activeRange} />

            <div className={styles.kpis}>
              <div className={styles.kpi}>
                <div className={styles.kpiKey}>CURRENT</div>
                <div className={styles.kpiVal}>{formatMoney(equitySummary?.endValue ?? 0)}</div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiKey}>CHANGE ({activeRange})</div>
                <div className={`${styles.kpiVal} ${(equitySummary?.changePct ?? 0) >= 0 ? styles.pos : styles.neg}`}>
                  {formatPct(equitySummary?.changePct ?? 0)}
                </div>
              </div>
              <div className={styles.kpi}>
                <div className={styles.kpiKey}>MODE</div>
                <div className={styles.kpiVal}>{equityIsLive ? 'LIVE' : 'DEMO'}</div>
              </div>
            </div>
          </section>

          {/* RIGHT: MARKET */}
          <section className={`${styles.panel} ${styles.panelMarket}`} aria-label="Holdings" onDoubleClick={() => openModal('market')}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>Holdings</div>
              <div className={styles.panelMeta}>
                <button className={styles.expandBtn} type="button" title="Expand" aria-label="Expand market" onClick={() => openModal('market')}>
                  ⤢
                </button>
              </div>
            </div>

            <div className={styles.marketList}>
              {holdings.map((h) => (
                <div key={h.symbol} className={styles.marketCard}>
                  <div className={styles.mLeft}>
                    <div className={styles.mTicker}>{h.symbol}</div>
                    <div className={`${styles.mSub} ${styles.mono}`}>{h.name}</div>
                  </div>
                  <div className={styles.mRight}>
                    <div className={`${styles.mPrice} ${styles.mono}`}>{h.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM CENTER: Trades + Allocation */}
          <div className={styles.bottomWrap}>
            <section className={styles.panel} aria-label="Recent trades" onDoubleClick={() => openModal('trades')}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>Recent Trades</div>
                <div className={styles.panelMeta}>
                  <button className={styles.expandBtn} type="button" title="Expand" aria-label="Expand trades" onClick={() => openModal('trades')}>
                    ⤢
                  </button>
                </div>
              </div>
              <div className={styles.tradeTable}>
                <div className={styles.tradeHead}>
                  <div>TYPE</div>
                  <div>PAIR</div>
                  <div>TIME</div>
                </div>
                <div className={styles.tradeBody}>
                  {recentTrades.map((t, idx) => (
                    <div key={idx} className={styles.tradeRow}>
                      <div>
                        <span className={`${styles.tradeType} ${t.type === 'BUY' ? styles.tradeBuy : styles.tradeSell}`}>{t.type}</span>
                      </div>
                      <div className={styles.mono}>{t.pair}</div>
                      <div className={`${styles.mono} ${styles.muted}`}>{t.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.panel} aria-label="Asset allocation" onDoubleClick={() => openModal('allocation')}>
              <div className={styles.panelHeader}>
                <div className={styles.panelTitle}>Asset Allocation</div>
                <div className={styles.panelMeta}>
                  <button
                    className={styles.expandBtn}
                    type="button"
                    title="Expand"
                    aria-label="Expand allocation"
                    onClick={() => openModal('allocation')}
                  >
                    ⤢
                  </button>
                </div>
              </div>
              <div className={styles.allocWrap}>
                <div className={styles.donut} aria-label="Allocation donut" />
                <div className={styles.legend}>
                  {[
                    { k: 'SOL', v: '52%', color: 'rgba(255,178,74,.95)' },
                    { k: 'ADA', v: '31%', color: 'rgba(45,212,191,.92)' },
                    { k: 'Other', v: '17%', color: 'rgba(42,48,60,.92)' },
                  ].map((item) => (
                    <div key={item.k} className={styles.legendItem}>
                      <div className={styles.liLeft}>
                        <span className={styles.swatch} style={{ background: item.color }} />
                        <span className={styles.mono}>{item.k}</span>
                      </div>
                      <div className={`${styles.liRight} ${styles.mono}`}>{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT BOTTOM: System status */}
          <section className={`${styles.panel} ${styles.panelSystem}`} aria-label="System status" onDoubleClick={() => openModal('system')}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>System Status</div>
              <div className={styles.panelMeta}>
                <button className={styles.expandBtn} type="button" title="Expand" aria-label="Expand system" onClick={() => openModal('system')}>
                  ⤢
                </button>
              </div>
            </div>
            <div className={styles.sysList}>
              {systemStatus.map((sys) => (
                <div key={sys.label} className={styles.sysRow}>
                  <div className={styles.sysName}>{sys.label}</div>
                  <div className={styles.sysState}>
                    <span
                      className={`${styles.sysDot} ${sys.tone === 'ok' ? styles.ok : sys.tone === 'warn' ? styles.warn : styles.bad} ${
                        sys.pulse ? styles.pulse : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span className={styles.mono}>{sys.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className={styles.hudFooter}>
          <div className={`${styles.footerHint} ${styles.mono}`}>Less clutter · Bigger panels · Click ⤢ to expand · Double‑click any panel</div>
          <div className={`${styles.footerHint} ${styles.mono}`}>
            Tip: Stop an agent to turn its indicator light off
          </div>
        </footer>
      </div>

      {/* Modal Overlay for expanded views */}
      <div
        className={`${styles.modalOverlay} ${modalPanel ? styles.isOpen : ''}`}
        aria-hidden={modalPanel ? 'false' : 'true'}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className={styles.modalShell}>
          <div className={`${styles.panel} ${styles.modalPanel}`}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>{modalPanel ? PANEL_TITLES[modalPanel] : 'DETAILS'}</div>
              <div className={styles.panelMeta}>
                <button className={`${styles.btnGhost} ${styles.sm}`} type="button" onClick={closeModal}>
                  CLOSE
                </button>
              </div>
            </div>

            <div className={styles.modalBody}>
              {modalPanel === 'agents' ? (
                <div className={styles.modalGrid}>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>AGENT ROSTER</div>
                    <div className={styles.subNote}>Same agents as the Classic dashboard roster.</div>
                    <div style={{ height: 12 }} />

                    <div className={styles.agentList} style={{ maxHeight: '58vh' }}>
                      {agents.map((a) => {
                        const isActive = a.id === selectedAgentId;
                        const dotTone =
                          a.runtimeState === 'running'
                            ? styles.dotRunning
                            : a.runtimeState === 'idle'
                              ? styles.dotIdle
                              : a.runtimeState === 'alert'
                                ? styles.dotAlert
                                : styles.dotStopped;
                        const pnlTone = a.pnlPct > 0 ? styles.pos : styles.neg;
                        return (
                          <div
                            key={a.id}
                            className={`${styles.agentItem} ${isActive ? styles.isActive : ''}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isActive}
                            onClick={() => setSelectedAgentId(a.id)}
                          >
                            <div className={styles.agentIcon}>{a.chip}</div>
                            <div>
                              <div className={styles.agentName}>
                                <span className={`${styles.dot} ${dotTone}`} aria-hidden="true" />
                                {a.name}
                              </div>
                              <div className={styles.agentSub}>
                                {a.role} · {a.chain}
                              </div>
                            </div>
                            <div className={styles.agentRight}>
                              <div className={`${styles.agentPnl} ${pnlTone}`}>{formatPct(a.pnlPct)}</div>
                            </div>
                          </div>
                        );
                      })}

                      <button type="button" className={styles.deployBtn}>
                        Deploy New Agent
                      </button>
                    </div>
                  </div>

                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>SELECTED AGENT</div>
                    <div className={styles.subNote}>
                      {selectedAgent ? `${selectedAgent.role} · ${selectedAgent.chain}` : '—'}
                    </div>
                    <div style={{ height: 14 }} />

                    <div className={styles.subPanel} style={{ background: 'rgba(0,0,0,.10)' }}>
                      <div className={styles.subTitle}>SUMMARY</div>
                      <div className={styles.subNote}>
                        <span className={styles.mono}>PNL</span>: {formatPct(selectedAgent?.pnlPct ?? 0)}
                      </div>
                      <div className={styles.subNote}>
                        <span className={styles.mono}>STATUS</span>: {(selectedAgent?.runtimeState ?? 'stopped').toUpperCase()}
                      </div>
                    </div>

                    <div style={{ height: 14 }} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        className={styles.btnGhost}
                        type="button"
                        style={{ flex: 1 }}
                        onClick={() => {
                          closeModal();
                          router.push('/squad');
                        }}
                      >
                        Open Squad
                      </button>
                      <button
                        className={styles.btnPrimary}
                        type="button"
                        style={{ flex: 1 }}
                        onClick={() => {
                          closeModal();
                          router.push('/squad');
                        }}
                      >
                        Manage
                      </button>
                    </div>

                    <div style={{ height: 12 }} />
                    <button
                      className={styles.btnDanger}
                      type="button"
                      disabled={!selectedAgent || selectedAgent.runtimeState === 'stopped'}
                      onClick={() => {
                        if (!selectedAgent) return;
                        stopAgent(selectedAgent.id);
                      }}
                      style={{ width: '100%', opacity: !selectedAgent || selectedAgent.runtimeState === 'stopped' ? 0.6 : 1 }}
                    >
                      {selectedAgent?.runtimeState === 'stopped' ? 'STOPPED' : 'STOP AGENT'}
                    </button>
                  </div>
                </div>
              ) : null}

              {modalPanel === 'performance' ? (
                <>
                  <div className={styles.subPanel} style={{ marginBottom: 14 }}>
                    <div className={styles.subTitle}>PORTFOLIO PERFORMANCE</div>
                    <div className={styles.subNote}>
                      Range: <span className={styles.mono}>{activeRange}</span> · {equityIsLive ? 'LIVE' : 'DEMO'}
                    </div>
                    <div style={{ height: 12 }} />
                    <div className={styles.seg} role="tablist" aria-label="Performance range">
                      {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`${styles.segBtn} ${activeRange === t ? styles.isOn : ''}`}
                          onClick={() => setActiveRange(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <HudPerfChart hostRef={rootRef} series={equityPoints} range={activeRange} height={520} />
                  <div className={styles.kpis} style={{ marginTop: 14 }}>
                    <div className={styles.kpi}>
                      <div className={styles.kpiKey}>CURRENT</div>
                      <div className={styles.kpiVal}>{formatMoney(equitySummary?.endValue ?? 0)}</div>
                    </div>
                    <div className={styles.kpi}>
                      <div className={styles.kpiKey}>CHANGE ({activeRange})</div>
                      <div className={`${styles.kpiVal} ${(equitySummary?.changePct ?? 0) >= 0 ? styles.pos : styles.neg}`}>
                        {formatPct(equitySummary?.changePct ?? 0)}
                      </div>
                    </div>
                    <div className={styles.kpi}>
                      <div className={styles.kpiKey}>MODE</div>
                      <div className={styles.kpiVal}>{equityIsLive ? 'LIVE' : 'DEMO'}</div>
                    </div>
                  </div>
                </>
              ) : null}

              {modalPanel === 'market' ? (
                <div className={styles.modalGrid}>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>HOLDINGS</div>
                    <div className={styles.subNote}>Same holdings list as the Classic dashboard.</div>
                    <div style={{ height: 12 }} />
                    <div className={styles.marketList}>
                      {holdings.map((h) => (
                        <div key={h.symbol} className={styles.marketCard}>
                          <div className={styles.mLeft}>
                            <div className={styles.mTicker}>{h.symbol}</div>
                            <div className={`${styles.mSub} ${styles.mono}`}>{h.name}</div>
                          </div>
                          <div className={styles.mRight}>
                            <div className={`${styles.mPrice} ${styles.mono}`}>{h.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>DETAILS</div>
                    <div className={styles.subNote}>
                      To manage holdings (send/receive, positions, etc.) open the Portfolio view in Classic.
                    </div>
                    <div style={{ height: 14 }} />
                    <div className={styles.subPanel} style={{ background: 'rgba(0,0,0,.10)' }}>
                      <div className={styles.subTitle}>QUICK ACTIONS</div>
                      <div style={{ height: 12 }} />
                      <button
                        className={styles.btnPrimary}
                        type="button"
                        style={{ width: '100%' }}
                        onClick={() => {
                          closeModal();
                          setView('portfolio');
                        }}
                      >
                        Open Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {modalPanel === 'trades' ? (
                <>
                  <div className={styles.subPanel} style={{ marginBottom: 14 }}>
                    <div className={styles.subTitle}>RECENT TRADES</div>
                    <div className={styles.subNote}>Expanded view of the same Recent Trades list shown on the dashboard.</div>
                  </div>

                  <div className={styles.tradeTable} style={{ maxHeight: '66vh', overflow: 'auto' }}>
                    <div className={styles.tradeHead}>
                      <div>TYPE</div>
                      <div>PAIR</div>
                      <div>TIME</div>
                    </div>
                    <div className={styles.tradeBody} style={{ maxHeight: 'none' }}>
                      {Array.from({ length: 16 }).map((_, i) => {
                        const t = recentTrades[i % recentTrades.length]!;
                        return (
                          <div key={i} className={styles.tradeRow}>
                            <div>
                              <span className={`${styles.tradeType} ${t.type === 'BUY' ? styles.tradeBuy : styles.tradeSell}`}>{t.type}</span>
                            </div>
                            <div className={styles.mono}>{t.pair}</div>
                            <div className={`${styles.mono} ${styles.muted}`}>{t.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              {modalPanel === 'allocation' ? (
                <div className={styles.modalGrid}>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>ALLOCATION</div>
                    <div className={styles.subNote}>Same allocation breakdown shown on the Classic dashboard.</div>
                    <div style={{ height: 12 }} />
                    <div className={styles.allocWrap} style={{ gridTemplateColumns: '220px 1fr' }}>
                      <div className={styles.donut} style={{ width: 220, height: 220 }} />
                      <div className={styles.legend}>
                        {[
                          { k: 'SOL', v: '52%', color: 'rgba(255,178,74,.95)' },
                          { k: 'ADA', v: '31%', color: 'rgba(45,212,191,.92)' },
                          { k: 'Other', v: '17%', color: 'rgba(42,48,60,.92)' },
                        ].map((item) => (
                          <div key={item.k} className={styles.legendItem}>
                            <div className={styles.liLeft}>
                              <span className={styles.swatch} style={{ background: item.color }} />
                              <span className={styles.mono}>{item.k}</span>
                            </div>
                            <div className={`${styles.liRight} ${styles.mono}`}>{item.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>NOTES</div>
                    <div className={styles.subNote}>This is a cosmetic demo view. Wire real holdings breakdown when portfolio data is available.</div>
                    <div style={{ height: 14 }} />
                    <div className={styles.subPanel} style={{ background: 'rgba(0,0,0,.10)' }}>
                      <div className={styles.subTitle}>SOURCE</div>
                      <div className={styles.subNote}>
                        Classic dashboard currently uses the SOL/ADA/Other split. This HUD view mirrors that.
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {modalPanel === 'system' ? (
                <div className={styles.modalGrid}>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>SYSTEM STATUS</div>
                    <div className={styles.subNote}>Same system status list as the Classic dashboard.</div>
                    <div style={{ height: 12 }} />
                    <div className={styles.sysList}>
                      {systemStatus.map((sys) => (
                        <div key={sys.label} className={styles.sysRow}>
                          <div className={styles.sysName}>{sys.label}</div>
                          <div className={styles.sysState}>
                            <span
                              className={`${styles.sysDot} ${sys.tone === 'ok' ? styles.ok : sys.tone === 'warn' ? styles.warn : styles.bad} ${
                                sys.pulse ? styles.pulse : ''
                              }`}
                              aria-hidden="true"
                            />
                            <span className={styles.mono}>{sys.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.subPanel}>
                    <div className={styles.subTitle}>LATEST LOGS</div>
                    <div className={styles.subNote}>
                      <span className={styles.mono}>[GENERAL]</span> buy cycle complete · 50 scanned · 0 executed
                    </div>
                    <div className={styles.subNote}>
                      <span className={styles.mono}>[RELAY]</span> tx submitted · confirmed
                    </div>
                    <div className={styles.subNote}>
                      <span className={styles.mono}>[DB]</span> p95 latency elevated · retrying
                    </div>
                    <div style={{ height: 14 }} />
                    <button className={styles.btnPrimary} type="button" style={{ width: '100%' }}>
                      OPEN FULL MONITORING
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* FULL CHAT OVERLAY (Agent T) */}
      <div
        className={
          'fixed inset-0 z-[11050] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center will-change-[opacity,transform] ' +
          (view === 'chatFull'
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-8 scale-[0.92] pointer-events-none')
        }
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setView('dashboard');
          }
        }}
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.92)_48%,rgba(0,0,0,0.88)_100%)] backdrop-blur-[40px]" />

        <div className="relative h-full overflow-y-auto custom-scrollbar px-[12%] pt-[clamp(92px,10vh,140px)] pb-[12%]">
          <div className="max-w-[980px] mx-auto space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-2xl font-semibold text-white">Ask Agent T</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setView('dashboard');
                    setIsChatDockOpen(true);
                  }}
                  className="p-2 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Minimize"
                >
                  <Minimize2 size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="p-2 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="relative rounded-[22px] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.65)]">
              <div aria-hidden className="absolute inset-0 p-[2px] rounded-[22px] copperRim" />
              <div aria-hidden className="absolute inset-[2px] rounded-[20px] bg-[#0E131C]/88 border border-white/5 backdrop-blur-2xl" />

              {/* T-chat-logo background - barely visible */}
              <div aria-hidden className="absolute inset-[2px] rounded-[20px] overflow-hidden pointer-events-none flex items-center justify-center">
                <Image
                  src="/agents/t-chat-logo.svg"
                  alt=""
                  width={300}
                  height={300}
                  className="object-contain object-center blur-[3px]"
                  style={{ width: '20%', height: 'auto', opacity: 0.15 }}
                />
              </div>

              <div className="relative h-[min(70vh,640px)] flex flex-col z-10">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={'flex items-start gap-3 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                      {m.role === 'assistant' && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-400/20 flex-shrink-0 mt-1">
                          <Image
                            src="/agents/agent-t-portrait-512.jpg"
                            alt="Agent T"
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div
                        className={
                          'max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ' +
                          (m.role === 'user'
                            ? 'bg-white/10 text-white border-white/10'
                            : 'bg-black/25 text-white/85 border-white/5')
                        }
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-4 space-y-3">
                  {chatMessages.length <= 1 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-white/55">Try one of these:</div>
                      <div className="grid gap-2">
                        {chatStarters.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => sendChatText(q)}
                            className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="*/*"
                    />
                    {/* Attach button on left */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#0F131B]/80 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Attach file"
                    >
                      <Paperclip size={18} />
                    </button>

                    {/* Input field */}
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendChat();
                        }
                      }}
                      placeholder="What do you want to know?"
                      className="h-11 flex-1 rounded-xl bg-[#0F131B]/80 border border-white/10 px-4 text-sm text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                    />

                    {/* Mode selector */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setChatModeOpen((v) => !v)}
                        className="h-11 px-3 flex items-center gap-2 rounded-xl bg-[#0F131B]/80 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
                      >
                        {chatMode === 'thinking' ? <Lightbulb size={16} /> : chatMode === 'fast' ? <Rocket size={16} /> : null}
                        <span className="capitalize">{chatMode}</span>
                        <ChevronDown size={14} />
                      </button>
                      {chatModeOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-32 rounded-lg bg-[#0F131B]/95 border border-white/10 shadow-lg overflow-hidden z-50">
                          {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setChatMode(mode);
                                setChatModeOpen(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                                chatMode === mode
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <span className="capitalize">{mode}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Send button (circular with arrow) */}
                    <button
                      type="button"
                      onClick={sendChat}
                      className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Send"
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHAT POPUP (Glass) */}
      <div
        className={
          'fixed inset-0 z-[11040] transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
          (isChatDockOpen ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none')
        }
      >
        {/* No backdrop - background remains normal */}

        {/* Window (fade/scale) */}
        <div
          role="dialog"
          aria-label="Agent T chat"
          className={
            'absolute right-[clamp(16px,2.2vw,28px)] bottom-[clamp(16px,2.2vw,28px)] ' +
            'w-[min(460px,92vw)] h-[min(72vh,680px)] origin-bottom-right ' +
            'transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
            'will-change-[opacity,transform,filter] pointer-events-auto ' +
            (isChatDockOpen ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-[0.96] blur-[2px]')
          }
        >
          <div className="relative h-full rounded-[28px] overflow-hidden border border-white/12 bg-[#0E131C]/95 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            {/* Frost gradients */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.12),transparent_55%),radial-gradient(circle_at_82%_12%,rgba(217,119,6,0.12),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.15))]"
            />
            {/* Film grain */}
            <div aria-hidden className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none adamNoiseOverlay" />
            {/* Watermark logo */}
            <Image
              src="/agents/t-chat-logo.png"
              alt=""
              width={560}
              height={560}
              className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(340px,72%)] opacity-[0.08]"
            />

            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-400/20">
                    <Image
                      src="/agents/agent-t-portrait-512.jpg"
                      alt="Agent T"
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Agent T</div>
                    <div className="text-[10px] text-white/50">Quick chat</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChatDockOpen(false);
                      setView('chatFull');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Expand
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChatDockOpen(false)}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-3">
                {chatMessages.map((m, idx) => (
                  <div key={idx} className={'flex ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={
                        'max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed border ' +
                        (m.role === 'user'
                          ? 'bg-white/10 text-white border-white/10'
                          : 'bg-black/25 text-white/85 border-white/5')
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t border-white/10 p-4 space-y-2">
                {chatMessages.length <= 1 ? (
                  <div className="space-y-2">
                    <div className="text-[11px] text-white/55">Try one of these:</div>
                    <div className="grid gap-2">
                      {chatStarters.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => sendChatText(q)}
                          className="text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputDockRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  {/* Attach button on left */}
                  <button
                    type="button"
                    onClick={() => fileInputDockRef.current?.click()}
                    className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Input field */}
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendChat();
                      }
                    }}
                    placeholder="What do you want to know?"
                    className="h-9 flex-1 rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white/85 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                  />

                  {/* Mode selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setChatModeOpen((v) => !v)}
                      className="h-9 px-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-[10px]"
                    >
                      {chatMode === 'thinking' ? <Lightbulb size={12} /> : chatMode === 'fast' ? <Rocket size={12} /> : null}
                      <span className="capitalize">{chatMode}</span>
                      <ChevronDown size={10} />
                    </button>
                    {chatModeOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-28 rounded-lg bg-[#0F131B]/95 border border-white/10 shadow-lg overflow-hidden z-50">
                        {(['auto', 'fast', 'thinking'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setChatMode(mode);
                              setChatModeOpen(false);
                            }}
                            className={`w-full px-2.5 py-1.5 text-left text-[10px] transition-colors ${
                              chatMode === mode
                                ? 'bg-white/10 text-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="capitalize">{mode}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send button (circular with arrow) */}
                  <button
                    type="button"
                    onClick={sendChat}
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Send"
                  >
                    <ArrowUp size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING CHAT FAB */}
      {!isChatDockOpen && view !== 'chatFull' && (
        <div className="fixed bottom-8 right-8 z-[11060]">
          <button
            type="button"
            onClick={() => setIsChatDockOpen(true)}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(217,119,6,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] border-[1px] border-amber-400/10 hover:scale-110 transition-transform group copperButtonRaised"
            aria-label="Talk to Agent T"
          >
            <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden border border-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <Image
                src="/agents/agent-t-portrait-512.jpg"
                alt="Agent T"
                fill
                sizes="50px"
                className="object-cover"
              />
            </div>
          </button>
        </div>
      )}

    </div>
  );
}


