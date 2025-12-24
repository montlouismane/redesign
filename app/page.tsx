'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Cpu,
  MoreHorizontal,
  Plus,
  Search,
  Wallet,
  Rocket,
  ArrowUp,
  Paperclip,
  Lightbulb,
  Minimize2,
  X,
} from 'lucide-react';

import { UiStyleToggle } from './UiStyleToggle';
import { useUiStyle } from './UiStyleProvider';
import { HudDashboard } from './HudDashboard';

// --- ASSETS & TEXTURES ---
// Served locally from /public/textures via CSS vars/classes in app/globals.css.

// --- TYPES ---

type AgentStatus = 'active' | 'inactive' | 'idle';

type RosterItemProps = {
  name: string;
  role: string;
  chain: string;
  status: AgentStatus;
  pnl: string;
};

type BentoVariant = 'standard' | 'roster';

type BentoHeaderStyle = 'plain' | 'tabbed';

type BentoCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  variant?: BentoVariant;
  controls?: ReactNode;
  headerStyle?: BentoHeaderStyle;
  tabbedFrontOutline?: boolean;
  onOpen?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
};

type PortfolioRange = '1H' | '24H' | '7D' | '30D' | 'ALL';

type PortfolioSeriesPoint = { time: number; value: number };

type ChartPoint = { x: number; y: number; time: number; value: number };

type HoverData = {
  x: number;
  y: number;
  time: number;
  value: number;
};

// --- UTILS ---

