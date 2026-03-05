import type { PlayerProfile, OfflineEarnings } from '../../types/game';

/**
 * Calculates offline earnings based on player's hourly income and time away
 *
 * @param profile - Player profile with last_played_at and hourly_income
 * @returns Offline earnings object with amount and minutes, or null if not applicable
 */
export function calculateOfflineEarnings(profile: PlayerProfile): OfflineEarnings | null {
  if (!profile.last_played_at || !profile.hourly_income) return null;

  const now = new Date();
  const lastPlayed = new Date(profile.last_played_at);
  const minutesOffline = Math.floor((now.getTime() - lastPlayed.getTime()) / 1000 / 60);

  if (minutesOffline < 1) return null;

  const maxOfflineMinutes = 12 * 60; // 12 hours
  const actualMinutes = Math.min(minutesOffline, maxOfflineMinutes);
  const offlineRate = 0.20; // 20% of normal income
  const offlineEarnings = (profile.hourly_income / 60) * actualMinutes * offlineRate;

  return {
    amount: Math.floor(offlineEarnings),
    minutes: minutesOffline,
  };
}

/**
 * Calculates income per second from hourly income
 *
 * @param hourlyIncome - Hourly income amount
 * @returns Income per second
 */
export function calculateIncomePerSecond(hourlyIncome: number): number {
  return hourlyIncome / 3600;
}

/**
 * Calculates the appropriate update interval in milliseconds based on income per second
 *
 * @param incomePerSecond - Income per second amount
 * @returns Update interval in milliseconds
 */
export function calculateUpdateInterval(incomePerSecond: number): number {
  const absIncomePerSecond = Math.abs(incomePerSecond);
  return absIncomePerSecond >= 1 ? 1000 : Math.floor(1000 / absIncomePerSecond);
}

/**
 * Calculates integer money delta with remainder tracking
 *
 * @param incomePerSecond - Income per second
 * @param currentRemainder - Current remainder from previous calculations
 * @returns Object with integer delta and new remainder
 */
export function calculateMoneyDelta(
  incomePerSecond: number,
  currentRemainder: number
): { moneyDelta: number; newRemainder: number } {
  const raw = incomePerSecond + currentRemainder;
  const moneyDelta = raw >= 0 ? Math.floor(raw) : Math.ceil(raw);
  const newRemainder = raw - moneyDelta;

  return { moneyDelta, newRemainder };
}
