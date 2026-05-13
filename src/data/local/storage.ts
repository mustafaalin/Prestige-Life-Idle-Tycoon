import type {
  GameState,
  Job,
  PlayerJob,
  BusinessWithPlayerData,
  InvestmentWithPlayerData,
  PlayerProfile,
  GameStats,
  PlayerOutfit,
  CharacterOutfit,
  Character,
  QuestProgress,
} from '../../types/game';
import { GAME_STATE_KEY } from '../../utils/game/storage';
import { LOCAL_JOBS } from './jobs';
import { LOCAL_BUSINESSES } from './businesses';
import {
  calculateInvestmentRentalIncome,
  INVESTMENT_UPGRADE_ORDER,
  LOCAL_INVESTMENTS,
} from './investments';
import { LOCAL_OUTFITS } from './outfits';
import { LOCAL_CHARACTERS } from './characters';

export function loadLocalGameState(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalGameState(state: Partial<GameState>): void {
  const current = loadLocalGameState();
  const currentProfile = current.profile as Record<string, unknown> | undefined;
  const incomingProfile = state.profile as Record<string, unknown> | undefined;

  // Wellbeing alanları profile'ın her yazılmasında kaybolmamalı.
  // Gelen profile'da bu alanlar eksikse mevcut değeri koru.
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
}

export function getLocalJobs(): Job[] {
  return LOCAL_JOBS;
}

export function getLocalPlayerJobs(): PlayerJob[] {
  return (loadLocalGameState().playerJobs as PlayerJob[] | undefined) || [];
}

export function getLocalBusinesses(): BusinessWithPlayerData[] {
  const storedBusinesses = loadLocalGameState().businesses as BusinessWithPlayerData[] | undefined;

  if (!storedBusinesses?.length) {
    return LOCAL_BUSINESSES;
  }

  return LOCAL_BUSINESSES.map((seedBusiness) => {
    const storedBusiness =
      storedBusinesses.find((business) => business.id === seedBusiness.id) ||
      storedBusinesses.find((business) => business.unlock_order === seedBusiness.unlock_order) ||
      storedBusinesses.find((business) => business.name === seedBusiness.name);

    if (!storedBusiness) {
      return seedBusiness;
    }

    return {
      ...seedBusiness,
      is_owned: storedBusiness.is_owned ?? seedBusiness.is_owned,
      can_unlock: storedBusiness.can_unlock ?? seedBusiness.can_unlock,
      current_level: storedBusiness.current_level ?? seedBusiness.current_level,
      current_hourly_income: storedBusiness.current_hourly_income ?? seedBusiness.current_hourly_income,
      total_invested: storedBusiness.total_invested ?? seedBusiness.total_invested,
      current_prestige_points:
        storedBusiness.current_prestige_points ?? seedBusiness.current_prestige_points,
    };
  });
}

export function getLocalInvestments(): InvestmentWithPlayerData[] {
  const storedInvestments = loadLocalGameState().investments as InvestmentWithPlayerData[] | undefined;

  if (!storedInvestments?.length) {
    return LOCAL_INVESTMENTS;
  }

  return LOCAL_INVESTMENTS.map((seedInvestment) => {
    const storedInvestment =
      storedInvestments.find((investment) => investment.id === seedInvestment.id) ||
      storedInvestments.find((investment) => investment.sort_order === seedInvestment.sort_order) ||
      storedInvestments.find((investment) => investment.region === seedInvestment.region);

    if (!storedInvestment) {
      return seedInvestment;
    }

    const inferredUpgradeCount = Math.max(
      0,
      Number(storedInvestment.current_level || seedInvestment.current_level || 0) - 1
    );
    const normalizedUpgrades =
      storedInvestment.upgrades_applied?.length
        ? storedInvestment.upgrades_applied
        : INVESTMENT_UPGRADE_ORDER.slice(0, inferredUpgradeCount);
    const normalizedRentalIncome =
      storedInvestment.is_owned || normalizedUpgrades.length > 0
        ? calculateInvestmentRentalIncome(seedInvestment.base_rental_income, normalizedUpgrades)
        : seedInvestment.current_rental_income;

    return {
      ...seedInvestment,
      is_owned: storedInvestment.is_owned ?? seedInvestment.is_owned,
      current_level:
        storedInvestment.is_owned || normalizedUpgrades.length > 0
          ? normalizedUpgrades.length + 1
          : seedInvestment.current_level,
      current_rental_income: normalizedRentalIncome,
      total_invested: storedInvestment.total_invested ?? seedInvestment.total_invested,
      purchased_at: storedInvestment.purchased_at ?? seedInvestment.purchased_at,
      upgrades_applied: normalizedUpgrades,
    };
  });
}

export function getLocalProfile(): PlayerProfile | null {
  return (loadLocalGameState().profile as PlayerProfile | undefined) || null;
}

export function getLocalCharacters(): Character[] {
  return (loadLocalGameState().characters as Character[] | undefined) || LOCAL_CHARACTERS;
}

export function getLocalOutfits(): CharacterOutfit[] {
  return LOCAL_OUTFITS;
}

export function getLocalPlayerOutfits(): PlayerOutfit[] {
  return (loadLocalGameState().playerOutfits as PlayerOutfit[] | undefined) || [];
}

export function getLocalGameStats(): GameStats | null {
  return (loadLocalGameState().gameStats as GameStats | undefined) || null;
}

export function getLocalOwnedCars(): string[] {
  return (loadLocalGameState().ownedCars as string[] | undefined) || [];
}

export function getLocalOwnedCharacters(): string[] {
  return (loadLocalGameState().ownedCharacters as string[] | undefined) || [];
}

export function getLocalOwnedHouses(): string[] {
  return (loadLocalGameState().ownedHouses as string[] | undefined) || [];
}

export function getLocalQuestProgress(): QuestProgress | null {
  return (loadLocalGameState().questProgress as QuestProgress | undefined) || null;
}
