import type { InvestmentUpgradeKey } from '../types/game';
import {
  getLocalBusinesses,
  getLocalInvestments,
  getLocalJobs,
  getLocalPlayerJobs,
  getLocalProfile,
  saveLocalGameState,
} from '../data/local/storage';
import {
  calculateInvestmentRentalIncome,
  INVESTMENT_UPGRADE_COST_DIVISORS,
  INVESTMENT_UPGRADE_INCOME_BOOSTS,
  INVESTMENT_UPGRADE_ORDER,
} from '../data/local/investments';
import { recalculateLocalEconomy } from '../data/local/economy';
import { awardCashback } from '../data/local/bankRewards';

function calculateTotalInvestmentIncome() {
  return getLocalInvestments()
    .filter((investment) => investment.is_owned)
    .reduce((sum, investment) => sum + Number(investment.current_rental_income || 0), 0);
}

export async function getInvestments(_playerId: string) {
  const investments = getLocalInvestments();
  return {
    investments,
    totalInvestmentIncome: calculateTotalInvestmentIncome(),
  };
}

export async function purchaseInvestment(playerId: string, investmentId: string) {
  void playerId;
  const profile = getLocalProfile();
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const businesses = getLocalBusinesses();
  const investments = getLocalInvestments();

  if (!profile) throw new Error('Player not found');

  const target = investments.find((investment) => investment.id === investmentId);
  if (!target) throw new Error('Property not found');
  if (target.is_owned) throw new Error('Property already owned');
  if (Number(profile.total_money) < target.price) throw new Error('Not enough money');

  const now = new Date().toISOString();
  const nextInvestments = investments.map((investment) =>
    investment.id === investmentId
      ? {
          ...investment,
          is_owned: true,
          current_level: 1,
          current_rental_income: investment.base_rental_income,
          total_invested: investment.price,
          purchased_at: now,
          upgrades_applied: [],
        }
      : investment
  );

  const profileAfterSpend = {
    ...profile,
    total_money: Number(profile.total_money) - target.price,
  };
  const finalProfile = recalculateLocalEconomy({
    profile: profileAfterSpend,
    jobs,
    playerJobs,
    businesses,
    investments: nextInvestments,
  });
  const cashbackResult = awardCashback(finalProfile, target.price);

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    investments: nextInvestments,
  });

  return { success: true };
}

export function getInvestmentUpgradeCost(price: number, upgradeIndex: number) {
  return Math.floor(price / INVESTMENT_UPGRADE_COST_DIVISORS[upgradeIndex]);
}

export function getInvestmentUpgradeIncome(investmentBaseIncome: number, upgradeIndex: number) {
  return investmentBaseIncome + Math.floor(investmentBaseIncome * INVESTMENT_UPGRADE_INCOME_BOOSTS[upgradeIndex]);
}

export async function upgradeInvestment(
  _playerId: string,
  investmentId: string,
  upgradeKey: InvestmentUpgradeKey
) {
  const profile = getLocalProfile();
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const businesses = getLocalBusinesses();
  const investments = getLocalInvestments();

  if (!profile) throw new Error('Player not found');

  const target = investments.find((investment) => investment.id === investmentId);
  if (!target || !target.is_owned) throw new Error('Property not owned');

  const applied = target.upgrades_applied || [];
  if (applied.includes(upgradeKey)) throw new Error('Upgrade already applied');

  const upgradeIndex = INVESTMENT_UPGRADE_ORDER.indexOf(upgradeKey);
  if (upgradeIndex < 0) throw new Error('Invalid upgrade');
  if (upgradeIndex !== applied.length) {
    throw new Error('Upgrades must be purchased in order');
  }

  const upgradeCost = getInvestmentUpgradeCost(target.price, upgradeIndex);
  if (Number(profile.total_money) < upgradeCost) throw new Error('Not enough money');

  const nextUpgradesApplied = [...applied, upgradeKey];
  const nextIncome = calculateInvestmentRentalIncome(
    target.base_rental_income,
    nextUpgradesApplied
  );

  const nextInvestments = investments.map((investment) =>
    investment.id === investmentId
      ? {
          ...investment,
          current_level: Math.max(1, Number(investment.current_level || 1)) + 1,
          current_rental_income: nextIncome,
          total_invested: Number(investment.total_invested || investment.price) + upgradeCost,
          upgrades_applied: nextUpgradesApplied,
        }
      : investment
  );

  const profileAfterSpend = {
    ...profile,
    total_money: Number(profile.total_money) - upgradeCost,
  };
  const finalProfile = recalculateLocalEconomy({
    profile: profileAfterSpend,
    jobs,
    playerJobs,
    businesses,
    investments: nextInvestments,
  });
  const cashbackResult = awardCashback(finalProfile, upgradeCost);

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    investments: nextInvestments,
  });

  return { success: true, newIncome: nextIncome, cost: upgradeCost };
}
