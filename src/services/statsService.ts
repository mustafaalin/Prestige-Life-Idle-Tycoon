import type { GameStats } from '../types/game';
import { getLocalGameStats, getLocalProfile, saveLocalGameState } from '../data/local/storage';

export async function getGameStats(_playerId: string): Promise<GameStats | null> {
  return getLocalGameStats();
}

export async function fetchGameStats(playerId: string): Promise<GameStats | null> {
  return getGameStats(playerId);
}

export async function updateGameStats(
  _playerId: string,
  updates: Partial<GameStats>
): Promise<{ success: boolean; error?: string }> {
  const stats = getLocalGameStats();
  if (!stats) {
    return { success: false, error: 'Game stats not found' };
  }
  saveLocalGameState({ gameStats: { ...stats, ...updates } });
  return { success: true };
}

export async function calculatePlayerIncome(
  _playerId: string
): Promise<{ hourly_income: number; hourly_expenses: number }> {
  const profile = getLocalProfile();
  return {
    hourly_income: Number(profile?.hourly_income || 0),
    hourly_expenses: Number(profile?.total_expenses || 0),
  };
}

export async function calculatePrestigeTotal(_playerId: string): Promise<number> {
  const profile = getLocalProfile();
  return Number(profile?.prestige_points || 0);
}
