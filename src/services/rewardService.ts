import {
  claimAccumulatedMoney as claimAccumulatedMoneyLocal,
  claimAdReward,
  claimDailyReward as claimDailyRewardLocal,
  getDailyRewardStatus,
  normalizeAccumulatedClaimProfile,
  rescueDailyRewardStreak as rescueDailyRewardStreakLocal,
} from '../data/local/rewards';
import { getLocalGameStats, getLocalInvestments, getLocalProfile, saveLocalGameState } from '../data/local/storage';
import { getScaledShopRewards } from '../data/local/rewardScaling';
import type { GameStats } from '../types/game';

function ensureLocalGameStats(playerId: string): GameStats {
  const existing = getLocalGameStats();
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const gameStats: GameStats = {
    id: 'local-game-stats',
    player_id: playerId,
    play_time_seconds: 0,
    highest_combo: 0,
    achievements_unlocked: [],
    daily_login_streak: 0,
    last_daily_reward: null,
    created_at: now,
    updated_at: now,
    claimed_reward_days: [],
    last_claim_date: null,
  };

  saveLocalGameState({ gameStats });
  return gameStats;
}

export async function getClaimStatus(playerId: string) {
  const gameStats = ensureLocalGameStats(playerId);
  const storedProfile = getLocalProfile();
  const normalizedProfile = storedProfile ? normalizeAccumulatedClaimProfile(storedProfile) : null;
  const profile = normalizedProfile?.profile || storedProfile;
  const ownedInvestmentCount = getLocalInvestments().filter((investment) => investment.is_owned).length;

  if (normalizedProfile?.changed && profile) {
    saveLocalGameState({ profile });
  }

  const status = getDailyRewardStatus(gameStats);
  const scaledRewards = getScaledShopRewards(Number(profile?.prestige_points || 0), ownedInvestmentCount);
  return {
    claimLockedUntil: profile?.claim_locked_until || null,
    dailyClaimedTotal: profile?.daily_claimed_total || 0,
    claimPool: scaledRewards.claimPool,
    dailyClaimLimit: scaledRewards.dailyClaimLimit,
    adReward: scaledRewards.adReward,
    ...status,
  };
}

export async function claimDailyReward(playerId: string) {
  const profile = getLocalProfile();
  const gameStats = ensureLocalGameStats(playerId);
  if (!profile) throw new Error('Player stats not found');
  const result = claimDailyRewardLocal(profile, gameStats);
  saveLocalGameState({
    profile: result.profile,
    gameStats: result.gameStats,
  });
  return {
    claimLockedUntil: result.profile.claim_locked_until || null,
    dailyClaimedTotal: result.profile.daily_claimed_total || 0,
    rewardAmount: result.rewardAmount,
    rewardGems: result.rewardGems,
    rewardDay: result.rewardDay,
  };
}

export async function rescueDailyRewardStreak(playerId: string) {
  const profile = getLocalProfile();
  const gameStats = ensureLocalGameStats(playerId);
  if (!profile) throw new Error('Player stats not found');
  const result = rescueDailyRewardStreakLocal(profile, gameStats);
  saveLocalGameState({
    profile: result.profile,
    gameStats: result.gameStats,
  });
  return {
    success: result.success,
    cooldown: result.cooldown,
  };
}

export async function claimAccumulatedMoney(playerId: string, isTriple = false) {
  void playerId;
  const storedProfile = getLocalProfile();
  const profile = storedProfile ? normalizeAccumulatedClaimProfile(storedProfile).profile : storedProfile;
  if (!profile) throw new Error('Player not found');
  const ownedInvestmentCount = getLocalInvestments().filter((investment) => investment.is_owned).length;
  const result = claimAccumulatedMoneyLocal(profile, isTriple, ownedInvestmentCount);
  saveLocalGameState({ profile: result.profile });
  return {
    claimLockedUntil: result.profile.claim_locked_until || null,
    dailyClaimedTotal: result.profile.daily_claimed_total || 0,
    claimed_amount: result.claimedAmount,
    new_total: result.newTotal,
  };
}

export async function watchAd(playerId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const ownedInvestmentCount = getLocalInvestments().filter((investment) => investment.is_owned).length;
  const result = claimAdReward(profile, ownedInvestmentCount);
  saveLocalGameState({ profile: result.profile });
  return {
    ...result,
    new_total: Number(result.profile.total_money || 0),
  };
}
