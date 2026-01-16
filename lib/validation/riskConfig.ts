/**
 * Risk configuration validation schema
 * Based on production ranges from RiskSettingsPanel.client.tsx
 */

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRiskConfig(config: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (config.edgeAfterCost?.minNetEdgePct !== undefined) {
    if (config.edgeAfterCost.minNetEdgePct < 0 || config.edgeAfterCost.minNetEdgePct > 10) {
      errors.push({ field: 'edgeAfterCost.minNetEdgePct', message: 'Must be between 0 and 10' });
    }
  }

  if (config.liquidityGuard?.maxImpactPct !== undefined) {
    if (config.liquidityGuard.maxImpactPct < 0.5 || config.liquidityGuard.maxImpactPct > 20) {
      errors.push({ field: 'liquidityGuard.maxImpactPct', message: 'Must be between 0.5 and 20' });
    }
  }

  if (config.liquidityGuard?.binarySearchIterations !== undefined) {
    if (config.liquidityGuard.binarySearchIterations < 1 || config.liquidityGuard.binarySearchIterations > 16) {
      errors.push({ field: 'liquidityGuard.binarySearchIterations', message: 'Must be between 1 and 16' });
    }
  }

  if (config.partialExits?.targets) {
    config.partialExits.targets.forEach((t: any, i: number) => {
      if (t.sellPct !== undefined && (t.sellPct < 0 || t.sellPct > 100)) {
        errors.push({ field: `partialExits.targets[${i}].sellPct`, message: 'Must be between 0 and 100' });
      }
    });
  }

  if (config.portfolioRisk?.maxOpenPositions !== undefined) {
    if (config.portfolioRisk.maxOpenPositions < 1 || config.portfolioRisk.maxOpenPositions > 50) {
      errors.push({ field: 'portfolioRisk.maxOpenPositions', message: 'Must be between 1 and 50' });
    }
  }

  if (config.portfolioRisk?.maxSinglePositionPct !== undefined) {
    if (config.portfolioRisk.maxSinglePositionPct < 1 || config.portfolioRisk.maxSinglePositionPct > 100) {
      errors.push({ field: 'portfolioRisk.maxSinglePositionPct', message: 'Must be between 1 and 100' });
    }
  }

  if (config.portfolioRisk?.maxDailyLossPct !== undefined) {
    if (config.portfolioRisk.maxDailyLossPct < 1 || config.portfolioRisk.maxDailyLossPct > 50) {
      errors.push({ field: 'portfolioRisk.maxDailyLossPct', message: 'Must be between 1 and 50' });
    }
  }

  return errors;
}