const clampNum = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const formatUsd = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const rangeToLabel = (r: PortfolioRange) => {
  if (r === '1H') return '1h';
  if (r === '24H') return '24h';
  if (r === '7D') return '7d';
  if (r === '30D') return '30d';
  return 'all';
};
// --- COMPONENT: ROSTER ITEM ---
const RosterItem = ({ name, role, chain, status, pnl }: RosterItemProps) => (
  <div className="group/agent relative flex items-center gap-3 p-3 mx-2 my-1 rounded-xl transition-all overflow-hidden shrink-0 cursor-pointer border border-transparent hover:bg-[#D97706]/10">
    {/* Hover Border Highlight */}
    <div className="absolute inset-0 rounded-xl border border-amber-500/30 opacity-0 group-hover/agent:opacity-100 transition-opacity pointer-events-none"></div>

    {/* Content */}
    <div className="flex items-center gap-3 w-full transition-all duration-300 group-hover/agent:blur-[1px] group-hover/agent:opacity-50">
      {/* Avatar with Bevel */}
      <div className="w-10 h-10 rounded-lg bg-[#0F1115] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_2px_rgba(0,0,0,0.3)] border border-[#2A303C] flex items-center justify-center relative shrink-0">
        <Cpu size={18} className="text-gray-500 group-hover/agent:text-amber-400 transition-colors" />
        <div
          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#13151A] ${
            status === 'active' ? 'bg-teal-400 shadow-[0_0_8px_#2DD4BF]' : 'bg-gray-500'
          }`}
        ></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-gray-200 group-hover/agent:text-white truncate tracking-wide">
            {name}
          </h4>
          <span
            className={`text-[10px] tabular-nums font-semibold ${
              parseFloat(pnl) > 0 ? 'text-teal-400' : 'text-red-400'
            }`}
          >
            {pnl}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{role}</span>
          <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 rounded-[4px]">
            {chain}
          </span>
        </div>
      </div>
    </div>

    {/* Metallic Manage Button */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/agent:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
      <div
        className="flex items-center gap-2 text-[10px] font-bold px-5 py-1.5 rounded-full shadow-[0_4px_15px_rgba(217,119,6,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] transform translate-y-2 group-hover/agent:translate-y-0 transition-transform copperButtonRaised"
      >
        <span className="text-white drop-shadow-sm">MANAGE</span>{' '}
        <ChevronRight size={12} className="text-white" />
      </div>
    </div>
  </div>
);


type ScrollHintAreaProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scrollable container without a visible scrollbar.
 * Shows a subtle animated hint when there is more content below.
 */
const ScrollHintArea = ({ children, className = '' }: ScrollHintAreaProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const canScroll = el.scrollHeight > el.clientHeight + 2;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setShowHint(canScroll && !atBottom);
    };

    update();

    el.addEventListener('scroll', update, { passive: true });
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(el);
    } else {
      window.addEventListener('resize', update, { passive: true });
    }

    return () => {
      el.removeEventListener('scroll', update);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="relative h-full min-h-0">
      <div ref={ref} className={`h-full min-h-0 overflow-y-auto scrollbar-hide ${className}`}>{children}</div>

      {showHint ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/45 via-black/20 to-transparent"
          />
          <div aria-hidden className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="h-7 w-9 rounded-full bg-black/25 border border-white/10 flex items-center justify-center">
              <ChevronDown size={16} className="text-white/65 adam-scroll-hint" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
// --- COMPONENT: BENTO CARD (The Texture Upgrade) ---
const BentoCard = ({
  title,
  children,
  className = '',
  variant = 'standard',
  controls,
  headerStyle = 'plain',
  tabbedFrontOutline = false,
  onOpen,
  showMenu = true,
  onMenuClick,
}: BentoCardProps) => {
  const clipId = useId();
  const isTabbedHeader = headerStyle === 'tabbed';
  const isOutlinedTabbedHeader = isTabbedHeader && tabbedFrontOutline;
  const isOpenable = typeof onOpen === 'function';

  // SVG clip path IDs for folder-split header
  const frontClipId = `front-${clipId}`;
  const backClipId = `back-${clipId}`;

  return (
    <div
      className={
        `relative flex flex-col min-w-0 rounded-[22px] shadow-[0_18px_55px_rgba(0,0,0,0.65)] overflow-hidden group ${className}`
      }
    >
      {/* Bronze rim ring */}
      <div aria-hidden className="absolute inset-0 pointer-events-none z-20 p-[2px] rounded-[22px] copperRim" />
      {/* Inner stroke */}
      <div aria-hidden className="absolute inset-[2px] rounded-[20px] pointer-events-none z-20 ui-panel-inset-stroke" />

      {/* adam-tab-edge-fix: mask the rim over the copper (back) section so it reads as recessed/behind */}
      {isTabbedHeader ? (
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-11 pointer-events-none z-30"
          style={{ clipPath: `url(#${backClipId})` }}
        >
          <div aria-hidden className="absolute inset-0 rounded-tr-[22px] border-t-[4px] border-r-[4px] border-[#070A10]" />
        </div>
      ) : null}

      {/* PANEL SURFACE */}
      <div aria-hidden className="absolute inset-0 ui-bento-surface z-0" />
      <div className="absolute inset-0 bg-repeat opacity-[0.06] mix-blend-overlay pointer-events-none z-0 adamNoiseOverlay"></div>
      <div
        aria-hidden
        className="absolute inset-[2px] rounded-[20px] bg-gradient-to-b from-white/10 via-white/0 to-black/10 pointer-events-none z-10"
      />

      {/* HEADER */}
      {isTabbedHeader ? (
        /* Folder-split header for bottom-row cards */
        <div
          className={`relative h-11 shrink-0 z-10 ${isOpenable ? 'cursor-pointer' : ''}`}
          role={isOpenable ? 'button' : undefined}
          tabIndex={isOpenable ? 0 : undefined}
          onClick={() => onOpen?.()}
          onKeyDown={(e) => {
            if (!isOpenable) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen?.();
            }
          }}
        >
          {/* SVG clip path definitions + diagonal copper stroke */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              {/* Back (copper) clip: fills to the top/right edge (rim masked above) */}
              <clipPath id={backClipId} clipPathUnits="objectBoundingBox">
                <path d="M0.55,0.00 L1,0.00 L1,1 L0.63,1 Q0.61,1 0.59,0.78 L0.54,0.44 Q0.53,0.00 0.55,0.00 Z" />
              </clipPath>
              {/* Front (slate) clip: full height on left with diagonal to bottom-right */}
              <clipPath id={frontClipId} clipPathUnits="objectBoundingBox">
                <path d="M0,0 L0.61,0 Q0.63,0 0.64,0.20 L0.69,0.76 Q0.70,1 0.72,1 L0,1 Z" />
              </clipPath>
            </defs>
            {/* Diagonal/front-outline stroke (clipped to the front so it hugs the slate) */}
            {isOutlinedTabbedHeader ? (
              <>
                <g clipPath={`url(#${frontClipId})`}>
                  {/* top edge + diagonal (front/grey) */}
                  <path
                    d="M-2,0.8 H61.6 Q63.4,0.8 64.2,20 L69.2,76 Q70.3,98 72.8,98"
                    fill="none"
                    stroke="rgba(0,0,0,0.65)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M-2,0.8 H61.6 Q63.4,0.8 64.2,20 L69.2,76 Q70.3,98 72.8,98"
                    fill="none"
                    stroke="rgba(var(--ui-accentHot-rgb),0.92)"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(var(--ui-accentHot-rgb),0.55))' }}
                  />
                  <path
                    d="M-2,0.8 H61.6 Q63.4,0.8 64.2,20 L69.2,76 Q70.3,98 72.8,98"
                    fill="none"
                    stroke="rgba(255,235,200,0.98)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>

                {/* under-tab edge: curve + straight to meet the right border */}
                <g clipPath={`url(#${backClipId})`}>
                  <path
                    d="M69,98 H103"
                    fill="none"
                    stroke="rgba(0,0,0,0.65)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M69,98 H103"
                    fill="none"
                    stroke="rgba(var(--ui-accentHot-rgb),0.92)"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(var(--ui-accentHot-rgb),0.55))' }}
                  />
                  <path
                    d="M69,98 H103"
                    fill="none"
                    stroke="rgba(255,235,200,0.98)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              </>
            ) : (
              <path
                d="M61,0 Q63,0 64,20 L69,76 Q70,100 72,100"
                fill="none"
                stroke="rgba(var(--ui-accent-rgb),0.85)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Back layer: Copper tab (positioned lower, creating visible gap at top-right) */}
          <div
            aria-hidden
            className="absolute inset-0 copperPlate"
            style={{ clipPath: `url(#${backClipId})` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-black/8 opacity-60"
            style={{ clipPath: `url(#${backClipId})` }}
          />

          {/* Front layer: Slate header with folder lip (full height) */}
          <div
            aria-hidden
            className="absolute inset-0 ui-bento-front"
            style={{ clipPath: `url(#${frontClipId})` }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/0 to-black/4 pointer-events-none"
            style={{ clipPath: `url(#${frontClipId})` }}
          />

          {/* Header content */}
          <div className="relative h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 rounded-full bg-[rgba(var(--ui-accentHot-rgb),0.72)] shadow-[0_0_12px_rgba(var(--ui-accentHot-rgb),0.22)]" />
              <span className="text-[16px] font-semibold tracking-[0.04em] text-white/92 leading-none">{title}</span>
            </div>

            {/* Menu in copper area */}
            <div className="flex items-center gap-2">
              {controls}
              {showMenu ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMenuClick) {
                      onMenuClick();
                      return;
                    }
                    if (isOpenable) onOpen?.();
                  }}
                  className="text-amber-200/80 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                  aria-label={`Open ${title} menu`}
                >
                  <MoreHorizontal size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {!isOutlinedTabbedHeader ? (
            <div
              aria-hidden
              className="absolute bottom-0 left-0 w-full h-[2px] bg-[rgba(200,137,93,0.55)]"
              style={{ clipPath: `url(#${frontClipId})` }}
            />
          ) : null}
        </div>
      ) : (
        /* Plain header for top-row cards */
        <div
          className={`relative h-12 shrink-0 flex items-center justify-between px-4 z-10 ${isOpenable ? 'cursor-pointer' : ''}`}
          role={isOpenable ? 'button' : undefined}
          tabIndex={isOpenable ? 0 : undefined}
          onClick={() => onOpen?.()}
          onKeyDown={(e) => {
            if (!isOpenable) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen?.();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded-full bg-[rgba(var(--ui-accentHot-rgb),0.72)] shadow-[0_0_12px_rgba(var(--ui-accentHot-rgb),0.22)]" />
            {variant === 'roster' && <Search size={14} className="text-amber-300/90" />}
            <span className="text-[14px] font-semibold tracking-[0.04em] text-white/90 leading-none">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            {controls ? <div className="shrink-0">{controls}</div> : null}
            {showMenu ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMenuClick) {
                    onMenuClick();
                    return;
                  }
                  if (isOpenable) onOpen?.();
                }}
                className="text-white/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                aria-label={`Open ${title} menu`}
              >
                <MoreHorizontal size={16} />
              </button>
            ) : null}
          </div>

          <div className="absolute bottom-0 left-0 w-full h-px ui-divider" />
        </div>
      )}

      {/* BODY */}
      <div className="flex-1 min-h-0 relative flex flex-col z-10">{children}</div>
    </div>
  );
};


