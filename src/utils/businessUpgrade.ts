export const BUSINESS_MAX_LEVEL = 6;
export const BUSINESS_UPGRADE_MULTIPLIERS = [30, 60, 120, 180, 240] as const;
export const BUSINESS_AD_DISCOUNT_MULTIPLIER = 0.5;

export function isBusinessAtMaxLevel(currentLevel: number) {
  return Math.max(1, Number(currentLevel || 1)) >= BUSINESS_MAX_LEVEL;
}

export function getBusinessUpgradeCost(
  currentIncome: number,
  currentLevel: number,
  priceMultiplier = 1
) {
  if (isBusinessAtMaxLevel(currentLevel)) {
    return 0;
  }

  const normalizedIncome = Math.max(0, Number(currentIncome || 0));
  const normalizedLevel = Math.max(1, Number(currentLevel || 1));
  const baseCost = normalizedIncome * BUSINESS_UPGRADE_MULTIPLIERS[normalizedLevel - 1];

  return Math.max(0, Math.floor(baseCost * priceMultiplier));
}

export function getDiscountedBusinessUpgradeCost(currentIncome: number, currentLevel: number) {
  return getBusinessUpgradeCost(currentIncome, currentLevel, BUSINESS_AD_DISCOUNT_MULTIPLIER);
}

export function getNextBusinessIncome(currentIncome: number) {
  return Math.floor(Math.max(0, Number(currentIncome || 0)) * 1.25);
}
