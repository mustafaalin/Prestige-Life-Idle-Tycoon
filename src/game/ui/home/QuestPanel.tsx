import { ArrowBigUpDash, ChevronDown, ChevronRight, ChevronUp, Target } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import { questReward } from '../../core/formulas';
import { activeQuests, isQuestComplete, questProgress } from '../../core/state';
import type { GameStateV2, QuestDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { burstCoins } from './coins';
import { questTarget, questText, questVisual, questWhere } from './questText';
import type { TabId } from './tabs';

// Goals (plan 1.12/2.7). On the home scene: a card with the next goal (a finished one jumps to the top
// with a Claim button); "All" shows the three on screen. Inside a tab: a thin strip with one goal, so
// the player still sees it while doing it. Each goal shows its picture, where it's done, and "Go".

export type GoToQuest = (quest: QuestDef) => void;

/** Finished goals first, then the order they were given. */
function orderedQuests(game: GameStateV2) {
  return [...activeQuests(game)].sort(
    (a, b) => Number(isQuestComplete(game, b)) - Number(isQuestComplete(game, a)),
  );
}

export function QuestPanel({ onGo }: { onGo: GoToQuest }) {
  const { game } = useGameV2();
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);

  const quests = orderedQuests(game);
  if (quests.length === 0) return null;
  const shown = expanded ? quests : quests.slice(0, 1);

  return (
    <div className="pointer-events-auto absolute left-3 top-2 w-[min(300px,calc(100%-24px))] rounded-2xl bg-white/90 border-2 border-white shadow-lg px-2.5 py-2">
      <div className="flex items-center gap-1.5">
        <Target className="w-4 h-4 text-orange-500" />
        <p className="flex-1 v2-display text-[12px] uppercase tracking-wide text-indigo-900/60">{t('quests.title')}</p>
        {quests.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-0.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-black text-indigo-600 transition-all active:scale-95"
          >
            {expanded ? t('quests.less') : t('quests.all')}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      <ul className="mt-1.5 flex flex-col gap-2">
        {shown.map((quest) => (
          <QuestRow key={quest.id} quest={quest} onGo={onGo} />
        ))}
      </ul>
    </div>
  );
}

/**
 * One goal at the top of an open tab: a finished one, else the one the player went to, else one done
 * in this tab, else one with a "Go", else the next.
 */
export function QuestStrip({ tab, pinnedId, onGo }: { tab: TabId; pinnedId: string | null; onGo: GoToQuest }) {
  const { game } = useGameV2();
  const quests = orderedQuests(game);
  const quest =
    quests.find((candidate) => isQuestComplete(game, candidate)) ??
    quests.find((candidate) => candidate.id === pinnedId) ??
    quests.find((candidate) => questTarget(candidate)?.tab === tab) ??
    quests.find((candidate) => questTarget(candidate) !== null) ??
    quests[0];
  if (!quest) return null;
  return (
    <div className="shrink-0 px-3 py-1.5 bg-white/85 border-b border-indigo-100">
      <ul>
        <QuestRow quest={quest} onGo={onGo} compact />
      </ul>
    </div>
  );
}

function QuestRow({ quest, onGo, compact }: { quest: QuestDef; onGo: GoToQuest; compact?: boolean }) {
  const { game, actions } = useGameV2();
  const translator = useT();
  const { t, money } = translator;

  const { current, target } = questProgress(game, quest.goal);
  const done = current >= target;
  const visual = questVisual(quest);
  const canGo = questTarget(quest) !== null;
  const where = questWhere(quest, translator);

  const claim = (event: MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const amount = actions.claimQuest(quest.id);
    if (amount <= 0) return;
    playSfx('coin');
    haptic('medium');
    burstCoins({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, count: 8 });
  };

  return (
    <li className="flex items-center gap-2">
      <div
        className={`relative shrink-0 ${compact ? 'w-9 h-9' : 'w-11 h-11'} ${
          visual.round ? 'rounded-full' : 'rounded-xl'
        } bg-gradient-to-b from-sky-100 to-indigo-100 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center`}
      >
        <img
          src={visual.image}
          alt=""
          draggable={false}
          className={visual.cover || visual.round ? 'w-full h-full object-cover' : 'w-[85%] h-[85%] object-contain'}
        />
        {visual.upgrade && (
          <span className="absolute -right-0.5 -bottom-0.5 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white">
            <ArrowBigUpDash className="w-3.5 h-3.5 text-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold leading-tight text-indigo-950">{questText(quest, translator)}</p>
        {(!compact || !canGo) && where && (
          <p className="text-[10px] font-bold leading-tight text-indigo-900/50 truncate">{where}</p>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <div className="flex-1 h-2 rounded-full bg-indigo-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all"
              style={{ width: `${Math.min(1, current / Math.max(target, 1)) * 100}%` }}
            />
          </div>
          {target > 1 && (
            <span className="text-[10px] font-black text-indigo-900/50 tabular-nums">
              {Math.min(Math.floor(current), target)}/{target}
            </span>
          )}
          <span className="text-[10px] font-black text-amber-600 tabular-nums">+{money(questReward(game, quest))}</span>
        </div>
      </div>

      {done ? (
        <button
          type="button"
          onClick={claim}
          className="shrink-0 rounded-full border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy px-2.5 py-1.5 v2-display text-[12px] text-white v2-shadow transition-all active:scale-95"
        >
          {t('quests.claim')}
        </button>
      ) : (
        canGo && (
          <button
            type="button"
            onClick={() => {
              haptic('light');
              onGo(quest);
            }}
            className="shrink-0 flex items-center rounded-full border-2 border-white bg-gradient-to-b from-violet-400 to-indigo-600 v2-glossy pl-2.5 pr-1.5 py-1.5 v2-display text-[12px] text-white v2-shadow transition-all active:scale-95"
          >
            {t('quests.go')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </li>
  );
}
