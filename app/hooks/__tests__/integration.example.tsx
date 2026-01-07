/**
 * Integration Test Examples for API Hooks
 *
 * These are example patterns for testing the API integration layer.
 * Copy and adapt these for your actual test suite.
 */

import { renderHook, waitFor } from '@testing-library/react';
import {
  useAgentList,
  useAgent,
  useRiskConfig,
  useWalletBalance,
  useBotHealth,
} from '../index';

// Mock environment variables
beforeEach(() => {
  process.env.NEXT_PUBLIC_DATA_MODE = 'demo';
  process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'true';
});

describe('Agent Hooks', () => {
  describe('useAgentList', () => {
    it('should fetch agent list in mock mode', async () => {
      const { result } = renderHook(() => useAgentList());

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.agents).toEqual([]);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Check mock data loaded
      expect(result.current.agents.length).toBeGreaterThan(0);
      expect(result.current.listItems.length).toBeGreaterThan(0);
      expect(result.current.error).toBeNull();
    });

    it('should refetch agent list', async () => {
      const { result } = renderHook(() => useAgentList());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialAgents = result.current.agents;

      // Trigger refetch
      await result.current.refetch();

      // Data should be refreshed
      expect(result.current.agents).toBeDefined();
    });
  });

  describe('useAgent', () => {
    it('should fetch single agent', async () => {
      const { result } = renderHook(() => useAgent('agent-t'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.agent).toBeDefined();
      expect(result.current.agent?.id).toBe('agent-t');
      expect(result.current.agent?.name).toBe('Agent T');
    });

    it('should return null for non-existent agent', async () => {
      const { result } = renderHook(() => useAgent('non-existent'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.agent).toBeNull();
    });
  });
});

describe('Risk Configuration', () => {
  it('should fetch risk config', async () => {
    const { result } = renderHook(() => useRiskConfig('bot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeDefined();
    expect(result.current.config?.edgeAfterCost).toBeDefined();
    expect(result.current.config?.liquidityGuard).toBeDefined();
  });

  it('should update risk config', async () => {
    const { result } = renderHook(() => useRiskConfig('bot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update config
    await result.current.updateConfig({
      portfolioRisk: {
        maxOpenPositions: 15,
        maxSinglePositionPct: 20,
        maxDailyLossPct: 5,
      },
    });

    // Check updated
    expect(result.current.config?.portfolioRisk.maxOpenPositions).toBe(15);
  });
});

describe('Wallet Balance', () => {
  it('should fetch wallet balance', async () => {
    const address = 'addr1q9s6m9d8yedfcf53yhq5j5zsg0s58wpzamwexrxpfelgz2';
    const { result } = renderHook(() => useWalletBalance(address));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balance).toBeDefined();
    expect(result.current.balance?.lovelace).toBeDefined();
    expect(result.current.balance?.tokens).toBeDefined();
  });

  it('should poll wallet balance', async () => {
    jest.useFakeTimers();

    const address = 'addr1q9s6m9d8yedfcf53yhq5j5zsg0s58wpzamwexrxpfelgz2';
    const { result } = renderHook(() => useWalletBalance(address, 5000));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialBalance = result.current.balance;

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      // Balance should be updated (or at least re-fetched)
      expect(result.current.balance).toBeDefined();
    });

    jest.useRealTimers();
  });
});

describe('Bot Health', () => {
  it('should fetch bot health', async () => {
    const { result } = renderHook(() => useBotHealth('bot-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.health).toBeDefined();
    expect(result.current.health?.botId).toBe('bot-1');
    expect(result.current.health?.status).toBeDefined();
    expect(result.current.health?.items.length).toBeGreaterThan(0);
  });

  it('should poll bot health', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useBotHealth('bot-1', 15000));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Fast-forward 15 seconds
    jest.advanceTimersByTime(15000);

    await waitFor(() => {
      expect(result.current.health?.lastCheck).toBeDefined();
    });

    jest.useRealTimers();
  });
});

describe('Backend Mode', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'backend';
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
  });

  it('should switch to backend API mode', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ([]),
    }) as jest.Mock;

    const { result } = renderHook(() => useAgentList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify fetch was called with production endpoint
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/bot/admin/deployed-bots'),
      expect.any(Object)
    );
  });

  it('should handle API errors gracefully', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn().mockRejectedValue(
      new Error('Network error')
    ) as jest.Mock;

    const { result } = renderHook(() => useAgentList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should return empty array and no error (graceful fallback)
    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

describe('Error Handling', () => {
  it('should retry failed requests', async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'backend';
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';

    // Mock fetch to fail twice, then succeed
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ([]),
      });
    }) as jest.Mock;

    const { result } = renderHook(() => useAgentList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have retried 3 times
    expect(callCount).toBe(3);
  });

  it('should not retry 404 errors', async () => {
    process.env.NEXT_PUBLIC_DATA_MODE = 'backend';
    process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';

    // Mock 404 response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' }),
    }) as jest.Mock;

    const { result } = renderHook(() => useAgent('non-existent'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only call once (no retries for 404)
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.agent).toBeNull();
  });
});
