// Chain-specific token registries for multi-chain support

export interface ChainToken {
  ticker: string;
  name: string;
  // Cardano
  policyId?: string;
  assetName?: string;
  fullAssetId?: string;
  // Solana
  mint?: string;
  // Base/Ethereum
  address?: string;
  decimals: number;
}

export const CHAIN_TOKENS: Record<string, ChainToken[]> = {
  cardano: [
    { ticker: 'ADA', name: 'Cardano', policyId: '', assetName: '', decimals: 6 },
    { ticker: 'SHARDS', name: 'Shards', policyId: 'ea153b5d4864af15a1079a94a0e2486d6376fa28aafad272d15b243a', assetName: '0014df10536861726473', fullAssetId: 'ea153b5d4864af15a1079a94a0e2486d6376fa28aafad272d15b243a0014df10536861726473', decimals: 0 },
    { ticker: 'SNEK', name: 'Snek', policyId: '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f', assetName: '534e454b', fullAssetId: '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f534e454b', decimals: 0 },
    { ticker: 'WMT', name: 'World Mobile Token', policyId: '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e', assetName: '776f726c646d6f62696c65746f6b656e', fullAssetId: '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e776f726c646d6f62696c65746f6b656e', decimals: 6 },
    { ticker: 'MIN', name: 'Minswap', policyId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6', assetName: '4d494e', fullAssetId: '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e', decimals: 6 },
    { ticker: 'INDY', name: 'Indigo', policyId: '533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0', assetName: '494e4459', fullAssetId: '533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0494e4459', decimals: 6 },
    { ticker: 'AGENT T', name: 'Agent T', policyId: '97bbb7db0baef89caefce61b8107ac74c7a7340166b39d906f174bec', assetName: '54616c6f73', fullAssetId: '97bbb7db0baef89caefce61b8107ac74c7a7340166b39d906f174bec54616c6f73', decimals: 0 },
    { ticker: 'LENFI', name: 'Lenfi', policyId: '8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f69587', assetName: '6c656e6669', fullAssetId: '8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f695876c656e6669', decimals: 6 },
    { ticker: 'MELD', name: 'MELD', policyId: '6f46e1304b16d884c85c62fb0eef35027ad2af5dc3ff1a3b05f37b53', assetName: '4d454c44', fullAssetId: '6f46e1304b16d884c85c62fb0eef35027ad2af5dc3ff1a3b05f37b534d454c44', decimals: 6 },
    { ticker: 'OPTIM', name: 'Optim', policyId: '13af030aefa9d5dba24c2992aac25f70fef2aabd8a38a9bdb2824293', assetName: '4f5054494d', fullAssetId: '13af030aefa9d5dba24c2992aac25f70fef2aabd8a38a9bdb28242934f5054494d', decimals: 6 },
  ],

  solana: [
    { ticker: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
    { ticker: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
    { ticker: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    { ticker: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 },
    { ticker: 'ORCA', name: 'Orca', mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', decimals: 6 },
    { ticker: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
    { ticker: 'JTO', name: 'Jito', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL', decimals: 9 },
    { ticker: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', decimals: 6 },
    { ticker: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', decimals: 6 },
    { ticker: 'WIF', name: 'dogwifhat', mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', decimals: 6 },
  ],

  base: [
    { ticker: 'ETH', name: 'Ethereum', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18 },
    { ticker: 'WETH', name: 'Wrapped ETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    { ticker: 'USDC', name: 'USD Coin (Native)', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    { ticker: 'DAI', name: 'Dai Stablecoin', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 },
    { ticker: 'AERO', name: 'Aerodrome', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18 },
    { ticker: 'DEGEN', name: 'Degen', address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed', decimals: 18 },
    { ticker: 'BRETT', name: 'Brett', address: '0x532f27101965dd16442E59d40670FaF5eBB142E4', decimals: 18 },
  ]
};

// Helper function to get native currency for each chain
export function getNativeCurrency(chain: string): string {
  switch (chain) {
    case 'cardano': return 'ADA';
    case 'solana': return 'SOL';
    case 'base': return 'ETH';
    default: return 'ADA';
  }
}

// Helper function to get chain-specific reserve name
export function getReserveName(chain: string): string {
  switch (chain) {
    case 'cardano': return 'ADA Reserve';
    case 'solana': return 'SOL Reserve';
    case 'base': return 'ETH Reserve';
    default: return 'Reserve';
  }
}

// Helper function to get default reserve amount
export function getDefaultReserve(chain: string): number {
  switch (chain) {
    case 'cardano': return 50;   // 50 ADA
    case 'solana': return 0.05;  // 0.05 SOL
    case 'base': return 0.01;    // 0.01 ETH
    default: return 50;
  }
}

// Helper function to get min/max trade sizes
export function getTradeSizeLimits(chain: string): { min: number; max: number } {
  switch (chain) {
    case 'cardano': return { min: 10, max: 1000 };   // 10-1000 ADA
    case 'solana': return { min: 0.1, max: 10 };     // 0.1-10 SOL
    case 'base': return { min: 0.01, max: 0.5 };     // 0.01-0.5 ETH
    default: return { min: 10, max: 1000 };
  }
}

// Helper function to get default portfolio targets for a chain
export function getDefaultTargets(chain: string): Record<string, number> {
  switch (chain) {
    case 'solana': return { 'SOL': 1 };
    case 'base': return { 'ETH': 1 };
    case 'cardano':
    default: return { 'ADA': 1 };
  }
}

// Native currency tickers for each chain
const NATIVE_TICKERS: Record<string, string> = {
  cardano: 'ADA',
  solana: 'SOL',
  base: 'ETH'
};

// Check if a ticker is a native currency for any chain
export function isNativeCurrency(ticker: string): boolean {
  return Object.values(NATIVE_TICKERS).includes(ticker);
}

// Helper to migrate targets from one chain's native currency to another
export function migrateTargetsToChain(
  targets: Record<string, number>,
  fromChain: string,
  toChain: string
): Record<string, number> {
  if (!targets || typeof targets !== 'object') {
    return getDefaultTargets(toChain);
  }

  if (fromChain === toChain) {
    return targets;
  }

  const fromNative = NATIVE_TICKERS[fromChain] || 'ADA';
  const toNative = NATIVE_TICKERS[toChain] || getNativeCurrency(toChain);

  const hasFromNative = targets[fromNative] !== undefined;
  const hasToNative = targets[toNative] !== undefined;

  if (hasToNative && !hasFromNative) {
    return targets;
  }

  if (hasFromNative && !hasToNative) {
    const migrated = { ...targets };
    migrated[toNative] = targets[fromNative];
    delete migrated[fromNative];
    return migrated;
  }

  if (!hasFromNative && !hasToNative) {
    return { [toNative]: 1, ...targets };
  }

  const result = { ...targets };
  delete result[fromNative];
  return result;
}
