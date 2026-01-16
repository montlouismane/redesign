'use client';

import { useState, useEffect } from 'react';

// =============================================================================
// Types
// =============================================================================

type CacheEntry<T = unknown> = {
  promise?: Promise<T>;
  data?: T;
  error?: Error;
  fetchedAt: number;
};

export type TaptoolsHookState<T = unknown> = {
  data?: T;
  error?: Error;
  loading: boolean;
  stale: boolean;
  degraded: boolean;
};

export type TaptoolsPortfolioItem = {
  unit: string;
  name: string;
  ticker?: string;
  quantity: string;
  decimals: number;
  price?: number;
  value?: number;
  change24h?: number;
};

export type TaptoolsPortfolioResponse = {
  positions: TaptoolsPortfolioItem[];
  totalValue: number;
  change24h: number;
};

export type TaptoolsTradeEntry = {
  id: string;
  txHash: string;
  timestamp: string;
  pair: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  value: number;
};

export type TaptoolsTradeHistoryResponse = {
  trades: TaptoolsTradeEntry[];
  total: number;
};

export type TaptoolsTokenPriceResponse = {
  unit: string;
  price: number;
  change24h: number;
  volume24h: number;
};

// =============================================================================
// Cache Configuration
// =============================================================================

const portfolioCache = new Map<string, CacheEntry<TaptoolsPortfolioResponse>>();
const tokenPriceCache = new Map<string, CacheEntry<TaptoolsTokenPriceResponse>>();
const tradeHistoryCache = new Map<string, CacheEntry<TaptoolsTradeHistoryResponse>>();

// Frontend TTLs - stay within 5-15s guidance for fast-moving data
const PORTFOLIO_TTL_MS = Number(process.env.NEXT_PUBLIC_TAPTOOLS_PORTFOLIO_TTL_MS || 10000);
const TOKEN_PRICE_TTL_MS = Number(process.env.NEXT_PUBLIC_TAPTOOLS_TOKEN_TTL_MS || 7500);
const TRADE_HISTORY_TTL_MS = Number(process.env.NEXT_PUBLIC_TAPTOOLS_TRADE_TTL_MS || 10000);

// =============================================================================
// Telemetry
// =============================================================================

function recordTaptoolsMetric(kind: string) {
  try {
    if (typeof window !== 'undefined') {
      const w = window as unknown as Record<string, unknown>;
      const metrics = (w.__talosTaptoolsMetrics as Record<string, number>) || { hits: 0 };
      metrics[kind] = (metrics[kind] || 0) + 1;
      metrics.hits += 1;
      w.__talosTaptoolsMetrics = metrics;
    } else if (process.env.NODE_ENV === 'development') {
      console.debug(`[TaptoolsMetrics] ${kind}`);
    }
  } catch {
    // Best-effort telemetry only
  }
}

// =============================================================================
// Cache Helper
// =============================================================================

async function fetchWithCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  url: string,
  ttlMs: number,
  kind: string,
  errorCode: string
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached) {
    // Return in-flight promise if one exists
    if (cached.promise) {
      recordTaptoolsMetric(`${kind}:inflightReuse`);
      return cached.promise;
    }

    const age = now - cached.fetchedAt;

    // Return cached data if still fresh
    if (cached.data !== undefined && age < ttlMs) {
      recordTaptoolsMetric(`${kind}:cacheHit`);
      return cached.data;
    }
  }

  // Make network request
  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(errorCode);
      }
      return res.json() as Promise<T>;
    })
    .then((data) => {
      cache.set(key, { data, fetchedAt: Date.now() });
      recordTaptoolsMetric(`${kind}:networkFetch`);
      return data;
    })
    .catch((err) => {
      const error = err instanceof Error ? err : new Error(errorCode);
      cache.delete(key); // Don't cache errors - allow immediate retry
      recordTaptoolsMetric(`${kind}:networkError`);
      throw error;
    });

  cache.set(key, { promise, fetchedAt: now });
  return promise;
}

function computeFlags<T>(entry: CacheEntry<T> | undefined, ttlMs: number) {
  if (!entry) return { stale: false, degraded: false };
  const age = Date.now() - entry.fetchedAt;
  const stale = !!entry.data && age > ttlMs;
  return { stale, degraded: false }; // degraded always false since errors aren't cached
}

// =============================================================================
// Fetch Functions
// =============================================================================

export async function fetchTaptoolsPortfolio(address: string): Promise<TaptoolsPortfolioResponse> {
  if (!address) {
    throw new Error('taptools_portfolio_address_required');
  }
  const key = `portfolio:${address}`;
  const url = `/api/taptools/portfolio?address=${encodeURIComponent(address)}`;
  return fetchWithCache<TaptoolsPortfolioResponse>(
    portfolioCache,
    key,
    url,
    PORTFOLIO_TTL_MS,
    'portfolio',
    'taptools_portfolio_failed'
  );
}

export async function fetchTaptoolsTokenPrice(unit: string): Promise<TaptoolsTokenPriceResponse> {
  if (!unit) {
    throw new Error('taptools_token_unit_required');
  }
  const key = `token:${unit}`;
  const url = `/api/taptools/token-price?unit=${encodeURIComponent(unit)}`;
  return fetchWithCache<TaptoolsTokenPriceResponse>(
    tokenPriceCache,
    key,
    url,
    TOKEN_PRICE_TTL_MS,
    'tokenPrice',
    'taptools_token_price_failed'
  );
}

