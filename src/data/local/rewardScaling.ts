const MONEY_PACKAGE_BASES = [
  { id: 'money-pack-1', amount: 5000 },
  { id: 'money-pack-2', amount: 15000 },
  { id: 'money-pack-3', amount: 50000 },
  { id: 'money-pack-4', amount: 150000 },
] as const;

const REWARD_TIERS = [
  { minProgress: 0, claimPool: 1500, adReward: 750, packageMultiplier: 1 },
  { minProgress: 10, claimPool: 3000, adReward: 1500, packageMultiplier: 1.6 },
  { minProgress: 25, claimPool: 6000, adReward: 3000, packageMultiplier: 2.4 },
  { minProgress: 50, claimPool: 12000, adReward: 6000, packageMultiplier: 4 },
  { minProgress: 90, claimPool: 25000, adReward: 12000, packageMultiplier: 6.5 },
  { minProgress: 150, claimPool: 50000, adReward: 25000, packageMultiplier: 10 },
] as const;

function getEffectiveProgress(prestigePoints: number, ownedInvestmentCount: number) {
  return Math.max(0, Number(prestigePoints || 0)) + Math.max(0, Number(ownedInvestmentCount || 0)) * 10;
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
