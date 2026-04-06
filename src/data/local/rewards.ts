import type { GameStats, PlayerProfile } from '../../types/game';
import { getScaledShopRewards } from './rewardScaling';

const DAY_MS = 24 * 60 * 60 * 1000;
const AD_COOLDOWN_SECONDS = 30;

export const DAILY_REWARDS = [
  { day: 1, money: 5000, gems: 0 },
  { day: 2, money: 15000, gems: 0 },
  { day: 3, money: 30000, gems: 0 },
  { day: 4, money: 60000, gems: 2 },
  { day: 5, money: 100000, gems: 0 },
  { day: 6, money: 175000, gems: 5 },
  { day: 7, money: 300000, gems: 15 },
] as const;

function getTodayUtcString(now: Date) {
  return now.toISOString().slice(0, 10);
}

function getUtcDayDiff(lastClaimDate: string | null | undefined, todayUtcStr: string) {
  if (!lastClaimDate) return null;

  const lastClaimTime = new Date(`${lastClaimDate}T00:00:00.000Z`).getTime();
  const todayTime = new Date(`${todayUtcStr}T00:00:00.000Z`).getTime();
  return Math.floor((todayTime - lastClaimTime) / DAY_MS);
}

function resolveRewardDay(streak: number) {
  if (streak <= 0) return 1;
  return ((streak - 1) % DAILY_REWARDS.length) + 1;
}

export function normalizeAccumulatedClaimProfile(profile: PlayerProfile, now = new Date()) {
  const currentDate = getTodayUtcString(now);
  let nextProfile = { ...profile };
  let changed = false;

  if (!nextProfile.last_claim_reset_date || nextProfile.last_claim_reset_date < currentDate) {
    nextProfile = {
      ...nextProfile,
      daily_claimed_total: 0,
      last_claim_reset_date: currentDate,
      claim_locked_until: null,
    };
    changed = true;
  } else if (
    nextProfile.claim_locked_until &&
    new Date(nextProfile.claim_locked_until).getTime() <= now.getTime()
  ) {
    nextProfile = {
      ...nextProfile,
      claim_locked_until: null,
    };
    changed = true;
  }

  return {
    profile: nextProfile,
    changed,
  };
}

export function getDailyRewardStatus(gameStats: GameStats | null) {
  const now = new Date();
  const streak = gameStats?.daily_login_streak || 0;
  const todayUtcStr = getTodayUtcString(now);
  const dayDiff = getUtcDayDiff(gameStats?.last_claim_date, todayUtcStr);
  const hasClaimedToday = dayDiff === 0;
  const rescueAvailable = dayDiff === 2 && streak > 0;
  const canClaim = !hasClaimedToday;
  const nextRewardDay = hasClaimedToday
    ? resolveRewardDay(streak + 1)
    : dayDiff === null || dayDiff === 1 || rescueAvailable
      ? resolveRewardDay(streak + 1)
      : 1;
  const displayRewardDay = hasClaimedToday ? resolveRewardDay(streak) : nextRewardDay;
  const nextMidnightUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const hoursUntilReset = Math.max(0, (nextMidnightUtc - now.getTime()) / 3600000);

  return {
    canClaim,
    currentStreak: streak,
    nextRewardDay,
    displayRewardDay,
    hasClaimedToday,
    rescueAvailable,
    streakBroken: Boolean(dayDiff && dayDiff > 1),
    hoursUntilReset,
    cycleLength: DAILY_REWARDS.length,
  };
}

export function claimDailyReward(profile: PlayerProfile, gameStats: GameStats) {
  const now = new Date();
  const todayUtcStr = getTodayUtcString(now);
  const lastClaimDate = gameStats.last_claim_date;
  const dayDiff = getUtcDayDiff(lastClaimDate, todayUtcStr);

  if (dayDiff === 0) {
    throw new Error('Daily reward already claimed today');
  }

  const continuedStreak = dayDiff === null || dayDiff === 1;
  const newStreak = continuedStreak ? Math.max(1, (gameStats.daily_login_streak || 0) + 1) : 1;
  const rewardDay = resolveRewardDay(newStreak);
  const reward = DAILY_REWARDS[rewardDay - 1];

  return {
    profile: {
      ...profile,
      total_money: Number(profile.total_money) + reward.money,
      lifetime_earnings: Number(profile.lifetime_earnings) + reward.money,
      gems: Number(profile.gems || 0) + reward.gems,
    },
    gameStats: {
      ...gameStats,
      daily_login_streak: newStreak,
      last_claim_date: todayUtcStr,
      last_daily_reward: now.toISOString(),
      updated_at: now.toISOString(),
    },
    rewardAmount: reward.money,
    rewardGems: reward.gems,
    rewardDay,
  };
}

