import { useCallback } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  createBankDeposit,
  getBankDepositMaxAmount,
  getBankDepositPlan,
  isBankDepositReady,
} from '../data/local/bankDeposits';
import { claimCashback as claimCashbackReward } from '../data/local/bankRewards';
import {
  applyPremiumBankCardPurchase,
  hasPremiumBankCard,
  type PremiumPurchaseMethod,
} from '../data/local/bankPremium';
import { recalculateLocalEconomy } from '../data/local/economy';
import type { BankDepositPlanId, GameState } from '../types/game';

interface UseBankActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  gameStateRef: MutableRefObject<GameState>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
  premiumBankCardMutationInFlightRef: MutableRefObject<boolean>;
}

export function useBankActions({
  gameState,
  setGameState,
  gameStateRef,
  saveToLocalStorage,
  premiumBankCardMutationInFlightRef,
}: UseBankActionsParams) {
  const startBankDeposit = useCallback(async (planId: BankDepositPlanId, amount: number) => {
    const currentProfile = gameState.profile;
    if (!currentProfile) return false;

    const hasActivePlanDeposit = gameStateRef.current.bankDeposits.some(
      (deposit) => deposit.plan_id === planId
    );
    if (hasActivePlanDeposit) return false;

    const principal = Math.floor(amount);
    const maxAmount = getBankDepositMaxAmount(Number(currentProfile.total_money || 0), planId);

    if (principal < 1000 || principal > maxAmount || principal > Number(currentProfile.total_money || 0)) {
      return false;
    }

    const deposit = createBankDeposit({
      planId,
      principal,
      hasPremiumCard: hasPremiumBankCard(currentProfile),
    });
    const updatedProfile = {
      ...currentProfile,
      total_money: Number(currentProfile.total_money || 0) - principal,
    };
    const nextDeposits = [...gameStateRef.current.bankDeposits, deposit];

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    }));

    saveToLocalStorage({
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    });

    return true;
  }, [gameState.profile, gameStateRef, saveToLocalStorage, setGameState]);

  const claimBankDeposit = useCallback(async (depositId: string) => {
    const currentProfile = gameStateRef.current.profile;
    const currentDeposits = gameStateRef.current.bankDeposits;
    if (!currentProfile) return null;

    const deposit = currentDeposits.find((entry) => entry.id === depositId);
    if (!deposit || !isBankDepositReady(deposit)) {
      return null;
    }

    const totalPayout = deposit.principal + deposit.profit;
    const updatedProfile = {
      ...currentProfile,
      total_money: Number(currentProfile.total_money || 0) + totalPayout,
      lifetime_earnings: Number(currentProfile.lifetime_earnings || 0) + deposit.profit,
    };
    const nextDeposits = currentDeposits.filter((entry) => entry.id !== depositId);

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    };

    setGameState((prev) => ({
      ...prev,
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    }));

    saveToLocalStorage({
      profile: updatedProfile,
      bankDeposits: nextDeposits,
    });

    return {
      success: true,
      amount: totalPayout,
      profit: deposit.profit,
      deposit,
      plan: getBankDepositPlan(deposit.plan_id),
    };
  }, [gameStateRef, saveToLocalStorage, setGameState]);

  const claimCashback = useCallback(async () => {
    const currentProfile = gameStateRef.current.profile;
    if (!currentProfile) return null;

    const result = claimCashbackReward(currentProfile);
    if (!result) {
      return null;
    }

    gameStateRef.current = {
      ...gameStateRef.current,
      profile: result.updatedProfile,
    };

    setGameState((prev) => ({
      ...prev,
      profile: result.updatedProfile,
    }));

    saveToLocalStorage({
      profile: result.updatedProfile,
    });

    return {
      success: true,
      amount: result.claimedAmount,
    };
  }, [gameStateRef, saveToLocalStorage, setGameState]);

  const purchasePremiumBankCard = useCallback(async (purchaseMethod: PremiumPurchaseMethod) => {
    const currentProfile = gameStateRef.current.profile;
    if (!currentProfile) return false;
    if (premiumBankCardMutationInFlightRef.current) return false;

    premiumBankCardMutationInFlightRef.current = true;
    try {
      const nextProfileBase = applyPremiumBankCardPurchase(currentProfile, purchaseMethod);
      if (!nextProfileBase) {
        return false;
      }

      const updatedProfile = recalculateLocalEconomy({
        profile: nextProfileBase,
        jobs: gameStateRef.current.jobs,
        playerJobs: gameStateRef.current.playerJobs,
        businesses: gameStateRef.current.businesses,
        investments: gameStateRef.current.investments,
        selectedOutfit: gameStateRef.current.selectedOutfit,
      });

      gameStateRef.current = {
        ...gameStateRef.current,
        profile: updatedProfile,
      };

      setGameState((prev) => ({
        ...prev,
        profile: updatedProfile,
      }));

      saveToLocalStorage({
        profile: updatedProfile,
      });

      return true;
    } finally {
      premiumBankCardMutationInFlightRef.current = false;
    }
  }, [gameStateRef, premiumBankCardMutationInFlightRef, saveToLocalStorage, setGameState]);

  return {
    startBankDeposit,
    claimBankDeposit,
    claimCashback,
    purchasePremiumBankCard,
  };
}