export async function fetchTaptoolsTradeHistory(
  address: string,
  perPage = 20
): Promise<TaptoolsTradeHistoryResponse> {
  if (!address) {
    throw new Error('taptools_trade_history_address_required');
  }
  const key = `trades:${address}:${perPage}`;
  const url = `/api/taptools/trade-history?address=${encodeURIComponent(address)}&perPage=${encodeURIComponent(
    String(perPage)
  )}`;
  return fetchWithCache<TaptoolsTradeHistoryResponse>(
    tradeHistoryCache,
    key,
    url,
    TRADE_HISTORY_TTL_MS,
    'tradeHistory',
    'taptools_trade_history_failed'
  );
}

export function clearTaptoolsCache() {
  portfolioCache.clear();
  tokenPriceCache.clear();
  tradeHistoryCache.clear();
}

// =============================================================================
// React Hooks
// =============================================================================

export function useTaptoolsPortfolio(
  address?: string | null
): TaptoolsHookState<TaptoolsPortfolioResponse> {
  const [state, setState] = useState<TaptoolsHookState<TaptoolsPortfolioResponse>>({
    data: undefined,
    error: undefined,
    loading: !!address,
    stale: false,
    degraded: false,
  });

  useEffect(() => {
    if (!address) {
      setState({
        data: undefined,
        error: undefined,
        loading: false,
        stale: false,
        degraded: false,
      });
      return;
    }

    let cancelled = false;
    const key = `portfolio:${address}`;
    const entry = portfolioCache.get(key);

    if (entry) {
      const { stale, degraded } = computeFlags(entry, PORTFOLIO_TTL_MS);
      setState({
        data: entry.data,
        error: entry.error,
        loading: !!entry.promise && !entry.data,
        stale,
        degraded,
      });
    } else {
      setState((prev) => ({
        ...prev,
        loading: true,
      }));
    }

    fetchTaptoolsPortfolio(address)
      .then((data) => {
        if (cancelled) return;
        const latest = portfolioCache.get(key);
        const { stale } = computeFlags(latest, PORTFOLIO_TTL_MS);
        setState({
          data,
          error: undefined,
          loading: false,
          stale,
          degraded: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          loading: false,
          degraded: true,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return state;
}

export function useTaptoolsTokenPrice(
  unit?: string | null
): TaptoolsHookState<TaptoolsTokenPriceResponse> {
  const [state, setState] = useState<TaptoolsHookState<TaptoolsTokenPriceResponse>>({
    data: undefined,
    error: undefined,
    loading: !!unit,
    stale: false,
    degraded: false,
  });

  useEffect(() => {
    if (!unit) {
      setState({
        data: undefined,
        error: undefined,
        loading: false,
        stale: false,
        degraded: false,
      });
      return;
    }

    let cancelled = false;
    const key = `token:${unit}`;
    const entry = tokenPriceCache.get(key);

    if (entry) {
      const { stale, degraded } = computeFlags(entry, TOKEN_PRICE_TTL_MS);
      setState({
        data: entry.data,
        error: entry.error,
        loading: !!entry.promise && !entry.data,
        stale,
        degraded,
      });
    } else {
      setState((prev) => ({
        ...prev,
        loading: true,
      }));
    }

    fetchTaptoolsTokenPrice(unit)
      .then((data) => {
        if (cancelled) return;
        const latest = tokenPriceCache.get(key);
        const { stale } = computeFlags(latest, TOKEN_PRICE_TTL_MS);
        setState({
          data,
          error: undefined,
          loading: false,
          stale,
          degraded: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          loading: false,
          degraded: true,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [unit]);

  return state;
}

export function useTaptoolsTradeHistory(
  address?: string | null,
  perPage = 20
): TaptoolsHookState<TaptoolsTradeHistoryResponse> {
  const [state, setState] = useState<TaptoolsHookState<TaptoolsTradeHistoryResponse>>({
    data: undefined,
    error: undefined,
    loading: !!address,
    stale: false,
    degraded: false,
  });

  useEffect(() => {
    if (!address) {
      setState({
        data: undefined,
        error: undefined,
        loading: false,
        stale: false,
        degraded: false,
      });
      return;
    }

    let cancelled = false;
    const key = `trades:${address}:${perPage}`;
    const entry = tradeHistoryCache.get(key);

    if (entry) {
      const { stale, degraded } = computeFlags(entry, TRADE_HISTORY_TTL_MS);
      setState({
        data: entry.data,
        error: entry.error,
        loading: !!entry.promise && !entry.data,
        stale,
        degraded: false,
      });
    } else {
      setState((prev) => ({
        ...prev,
        loading: true,
      }));
    }

    fetchTaptoolsTradeHistory(address, perPage)
      .then((data) => {
        if (cancelled) return;
        const latest = tradeHistoryCache.get(key);
        const { stale } = computeFlags(latest, TRADE_HISTORY_TTL_MS);
        setState({
          data,
          error: undefined,
          loading: false,
          stale,
          degraded: false,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          loading: false,
          degraded: true,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [address, perPage]);

  return state;
}
