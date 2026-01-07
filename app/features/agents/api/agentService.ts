import type {
  Agent,
  AgentMode,
  AgentStatus,
  AgentSettings,
  CreateAgentPayload,
  UpdateAgentPayload,
  AgentListItem,
  ProductionBotStatus,
  ProductionBotConfig,
  ProductionDeployRequest,
  ProductionDeployResponse,
  ProductionUpdatePortfolioRequest,
} from '../types';
import { agentModeToMode } from '../types';
import { DEFAULT_AGENT_SETTINGS } from '../constants';
import { mockAgents, generateAgentId } from './mockData';

// =============================================================================
// Configuration
// =============================================================================

// Production API base path (aligned with docs/AGENT_HANDOFF.md)
const API_BASE = '/api/bot';

// Environment-based toggle (controlled by NEXT_PUBLIC_USE_MOCK_DATA env var)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NEXT_PUBLIC_DATA_MODE !== 'backend';
const SIMULATED_DELAY_MS = 300;

// In-memory store for mock data (simulates database)
let agentsStore: Agent[] = [...mockAgents];

// =============================================================================
// Auth Helpers
// =============================================================================

/**
 * Get authentication headers for production API
 * Production requires x-user-address header with wallet address
 */
function getAuthHeaders(walletAddress?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (walletAddress) {
    headers['x-user-address'] = walletAddress;
  }

  return headers;
}

// =============================================================================
// Error Handling & Retry Logic
// =============================================================================

/**
 * Retry a fetch operation with exponential backoff
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }

      // Retry 5xx and 429 (rate limit)
      if (!response.ok && (response.status >= 500 || response.status === 429)) {
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Safe JSON parse with fallback
 */
async function safeJsonParse<T>(response: Response, fallback: T): Promise<T> {
  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    return fallback;
  }
}

/**
 * Log errors in development mode
 */
