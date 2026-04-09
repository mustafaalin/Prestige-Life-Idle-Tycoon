import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  getQuestChapterByIndex,
  getQuestsForChapter,
  isQuestCompleted,
} from '../data/local/quests';
import type { GameState, PlayerProfile, QuestProgress } from '../types/game';
import { syncQuestPrestige } from '../utils/game/gameStateHelpers';

interface UseQuestDetectionParams {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  questRewardInFlightRef: MutableRefObject<boolean>;
  saveToLocalStorage: (state: Partial<GameState>) => void;
}

export function useQuestDetection({
  gameState,
  setGameState,
  questRewardInFlightRef,
  saveToLocalStorage,
}: UseQuestDetectionParams) {
  useEffect(() => {
    if (questRewardInFlightRef.current) return;
    if (!gameState.profile) return;

    const openChapterQuests = getQuestsForChapter(gameState.questProgress.unlockedChapterIndex);
    if (!openChapterQuests.length) return;

    const snapshot = {
      profile: gameState.profile,
      questProgress: gameState.questProgress,
      gameStats: gameState.gameStats,
      cars: gameState.cars,
      jobs: gameState.jobs,
      playerJobs: gameState.playerJobs,
      unsavedJobWorkSeconds: gameState.unsavedJobWorkSeconds,
      ownedCars: gameState.ownedCars,
      playerOutfits: gameState.playerOutfits,
      businesses: gameState.businesses,
      investments: gameState.investments,
    };

    const newlyCompletedQuestIds = openChapterQuests
      .filter((quest) => {
        const alreadyTracked =
          gameState.questProgress.completedQuestIds.includes(quest.id) ||
          gameState.questProgress.claimableQuestIds.includes(quest.id);

        if (alreadyTracked) return false;
        return isQuestCompleted(quest, snapshot);
      })
      .map((quest) => quest.id);

    const openChapter = getQuestChapterByIndex(gameState.questProgress.unlockedChapterIndex);
    const chapterQuestIds = openChapterQuests.map((quest) => quest.id);
    const completedQuestIds = [
      ...new Set([...gameState.questProgress.completedQuestIds, ...newlyCompletedQuestIds]),
    ];
    const chapterCompleted =
      chapterQuestIds.length > 0 &&
      chapterQuestIds.every((questId) => completedQuestIds.includes(questId));
    const shouldUnlockChapterReward =
      Boolean(openChapter) &&
      chapterCompleted &&
      !gameState.questProgress.claimableChapterRewardId &&
      !gameState.questProgress.claimedChapterRewardIds.includes(openChapter!.id);

    if (!newlyCompletedQuestIds.length && !shouldUnlockChapterReward) return;

    questRewardInFlightRef.current = true;
    setGameState((prev) => {
      const currentChapter = getQuestChapterByIndex(prev.questProgress.unlockedChapterIndex);
      const nextQuestProgress: QuestProgress = {
        ...prev.questProgress,
        completedQuestIds: [
          ...new Set([...prev.questProgress.completedQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableQuestIds: [
          ...new Set([...prev.questProgress.claimableQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableChapterRewardId:
          shouldUnlockChapterReward && currentChapter
            ? currentChapter.id
            : prev.questProgress.claimableChapterRewardId,
      };
      const nextProfile = prev.profile
        ? syncQuestPrestige(prev.profile as PlayerProfile, nextQuestProgress)
        : prev.profile;

      saveToLocalStorage({
        profile: nextProfile || undefined,
        questProgress: nextQuestProgress,
      });

      questRewardInFlightRef.current = false;
      return {
        ...prev,
        profile: nextProfile,
        questProgress: nextQuestProgress,
      };
    });
  }, [
    gameState.profile,
    gameState.gameStats,
    gameState.cars,
    gameState.jobs,
    gameState.playerJobs,
    gameState.ownedCars,
    gameState.unsavedJobWorkSeconds,
    gameState.playerOutfits,
    gameState.businesses,
    gameState.investments,
    gameState.questProgress,
    saveToLocalStorage,
    setGameState,
    questRewardInFlightRef,
  ]);
}