// --- COMPONENT: CHART (TapTools equity curve) ---

type RevolutChartProps = {
  range: PortfolioRange;
  address?: string;
  quote?: 'ADA' | 'USD' | 'EUR' | 'ETH' | 'BTC';
};

const RevolutChart = ({ range, address, quote = 'USD' }: RevolutChartProps) => {
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [summary, setSummary] = useState<{ endValue: number; changePct: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  const setDemo = () => {
    const arr: ChartPoint[] = [];
    const now = Math.floor(Date.now() / 1000);
    for (let i = 0; i <= 100; i += 2) {
      const y = 50 + Math.sin(i * 0.1) * 20 + Math.sin(i * 0.3) * 10 + i * 0.2;
      const yy = Math.min(Math.max(y, 10), 90);
      const value = 12403.92 + (yy - 50) * 20;
      arr.push({ x: i, y: yy, time: now - (100 - i) * 60, value });
    }
    setPoints(arr);
    setSummary({ endValue: 12403.92, changePct: 8.4 });
    setIsLive(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      if (!address) {
        setDemo();
        return;
      }

      try {
        const url = new URL('/api/portfolio/equity', window.location.origin);
        url.searchParams.set('address', address);
        url.searchParams.set('range', range);
        url.searchParams.set('quote', quote);

        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) throw new Error(`equity fetch failed: ${res.status}`);

        const data = (await res.json()) as {
          points?: PortfolioSeriesPoint[];
          summary?: { endValue?: number; changePct?: number };
        };

        const series = (data.points ?? []).slice().sort((a, b) => a.time - b.time);
        if (series.length === 0) throw new Error('no series points');

        const values = series.map((p) => p.value);
        const minV = Math.min(...values);
        const maxV = Math.max(...values);
        const span = maxV - minV;

        const n = series.length;
        const mapped: ChartPoint[] = series.map((p, idx) => {
          const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
          const t = span === 0 ? 0.5 : (p.value - minV) / span;
          const y = 90 - clampNum(t, 0, 1) * 80;
          return { x, y, time: p.time, value: p.value };
        });

        setPoints(mapped);
        setSummary({
          endValue: data.summary?.endValue ?? series[series.length - 1].value,
          changePct:
            data.summary?.changePct ??
            (series[0].value === 0 ? 0 : ((series[series.length - 1].value - series[0].value) / series[0].value) * 100),
        });
        setIsLive(true);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setDemo();
      }
    };

    run();
    return () => controller.abort();
  }, [address, range, quote]);

  const pathD =
    points.length > 0
      ? `M${points[0].x},${100 - points[0].y} ` + points.map((p) => `L${p.x},${100 - p.y}`).join(' ')
      : '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    if (points.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xNorm = clampNum(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const idx = Math.round((xNorm / 100) * (points.length - 1));
    const p = points[clampNum(idx, 0, points.length - 1)];

    setHoverData({ x: p.x, y: p.y, time: p.time, value: p.value });
  };

  const currentVal = hoverData ? hoverData.value : summary?.endValue ?? 0;
  const currentPct = summary?.changePct ?? 0;
  const isPositive = currentPct >= 0;

  return (
    <div className="h-full min-h-0 flex flex-col relative group select-none overflow-hidden rounded-b-2xl">
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <div className="text-3xl font-bold text-white tracking-tight font-sans drop-shadow-md">
          ${formatUsd(currentVal)}
        </div>
        <div className={`flex items-center gap-2 text-sm tabular-nums font-medium mt-1 ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
          <ArrowUpRight size={14} className={isPositive ? '' : 'rotate-90'} />{' '}
          {isPositive ? '+' : ''}
          {currentPct.toFixed(2)}% ({rangeToLabel(range)})
          <span className="ml-2 text-[10px] tracking-wider uppercase text-white/35">
            {isLive ? 'LIVE' : 'DEMO'}
          </span>
        </div>
      </div>

      <div
        className="flex-1 w-full relative cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverData(null)}
      >
        <div ref={containerRef} className="absolute inset-0 px-4 pt-10 pb-2 overflow-hidden">
          <svg className="w-full h-full block" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#2DD4BF" />
              </linearGradient>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.1" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </linearGradient>
            </defs>

            {pathD ? (
              <path
                d={pathD}
                fill="url(#fillGradient)"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]"
              />
            ) : null}

            {hoverData ? (
              <g>
                <line
                  x1={hoverData.x}
                  y1="0"
                  x2={hoverData.x}
                  y2="100"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
                <circle
                  cx={hoverData.x}
                  cy={100 - hoverData.y}
                  r="4"
                  fill="#181B21"
                  stroke="#D97706"
                  strokeWidth="2"
                />
                <circle cx={hoverData.x} cy={100 - hoverData.y} r="8" fill="#D97706" opacity="0.3" />
              </g>
            ) : null}
          </svg>
        </div>
      </div>
    </div>
  );
};
// --- MAIN LAYOUT ---
export default function DashboardPage() {
  const { style: uiStyle } = useUiStyle();
  return uiStyle === 'hud' ? <HudDashboard /> : <ClassicDashboard />;
}

function ClassicDashboard() {
  const [activeTab, setActiveTab] = useState<PortfolioRange>('1H');

  const { style: uiStyle } = useUiStyle();
  const isHud = uiStyle === 'hud';



  const router = useRouter();
  const [view, setView] = useState<'dashboard' | 'portfolio' | 'chatFull' | 'settings'>('dashboard');

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle file upload - for now, just show a message
    const fileNames = Array.from(files).map((f) => f.name).join(', ');
    sendChatText(`[File uploaded: ${fileNames}]`);
    
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  const sendChat = () => sendChatText(chatInput);

  const botWallets = [
    {
      id: 'alpha',
      label: 'Alpha Sniper',
      address: 'addr1q8p209qzgw25tmnu3eu9x5jk82twxr28jm5022c0s4ht7cts2sap',
    },
    {
      id: 'snek',
      label: 'Snek Farmer',
      address: 'addr1q9m9m5v6l3y0n3u6rzz0w3z0k0d9t3d0s5s3k0n0l0s9s8s3k0',
    },
    {
      id: 'base',
      label: 'Base Runner',
      address: '0x8a22...c0de',
    },
  ] as const;

  const [receiveWalletId, setReceiveWalletId] = useState<(typeof botWallets)[number]['id']>('alpha');
  const receiveWallet = botWallets.find((w) => w.id === receiveWalletId) ?? botWallets[0];
  const [copied, setCopied] = useState(false);

  const [sendRecipient, setSendRecipient] = useState('');
  const [sendAsset, setSendAsset] = useState<'ADA' | 'USDC' | 'SOL'>('ADA');
  const [sendAmount, setSendAmount] = useState('');

  const heldPositions = [
    {
      symbol: 'ADA',
      name: 'Cardano',
      amount: '191.530038 ADA',
      value: '$71.49',
    },
    {
      symbol: 'SNEK',
      name: 'Snek',
      amount: '455 SNEK',
      value: '$0.00',
      subtitle: '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b',
    },
  ] as const;

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  const systemStatus = [
    {
      label: 'Execution Engine',
      status: 'ONLINE',
      textClass: 'text-teal-400',
      dotClass: 'bg-teal-400',
      pulse: true,
    },
    { label: 'Data Feeds', status: '12ms', textClass: 'text-teal-400', dotClass: 'bg-teal-400', pulse: false },
    { label: 'AI Logic Core', status: 'TRAINING', textClass: 'text-amber-500', dotClass: 'bg-amber-500', pulse: false },
  ] as const;

  return (
    <div className="h-screen bg-[var(--ui-bg0)] text-[var(--ui-text)] font-terminal flex flex-col overflow-hidden relative min-w-0">
      {/* GLOBAL BACKGROUND & LIGHTING */}
      {isHud ? (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(1200px_800px_at_30%_20%,rgba(var(--ui-accent-rgb),0.10),transparent_55%),radial-gradient(1000px_700px_at_70%_35%,rgba(var(--ui-accentHot-rgb),0.08),transparent_60%),linear-gradient(180deg,var(--ui-bg1),var(--ui-bg0))]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(1200px_900px_at_50%_30%,transparent_45%,rgba(0,0,0,0.40)_80%),repeating-linear-gradient(180deg,rgba(255,255,255,0.02)_0px,rgba(255,255,255,0.02)_1px,transparent_2px,transparent_4px)] opacity-90"
          />
          <div aria-hidden className="absolute inset-0 bg-repeat opacity-[0.10] mix-blend-overlay pointer-events-none adamNoiseOverlay" />
        </>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-[#2B3340] via-[#0E1117] to-[#070A10]"
          />
          <div aria-hidden className="absolute inset-0 bg-repeat opacity-[0.06] mix-blend-overlay pointer-events-none adamNoiseOverlay" />
          <div aria-hidden className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/14 blur-[150px] pointer-events-none" />
        </>
      )}
      {/* HEADER */}
      <header
        className={
          'h-[10vh] shrink-0 backdrop-blur-md flex items-center px-[clamp(20px,3vw,64px)] z-50 relative shadow-[0_1px_5px_rgba(0,0,0,0.22)] font-adam-header ' +
          (isHud
            ? 'bg-[rgba(7,7,10,0.72)] border-b border-[rgba(var(--ui-accent-rgb),0.18)]'
            : 'bg-[#0F1115]/60 border-b border-amber-500/15')
        }
      >
        <div className="w-full max-w-[1920px] 2xl:max-w-[2560px] mx-auto h-full grid grid-cols-12 items-center gap-6 min-w-0">
          {/* Brand */}
          <div className="col-span-6 md:col-span-3 flex items-center h-full min-w-0">
              <button
                type="button"
                onClick={() => {
                  setIsChatDockOpen(false);
                  setView('dashboard');
                }}
                className="h-full w-full max-w-[clamp(280px,26vw,480px)] flex items-center"
                aria-label="Go to Dashboard"
              >
                <picture className="h-[clamp(48px,9vh,90px)] w-full overflow-hidden flex items-center">
                <img
                  src="/brand/adam-mark.png"
                  alt="ADAM"
                  className="h-full w-full object-contain object-left"
                  draggable={false}
                />
              </picture>
            </button>
          </div>

          {/* Nav */}
          <div className="hidden md:flex md:col-span-6 items-center justify-center min-w-0 -translate-x-[clamp(24px,2vw,56px)]">
            <nav className="flex items-center gap-[clamp(18px,2.3vw,44px)]">
            {(
              [
                { key: 'dashboard', label: 'Dashboard', onClick: () => setView('dashboard') },
                { key: 'portfolio', label: 'Portfolio', onClick: () => setView('portfolio') },
                { key: 'aiAgents', label: 'AI Agents', onClick: () => router.push('/squad') },
                { key: 'aiChat', label: 'AI Chat', onClick: () => { setIsChatDockOpen(false); setView('chatFull'); } },
                { key: 'settings', label: 'Settings', onClick: () => setView('settings') },
              ] as const
            ).map((item) => {
              const isActive =
                (view === 'dashboard' && item.key === 'dashboard') ||
                (view === 'portfolio' && item.key === 'portfolio') ||
                (view === 'chatFull' && item.key === 'aiChat') ||
                (view === 'settings' && item.key === 'settings');

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                    className={
                      'relative uppercase text-[clamp(12px,1.14vw,22px)] font-semibold tracking-[0.12em] transition-colors ' +
                    (isActive
                      ? 'text-transparent bg-clip-text bg-[linear-gradient(180deg,rgba(var(--ui-accentHot-rgb),0.95),rgba(var(--ui-accent-rgb),0.95))] drop-shadow-[0_0_10px_rgba(var(--ui-accent-rgb),0.22)]'
                      : 'text-white/65 hover:text-[rgb(var(--ui-accent-rgb))]')
                  }
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={
                      'absolute -bottom-3 left-0 right-0 h-[2px] rounded-full transition-opacity ' +
                      (isActive
                        ? 'opacity-100 bg-gradient-to-r from-transparent via-[rgb(var(--ui-accent-rgb))] to-transparent shadow-[0_0_14px_rgba(var(--ui-accent-rgb),0.55)]'
                        : 'opacity-0')
                    }
                  />
                </button>
              );
            })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-[clamp(8px,1vw,16px)] min-w-0">
            <UiStyleToggle className="shrink-0" />
            <button
              type="button"
              className="p-[clamp(8px,0.8vw,12px)] rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-[clamp(20px,1.44vw,30px)] h-[clamp(20px,1.44vw,30px)]" />
            </button>
            <button
              type="button"
              className="flex items-center gap-[clamp(8px,0.8vw,12px)] bg-[#13151A]/70 hover:bg-[#1C1F26]/80 border border-amber-500/20 px-[clamp(12px,1vw,16px)] py-[clamp(6px,0.6vw,10px)] rounded-full transition-all shadow-[0_8px_22px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] font-terminal"
            >
              <Wallet className="w-[clamp(16px,1.2vw,22px)] h-[clamp(16px,1.2vw,22px)] text-amber-300" />
              <span className="text-[clamp(11px,1.02vw,17px)] font-semibold text-white/85">0x...8a22</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative z-10 px-[clamp(20px,3vw,64px)] pt-[clamp(16px,2vh,28px)] min-w-0">
        <div className="w-full max-w-[1920px] 2xl:max-w-[2560px] mx-auto h-full flex flex-col min-w-0">
          <div className="flex-1 min-h-0 grid grid-cols-12 gap-[clamp(16px,2vw,24px)] min-w-0">
          {/* COLUMN 1: AGENT ROSTER */}
          <div className="col-span-12 lg:col-span-3 xl:col-span-3 2xl:col-span-3 h-full min-h-0">
            <BentoCard title="Agent Roster" variant="roster" className="h-full" onOpen={() => router.push('/squad')}>
              <ScrollHintArea className="py-2 px-1">
                <RosterItem name="Alpha Sniper" role="Momentum" chain="SOL" status="active" pnl="+12.4%" />
                <RosterItem name="Snek Farmer" role="Grid Bot" chain="ADA" status="active" pnl="+3.2%" />
                <RosterItem name="Base Runner" role="Perps" chain="BASE" status="inactive" pnl="0.0%" />

                <button
                  type="button"
                  className="mx-2 my-2 w-[calc(100%-16px)] py-4 rounded-xl border border-dashed border-[#2A303C] bg-white/0 text-gray-500 hover:text-[rgb(200,137,93)] hover:border-[rgba(200,137,93,0.45)] hover:bg-[rgba(200,137,93,0.08)] transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  <Plus size={18} /> Deploy New Agent
                </button>
              </ScrollHintArea>
            </BentoCard>
          </div>

          {/* COLUMN 2: DASHBOARD */}
          <div className="col-span-12 lg:col-span-9 xl:col-span-9 2xl:col-span-9 h-full min-h-0 grid grid-rows-[1.72fr_1fr] gap-[clamp(16px,2vw,24px)]">
            {/* TOP HALF */}
            <div className="grid grid-cols-12 gap-[clamp(16px,2vw,24px)] h-full min-h-0">
              <div className="col-span-12 lg:col-span-8 xl:col-span-8 2xl:col-span-8 h-full min-h-0">
                <BentoCard
                  title="Portfolio Performance"
                  className="h-full"
                  showMenu={false}
                  controls={
                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/25 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      {(['1H', '24H', '7D', '30D', 'ALL'] as const).map((t) => {
                        const isActive = activeTab === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setActiveTab(t)}
                            className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                              isActive
                                ? 'copperButtonRaised text-white shadow-[0_6px_14px_rgba(217,119,6,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  }
                >
                  <RevolutChart range={activeTab} address={process.env.NEXT_PUBLIC_DEFAULT_STAKE_ADDRESS} />
                </BentoCard>
              </div>

              <div className="col-span-12 lg:col-span-4 xl:col-span-4 2xl:col-span-4 h-full min-h-0">
                <BentoCard title="Holdings" className="h-full" onOpen={() => setView('portfolio')} onMenuClick={() => setView('portfolio')}>
                  <ScrollHintArea className="p-4 space-y-1">
                    {[
                      { s: 'SOL', n: 'Solana', v: '$4,200', c: 'bg-purple-600' },
                      { s: 'ADA', n: 'Cardano', v: '$1,840', c: 'bg-blue-600' },
                      { s: 'SNEK', n: 'Snek', v: '$920', c: 'bg-yellow-500' },
                      { s: 'WIF', n: 'Dogwifhat', v: '$410', c: 'bg-orange-900' },
                      { s: 'BONK', n: 'Bonk', v: '$220', c: 'bg-orange-600' },
                      { s: 'ETH', n: 'Ethereum', v: '$140', c: 'bg-indigo-600' },
                      { s: 'USDC', n: 'USD Coin', v: '$50', c: 'bg-blue-400' },
                      { s: 'XRP', n: 'Ripple', v: '$45', c: 'bg-gray-400' },
                      { s: 'DOT', n: 'Polkadot', v: '$32', c: 'bg-pink-600' },
                    ].map((coin, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full ${coin.c} flex items-center justify-center text-white text-[10px] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.3)] shadow-inner`}
                          >
                            {coin.s[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-200">{coin.s}</div>
                            <div className="text-[10px] text-gray-500">{coin.n}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm tabular-nums font-medium text-gray-200">{coin.v}</div>
                        </div>
                      </div>
                    ))}
                  </ScrollHintArea>
                </BentoCard>
              </div>
            </div>

            {/* BOTTOM HALF */}
            <div className="grid grid-cols-12 gap-[clamp(16px,2vw,24px)] h-full min-h-0">
              <BentoCard title="Recent Trades" headerStyle="tabbed" tabbedFrontOutline className="h-full min-h-0 col-span-12 lg:col-span-4 xl:col-span-4">
                <ScrollHintArea className="p-3 space-y-1">
                  {[
                    { t: 'BUY', p: 'SNEK/ADA', v: '0.0021', time: '2m' },
                    { t: 'SELL', p: 'SOL/USDC', v: '142.50', time: '12m' },
                    { t: 'BUY', p: 'WIF/SOL', v: '2.10', time: '45m' },
                    { t: 'BUY', p: 'BONK/SOL', v: '0.0004', time: '1h' },
                    { t: 'SELL', p: 'ETH/USDC', v: '3400.2', time: '2h' },
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-white/5 pb-1.5 last:border-0 hover:bg-white/5 -mx-1.5 px-1.5 rounded transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            t.t === 'BUY'
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}
                        >
                          {t.t}
                        </span>
                        <span className="text-[11px] text-gray-300 font-mono">{t.p}</span>
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">{t.time}</span>
                    </div>
                  ))}
                </ScrollHintArea>
              </BentoCard>

              <BentoCard title="Asset Allocation" headerStyle="tabbed" className="h-full min-h-0 col-span-12 lg:col-span-4 xl:col-span-4">
                <div className="h-full flex flex-col items-center justify-center py-1">
                  <div className="w-16 h-16 rounded-full border-[6px] border-amber-600 border-r-teal-400 border-b-[#2A303C] rotate-12 relative shadow-[0_0_16px_rgba(217,119,6,0.2)] mb-1.5"></div>
                  <div className="w-full px-5 space-y-0.5">
                    {[
                      { l: 'SOL', c: 'bg-amber-600', p: '52%' },
                      { l: 'ADA', c: 'bg-teal-400', p: '31%' },
                      { l: 'Other', c: 'bg-[#2A303C]', p: '17%' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${item.c} shadow-sm`}></div>
                          <span className="text-gray-400">{item.l}</span>
                        </div>
                        <span className="font-mono text-gray-300">{item.p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="System Status" headerStyle="tabbed" className="h-full min-h-0 col-span-12 lg:col-span-4 xl:col-span-4">
                <div className="p-3 space-y-2 h-full overflow-y-auto custom-scrollbar">
                  {systemStatus.map((sys) => (
                    <div key={sys.label} className="flex justify-between items-center p-1.5 bg-white/5 rounded-lg border border-white/5">
                      <span className="text-[11px] text-gray-400">{sys.label}</span>
                      <span className={`text-[10px] ${sys.textClass} flex items-center gap-1 font-bold`}>
                        <div className={`w-1.5 h-1.5 ${sys.dotClass} rounded-full ${sys.pulse ? 'animate-pulse' : ''}`}></div>{' '}
                        {sys.status}
                      </span>
                    </div>
                  ))}
                </div>
              </BentoCard>
            </div>
          </div>
          </div>
          <div aria-hidden className="h-[clamp(18px,2.2vh,36px)] shrink-0" />
        </div>


        {/* EXPANDED VIEWS */}
        <div
          className={
            'absolute inset-0 z-40 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] origin-center will-change-[opacity,transform] ' +
            (view === 'dashboard'
              ? 'opacity-0 translate-y-8 scale-[0.92] pointer-events-none'
              : 'opacity-100 translate-y-0 scale-100 pointer-events-auto')
          }
        >
          <div 
            aria-hidden 
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.92)_48%,rgba(0,0,0,0.88)_100%)] backdrop-blur-[40px]"
            onClick={(e) => {
              if (e.target === e.currentTarget && view === 'chatFull') {
                setView('dashboard');
              }
            }}
          />

          <div className="relative h-full overflow-y-auto custom-scrollbar px-[12%] pt-[calc(10vh+2%)] pb-[12%]">
            {view === 'portfolio' ? (
              <div className="max-w-[980px] mx-auto space-y-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-3xl font-semibold text-white">Portfolio</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setView('dashboard')}
                      className="px-4 py-2 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Send / Receive */}
                <div className="relative rounded-[22px] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.65)]">
                  <div aria-hidden className="absolute inset-0 p-[2px] rounded-[22px] copperRim" />
                  <div aria-hidden className="absolute inset-[2px] rounded-[20px] bg-[#0E131C]/88 border border-white/5" />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Send / Receive</h2>
                      <div className="text-[11px] text-white/50">{receiveWallet.label}</div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] items-center">
                        <select
                          value={receiveWalletId}
                          onChange={(e) => setReceiveWalletId(e.target.value as (typeof botWallets)[number]['id'])}
                          className="h-11 rounded-xl bg-[#0F131B]/80 border border-white/10 px-3 text-sm text-white/80 focus:outline-none focus:border-amber-300/40"
                        >
                          {botWallets.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.label}
                            </option>
                          ))}
                        </select>

                        <input
                          value={receiveWallet.address}
                          readOnly
                          className="h-11 w-full rounded-xl bg-[#0F131B]/80 border border-white/10 px-3 text-sm text-white/70 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => copyText(receiveWallet.address)}
                          className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto] items-end">
                        <div>
                          <div className="text-xs text-white/60 mb-2">Recipient</div>
                          <input
                            value={sendRecipient}
                            onChange={(e) => setSendRecipient(e.target.value)}
                            placeholder="Recipient addr1..."
                            className="h-11 w-full rounded-xl bg-[#0F131B]/80 border border-white/10 px-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-white/60 mb-2">Asset</div>
                          <select
                            value={sendAsset}
                            onChange={(e) => setSendAsset(e.target.value as typeof sendAsset)}
                            className="h-11 w-full rounded-xl bg-[#0F131B]/80 border border-white/10 px-3 text-sm text-white/80 focus:outline-none focus:border-amber-300/40"
                          >
                            <option value="ADA">ADA</option>
                            <option value="USDC">USDC</option>
                            <option value="SOL">SOL</option>
                          </select>
                        </div>

                        <div>
                          <div className="text-xs text-white/60 mb-2">Amount</div>
                          <input
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            placeholder="Amount"
                            className="h-11 w-full rounded-xl bg-[#0F131B]/80 border border-white/10 px-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-amber-300/40"
                          />
                        </div>

                        <button
                          type="button"
                          className="h-11 px-6 rounded-xl copperButtonRaised text-white shadow-[0_10px_24px_rgba(200,137,93,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]"
                        >
                          Send
                        </button>
                      </div>

                      <div className="text-xs text-white/55">
                        Balance: 191.5300 ADA{' '}
                        <button type="button" className="ml-2 text-amber-200/80 hover:text-amber-200 underline underline-offset-4">
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio positions */}
                <div className="relative rounded-[22px] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.65)]">
                  <div aria-hidden className="absolute inset-0 p-[2px] rounded-[22px] copperRim" />
                  <div aria-hidden className="absolute inset-[2px] rounded-[20px] bg-[#0E131C]/88 border border-white/5" />

                  <div className="relative p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Portfolio</h2>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-full copperButtonRaised text-white shadow-[0_10px_24px_rgba(200,137,93,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]"
                      >
                        Sell all
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {heldPositions.map((pos) => (
                        <div
                          key={pos.symbol}
                          className="group relative flex items-center justify-between gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/7 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-semibold text-white/80">
                              {pos.symbol[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white/90">{pos.symbol}</div>
                              <div className="text-xs text-white/50">{pos.name}</div>
                              {'subtitle' in pos ? (
                                <div className="text-[10px] text-white/25 font-mono truncate max-w-[520px] mt-1">{pos.subtitle}</div>
                              ) : null}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-semibold text-white/90">{pos.value}</div>
                            <div className="text-xs text-white/50">{pos.amount}</div>
                          </div>

                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-full copperButtonRaised text-white shadow-[0_10px_24px_rgba(200,137,93,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : view === 'chatFull' ? (
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
                        <div
                          key={idx}
                          className={'flex items-start gap-3 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
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
            ) : view === 'settings' ? (
              <div className="max-w-[980px] mx-auto space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[11px] tracking-[0.22em] uppercase text-white/60">Settings</div>
                    <div className="text-2xl font-semibold text-white">Settings</div>
                    <div className="text-sm text-white/50 mt-1">Placeholder.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setView('dashboard')}
                    className="px-4 py-2 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="relative rounded-[22px] overflow-hidden shadow-[0_18px_55px_rgba(0,0,0,0.65)]">
                  <div aria-hidden className="absolute inset-0 p-[2px] rounded-[22px] copperRim" />
                  <div aria-hidden className="absolute inset-[2px] rounded-[20px] bg-[#0E131C]/88 border border-white/5" />
                  <div className="relative p-6 text-white/70">Settings UI TBD.</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

            {/* CHAT POPUP (Glass) */}
      <div
        className={
          'fixed inset-0 z-[90] transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
          (isChatDockOpen ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none')
        }
      >
        {/* No backdrop - background remains normal */}

        {/* Window (Grok-like fade/scale) */}
        <div
          role="dialog"
          aria-label="Agent T chat"
          className={
            'absolute right-[clamp(16px,2.2vw,28px)] bottom-[clamp(16px,2.2vw,28px)] ' +
            'w-[min(460px,92vw)] h-[min(72vh,680px)] origin-bottom-right ' +
            'transition-[opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
            'will-change-[opacity,transform,filter] pointer-events-auto ' +
            (isChatDockOpen
              ? 'opacity-100 translate-y-0 scale-100 blur-0'
              : 'opacity-0 translate-y-4 scale-[0.96] blur-[2px]')
          }
        >
          <div className="relative h-full rounded-[28px] overflow-hidden border border-white/12 bg-[#0E131C]/95 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            {/* Frost gradients */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_55%),radial-gradient(circle_at_82%_12%,rgba(217,119,6,0.16),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.25))]"
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
                      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

      {/* FLOATING CHAT FAB (Textured) */}
      {!isChatDockOpen && view !== 'chatFull' && (
        <div className="fixed bottom-8 right-8 z-[100]">
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
