// Backend API client wrapper - ensures compatibility with production backend
// Modeled after _prod_build/adam-main/ui/lib/api.ts

/**
 * Get API URL for a given path.
 * Prefers relative paths so Next.js rewrites can proxy to the backend service.
 * If NEXT_PUBLIC_API_URL is defined, it will prefix the path explicitly (for non-K8s prod).
 */
export function getApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Helper to inject x-user-address header when provided.
 * Use this when calling backend endpoints that require user identity.
 */
export function withUserAddress(
  headers: HeadersInit = {},
  userAddress?: string | null
): HeadersInit {
  if (!userAddress) return headers;
  
  const baseHeaders = typeof headers === 'object' && !(headers instanceof Headers)
    ? { ...headers }
    : Object.fromEntries(new Headers(headers).entries());
  
  return {
    ...baseHeaders,
    'x-user-address': userAddress,
  };
}

/**
 * Make an API call with proper error handling.
 * Automatically adds Content-Type header and handles JSON errors.
 */
export async function apiCall(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed: ${path}`, error);
    throw error;
  }
}

/**
 * Make an API call and parse JSON response.
 * Convenience wrapper around apiCall().
 */
export async function apiCallJson<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const response = await apiCall(path, options);
  return response.json() as Promise<T>;
}

/**
 * Check if we're in backend mode (vs demo mode).
 * When backend mode is enabled, API calls should go through the backend proxy.
 */
export function isBackendMode(): boolean {
  return process.env.NEXT_PUBLIC_DATA_MODE === 'backend';
}

/**
 * List user's bots/agents.
 * Requires wallet address for identification.
 */
export async function listUserBots(walletAddress: string): Promise<Array<{
  id: string;
  userId: string;
  walletAddress?: string;
  status?: string;
  botMode?: string;
}>> {
  if (!walletAddress) return [];
  
  try {
    const params = new URLSearchParams({ walletAddress });
    const data = await apiCallJson<{ bots?: any[] } | any[]>(
      `/api/bot/user-bots?${params.toString()}`,
      {
        headers: withUserAddress({}, walletAddress),
      }
    );
    
    // Normalize response
    const bots = Array.isArray(data) ? data : (data?.bots || []);
    
    return bots.map((b: any) => ({
      id: b.id || b.userId,
      userId: b.id || b.userId,
      walletAddress: b.walletAddress || b.address,
      status: b.status,
      botMode: b.botMode,
    }));
  } catch (error) {
    console.error('Failed to list user bots:', error);
    return [];
  }
}