function logError(context: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[AgentService] ${context}:`, error);
  }
}

// =============================================================================
// Delay Helper
// =============================================================================

async function simulateDelay(): Promise<void> {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
  }
}

// =============================================================================
// Data Transformation Helpers
// =============================================================================

function toListItem(agent: Agent): AgentListItem {
  return {
    id: agent.id,
    name: agent.name,
    avatar: agent.avatar,
    mode: agent.mode,
    status: agent.status,
    pnl24h: agent.performance.pnl24h,
    createdAt: agent.createdAt,
  };
}

/**
 * Transform production bot config to UI Agent format
 */
function fromProductionConfig(
  userId: string,
  config: ProductionBotConfig,
  status: ProductionBotStatus
): Partial<Agent> {
  return {
    id: userId,
    mode: config.botMode,
    status: status.status,
    settings: {
      ...DEFAULT_AGENT_SETTINGS,
      standard: {
        // Map production targets (0-1 decimals) to UI percentages
        targetAllocation: Object.fromEntries(
          Object.entries(config.portfolioSettings.targets).map(
            ([token, value]) => [token, value * 100]
          )
        ),
        rebalanceThreshold: config.portfolioSettings.tolerance * 100,
        rebalanceFrequency: minutesToFrequency(
          config.portfolioSettings.rebalanceIntervalMinutes
        ),
      },
    },
  };
}

/**
 * Transform UI settings to production portfolio format
 */
function toProductionPortfolio(settings: AgentSettings): ProductionUpdatePortfolioRequest {
  const standardSettings = settings.standard;
  return {
    // Convert UI percentages to production decimals (0-1)
    targets: Object.fromEntries(
      Object.entries(standardSettings.targetAllocation).map(
        ([token, value]) => [token, value / 100]
      )
    ),
    tolerance: standardSettings.rebalanceThreshold / 100,
    minAdaReserve: 50, // Default, can be made configurable
    slippage: 0.01, // Default 1%
  };
}

/**
 * Convert rebalance interval minutes to frequency string
 */
function minutesToFrequency(minutes?: number): 'hourly' | 'daily' | 'weekly' {
  if (!minutes) return 'daily';
  if (minutes <= 60) return 'hourly';
  if (minutes <= 1440) return 'daily';
  return 'weekly';
}

/**
 * Convert frequency string to minutes for production API
 */
function frequencyToMinutes(frequency: 'hourly' | 'daily' | 'weekly'): number {
  switch (frequency) {
    case 'hourly': return 60;
    case 'daily': return 1440;
    case 'weekly': return 10080;
  }
}

// =============================================================================
// Agent Service
// =============================================================================

export const agentService = {
  /**
   * List all agents for current user
   *
   * Production endpoint: GET /api/bot/admin/deployed-bots (admin)
   * or query deployed_bots table per user
   */
  async getAll(): Promise<Agent[]> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return [...agentsStore];
    }

    try {
      // Production implementation:
      // Note: Production system manages bots per-user, not as a list
      // This would need to query deployed_bots table or admin endpoint
      const response = await fetchWithRetry(`${API_BASE}/admin/deployed-bots`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        logError('getAll', `HTTP ${response.status}`);
        return [];
      }

      return await safeJsonParse<Agent[]>(response, []);
    } catch (error) {
      logError('getAll', error);
      return [];
    }
  },

  /**
   * Get list items (lightweight for sidebar)
   */
  async getListItems(): Promise<AgentListItem[]> {
    const agents = await this.getAll();
    return agents.map(toListItem);
  },

  /**
   * Get single agent by ID (userId/wallet address in production)
   *
   * Production endpoints:
   * - GET /api/bot/user/:userId/status
   * - GET /api/bot/user/:userId/config
   */
  async getById(id: string): Promise<Agent | null> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const agent = agentsStore.find((a) => a.id === id);
      return agent ? { ...agent } : null;
    }

    // Production: Fetch both status and config
    const [statusRes, configRes] = await Promise.all([
      fetch(`${API_BASE}/user/${id}/status`, {
        headers: getAuthHeaders(id),
      }),
      fetch(`${API_BASE}/user/${id}/config`, {
        headers: getAuthHeaders(id),
      }),
    ]);

    if (statusRes.status === 404 || configRes.status === 404) {
      return null;
    }

    if (!statusRes.ok || !configRes.ok) {
      throw new Error('Failed to fetch agent');
    }

    const status: ProductionBotStatus = await statusRes.json();
    const config: ProductionBotConfig = await configRes.json();

    // Transform production format to UI Agent format
    const partialAgent = fromProductionConfig(id, config, status);

    return {
      id,
      name: `Bot ${id.slice(-6)}`, // Production doesn't store names
      avatar: null,
      mode: config.botMode,
      status: status.status,
      createdAt: status.startTime || new Date().toISOString(),
      settings: partialAgent.settings || DEFAULT_AGENT_SETTINGS,
      performance: {
        pnl24h: 0, // Would need telemetry endpoint
        pnl7d: 0,
        pnlTotal: 0,
        trades24h: 0,
        winRate: 0,
      },
    };
  },

  /**
   * Create new agent (deploy bot)
   *
   * Production endpoint: POST /api/bot/deploy
   */
  async create(data: CreateAgentPayload): Promise<Agent> {
    if (USE_MOCK_DATA) {
      await simulateDelay();

      const newAgent: Agent = {
        id: generateAgentId(),
        name: data.name,
        avatar: data.avatar ?? null,
        mode: data.mode,
        status: 'stopped', // Production uses 'stopped', not 'idle'
        createdAt: new Date().toISOString(),
        settings: {
          ...DEFAULT_AGENT_SETTINGS,
          ...data.settings,
        },
        performance: {
          pnl24h: 0,
          pnl7d: 0,
          pnlTotal: 0,
          trades24h: 0,
          winRate: 0,
        },
      };

      agentsStore = [...agentsStore, newAgent];
      return { ...newAgent };
    }

    // Production deployment
    const deployRequest: ProductionDeployRequest = {
      userAddress: data.name, // In production, this would be the wallet address
      botMode: data.mode,
      botChain: 'cardano', // Default chain
      portfolioSettings: {
        targets: { ADA: 1.0 }, // Default allocation
        tolerance: 0.05,
        minAdaReserve: 50,
      },
      walletId: generateAgentId(),
    };

    const response = await fetch(`${API_BASE}/deploy`, {
      method: 'POST',
      headers: getAuthHeaders(data.name),
      body: JSON.stringify(deployRequest),
    });

    if (!response.ok) {
      throw new Error('Failed to deploy agent');
    }

    const result: ProductionDeployResponse = await response.json();

    // Return agent with deployment info
    return {
      id: result.deploymentId,
      name: data.name,
      avatar: data.avatar ?? null,
      mode: data.mode,
      status: 'stopped',
      createdAt: new Date().toISOString(),
      settings: {
        ...DEFAULT_AGENT_SETTINGS,
        ...data.settings,
      },
      performance: {
        pnl24h: 0,
        pnl7d: 0,
        pnlTotal: 0,
        trades24h: 0,
        winRate: 0,
      },
    };
  },

  /**
   * Update agent settings
   *
   * Production endpoint: POST /api/bot/user/:userId/update-portfolio
   */
  async update(id: string, data: UpdateAgentPayload): Promise<Agent> {
    if (USE_MOCK_DATA) {
      await simulateDelay();

      const index = agentsStore.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error(`Agent not found: ${id}`);
      }

      const existing = agentsStore[index];
      const updated: Agent = {
        ...existing,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.mode !== undefined && { mode: data.mode }),
        ...(data.settings && {
          settings: {
            ...existing.settings,
            ...data.settings,
          },
        }),
      };

      agentsStore = [
        ...agentsStore.slice(0, index),
        updated,
        ...agentsStore.slice(index + 1),
      ];

      return { ...updated };
    }

    // Production: Update portfolio settings
    const mergedSettings: AgentSettings = {
      ...DEFAULT_AGENT_SETTINGS,
      ...data.settings,
    };
    const portfolioUpdate = toProductionPortfolio(mergedSettings);

    const response = await fetch(`${API_BASE}/user/${id}/update-portfolio`, {
      method: 'POST',
      headers: getAuthHeaders(id),
      body: JSON.stringify(portfolioUpdate),
    });

    if (!response.ok) {
      throw new Error('Failed to update agent');
    }

    // Fetch updated agent to return current state
    const agent = await this.getById(id);
    if (!agent) {
      throw new Error('Agent not found after update');
    }

    return agent;
  },

  /**
   * Delete agent (stop and remove deployment)
   *
   * Production endpoint: DELETE /api/bot/user/:userId
   */
  async delete(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await simulateDelay();

      const index = agentsStore.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error(`Agent not found: ${id}`);
      }

      agentsStore = [
        ...agentsStore.slice(0, index),
        ...agentsStore.slice(index + 1),
      ];
      return;
    }

    const response = await fetch(`${API_BASE}/user/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(id),
    });

    if (!response.ok) {
      throw new Error('Failed to delete agent');
    }
  },

  /**
   * Start agent
   *
   * Production endpoint: POST /api/bot/user/:userId/start
   */
  async start(id: string): Promise<Agent> {
    return this.setStatus(id, 'running');
  },

  /**
   * Stop agent
   *
   * Production endpoint: POST /api/bot/user/:userId/stop
   */
  async stop(id: string): Promise<Agent> {
    return this.setStatus(id, 'stopped');
  },

  /**
   * Update agent status (start/stop)
   *
   * Production endpoints:
   * - POST /api/bot/user/:userId/start
   * - POST /api/bot/user/:userId/stop
   */
  async setStatus(id: string, status: AgentStatus): Promise<Agent> {
    if (USE_MOCK_DATA) {
      await simulateDelay();

      const index = agentsStore.findIndex((a) => a.id === id);
      if (index === -1) {
        throw new Error(`Agent not found: ${id}`);
      }

      const updated: Agent = {
        ...agentsStore[index],
        status,
      };

      agentsStore = [
        ...agentsStore.slice(0, index),
        updated,
        ...agentsStore.slice(index + 1),
      ];

      return { ...updated };
    }

    // Production: Use start/stop endpoints
    const endpoint = status === 'running' ? 'start' : 'stop';
    const response = await fetch(`${API_BASE}/user/${id}/${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(id),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${endpoint} agent`);
    }

    // Fetch updated agent
    const agent = await this.getById(id);
    if (!agent) {
      throw new Error('Agent not found after status update');
    }

    return agent;
  },

  /**
   * Reset mock data (for testing)
   */
  _resetMockData(): void {
    agentsStore = [...mockAgents];
  },

  /**
   * Get current mock store (for debugging)
   */
  _getMockStore(): Agent[] {
    return [...agentsStore];
  },

  /**
   * Get bot summary from production API
   *
   * Production endpoint: GET /api/bot/summary
   */
  async getSummary(): Promise<any> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      return {
        totalBots: agentsStore.length,
        runningBots: agentsStore.filter(a => a.status === 'running').length,
        totalPnl24h: agentsStore.reduce((sum, a) => sum + a.performance.pnl24h, 0),
      };
    }

    try {
      const response = await fetchWithRetry(`${API_BASE}/summary`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        logError('getSummary', `HTTP ${response.status}`);
        return null;
      }

      return await safeJsonParse(response, null);
    } catch (error) {
      logError('getSummary', error);
      return null;
    }
  },

  /**
   * Get bot configuration
   *
   * Production endpoint: GET /api/bot/config/:id
   */
  async getConfig(id: string): Promise<ProductionBotConfig | null> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const agent = agentsStore.find(a => a.id === id);
      if (!agent) return null;

      // Convert UI settings to production format
      return {
        botMode: agentModeToMode[agent.mode] as any,
        botChain: 'cardano',
        portfolioSettings: {
          targets: Object.fromEntries(
            Object.entries(agent.settings.standard.targetAllocation).map(
              ([token, value]) => [token, value / 100]
            )
          ),
          tolerance: agent.settings.standard.rebalanceThreshold / 100,
          minAdaReserve: 50,
          slippage: 0.01,
          rebalanceIntervalMinutes: frequencyToMinutes(agent.settings.standard.rebalanceFrequency),
        },
      };
    }

    try {
      const response = await fetchWithRetry(`${API_BASE}/config/${id}`, {
        headers: getAuthHeaders(id),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        logError('getConfig', `HTTP ${response.status}`);
        return null;
      }

      return await safeJsonParse<ProductionBotConfig | null>(response, null);
    } catch (error) {
      logError('getConfig', error);
      return null;
    }
  },

  /**
   * Update bot configuration
   *
   * Production endpoint: PUT /api/bot/config/:id
   */
  async updateConfig(id: string, config: Partial<ProductionBotConfig>): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const index = agentsStore.findIndex(a => a.id === id);
      if (index === -1) return false;

      // Update mock data
      // (Implementation depends on what config fields need updating)
      return true;
    }

    try {
      const response = await fetchWithRetry(`${API_BASE}/config/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(id),
        body: JSON.stringify(config),
      });

      return response.ok;
    } catch (error) {
      logError('updateConfig', error);
      return false;
    }
  },

  /**
   * Start bot
   *
   * Production endpoint: POST /api/bot/start
   */
  async startBot(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const index = agentsStore.findIndex(a => a.id === id);
      if (index === -1) return false;

      agentsStore[index].status = 'running';
      return true;
    }

    try {
      const response = await fetchWithRetry(`${API_BASE}/start`, {
        method: 'POST',
        headers: getAuthHeaders(id),
        body: JSON.stringify({ botId: id }),
      });

      return response.ok;
    } catch (error) {
      logError('startBot', error);
      return false;
    }
  },

  /**
   * Stop bot
   *
   * Production endpoint: POST /api/bot/stop
   */
  async stopBot(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      await simulateDelay();
      const index = agentsStore.findIndex(a => a.id === id);
      if (index === -1) return false;

      agentsStore[index].status = 'stopped';
      return true;
    }

    try {
      const response = await fetchWithRetry(`${API_BASE}/stop`, {
        method: 'POST',
        headers: getAuthHeaders(id),
        body: JSON.stringify({ botId: id }),
      });

      return response.ok;
    } catch (error) {
      logError('stopBot', error);
      return false;
    }
  },
};

export type AgentService = typeof agentService;
