'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { AgentPnLData } from './useAgentPnL';

// Event types from the backend
export interface AgentPnLUpdateEvent {
  agentId: string;
  pnl24h: number;
  pnl7d: number;
  pnlTotal: number;
  trades24h: number;
  winRate: number;
  lastTrade?: {
    pair: string;
    profit: number;
    time: string;
    type: 'BUY' | 'SELL';
  };
}

export interface DashboardUpdateEvent {
  type: 'portfolio' | 'agent' | 'trade';
  data: unknown;
}

export interface UseAgentWebSocketOptions {
  /** Wallet address for user identification */
  walletAddress?: string;
  /** Whether WebSocket is enabled */
  enabled?: boolean;
  /** Callback when agent P&L updates */
  onAgentPnLUpdate?: (event: AgentPnLUpdateEvent) => void;
  /** Callback when any dashboard update occurs */
  onDashboardUpdate?: (event: DashboardUpdateEvent) => void;
  /** Callback on connection status change */
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseAgentWebSocketReturn {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Last error message */
  error: string | null;
  /** Manually reconnect */
  reconnect: () => void;
  /** Disconnect WebSocket */
  disconnect: () => void;
}

/**
 * Hook for managing WebSocket connection to receive real-time agent updates
 *
 * Production backend uses Socket.IO at path /socket.io
 * Events:
 *   - 'agentPnlUpdate' - P&L changes per agent
 *   - 'dashboardUpdate' - General dashboard updates
 *   - 'tradeExecuted' - New trade completed
 */
export function useAgentWebSocket(options: UseAgentWebSocketOptions = {}): UseAgentWebSocketReturn {
  const {
    walletAddress,
    enabled = true,
    onAgentPnLUpdate,
    onDashboardUpdate,
    onConnectionChange,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connect = useCallback(async () => {
    if (!enabled) return;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      // Dynamic import of socket.io-client to avoid SSR issues
      const { io } = await import('socket.io-client');

      // Close existing connection if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Connect to Socket.IO
      // In production, this will be proxied to the backend via next.config.ts
      const socket = io({
        path: '/socket.io',
        transports: ['websocket'],
        upgrade: false,
        auth: walletAddress ? { walletAddress } : undefined,
        reconnection: false, // We handle reconnection manually
      });

      socket.on('connect', () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);
      });

      socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Disconnected:', reason);
        setIsConnected(false);
        onConnectionChange?.(false);

        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close') {
          scheduleReconnect();
        }
      });

      socket.on('connect_error', (err) => {
        console.error('[WebSocket] Connection error:', err.message);
        setError(err.message);
        setIsConnected(false);
        onConnectionChange?.(false);
        scheduleReconnect();
      });

      // Agent P&L update events
      socket.on('agentPnlUpdate', (data: AgentPnLUpdateEvent) => {
        console.log('[WebSocket] Agent P&L update:', data);
        onAgentPnLUpdate?.(data);
      });

      // General dashboard updates
      socket.on('dashboardUpdate', (data: DashboardUpdateEvent) => {
        console.log('[WebSocket] Dashboard update:', data);
        onDashboardUpdate?.(data);
      });

      // Trade executed events
      socket.on('tradeExecuted', (data: any) => {
        console.log('[WebSocket] Trade executed:', data);
        // Convert to dashboard update format
        onDashboardUpdate?.({ type: 'trade', data });
      });

      socketRef.current = socket;
    } catch (err) {
      console.error('[WebSocket] Failed to initialize:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      scheduleReconnect();
    }
  }, [enabled, walletAddress, onAgentPnLUpdate, onDashboardUpdate, onConnectionChange]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError('Max reconnection attempts reached');
      return;
    }

    reconnectAttemptsRef.current++;
    const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;

    console.log(`[WebSocket] Scheduling reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled]); // Only re-run if enabled changes

  // Re-connect when wallet address changes
  useEffect(() => {
    if (enabled && walletAddress && socketRef.current) {
      // Reconnect with new auth
      reconnect();
    }
  }, [walletAddress]);

  return {
    isConnected,
    error,
    reconnect,
    disconnect,
  };
}
