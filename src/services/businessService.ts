import { LOCAL_BUSINESSES } from '../data/local/businesses';
import {
  getLocalBusinesses,
  getLocalJobs,
  getLocalPlayerJobs,
  getLocalProfile,
  saveLocalGameState,
} from '../data/local/storage';
import { recalculateLocalEconomy } from '../data/local/economy';
import { getLocalInvestments } from '../data/local/storage';
import { getBusinessPrestigeForLevel } from '../data/local/businessPrestigePoints';
import { awardCashback } from '../data/local/bankRewards';
import type { BusinessWithPlayerData, PlayerProfile } from '../types/game';
import {
  BUSINESS_AD_DISCOUNT_MULTIPLIER,
  getBusinessUpgradeCost,
  getNextBusinessIncome,
  isBusinessAtMaxLevel,
} from '../utils/businessUpgrade';

export interface BusinessMutationResult {
  success: true;
  profile: PlayerProfile;
  businesses: BusinessWithPlayerData[];
  businessesPrestige: number;
}

function calculateOwnedBusinessPrestige() {
  const businesses = getLocalBusinesses().length ? getLocalBusinesses() : LOCAL_BUSINESSES;
  return businesses
    .filter((business) => business.is_owned)
    .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0);
}

function calculateBusinessesPrestige(businesses: BusinessWithPlayerData[]) {
  return businesses
    .filter((business) => business.is_owned)
    .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0);
}

function finalizeBusinessMutation(params: {
  profile: PlayerProfile;
  businesses: BusinessWithPlayerData[];
  amountSpent: number;
}) {
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const investments = getLocalInvestments();
  const finalProfile = recalculateLocalEconomy({
    profile: params.profile,
    jobs,
    playerJobs,
    businesses: params.businesses,
    investments,
  });
  const cashbackResult = awardCashback(finalProfile, params.amountSpent);
  const businessesPrestige = calculateBusinessesPrestige(params.businesses);

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    businesses: params.businesses,
    businessesPrestige,
  });

  return {
    success: true as const,
    profile: cashbackResult.updatedProfile,
    businesses: params.businesses,
    businessesPrestige,
  };
}

export async function getBusinesses(_playerId: string) {
  const businesses = getLocalBusinesses().length ? getLocalBusinesses() : LOCAL_BUSINESSES;
  const businessesPrestige = calculateOwnedBusinessPrestige();

  return {
    businesses,
    prestigePoints: businessesPrestige,
    businessesPrestige,
  };
}

export async function purchaseBusiness(_playerId: string, businessId: string) {
  const businesses = getLocalBusinesses();
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const target = businesses.find((business) => business.id === businessId);
  if (!target) throw new Error('Business not found');
  if (target.is_owned) throw new Error('You already own this business');

  const maxUnlocked = businesses
    .filter((business) => business.is_owned)
    .reduce((max, business) => Math.max(max, business.unlock_order), 0);

  if (target.unlock_order > maxUnlocked + 1) throw new Error('You must unlock businesses in order');
  if (Number(profile.total_money) < target.base_price) throw new Error('Not enough money to purchase this business');

  const nextBusinesses = businesses.map((business) =>
    business.id === businessId
      ? {
          ...business,
          is_owned: true,
          can_unlock: true,
          current_level: 1,
          current_hourly_income: business.base_hourly_income,
          total_invested: business.base_price,
          current_prestige_points: getBusinessPrestigeForLevel(business.id, 1),
        }
      : {
          ...business,
          can_unlock: business.is_owned || business.unlock_order <= maxUnlocked + 2,
        }
  );

  const profileAfterSpend = {
    ...profile,
    total_money: Number(profile.total_money) - target.base_price,
  };

  return finalizeBusinessMutation({
    profile: profileAfterSpend,
    businesses: nextBusinesses,
    amountSpent: target.base_price,
  });
}

export async function upgradeBusiness(
  _playerId: string,
  businessId: string,
  options?: { priceMultiplier?: number }
): Promise<BusinessMutationResult> {
  const businesses = getLocalBusinesses();
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const target = businesses.find((business) => business.id === businessId);
  if (!target || !target.is_owned) throw new Error('You do not own this business');
  if (isBusinessAtMaxLevel(target.current_level || 1)) throw new Error('Business is already at max level');

  const currentLevel = target.current_level || 1;
  const currentIncome = target.current_hourly_income || target.base_hourly_income;
  const upgradeCost = getBusinessUpgradeCost(
    currentIncome,
    currentLevel,
    options?.priceMultiplier ?? 1
  );

  if (Number(profile.total_money) < upgradeCost) throw new Error('Not enough money to upgrade this business');

  const newIncome = getNextBusinessIncome(currentIncome);
  const nextBusinesses = businesses.map((business) =>
    business.id === businessId
      ? {
          ...business,
          current_level: currentLevel + 1,
          current_hourly_income: newIncome,
          total_invested: (business.total_invested || business.base_price) + upgradeCost,
          current_prestige_points: getBusinessPrestigeForLevel(business.id, currentLevel + 1),
        }
      : business
  );

  const profileAfterSpend = {
    ...profile,
    total_money: Number(profile.total_money) - upgradeCost,
  };

  return finalizeBusinessMutation({
    profile: profileAfterSpend,
    businesses: nextBusinesses,
    amountSpent: upgradeCost,
  });
}

export async function upgradeBusinessWithAdDiscount(_playerId: string, businessId: string) {
  return upgradeBusiness(_playerId, businessId, {
    priceMultiplier: BUSINESS_AD_DISCOUNT_MULTIPLIER,
  });
}
