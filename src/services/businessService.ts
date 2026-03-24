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

function calculateOwnedBusinessPrestige() {
  const businesses = getLocalBusinesses().length ? getLocalBusinesses() : LOCAL_BUSINESSES;
  return businesses
    .filter((business) => business.is_owned)
    .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0);
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
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const investments = getLocalInvestments();
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
  const finalProfile = recalculateLocalEconomy({
    profile: profileAfterSpend,
    jobs,
    playerJobs,
    businesses: nextBusinesses,
    investments,
  });
  const cashbackResult = awardCashback(finalProfile, target.base_price);

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    businesses: nextBusinesses,
    businessesPrestige: nextBusinesses
      .filter((business) => business.is_owned)
      .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0),
  });

  return { success: true };
}

export async function upgradeBusiness(_playerId: string, businessId: string) {
  const businesses = getLocalBusinesses();
  const profile = getLocalProfile();
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const investments = getLocalInvestments();
  if (!profile) throw new Error('Player not found');

  const target = businesses.find((business) => business.id === businessId);
  if (!target || !target.is_owned) throw new Error('You do not own this business');
  if ((target.current_level || 1) >= 6) throw new Error('Business is already at max level');

  const currentLevel = target.current_level || 1;
  const currentIncome = target.current_hourly_income || target.base_hourly_income;
  const multiplier =
    currentLevel === 1 ? 30 :
    currentLevel === 2 ? 60 :
    currentLevel === 3 ? 120 :
    currentLevel === 4 ? 180 :
    240;
  const upgradeCost = currentIncome * multiplier;

  if (Number(profile.total_money) < upgradeCost) throw new Error('Not enough money to upgrade this business');

  const newIncome = Math.floor(currentIncome * 1.25);
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
  const finalProfile = recalculateLocalEconomy({
    profile: profileAfterSpend,
    jobs,
    playerJobs,
    businesses: nextBusinesses,
    investments,
  });
  const cashbackResult = awardCashback(finalProfile, upgradeCost);

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    businesses: nextBusinesses,
    businessesPrestige: nextBusinesses
      .filter((business) => business.is_owned)
      .reduce((sum, business) => sum + Number(business.current_prestige_points || 0), 0),
  });

  return { success: true };
}
