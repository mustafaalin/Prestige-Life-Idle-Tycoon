import type { HappinessActionKey, PlayerProfile } from '../../types/game';

export interface HappinessActionDefinition {
  id: number;
  key: HappinessActionKey;
  title: string;
  happinessIncreasePercent: number;
  cooldownSeconds: number;
  cost: number;
}

export const HAPPINESS_AD_BOOST_PERCENT = 50;

export const HAPPINESS_ACTIONS: HappinessActionDefinition[] = [
  { id: 1, key: 'listen_to_music', title: 'Listen to Music', happinessIncreasePercent: 1, cooldownSeconds: 5, cost: 10 },
  { id: 2, key: 'eat_a_dessert', title: 'Eat a Dessert', happinessIncreasePercent: 5, cooldownSeconds: 7, cost: 50 },
  { id: 3, key: 'hang_out_with_friends', title: 'Hang Out with Friends', happinessIncreasePercent: 9, cooldownSeconds: 9, cost: 200 },
  { id: 4, key: 'go_to_the_cinema', title: 'Go to the Cinema', happinessIncreasePercent: 12, cooldownSeconds: 11, cost: 500 },
  { id: 5, key: 'throw_a_party', title: 'Throw a Party', happinessIncreasePercent: 29, cooldownSeconds: 13, cost: 1500 },
  { id: 6, key: 'go_on_vacation', title: 'Go on Vacation', happinessIncreasePercent: 40, cooldownSeconds: 15, cost: 5000 },
];

export function getHappinessCooldownRemaining(
  profile: PlayerProfile | null | undefined,
  actionKey: HappinessActionKey,
  now = Date.now()
) {
  const cooldowns = profile?.happiness_action_cooldowns || {};
  const cooldownUntil = cooldowns[actionKey];
  if (!cooldownUntil) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(cooldownUntil).getTime() - now) / 1000));
}
