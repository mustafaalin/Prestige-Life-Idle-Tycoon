import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { getQuestChapterByIndex, LOCAL_QUESTS } from '../data/local/quests';
import type { GameState, PlayerProfile, QuestProgress } from '../types/game';
import { syncQuestPrestige } from '../utils/game/gameStateHelpers';

interface UseQuestActionsParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
}

export function useQuestActions({
  gameState,
  setGameState,
  saveToLocalStorage,
}: UseQuestActionsParams) {
  const claimQuestReward = useCallback(async (questId?: string, rewardMultiplier = 1) => {
    const claimableQuestId = questId || gameState.questProgress.claimableQuestIds[0];
    const activeQuest = LOCAL_QUESTS.find((quest) => quest.id === claimableQuestId);

    if (!gameState.profile || !claimableQuestId || !activeQuest) {
      return null;
    }

    const normalizedRewardMultiplier = rewardMultiplier > 1 ? 2 : 1;
    const finalRewardMoney = activeQuest.reward_money * normalizedRewardMultiplier;
    const finalRewardGems =
      activeQuest.reward_gems > 0 ? activeQuest.reward_gems * normalizedRewardMultiplier : 0;

    const nextQuestProgress: QuestProgress = {
      ...gameState.questProgress,
      completedQuestIds: [
        ...new Set([...gameState.questProgress.completedQuestIds, activeQuest.id]),
      ],
      claimedQuestIds: [...gameState.questProgress.claimedQuestIds, activeQuest.id],
      claimableQuestIds: gameState.questProgress.claimableQuestIds.filter((id) => id !== activeQuest.id),
      totalClaimedMoney: gameState.questProgress.totalClaimedMoney + finalRewardMoney,
      totalClaimedGems: gameState.questProgress.totalClaimedGems + finalRewardGems,
    };
    const nextProfile = syncQuestPrestige(
      {
        ...gameState.profile,
        total_money: Number(gameState.profile.total_money || 0) + finalRewardMoney,
        lifetime_earnings: Number(gameState.profile.lifetime_earnings || 0) + finalRewardMoney,
        gems: Number(gameState.profile.gems || 0) + finalRewardGems,
      } as PlayerProfile,
      nextQuestProgress
    );

    setGameState((prev) => ({
      ...prev,
      profile: nextProfile,
      questProgress: nextQuestProgress,
    }));

    saveToLocalStorage({
      profile: nextProfile,
      questProgress: nextQuestProgress,
    });

    return {
      success: true,
      rewardMoney: finalRewardMoney,
      rewardGems: finalRewardGems,
      questId: activeQuest.id,
    };
  }, [gameState.profile, gameState.questProgress, saveToLocalStorage, setGameState]);

  const claimQuestChapterReward = useCallback(async () => {
    const claimableChapterRewardId = gameState.questProgress.claimableChapterRewardId;
    const chapterIndex = gameState.questProgress.unlockedChapterIndex;
    const chapter = getQuestChapterByIndex(chapterIndex);

    if (!gameState.profile || !claimableChapterRewardId || !chapter || chapter.id !== claimableChapterRewardId) {
      return null;
    }

    const nextQuestProgress: QuestProgress = {
      ...gameState.questProgress,
      unlockedChapterIndex: Math.min(gameState.questProgress.unlockedChapterIndex + 1, 9),
      claimableChapterRewardId: null,
      claimedChapterRewardIds: [...gameState.questProgress.claimedChapterRewardIds, chapter.id],
      totalClaimedMoney: gameState.questProgress.totalClaimedMoney,
      totalClaimedGems: gameState.questProgress.totalClaimedGems,
    };
    const nextProfile = syncQuestPrestige(
      {
        ...gameState.profile,
      } as PlayerProfile,
      nextQuestProgress
    );

    setGameState((prev) => ({
      ...prev,
      profile: nextProfile,
      questProgress: nextQuestProgress,
    }));

    saveToLocalStorage({
      profile: nextProfile,
      questProgress: nextQuestProgress,
    });

    return {
      success: true,
      rewardPrestigePoints: chapter.reward_prestige_points,
      chapterId: chapter.id,
    };
  }, [gameState.profile, gameState.questProgress, saveToLocalStorage, setGameState]);

  return {
    claimQuestReward,
    claimQuestChapterReward,
  };
}
