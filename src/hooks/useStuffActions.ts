import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { getCarProgressionLevel } from '../data/local/cars';
import { getJobRequirementMinimum } from '../data/local/jobRequirements';
import { canAccessCarWithPrestige, canAccessHouseWithPrestige } from '../data/local/prestigeRequirements';
import type { GameState, PlayerProfile } from '../types/game';
import * as itemService from '../services/itemService';
import * as purchaseService from '../services/purchaseService';

interface UseStuffActionsParams {
  gameState: GameState;
  moneyMutationInFlightRef: MutableRefObject<boolean>;
  flushPendingIfNeeded: () => Promise<void>;
  loadGameData: (shouldCalculateOfflineEarnings?: boolean) => Promise<void>;
  saveProfile: (updates: Partial<PlayerProfile>) => Promise<void>;
}

export function useStuffActions({
  gameState,
  moneyMutationInFlightRef,
  flushPendingIfNeeded,
  loadGameData,
  saveProfile,
}: UseStuffActionsParams) {
  const purchaseitem = useCallback(async (
    itemType: 'character' | 'house' | 'car',
    itemId: string,
    price: number
  ) => {
    const activeId = gameState.profile?.id;
    const currentProfile = gameState.profile;
    if (!activeId || !currentProfile) return false;

    if (itemType === 'car') {
      const targetCar = gameState.cars.find((car) => car.id === itemId);
      const activePlayerJob = gameState.playerJobs.find((playerJob) => playerJob.is_active);
      const activeJob = activePlayerJob
        ? gameState.jobs.find((job) => job.id === activePlayerJob.job_id) || null
        : null;
      const minimumSupportedCarLevel = getJobRequirementMinimum(activeJob, 'car_level');

      if (!targetCar || !canAccessCarWithPrestige(targetCar, Number(gameState.profile?.prestige_points || 0))) {
        return false;
      }

      if (gameState.ownedCars.includes(itemId)) {
        return false;
      }

      if (minimumSupportedCarLevel > 0 && getCarProgressionLevel(targetCar) < minimumSupportedCarLevel) {
        return false;
      }

      const purchaseCurrency = targetCar.purchase_currency || 'cash';
      if (purchaseCurrency === 'gems') {
        if (Number(gameState.profile?.gems || 0) < Number(targetCar.gem_price || 0)) {
          return false;
        }
      } else if (currentProfile.total_money < price) {
        return false;
      }
    } else if (itemType === 'house') {
      const targetHouse = gameState.houses.find((house) => house.id === itemId);
      if (!targetHouse) return false;

      if (targetHouse.is_premium) {
        if (gameState.ownedHouses.includes(itemId)) return false;
        if (!canAccessHouseWithPrestige(targetHouse, Number(gameState.profile?.prestige_points || 0))) return false;
        if (Number(gameState.profile?.gems || 0) < Number(targetHouse.gem_price || 0)) return false;
      }
    } else if (currentProfile.total_money < price) {
      return false;
    }

    try {
      if (itemType === 'car') {
        moneyMutationInFlightRef.current = true;
        await flushPendingIfNeeded();
        await purchaseService.purchaseCarViaRPC(activeId, itemId, price);
        moneyMutationInFlightRef.current = false;
        await loadGameData(false);
        return true;
      }

      if (itemType === 'house' && gameState.houses.find((house) => house.id === itemId)?.is_premium) {
        moneyMutationInFlightRef.current = true;
        await flushPendingIfNeeded();
        await purchaseService.purchasePremiumHouseWithGems(activeId, itemId);
        moneyMutationInFlightRef.current = false;
        await loadGameData(false);
        return true;
      }

      await purchaseService.purchaseGeneralItem(activeId, itemType, itemId, price);
      await loadGameData(false);
      return true;
    } catch {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [
    gameState.profile,
    gameState.cars,
    gameState.houses,
    gameState.jobs,
    gameState.playerJobs,
    gameState.ownedCars,
    gameState.ownedHouses,
    moneyMutationInFlightRef,
    flushPendingIfNeeded,
    loadGameData,
  ]);

  const selectCar = useCallback(async (carId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;
    if (!gameState.ownedCars.includes(carId)) return false;

    const targetCar = gameState.cars.find((car) => car.id === carId);
    const activePlayerJob = gameState.playerJobs.find((playerJob) => playerJob.is_active);
    const activeJob = activePlayerJob
      ? gameState.jobs.find((job) => job.id === activePlayerJob.job_id) || null
      : null;
    const minimumSupportedCarLevel = getJobRequirementMinimum(activeJob, 'car_level');

    if (!targetCar) return false;
    if (minimumSupportedCarLevel > 0 && getCarProgressionLevel(targetCar) < minimumSupportedCarLevel) return false;

    try {
      await itemService.selectCar(activeId, carId);
      await loadGameData(false);
      return true;
    } catch {
      return false;
    }
  }, [gameState.profile?.id, gameState.ownedCars, gameState.cars, gameState.jobs, gameState.playerJobs, loadGameData]);

  const sellCar = useCallback(async (carId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await purchaseService.sellOwnedCar(activeId, carId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [gameState.profile?.id, moneyMutationInFlightRef, flushPendingIfNeeded, loadGameData]);

  const selectHouse = useCallback(async (houseId: string) => {
    const activeId = gameState.profile?.id;
    if (!activeId) return false;

    const targetHouse = gameState.houses.find((house) => house.id === houseId);
    const isCurrentHouse = gameState.profile?.selected_house_id === houseId;
    const activePlayerJob = gameState.playerJobs.find((playerJob) => playerJob.is_active);
    const activeJob = activePlayerJob
      ? gameState.jobs.find((job) => job.id === activePlayerJob.job_id) || null
      : null;
    const minimumSupportedHouseLevel = getJobRequirementMinimum(activeJob, 'house_level');

    if (!targetHouse || (!isCurrentHouse && !canAccessHouseWithPrestige(targetHouse, Number(gameState.profile?.prestige_points || 0)))) {
      return false;
    }
    if (!isCurrentHouse && targetHouse.is_premium && !gameState.ownedHouses.includes(houseId)) {
      return false;
    }
    if (!isCurrentHouse && !targetHouse.is_premium && minimumSupportedHouseLevel > 0 && targetHouse.level < minimumSupportedHouseLevel) {
      return false;
    }

    try {
      moneyMutationInFlightRef.current = true;
      await flushPendingIfNeeded();
      await itemService.selectHouse(activeId, houseId);
      moneyMutationInFlightRef.current = false;
      await loadGameData(false);
      return true;
    } catch {
      moneyMutationInFlightRef.current = false;
      return false;
    }
  }, [
    gameState.profile,
    gameState.houses,
    gameState.jobs,
    gameState.playerJobs,
    gameState.ownedHouses,
    moneyMutationInFlightRef,
    flushPendingIfNeeded,
    loadGameData,
  ]);

  const selectCharacter = useCallback(async (characterId: string) => {
    await saveProfile({ selected_character_id: characterId });
  }, [saveProfile]);

  return {
    purchaseitem,
    selectCar,
    sellCar,
    selectHouse,
    selectCharacter,
  };
}
