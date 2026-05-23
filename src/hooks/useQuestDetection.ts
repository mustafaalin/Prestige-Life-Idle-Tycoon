import { useEffect } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  getQuestChapterByIndex,
  getQuestsForChapter,
  isQuestCompleted,
  QUEST_CHAPTERS,
} from '../data/local/quests';
import type { GameState, PlayerProfile, QuestProgress } from '../types/game';
import { syncPrestige } from '../utils/game/gameStateHelpers';

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

    // ── Find the chapter the player is currently working on ──────────────────
    // = the LOWEST chapter whose reward hasn't been claimed yet.
    // unlockedChapterIndex is just for visibility (peek-ahead); the chapter
    // truly being "completed" is determined by claimed state, not by index.
    let activeChapterIndex = -1;
    for (let i = 0; i < QUEST_CHAPTERS.length; i += 1) {
      const chapter = QUEST_CHAPTERS[i];
      if (!chapter) continue;
      if (gameState.questProgress.claimedChapterRewardIds.includes(chapter.id)) continue;
      activeChapterIndex = i;
      break;
    }
    if (activeChapterIndex < 0) return; // all chapters claimed

    const activeChapter = getQuestChapterByIndex(activeChapterIndex);
    if (!activeChapter) return;

    const activeChapterQuests = getQuestsForChapter(activeChapterIndex);
    if (activeChapterQuests.length === 0) return;

    // ── Detect newly completed quests in the active chapter ───────────────────
    const newlyCompletedQuestIds = activeChapterQuests
      .filter((quest) => {
        const alreadyTracked =
          gameState.questProgress.completedQuestIds.includes(quest.id) ||
          gameState.questProgress.claimableQuestIds.includes(quest.id);
        if (alreadyTracked) return false;
        return isQuestCompleted(quest, snapshot);
      })
      .map((quest) => quest.id);

    const completedQuestIds = new Set([
      ...gameState.questProgress.completedQuestIds,
      ...newlyCompletedQuestIds,
    ]);

    // Chapter ready for reward when EVERY quest assigned to it is in
    // completedQuestIds (including the freshly detected ones).
    const chapterCompleted = activeChapterQuests.every((quest) => completedQuestIds.has(quest.id));

    const desiredClaimableId = chapterCompleted ? activeChapter.id : null;
    // Visibility: the chapter currently being worked on AND the next one
    // (so the player can peek at upcoming quests once the current is complete).
    const desiredUnlockedIndex = chapterCompleted
      ? Math.min(activeChapterIndex + 1, QUEST_CHAPTERS.length - 1)
      : activeChapterIndex;

    // ── Decide whether to write anything ─────────────────────────────────────
    const hasNewQuests = newlyCompletedQuestIds.length > 0;
    const claimableChanged =
      desiredClaimableId !== gameState.questProgress.claimableChapterRewardId;
    const unlockedChanged =
      desiredUnlockedIndex !== gameState.questProgress.unlockedChapterIndex;

    if (!hasNewQuests && !claimableChanged && !unlockedChanged) return;

    questRewardInFlightRef.current = true;
    setGameState((prev) => {
      const nextQuestProgress: QuestProgress = {
        ...prev.questProgress,
        completedQuestIds: [
          ...new Set([...prev.questProgress.completedQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableQuestIds: [
          ...new Set([...prev.questProgress.claimableQuestIds, ...newlyCompletedQuestIds]),
        ],
        claimableChapterRewardId: desiredClaimableId,
        unlockedChapterIndex: desiredUnlockedIndex,
      };
      const nextProfile = prev.profile
        ? syncPrestige(prev.profile as PlayerProfile, nextQuestProgress, prev.businesses)
        : prev.profile;

      saveToLocalStorage({
        profile: nextProfile || undefined,
        questProgress: nextQuestProgress,
      });

      return {
        ...prev,
        profile: nextProfile,
        questProgress: nextQuestProgress,
      };
    });
    questRewardInFlightRef.current = false;
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
