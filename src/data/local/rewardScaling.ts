const MONEY_PACKAGE_BASES = [
  { id: 'money-pack-1', amount: 50000 },
  { id: 'money-pack-2', amount: 150000 },
  { id: 'money-pack-3', amount: 500000 },
  { id: 'money-pack-4', amount: 1500000 },
] as const;

// Design rules:
// - Ad reward = Pack-1 base ($50K) × packageMultiplier × 0.25
//   (IAP Pack-1 is always 4× the value of a single ad watch)
// - Claim pool = Ad reward × 2 (preserved historical 2:1 ratio)
const REWARD_TIERS = [
  { minProgress: 0,   claimPool: 25000,   adReward: 12500,  packageMultiplier: 1 },
  { minProgress: 20,  claimPool: 40000,   adReward: 20000,  packageMultiplier: 1.6 },
  { minProgress: 50,  claimPool: 60000,   adReward: 30000,  packageMultiplier: 2.4 },
  { minProgress: 120, claimPool: 100000,  adReward: 50000,  packageMultiplier: 4 },
  { minProgress: 220, claimPool: 162500,  adReward: 81250,  packageMultiplier: 6.5 },
  { minProgress: 350, claimPool: 250000,  adReward: 125000, packageMultiplier: 10 },
  { minProgress: 500, claimPool: 375000,  adReward: 187500, packageMultiplier: 15 },
] as const;

function getEffectiveProgress(prestigePoints: number, ownedInvestmentCount: number) {
  return Math.max(0, Number(prestigePoints || 0)) + Math.max(0, Number(ownedInvestmentCount || 0)) * 3;
}

export function getScaledShopRewards(prestigePoints: number, ownedInvestmentCount: number) {
  const effectiveProgress = getEffectiveProgress(prestigePoints, ownedInvestmentCount);

  const tier =
    [...REWARD_TIERS]
      .reverse()
      .find((candidate) => effectiveProgress >= candidate.minProgress) || REWARD_TIERS[0];

  const claimPool = tier.claimPool;
  const dailyClaimLimit = claimPool * 2;

  return {
    effectiveProgress,
    claimPool,
    dailyClaimLimit,
    adReward: tier.adReward,
    moneyPackageMultiplier: tier.packageMultiplier,
  };
}

export function getScaledMoneyPackageAmount(
  packageId: string,
  prestigePoints: number,
  ownedInvestmentCount: number
) {
  const basePackage =
    MONEY_PACKAGE_BASES.find((pkg) => pkg.id === packageId) || MONEY_PACKAGE_BASES[0];
  const rewards = getScaledShopRewards(prestigePoints, ownedInvestmentCount);
  return Math.floor(basePackage.amount * rewards.moneyPackageMultiplier);
}
