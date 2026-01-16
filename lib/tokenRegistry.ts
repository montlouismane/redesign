export interface CardanoRegistryToken {
  unit: string;
  ticker?: string | null;
  name?: string | null;
  policyId?: string | null;
  assetName?: string | null;
  decimals?: number | null;
}

export async function searchCardanoRegistry(query: string, limit = 20): Promise<CardanoRegistryToken[]> {
  try {
    const r = await fetch(`/api/cardano/token-registry?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j?.items) ? j.items : [];
  } catch (_e) {
    return [];
  }
}
