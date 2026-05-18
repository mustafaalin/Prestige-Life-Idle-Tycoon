const MONEY_PACKAGE_BASES = [
  { id: 'money-pack-1', amount: 25000 },
  { id: 'money-pack-2', amount: 75000 },
  { id: 'money-pack-3', amount: 250000 },
  { id: 'money-pack-4', amount: 750000 },
] as const;

const REWARD_TIERS = [
  { minProgress: 0,   claimPool: 2000,    adReward: 1000,   packageMultiplier: 1 },
  { minProgress: 20,  claimPool: 6000,    adReward: 3000,   packageMultiplier: 1.6 },
  { minProgress: 50,  claimPool: 20000,   adReward: 10000,  packageMultiplier: 2.4 },
  { minProgress: 120, claimPool: 75000,   adReward: 37500,  packageMultiplier: 4 },
  { minProgress: 220, claimPool: 300000,  adReward: 150000, packageMultiplier: 6.5 },
  { minProgress: 350, claimPool: 1500000, adReward: 750000, packageMultiplier: 10 },
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
