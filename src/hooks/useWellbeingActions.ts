import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  DEFAULT_HAPPINESS,
  DEFAULT_HEALTH,
  getHealthCooldownRemaining,
  HEALTH_ACTIONS,
  HEALTH_AD_BOOST_PERCENT,
  normalizeProfileWellbeing,
} from '../data/local/healthActions';
import {
  getHappinessCooldownRemaining,
  HAPPINESS_ACTIONS,
  HAPPINESS_AD_BOOST_PERCENT,
} from '../data/local/happinessActions';
import type {
  GameState,
  HappinessActionKey,
  HealthActionKey,
} from '../types/game';
interface UseWellbeingActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
}

export function useWellbeingActions({
  gameState,
  setGameState,
  gameStateRef,
  saveToLocalStorage,
}: UseWellbeingActionsParams) {
  const applyHealthAction = useCallback(async (actionKey: HealthActionKey) => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const action = HEALTH_ACTIONS.find((entry) => entry.key === actionKey);
    if (!action) {
      return { success: false, appliedAmount: 0 };
    }

    if (getHealthCooldownRemaining(currentProfile, actionKey) > 0) {
      return { success: false, appliedAmount: 0 };
    }

    if (Number(currentProfile.total_money || 0) < action.cost) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHealth = Number(currentProfile.health ?? DEFAULT_HEALTH);
    const nextHealth = Math.min(100, currentHealth + action.healthIncreasePercent);
    const appliedAmount = Math.max(0, nextHealth - currentHealth);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      total_money: Math.max(0, Number(currentProfile.total_money || 0) - action.cost),
      health: nextHealth,
      health_action_cooldowns: {
        ...(currentProfile.health_action_cooldowns || {}),
        [actionKey]: new Date(Date.now() + action.cooldownSeconds * 1000).toISOString(),
      },
    });

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, gameStateRef, saveToLocalStorage, setGameState]);

  const applyHealthAdBoost = useCallback(async () => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHealth = Number(currentProfile.health ?? DEFAULT_HEALTH);
    const nextHealth = Math.min(100, currentHealth + HEALTH_AD_BOOST_PERCENT);
    const appliedAmount = Math.max(0, nextHealth - currentHealth);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      health: nextHealth,
      health_ad_cooldown_until: null,
    });

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, gameStateRef, saveToLocalStorage, setGameState]);

  const applyHappinessAction = useCallback(async (actionKey: HappinessActionKey) => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const action = HAPPINESS_ACTIONS.find((entry) => entry.key === actionKey);
    if (!action) {
      return { success: false, appliedAmount: 0 };
    }

    if (getHappinessCooldownRemaining(currentProfile, actionKey) > 0) {
      return { success: false, appliedAmount: 0 };
    }

    if (Number(currentProfile.total_money || 0) < action.cost) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHappiness = Number(currentProfile.happiness ?? DEFAULT_HAPPINESS);
    const nextHappiness = Math.min(100, currentHappiness + action.happinessIncreasePercent);
    const appliedAmount = Math.max(0, nextHappiness - currentHappiness);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      total_money: Math.max(0, Number(currentProfile.total_money || 0) - action.cost),
      happiness: nextHappiness,
      happiness_action_cooldowns: {
        ...(currentProfile.happiness_action_cooldowns || {}),
        [actionKey]: new Date(Date.now() + action.cooldownSeconds * 1000).toISOString(),
      },
    });

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, gameStateRef, saveToLocalStorage, setGameState]);

  const applyHappinessAdBoost = useCallback(async () => {
    const currentProfile = gameState.profile;
    const activeId = currentProfile?.id;
    if (!activeId || !currentProfile) {
      return { success: false, appliedAmount: 0 };
    }

    const currentHappiness = Number(currentProfile.happiness ?? DEFAULT_HAPPINESS);
    const nextHappiness = Math.min(100, currentHappiness + HAPPINESS_AD_BOOST_PERCENT);
    const appliedAmount = Math.max(0, nextHappiness - currentHappiness);
    const updatedProfile = normalizeProfileWellbeing({
      ...currentProfile,
      happiness: nextHappiness,
      happiness_ad_cooldown_until: null,
    });

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
    };
    setGameState((prev) => ({ ...prev, profile: updatedProfile }));
    saveToLocalStorage({ profile: updatedProfile });

    return { success: true, appliedAmount };
  }, [gameState.profile, gameStateRef, saveToLocalStorage, setGameState]);

  return {
    applyHealthAction,
    applyHealthAdBoost,
    applyHappinessAction,
    applyHappinessAdBoost,
  };
}
