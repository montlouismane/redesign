import { NextResponse } from 'next/server';

const TAPTOOLS_BASE_URL = 'https://openapi.taptools.io/api/v1';

type TapToolsPortfolioPoint = { time: number; value: number };

type Range = '1H' | '24H' | '7D' | '30D' | 'ALL';

type EquityResponse = {
  address: string;
  range: Range;
  quote: 'ADA' | 'USD' | 'EUR' | 'ETH' | 'BTC';
  points: TapToolsPortfolioPoint[];
  summary: {
    startTime: number;
    endTime: number;
    startValue: number;
    endValue: number;
    change: number;
    changePct: number;
  };
  meta: {
    source: 'taptools';
    timeframeUsed: '24h' | '7d' | '30d' | '90d' | '180d' | '1y' | 'all';
    cadence: '4h' | '1m-synth';
  };
};

function parseRange(input: string | null): Range {
  const v = (input ?? '').trim().toUpperCase();
  if (v === '1H') return '1H';
  if (v === '24H') return '24H';
  if (v === '7D') return '7D';
  if (v === '30D') return '30D';
  if (v === 'ALL') return 'ALL';

  // allow lowercase like 24h/7d/30d
  if (v === '24H') return '24H';
  if (v === '7D') return '7D';
  if (v === '30D') return '30D';
  if (v === 'ALL') return 'ALL';
  if (v === '1H') return '1H';

  return '24H';
}

function parseQuote(input: string | null): EquityResponse['quote'] {
  const v = (input ?? 'USD').trim().toUpperCase();
  if (v === 'ADA' || v === 'USD' || v === 'EUR' || v === 'ETH' || v === 'BTC') return v;
  return 'USD';
}

function timeframeForRange(range: Range): EquityResponse['meta']['timeframeUsed'] {
  // TapTools wallet/value/trended supports 24h, 7d, 30d, 90d, 180d, 1y, all.
  if (range === '24H' || range === '1H') return '24h';
  if (range === '7D') return '7d';
  if (range === '30D') return '30d';
  return 'all';
}

function clampNum(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeTapToolsSeries(raw: unknown): TapToolsPortfolioPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: TapToolsPortfolioPoint[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const time = rec.time;
    const value = rec.value;
    if (typeof time !== 'number' || typeof value !== 'number') continue;
    // TapTools returns unix seconds
    out.push({ time, value });
  }
  out.sort((a, b) => a.time - b.time);
  return out;
}

function synthLastHour(points: TapToolsPortfolioPoint[]): TapToolsPortfolioPoint[] {
  if (points.length === 0) return [];
  const sorted = [...points].sort((a, b) => a.time - b.time);
  const last = sorted[sorted.length - 1];
  const startTime = last.time - 60 * 60;

  // Find the segment that contains startTime (or the closest preceding segment)
  let segStartIdx = Math.max(0, sorted.length - 2);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].time <= startTime && startTime <= sorted[i + 1].time) {
      segStartIdx = i;
      break;
    }
  }

  const targetPoints: TapToolsPortfolioPoint[] = [];
  const step = 60; // 1 minute
  const steps = 60;

  for (let i = 0; i <= steps; i++) {
    const t = startTime + i * step;

    // walk forward to find correct segment (cheap because series is small)
    while (segStartIdx < sorted.length - 2 && t > sorted[segStartIdx + 1].time) {
      segStartIdx++;
    }

    const a = sorted[segStartIdx];
    const b = sorted[Math.min(segStartIdx + 1, sorted.length - 1)];
    if (a.time === b.time) {
      targetPoints.push({ time: t, value: a.value });
      continue;
    }

    const ratio = clampNum((t - a.time) / (b.time - a.time), 0, 1);
    const v = a.value + (b.value - a.value) * ratio;
    targetPoints.push({ time: t, value: v });
  }

  return targetPoints;
}

function buildSummary(points: TapToolsPortfolioPoint[]) {
  const sorted = [...points].sort((a, b) => a.time - b.time);
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const change = end.value - start.value;
  const changePct = start.value === 0 ? 0 : (change / start.value) * 100;

  return {
    startTime: start.time,
    endTime: end.time,
    startValue: start.value,
    endValue: end.value,
    change,
    changePct,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');
  const range = parseRange(searchParams.get('range'));
  const quote = parseQuote(searchParams.get('quote'));

  if (!address) {
    return NextResponse.json({ error: 'Missing required query param: address' }, { status: 400 });
  }

  const apiKey = process.env.TAPTOOLS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TAPTOOLS_API_KEY is not configured on the server' },
      { status: 501 }
    );
  }

  const timeframeUsed = timeframeForRange(range);
  const url = new URL(`${TAPTOOLS_BASE_URL}/wallet/value/trended`);
  url.searchParams.set('address', address);
  url.searchParams.set('timeframe', timeframeUsed);
  url.searchParams.set('quote', quote);

  const upstream = await fetch(url.toString(), {
    headers: { 'x-api-key': apiKey },
    // cache a bit to avoid burning quota in dev
    next: { revalidate: 30 },
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '');
    return NextResponse.json(
      { error: 'TapTools request failed', status: upstream.status, details: text.slice(0, 500) },
      { status: 502 }
    );
  }

  const raw = await upstream.json();
  const basePoints = normalizeTapToolsSeries(raw);

  if (basePoints.length === 0) {
    return NextResponse.json(
      { error: 'TapTools returned no points for this address/timeframe' },
      { status: 404 }
    );
  }

  const points = range === '1H' ? synthLastHour(basePoints) : basePoints;
  const summary = buildSummary(points);

  const payload: EquityResponse = {
    address,
    range,
    quote,
    points,
    summary,
    meta: {
      source: 'taptools',
      timeframeUsed,
      cadence: range === '1H' ? '1m-synth' : '4h',
    },
  };

  return NextResponse.json(payload);
}