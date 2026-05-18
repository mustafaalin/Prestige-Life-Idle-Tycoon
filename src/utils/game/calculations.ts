import type { PlayerProfile, OfflineEarnings } from '../../types/game';
import type { WellbeingEffectSource } from '../../types/game';
import { sumWellbeingEffectsPerHour } from '../../data/local/wellbeing';

export interface OfflineWellbeingDecay {
  health: number;
  happiness: number;
  appliedHours: number;
}

const OFFLINE_RATE = 0.20;
const MAX_OFFLINE_MS = 12 * 60 * 60 * 1000;

function parseBoostExpiry(iso: string | null | undefined): number {
  if (!iso) return 0;
  return new Date(iso).getTime();
}

/**
 * Calculates offline earnings, respecting active income boosts.
 *
 * The offline period is split at each boost expiry boundary so that the
 * boosted rate (job + biz×2 + inv×2) × total×2 applies only for the
 * portion of the offline window where each boost was still active.
 */
export function calculateOfflineEarnings(profile: PlayerProfile): OfflineEarnings | null {
  if (!profile.last_played_at) return null;

  const job  = Number(profile.job_income        || 0);
  const biz  = Number(profile.business_income   || 0);
  const inv  = Number(profile.investment_income || 0);
  const base = Number(profile.hourly_income     || 0);

  // Fallback: if income components aren't stored yet use hourly_income directly
  const hasComponents = job > 0 || biz > 0 || inv > 0;
  if (!hasComponents && base <= 0) return null;

  const startMs = new Date(profile.last_played_at).getTime();
  const nowMs   = Date.now();
  const offlineMs = nowMs - startMs;

  if (offlineMs < 60_000) return null;

  const endMs = startMs + Math.min(offlineMs, MAX_OFFLINE_MS);

  const bizExpiry = parseBoostExpiry(profile.business_boost_expires_at);
  const invExpiry = parseBoostExpiry(profile.investment_boost_expires_at);
  const totExpiry = parseBoostExpiry(profile.income_boost_expires_at);

  // Collect segment boundaries: start, end, and any boost expiry within the window
  const breakpoints = Array.from(new Set([
    startMs,
    endMs,
    ...[bizExpiry, invExpiry, totExpiry].filter((t) => t > startMs && t < endMs),
  ])).sort((a, b) => a - b);

  let totalEarnings = 0;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const segStart = breakpoints[i];
    const segEnd   = breakpoints[i + 1];
    const segHours = (segEnd - segStart) / 3_600_000;
    const mid      = (segStart + segEnd) / 2;

    let segIncome: number;
    if (hasComponents) {
      const bizMult = bizExpiry > mid ? 2 : 1;
      const invMult = invExpiry > mid ? 2 : 1;
      const totMult = totExpiry > mid ? 2 : 1;
      segIncome = (job + biz * bizMult + inv * invMult) * totMult;
    } else {
      // No component data — apply total boost multiplier to hourly_income
      const totMult = totExpiry > mid ? 2 : 1;
      segIncome = base * totMult;
    }

    totalEarnings += segIncome * segHours * OFFLINE_RATE;
  }

  if (totalEarnings <= 0) return null;

  return {
    amount: Math.floor(totalEarnings),
    minutes: Math.floor(offlineMs / 60_000),
    appliedMinutes: Math.floor((endMs - startMs) / 60_000),
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
