'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiCallJson, isBackendMode, withUserAddress } from '@/lib/backend/api';
import { useWalletAddress } from '../contexts/WalletContext';

export type AgentInfo = {
  id: string;
  userId: string;
  walletAddress?: string;
  status?: string;
  botMode?: string;
  botName?: string;
  chain?: 'cardano' | 'solana' | 'base';
  createdAt?: string;
};

export type UserAgentsState = {
  agents: AgentInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

/**
 * Hook to fetch user's agents/bots.
 * 
 * In demo mode: returns empty array or demo data
 * In backend mode: fetches from /api/bot/user-bots endpoint
 * 
 * @param walletAddress - Optional wallet address override (defaults to context wallet)
 */
export function useUserAgents(walletAddressOverride?: string | null): UserAgentsState {
  const contextWalletAddress = useWalletAddress();
  const effectiveAddress = walletAddressOverride ?? contextWalletAddress;
  
  const [state, setState] = useState<UserAgentsState>({
    agents: [],
    isLoading: true,
    error: null,
    refetch: async () => {},
  });

  const fetchAgents = useCallback(async () => {
    // Demo mode: return empty or demo data
    if (!isBackendMode()) {
      // In demo mode, you could return demo agents here if needed
      setState({
        agents: [],
        isLoading: false,
        error: null,
        refetch: fetchAgents,
      });
      return;
    }

    // Backend mode: fetch from API
    if (!effectiveAddress) {
      setState({
        agents: [],
        isLoading: false,
        error: null,
        refetch: fetchAgents,
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        walletAddress: effectiveAddress,
      });

      const data = await apiCallJson<{ bots?: AgentInfo[] } | AgentInfo[]>(
        `/api/bot/user-bots?${params.toString()}`,
        {
          headers: withUserAddress({}, effectiveAddress),
        }
      );

      // Normalize response (backend may return array directly or wrapped in { bots: [...] })
      const agents: AgentInfo[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.bots)
        ? data.bots
        : [];

      // Normalize agent structure
      const normalized: AgentInfo[] = agents.map((bot: any) => ({
        id: bot.id || bot.userId,
        userId: bot.id || bot.userId,
        walletAddress: bot.walletAddress || bot.address,
        status: bot.status,
        botMode: bot.botMode,
        botName: bot.botName,
        chain: bot.chain || bot.botChain,
        createdAt: bot.createdAt,
      }));

      setState({
        agents: normalized,
        isLoading: false,
        error: null,
        refetch: fetchAgents,
      });
    } catch (err) {
      setState({
        agents: [],
        isLoading: false,
        error: err instanceof Error ? err : new Error('Failed to fetch agents'),
        refetch: fetchAgents,
      });
    }
  }, [effectiveAddress]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return state;
}



