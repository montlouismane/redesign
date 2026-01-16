/**
 * ADAM Launch Pass Validation System
 * Validates that connected wallets have valid ADAM Launch Passes:
 * - T1 ADAM NFTs (excluding the 36 invalid ones)
 * - T2 ADAM Launch Passes (all are valid)
 */

export interface ValidatedNFT {
  assetName: string;
  assetUnit: string;
  isValid: boolean;
}

export interface ValidationResult {
  hasValidNfts: boolean;
  validNftCount: number;
  invalidNftCount: number;
  t1Count: number;
  t2Count: number;
  validNfts: ValidatedNFT[];
  invalidNfts: ValidatedNFT[];
  shouldAllowAccess: boolean;
}

// T1ADAM Policy ID
export const T1_ADAM_POLICY_ID = 'b46891456b77dbc77c16090fd92a37f087f9a68e953c56b00a20332f';

// T2 ADAM Launch Pass Policy ID
export const T2_ADAM_POLICY_ID = '06a64965c0ac1144a72a6ddfcb23aa9d4d7742a5b20ddd5cfb1164b9';

// Invalid T1 NFTs (minted with incorrect pricing)
export const INVALID_T1_ADAM_NFTS = [
  'T1ADAM4984', 'T1ADAM2503', 'T1ADAM4991', 'T1ADAM9667', 'T1ADAM2357', 'T1ADAM4746',
  'T1ADAM9457', 'T1ADAM1203', 'T1ADAM114', 'T1ADAM5196', 'T1ADAM2056', 'T1ADAM8705',
  'T1ADAM1374', 'T1ADAM4274', 'T1ADAM7029', 'T1ADAM7601', 'T1ADAM8762', 'T1ADAM5487',
  'T1ADAM987', 'T1ADAM648', 'T1ADAM3365', 'T1ADAM6527', 'T1ADAM8189', 'T1ADAM6628',
  'T1ADAM9600', 'T1ADAM4273', 'T1ADAM5233', 'T1ADAM341', 'T1ADAM709', 'T1ADAM1408',
  'T1ADAM557', 'T1ADAM7172', 'T1ADAM4091', 'T1ADAM9612', 'T1ADAM1327', 'T1ADAM1891'
];

/**
 * Core validation function - works with Blockfrost API response format
 */
export function validateT1AdamNfts(walletAssets: Array<{ unit: string; quantity: string }>): ValidationResult {
  const validNfts: ValidatedNFT[] = [];
  const invalidNfts: ValidatedNFT[] = [];
  let t1Count = 0;
  let t2Count = 0;

  walletAssets.forEach(asset => {
    if (parseInt(asset.quantity) > 0) {
      // Check T1ADAM NFTs
      if (asset.unit.startsWith(T1_ADAM_POLICY_ID)) {
        try {
          const assetNameHex = asset.unit.slice(56);
          const assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');

          if (assetName.startsWith('T1ADAM')) {
            const nftData: ValidatedNFT = {
              assetName,
              assetUnit: asset.unit,
              isValid: !INVALID_T1_ADAM_NFTS.includes(assetName)
            };

            if (nftData.isValid) {
              validNfts.push(nftData);
              t1Count++;
            } else {
              invalidNfts.push(nftData);
            }
          }
        } catch (error) {
          console.warn('Failed to decode T1 asset name:', asset.unit);
        }
      }
      // Check T2 ADAM Launch Pass
      else if (asset.unit.startsWith(T2_ADAM_POLICY_ID)) {
        try {
          const assetNameHex = asset.unit.slice(56);
          const assetName = Buffer.from(assetNameHex, 'hex').toString('utf8');

          const nftData: ValidatedNFT = {
            assetName: `T2 Launch Pass ${assetName}`,
            assetUnit: asset.unit,
            isValid: true
          };

          validNfts.push(nftData);
          t2Count++;
        } catch (error) {
          const nftData: ValidatedNFT = {
            assetName: 'T2 ADAM Launch Pass',
            assetUnit: asset.unit,
            isValid: true
          };
          validNfts.push(nftData);
          t2Count++;
        }
      }
    }
  });

  return {
    hasValidNfts: validNfts.length > 0,
    validNftCount: validNfts.length,
    invalidNftCount: invalidNfts.length,
    t1Count,
    t2Count,
    validNfts,
    invalidNfts,
    shouldAllowAccess: validNfts.length > 0
  };
}

/**
 * Simple boolean check for quick access control
 */
export function hasValidT1AdamAccess(walletAssets: Array<{ unit: string; quantity: string }>): boolean {
  return validateT1AdamNfts(walletAssets).shouldAllowAccess;
}

/**
 * Get upgrade message for users with invalid NFTs
 */
export function getUpgradeMessage(validation: ValidationResult): string {
  if (validation.validNftCount > 0) {
    return `Access granted! You have ${validation.validNftCount} valid ADAM Launch Pass${validation.validNftCount > 1 ? 'es' : ''}.`;
  }

  if (validation.invalidNftCount > 0) {
    return `Access denied: You have ${validation.invalidNftCount} invalid T1ADAM NFT${validation.invalidNftCount > 1 ? 's' : ''} that need upgrading.`;
  }

  return 'Access denied: No active subscription or valid ADAM Launch Pass found in your wallet.';
}

/**
 * Get success message for valid NFT holders
 */
export function getSuccessMessage(validation: ValidationResult): string {
  if (validation.validNftCount === 0) return '';

  return `Verified ADAM Launch Pass Holder (${validation.validNftCount} valid pass${validation.validNftCount > 1 ? 'es' : ''})`;
}