export function rescueDailyRewardStreak(profile: PlayerProfile, gameStats: GameStats) {
  const now = new Date();
  const todayUtcStr = getTodayUtcString(now);
  const dayDiff = getUtcDayDiff(gameStats.last_claim_date, todayUtcStr);

  if (profile.last_ad_watch_time) {
    const secondsSinceLastAd = (now.getTime() - new Date(profile.last_ad_watch_time).getTime()) / 1000;
    if (secondsSinceLastAd < AD_COOLDOWN_SECONDS) {
      return {
        profile,
        gameStats,
        success: false,
        cooldown: Math.ceil(AD_COOLDOWN_SECONDS - secondsSinceLastAd),
      };
    }
  }

  if (dayDiff !== 2 || !gameStats.daily_login_streak) {
    throw new Error('Streak rescue is not available');
  }

  const yesterdayUtcStr = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)
  )
    .toISOString()
    .slice(0, 10);

  return {
    profile: {
      ...profile,
      last_ad_watch_time: now.toISOString(),
    },
    gameStats: {
      ...gameStats,
      last_claim_date: yesterdayUtcStr,
      updated_at: now.toISOString(),
    },
    success: true,
    cooldown: AD_COOLDOWN_SECONDS,
  };
}

export function claimAccumulatedMoney(
  profile: PlayerProfile,
  isTriple = false,
  ownedInvestmentCount = 0
) {
  const now = new Date();
  let workingProfile = normalizeAccumulatedClaimProfile(profile, now).profile;

  if (workingProfile.claim_locked_until && new Date(workingProfile.claim_locked_until) > now) {
    throw new Error('Daily limit reached. Try again later.');
  }

  const lastClaimTime = workingProfile.last_claim_time ? new Date(workingProfile.last_claim_time) : now;
  const minutesPassed = Math.max(0, (now.getTime() - lastClaimTime.getTime()) / 60000);
  const clampedMinutes = Math.min(minutesPassed, 60);
  const scaledRewards = getScaledShopRewards(
    Number(workingProfile.prestige_points || 0),
    ownedInvestmentCount
  );
  const baseRatePerMinute = scaledRewards.claimPool / 60;
  let accumulatedMoney = Math.floor(baseRatePerMinute * clampedMinutes);

  if (accumulatedMoney <= 0) {
    throw new Error('No money to claim yet');
  }

  const dailyClaimedTotal = Number(workingProfile.daily_claimed_total || 0);
  if (dailyClaimedTotal + accumulatedMoney > scaledRewards.dailyClaimLimit) {
    const remaining = scaledRewards.dailyClaimLimit - dailyClaimedTotal;
    if (remaining <= 0) {
      throw new Error('Daily limit reached. Try again later.');
    }
    accumulatedMoney = remaining;
  }

  const finalAmount = isTriple ? accumulatedMoney * 3 : accumulatedMoney;
  const newTotalMoney = Number(workingProfile.total_money) + finalAmount;
  const reachedLimit = dailyClaimedTotal + accumulatedMoney >= scaledRewards.dailyClaimLimit;
  const eightHoursLater = new Date(now.getTime() + 8 * 3600000);
  const nextUtcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const claimLockedUntil = reachedLimit
    ? (eightHoursLater < nextUtcMidnight ? eightHoursLater : nextUtcMidnight).toISOString()
    : workingProfile.claim_locked_until;

  return {
    profile: {
      ...workingProfile,
      total_money: newTotalMoney,
      daily_claimed_total: dailyClaimedTotal + accumulatedMoney,
      last_claim_time: now.toISOString(),
      claim_locked_until: reachedLimit ? claimLockedUntil : workingProfile.claim_locked_until,
    },
    claimedAmount: finalAmount,
    newTotal: newTotalMoney,
  };
}

export function claimAdReward(profile: PlayerProfile, ownedInvestmentCount = 0) {
  const now = new Date();
  if (profile.last_ad_watch_time) {
    const secondsSinceLastAd = (now.getTime() - new Date(profile.last_ad_watch_time).getTime()) / 1000;
    if (secondsSinceLastAd < AD_COOLDOWN_SECONDS) {
      return {
        profile,
        success: false,
        reward: 0,
        cooldown: Math.ceil(AD_COOLDOWN_SECONDS - secondsSinceLastAd),
      };
    }
  }

  const reward = getScaledShopRewards(
    Number(profile.prestige_points || 0),
    ownedInvestmentCount
  ).adReward;
  return {
    profile: {
      ...profile,
      total_money: Number(profile.total_money) + reward,
      lifetime_earnings: Number(profile.lifetime_earnings) + reward,
      last_ad_watch_time: now.toISOString(),
    },
    success: true,
    reward,
    cooldown: AD_COOLDOWN_SECONDS,
  };
}
