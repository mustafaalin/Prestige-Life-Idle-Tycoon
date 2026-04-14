import { Check, CheckCircle2, Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getQuestsForChapter,
  QUEST_CHAPTERS,
  TOTAL_QUEST_CHAPTERS,
} from '../data/local/quests';
import { LOCAL_ICON_ASSETS } from '../lib/localAssets';
import type { QuestChapterDefinition, QuestDefinition, QuestProgress } from '../types/game';

interface QuestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  questProgress: QuestProgress;
  claimableChapterReward: QuestChapterDefinition | null;
  onClaimQuestReward: (questId: string) => Promise<void>;
  onClaimChapterReward: () => Promise<void>;
  onGoToQuest: (quest: QuestDefinition) => void;
  isBusy?: boolean;
}

export function QuestListModal({
  isOpen,
  onClose,
  questProgress,
  claimableChapterReward,
  onClaimQuestReward,
  onClaimChapterReward,
  onGoToQuest,
  isBusy = false,
}: QuestListModalProps) {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [recentlyUnlockedChapterIndex, setRecentlyUnlockedChapterIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedChapterIndex(questProgress.unlockedChapterIndex);
  }, [isOpen, questProgress.unlockedChapterIndex]);

  useEffect(() => {
    if (!isOpen) return;
    setRecentlyUnlockedChapterIndex((previous) => {
      if (previous === null) {
        return questProgress.unlockedChapterIndex;
      }

      if (questProgress.unlockedChapterIndex > previous) {
        return questProgress.unlockedChapterIndex;
      }

      return previous;
    });
  }, [isOpen, questProgress.unlockedChapterIndex]);

  useEffect(() => {
    if (recentlyUnlockedChapterIndex === null) return;
    const timeout = window.setTimeout(() => {
      setRecentlyUnlockedChapterIndex(null);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [recentlyUnlockedChapterIndex]);

  if (!isOpen) return null;

  const selectedChapterQuests = getQuestsForChapter(selectedChapterIndex);
  const selectedChapter = QUEST_CHAPTERS[selectedChapterIndex] || null;
  const selectedChapterQuestCount = selectedChapterQuests.length || 10;
  const chapterCompletedCount = selectedChapterQuests.filter((quest) =>
    questProgress.completedQuestIds.includes(quest.id)
  ).length;
  const sortedChapterQuests = [...selectedChapterQuests].sort((left, right) => {
    const leftClaimed = questProgress.claimedQuestIds.includes(left.id);
    const rightClaimed = questProgress.claimedQuestIds.includes(right.id);

    if (leftClaimed !== rightClaimed) {
      return leftClaimed ? 1 : -1;
    }

    const leftClaimable = questProgress.claimableQuestIds.includes(left.id);
    const rightClaimable = questProgress.claimableQuestIds.includes(right.id);

    if (leftClaimable !== rightClaimable) {
      return leftClaimable ? -1 : 1;
    }

    return 0;
  });
  const chapterProgressPercent =
    selectedChapterQuestCount > 0 ? (chapterCompletedCount / selectedChapterQuestCount) * 100 : 0;
  const isSelectedChapterUnlocked = selectedChapterIndex <= questProgress.unlockedChapterIndex;
  const isSelectedChapterRewardClaimable = claimableChapterReward?.id === selectedChapter?.id;
  const isSelectedChapterRewardClaimed = selectedChapter
    ? questProgress.claimedChapterRewardIds.includes(selectedChapter.id)
    : false;
  const isSelectedChapterComplete = chapterCompletedCount === selectedChapterQuestCount && selectedChapterQuests.length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-4">
      <div className="flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-800">Quest Chapters</h2>
            <p className="text-xs font-bold text-slate-500">Complete 10 quests to unlock each chapter reward.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white p-2 text-slate-500 shadow-sm transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Array.from({ length: TOTAL_QUEST_CHAPTERS }).map((_, index) => {
              const chapter = QUEST_CHAPTERS[index];
              const isUnlocked = index <= questProgress.unlockedChapterIndex;
              const isSelected = index === selectedChapterIndex;
              const isClaimed = questProgress.claimedChapterRewardIds.includes(chapter.id);
              const isRewardReady = claimableChapterReward?.id === chapter.id;
              const isJustUnlocked = recentlyUnlockedChapterIndex === index && isUnlocked && !isClaimed;

              return (
                <button
                  key={chapter.id}
                  onClick={() => isUnlocked && setSelectedChapterIndex(index)}
                  className={
                    'relative min-w-[56px] rounded-xl border px-3 py-2 text-center text-xs font-black transition-all ' +
                    (isSelected
                      ? 'border-amber-300 bg-amber-50 text-amber-700'
                      : isUnlocked
                        ? 'border-slate-200 bg-white text-slate-600'
                        : 'border-slate-200 bg-slate-100 text-slate-400') +
                    (isJustUnlocked ? ' animate-pulse' : '')
                  }
                >
                  {isRewardReady && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white shadow-md">
                      !
                    </span>
                  )}
                  {isClaimed ? (
                    <span className="mx-auto flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : isUnlocked ? (
                    `#${index + 1}`
                  ) : (
                    <Lock className="mx-auto h-4 w-4" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto bg-gradient-to-b from-slate-50/60 to-white px-4 py-4">
          {selectedChapter && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-800">{selectedChapter.title}</p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-amber-700">
                      {chapterCompletedCount}/{selectedChapterQuestCount}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/90">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                      style={{ width: `${chapterProgressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="w-[122px] shrink-0 rounded-2xl border border-amber-200 bg-white/90 p-2.5 shadow-sm">
                  <div className="mb-1 flex items-center justify-center gap-1.5">
                    <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-4 w-4" />
                    <span className="text-sm font-black text-amber-700">
                      +{selectedChapter.reward_prestige_points}
                    </span>
                  </div>
                  {selectedChapter.reward_gems > 0 && (
                    <div className="mb-2 flex items-center justify-center gap-1.5">
                      <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-4 w-4" />
                      <span className="text-sm font-black text-violet-700">
                        +{selectedChapter.reward_gems}
                      </span>
                    </div>
                  )}

                  {isSelectedChapterRewardClaimed ? (
                    <div className="flex items-center justify-center gap-1 rounded-xl bg-emerald-50 px-2 py-2 text-[11px] font-black text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Claimed
                    </div>
                  ) : isSelectedChapterRewardClaimable ? (
                    <button
                      onClick={onClaimChapterReward}
                      disabled={isBusy}
                      className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-2 py-2 text-[11px] font-black text-white transition-all active:scale-95 disabled:opacity-60"
                    >
                      Claim
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-2 py-2 text-[11px] font-black text-slate-500">
                      <Lock className="h-3.5 w-3.5" />
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {isSelectedChapterRewardClaimed ? (
                <p className="text-[11px] font-bold text-emerald-700">
                  Chapter reward claimed. This chapter is complete.
                </p>
              ) : isSelectedChapterRewardClaimable ? (
                <p className="text-[11px] font-bold text-emerald-700">
                  All quests finished. Claim the prestige reward to unlock the next chapter.
                </p>
              ) : isSelectedChapterComplete ? (
                <p className="text-[11px] font-bold text-amber-700">
                  Chapter complete. Reward is ready to unlock.
                </p>
              ) : (
                <p className="text-[11px] font-bold text-slate-500">
                  Finish every quest in this chapter to unlock the prestige reward.
                </p>
              )}
            </div>
          )}

          {!isSelectedChapterUnlocked ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <p className="text-sm font-black text-slate-700">This chapter is locked</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Claim the previous chapter reward to unlock these quests.
              </p>
            </div>
          ) : selectedChapterQuests.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-sm font-black text-slate-700">More quests coming later</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                This chapter is reserved for future quest content.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedChapterQuests.map((quest) => {
                const isClaimed = questProgress.claimedQuestIds.includes(quest.id);
                const isClaimable = questProgress.claimableQuestIds.includes(quest.id);
                const isCompleted = questProgress.completedQuestIds.includes(quest.id) || isClaimable || isClaimed;

                return (
                  <div
                    key={quest.id}
                    className={
                      'rounded-2xl border p-4 transition-all ' +
                      (isClaimable
                        ? 'border-emerald-200 bg-emerald-50'
                        : isClaimed
                          ? 'border-slate-200 bg-slate-50'
                          : isCompleted
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-200 bg-white')
                    }
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800">{quest.title}</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">{quest.description}</p>
                      </div>
                      <div className="shrink-0">
                        {isClaimable ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                            READY
                          </span>
                        ) : isClaimed ? (
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-700">
                            DONE
                          </span>
                        ) : isCompleted ? (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700">
                            COMPLETE
                          </span>
                        ) : (
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black text-sky-700">
                            GOAL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex flex-wrap items-center gap-2 text-[11px] font-black">
                        {quest.reward_money > 0 ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            ${quest.reward_money.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-700">
                            <img src={LOCAL_ICON_ASSETS.gem} alt="Gems" className="h-3.5 w-3.5" />
                            {quest.reward_gems} gems
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                          <img src={LOCAL_ICON_ASSETS.prestige} alt="Prestige" className="h-3.5 w-3.5" />
                          +1
                        </span>
                      </div>

                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          Claimed
                        </span>
                      ) : isClaimable ? (
                        <button
                          onClick={() => onClaimQuestReward(quest.id)}
                          disabled={isBusy}
                          className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-2 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-60"
                        >
                          Claim
                        </button>
                      ) : (
                        <button
                          onClick={() => onGoToQuest(quest)}
                          disabled={isBusy}
                          className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-3 py-2 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-60"
                        >
                          Go
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
