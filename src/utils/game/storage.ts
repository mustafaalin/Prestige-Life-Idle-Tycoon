import type { GameState } from '../../types/game';

export const GAME_STATE_KEY = 'idle_guy_game_state';

/**
 * Saves partial game state to localStorage
 *
 * @param state - Partial game state to save
 */
export function saveToLocalStorage(state: Partial<GameState>): void {
  try {
    const existing = localStorage.getItem(GAME_STATE_KEY);
    const current: Record<string, unknown> = existing ? JSON.parse(existing) : {};
    const currentProfile = current.profile as Record<string, unknown> | undefined;
    const incomingProfile = state.profile as Record<string, unknown> | undefined;

    // Wellbeing alanları her profile yazımında kaybolmamalı.
    const mergedProfile =
      incomingProfile && currentProfile
        ? {
            ...incomingProfile,
            health: (incomingProfile.health as number) > 0 ? incomingProfile.health : (currentProfile.health ?? incomingProfile.health),
            happiness: (incomingProfile.happiness as number) > 0 ? incomingProfile.happiness : (currentProfile.happiness ?? incomingProfile.happiness),
            health_action_cooldowns: incomingProfile.health_action_cooldowns ?? currentProfile.health_action_cooldowns,
            health_ad_cooldown_until: incomingProfile.health_ad_cooldown_until ?? currentProfile.health_ad_cooldown_until,
            happiness_action_cooldowns: incomingProfile.happiness_action_cooldowns ?? currentProfile.happiness_action_cooldowns,
            happiness_ad_cooldown_until: incomingProfile.happiness_ad_cooldown_until ?? currentProfile.happiness_ad_cooldown_until,
          }
        : incomingProfile ?? currentProfile;

    localStorage.setItem(
      GAME_STATE_KEY,
      JSON.stringify({ ...current, ...state, ...(mergedProfile ? { profile: mergedProfile } : {}) })
    );
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Loads game state from localStorage
 *
 * @returns Partial game state or null if not found
 */
export function loadFromLocalStorage(): Partial<GameState> | null {
  try {
    const stored = localStorage.getItem(GAME_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Clears game state from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}
