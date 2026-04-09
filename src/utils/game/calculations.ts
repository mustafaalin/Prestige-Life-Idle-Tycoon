import type { PlayerProfile, OfflineEarnings } from '../../types/game';
import type { WellbeingEffectSource } from '../../types/game';
import { sumWellbeingEffectsPerHour } from '../../data/local/wellbeing';

export interface OfflineWellbeingDecay {
  health: number;
  happiness: number;
  appliedHours: number;
}

/**
 * Calculates offline earnings based on player's hourly income and time away
 *
 * @param profile - Player profile with last_played_at and hourly_income
 * @returns Offline earnings object with amount and minutes, or null if not applicable
 */
export function calculateOfflineEarnings(profile: PlayerProfile): OfflineEarnings | null {
  if (!profile.last_played_at) return null;

  const hourlyIncome = Number(profile.hourly_income || 0);
  if (hourlyIncome <= 0) return null;

  const now = new Date();
  const lastPlayed = new Date(profile.last_played_at);
  const minutesOffline = Math.floor((now.getTime() - lastPlayed.getTime()) / 1000 / 60);

  if (minutesOffline < 1) return null;

  const maxOfflineMinutes = 12 * 60; // 12 hours
  const actualMinutes = Math.min(minutesOffline, maxOfflineMinutes);
  const offlineRate = 0.20; // 20% of normal income
  const offlineEarnings = (hourlyIncome / 60) * actualMinutes * offlineRate;

  if (offlineEarnings <= 0) return null;

  return {
    amount: Math.floor(offlineEarnings),
    minutes: minutesOffline,
    appliedMinutes: actualMinutes,
  };
}

/**
 * Calculates offline wellbeing change based on equipped items' per-hour effects.
 * Capped at MAX_OFFLINE_HOURS regardless of actual time away.
 */
export function calculateOfflineWellbeingDecay(
  sources: Array<WellbeingEffectSource | null | undefined>,
  lastPlayedAt: string | null,
  maxOfflineHours = 24,
): OfflineWellbeingDecay | null {
  if (!lastPlayedAt) return null;

  const perHour = sumWellbeingEffectsPerHour(sources);
  if (perHour.health === 0 && perHour.happiness === 0) return null;

  const now = Date.now();
  const last = new Date(lastPlayedAt).getTime();
  const elapsedHours = (now - last) / 1000 / 3600;
  if (elapsedHours < 1 / 60) return null; // 1 dakikadan az, yoksay

  const appliedHours = Math.min(elapsedHours, maxOfflineHours);

  // Offline iken negatif etkileri maks -2/h ile sınırla; pozitif etkiler aynen uygulanır
  const MAX_OFFLINE_DECAY_PER_HOUR = -2;
  const offlineHealthPerHour = perHour.health < 0 ? Math.max(perHour.health, MAX_OFFLINE_DECAY_PER_HOUR) : perHour.health;
  const offlineHappinessPerHour = perHour.happiness < 0 ? Math.max(perHour.happiness, MAX_OFFLINE_DECAY_PER_HOUR) : perHour.happiness;

  return {
    health: offlineHealthPerHour * appliedHours,
    happiness: offlineHappinessPerHour * appliedHours,
    appliedHours,
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
