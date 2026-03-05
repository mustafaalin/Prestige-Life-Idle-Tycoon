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
    const current = existing ? JSON.parse(existing) : {};
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ ...current, ...state }));
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
