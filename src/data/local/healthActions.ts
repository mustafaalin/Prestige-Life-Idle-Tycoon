import type { HealthActionKey, HappinessActionKey, PlayerProfile } from '../../types/game';

export interface HealthActionDefinition {
  id: number;
  key: HealthActionKey;
  title: string;
  healthIncreasePercent: number;
  cooldownSeconds: number;
  cost: number;
}

export const DEFAULT_HEALTH = 100;
export const DEFAULT_HAPPINESS = 100;
export const HEALTH_AD_BOOST_PERCENT = 50;
export const HEALTH_AD_COOLDOWN_SECONDS = 30;

export const HEALTH_ACTIONS: HealthActionDefinition[] = [
  { id: 1, key: 'exercise', title: 'Exercise', healthIncreasePercent: 1, cooldownSeconds: 5, cost: 0 },
  { id: 2, key: 'take_a_pill', title: 'Take a Pill', healthIncreasePercent: 5, cooldownSeconds: 7, cost: 250 },
  { id: 3, key: 'go_to_the_doctor', title: 'Go to the Doctor', healthIncreasePercent: 9, cooldownSeconds: 9, cost: 1500 },
  { id: 4, key: 'get_a_check_up', title: 'Get a Check-Up', healthIncreasePercent: 12, cooldownSeconds: 11, cost: 5000 },
  { id: 5, key: 'go_to_a_health_resort', title: 'Go to a Health Resort', healthIncreasePercent: 29, cooldownSeconds: 13, cost: 20000 },
  { id: 6, key: 'get_an_operation', title: 'Get an Operation', healthIncreasePercent: 40, cooldownSeconds: 15, cost: 75000 },
];

export function getProfileHealth(profile?: PlayerProfile | null) {
  return Math.max(0, Math.min(100, Number(profile?.health ?? DEFAULT_HEALTH)));
}

export function getProfileHappiness(profile?: PlayerProfile | null) {
  return Math.max(0, Math.min(100, Number(profile?.happiness ?? DEFAULT_HAPPINESS)));
}

export function getHealthCooldownRemaining(profile: PlayerProfile | null | undefined, actionKey: HealthActionKey, now = Date.now()) {
  const cooldowns = profile?.health_action_cooldowns || {};
  const cooldownUntil = cooldowns[actionKey];
  if (!cooldownUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(cooldownUntil).getTime() - now) / 1000));
}

export function normalizeProfileWellbeing<T extends Partial<PlayerProfile>>(profile: T): T & Pick<
  PlayerProfile,
  | 'health'
  | 'happiness'
  | 'health_action_cooldowns'
  | 'health_ad_cooldown_until'
  | 'happiness_action_cooldowns'
  | 'happiness_ad_cooldown_until'
> {
  return {
    ...profile,
    health: getProfileHealth(profile as PlayerProfile),
    happiness: getProfileHappiness(profile as PlayerProfile),
    health_action_cooldowns: (profile.health_action_cooldowns || {}) as Partial<Record<HealthActionKey, string>>,
    health_ad_cooldown_until: profile.health_ad_cooldown_until || null,
    happiness_action_cooldowns: (profile.happiness_action_cooldowns || {}) as Partial<Record<HappinessActionKey, string>>,
    happiness_ad_cooldown_until: profile.happiness_ad_cooldown_until || null,
  };
}

export function hasWellbeingDefaults(profile: Partial<PlayerProfile> | null | undefined) {
  if (!profile) {
    return false;
  }

  return (
    typeof profile.health === 'number' &&
    typeof profile.happiness === 'number' &&
    typeof profile.health_action_cooldowns === 'object' &&
    profile.health_action_cooldowns !== null &&
    'health_ad_cooldown_until' in profile &&
    typeof profile.happiness_action_cooldowns === 'object' &&
    profile.happiness_action_cooldowns !== null &&
    'happiness_ad_cooldown_until' in profile
  );
}
