import { ArrowBigUpDash, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { questReward } from '../../core/formulas';
import { QUEST_AD_MULTIPLIER } from '../../core/config/ads';
import { canWatch } from '../../runtime/adRewards';
import { AdButton } from '../ads/AdButton';
import { useAdFree } from '../ads/useAdText';
import { track } from '../../runtime/analytics';
import { ICONS } from '../icons';
import { activeQuests, isQuestComplete, questProgress } from '../../core/state';
import type { GameStateV2, QuestDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { useGuideTarget } from '../guide/guideSteps';
import { AlertBadge } from '../kit';
import { payout } from './coins';
import { PointingHand } from './Focusable';
import { questTarget, questText, questVisual, questWhere } from './questText';
import type { TabId } from './tabs';

// Goals (plan 1.12/2.7). On the home scene: a small round badge with the next goal's picture in a
// progress ring (a finished one jumps first, rings green with a "!" and a Claim button beside it); a tap
// opens the card with every goal on screen, which folds back after a few seconds or at a tap anywhere
// else. Inside a tab: a thin strip with one goal, so the player still sees it while doing it. Each goal
// shows its picture, where it's done, and "Go". The badge replaced a one-row card that still covered
// the home's face (phone test, 2026-10-15).

export type GoToQuest = (quest: QuestDef) => void;

/** The open list folds back after this long. */
const EXPANDED_MS = 8000;

/** Finished goals first, then the order they were given. */
function orderedQuests(game: GameStateV2) {
  return [...activeQuests(game)].sort(
    (a, b) => Number(isQuestComplete(game, b)) - Number(isQuestComplete(game, a)),
  );
}

/** Claims a finished goal; its reward shows in the middle of the screen and flies into the wallet. */
function useClaimQuest() {
  const { actions } = useGameV2();
  const { money } = useT();
  return (quest: QuestDef) => {
    const amount = actions.claimQuest(quest.id);
    if (amount <= 0) return;
    playSfx('payout');
    haptic('medium');
    payout({ amount, label: `+${money(amount)}`, count: 8 });
  };
}

export function QuestPanel({ onGo }: { onGo: GoToQuest }) {
  const { game } = useGameV2();
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const timer = window.setTimeout(() => setExpanded(false), EXPANDED_MS);
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) setExpanded(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', outside);
    };
  }, [expanded]);

  const quests = orderedQuests(game);
  if (quests.length === 0) return null;
  const go: GoToQuest = (quest) => {
    setExpanded(false);
    onGo(quest);
  };

  return (
    <section
      ref={panel}
      aria-label={t('quests.title')}
      className="pointer-events-auto absolute left-3 top-2 w-[min(270px,calc(100%-24px))]"
    >
      {expanded ? (
        <div className="v2-pop-in rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-white shadow-lg px-2 py-1.5">
          <ul className="flex flex-col gap-2">
            {quests.map((quest) => (
              <QuestRow key={quest.id} quest={quest} onGo={go} />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="relative v2-hit mx-auto mt-1 flex items-center gap-0.5 px-2 text-[10px] font-black text-indigo-600 transition-all active:scale-95"
          >
            {t('quests.less')}
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <QuestBadge
          quest={quests[0]}
          onOpen={() => {
            playSfx('click');
            haptic('light');
            setExpanded(true);
          }}
        />
      )}
    </section>
  );
}

/**
 * The folded goal: its picture in a progress ring; a finished one also gets a Claim button and, beside
 * it, the ad that pays it three times over (2026-10-21, user: claiming from here skipped the ×3 offer
 * that only the open card showed).
 */
function QuestBadge({ quest, onOpen }: { quest: QuestDef; onOpen: () => void }) {
  const { game } = useGameV2();
  const translator = useT();
  const { t, money } = translator;
  const claim = useClaimQuest();
  const x3 = useQuestX3(quest);
  const guided = useGuideTarget()?.key === `quest:${quest.id}:claim`;
  const { current, target } = questProgress(game, quest.goal);
  const done = current >= target;
  const share = Math.min(1, current / Math.max(target, 1));
  const visual = questVisual(quest);
  const radius = 26;
  const length = 2 * Math.PI * radius;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${t('quests.title')}: ${questText(quest, translator)}`}
        className="relative v2-hit shrink-0 w-[60px] h-[60px] transition-all active:scale-90"
      >
        <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md">
          <circle cx="30" cy="30" r={radius} fill="rgba(255,255,255,0.9)" stroke="rgba(30,27,75,0.25)" strokeWidth="5" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={done ? '#22c55e' : '#f59e0b'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={length}
            strokeDashoffset={length * (1 - share)}
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute inset-[8px] rounded-full overflow-hidden bg-gradient-to-b from-sky-100 to-indigo-100 flex items-center justify-center">
          <img
            src={visual.image}
            alt=""
            draggable={false}
            className={visual.cover || visual.round ? 'w-full h-full object-cover' : 'w-[80%] h-[80%] object-contain'}
          />
        </span>
        {done && <AlertBadge small className="-top-0.5 -right-0.5" />}
      </button>
      {done && (
        <button
          type="button"
          onClick={x3.pack ? x3.take : () => claim(quest)}
          className={`relative v2-hit shrink-0 rounded-full border-2 ${x3.pack ? 'border-amber-300' : 'border-white'} bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy px-3 py-1.5 v2-display text-[13px] text-white v2-shadow transition-all active:scale-95`}
        >
          {t('quests.claim')} <span className="tabular-nums">+{money(questReward(game, quest) * (x3.pack ? QUEST_AD_MULTIPLIER : 1))}</span>
          {x3.pack && <PackMark />}
          {guided && <PointingHand className="-bottom-6 -right-1" />}
        </button>
      )}
      {done && x3.offered && !x3.pack && (
        <AdButton small placement="quest_x3" onReward={x3.take}>
          ×{QUEST_AD_MULTIPLIER} +{money(questReward(game, quest) * QUEST_AD_MULTIPLIER)}
        </AdButton>
      )}
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
    <div className="v2-quest-strip shrink-0 px-3 py-1.5 bg-white/85 border-b border-indigo-100">
      <ul>
        <QuestRow quest={quest} onGo={onGo} compact />
      </ul>
    </div>
  );
}

/**
 * A finished goal's ×3 ad. With the Comfort Pack (`pack`) it is not a second button: Claim itself pays
 * three times over and wears the pack's mark (2026-10-22, user: two buttons, one paying less, made no sense).
 */
function useQuestX3(quest: QuestDef) {
  const { state, actions } = useGameV2();
  const { money } = useT();
  const free = useAdFree();
  const offered = canWatch(state.ads, 'quest_x3', Date.now());
  const take = () => {
    if (free) track('ad_watch', { placement: 'quest_x3', outcome: 'ad_free' });
    const amount = actions.ads.questX3(quest.id);
    if (amount <= 0) return;
    playSfx('payout');
    haptic('medium');
    payout({ amount, label: `+${money(amount)}`, count: 10 });
  };
  return { offered, pack: free && offered, take };
}

/** The Comfort Pack's mark on a button it made pay more: its picture and "×3". */
function PackMark() {
  return (
    <span className="pointer-events-none absolute -top-3 -right-2 flex items-center rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 pr-1.5 v2-display text-[10px] text-white v2-shadow">
      <img src={ICONS.adFree} alt="" draggable={false} className="w-5 h-5 object-contain" />×{QUEST_AD_MULTIPLIER}
    </span>
  );
}

function QuestRow({ quest, onGo, compact }: { quest: QuestDef; onGo: GoToQuest; compact?: boolean }) {
  const { game } = useGameV2();
  const translator = useT();
  const { t, money } = translator;

  const { current, target } = questProgress(game, quest.goal);
  const done = current >= target;
  const visual = questVisual(quest);
  const canGo = questTarget(quest) !== null;
  const where = questWhere(quest, translator);
  const guided = useGuideTarget()?.key === `quest:${quest.id}:claim`;

  const claimQuest = useClaimQuest();
  const claim = () => claimQuest(quest);
  const x3 = useQuestX3(quest);

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
        <div className="shrink-0 flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={x3.pack ? x3.take : claim}
            className={`relative v2-hit shrink-0 rounded-full border-2 ${x3.pack ? 'border-amber-300' : 'border-white'} bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy px-2.5 py-1.5 v2-display text-[12px] text-white v2-shadow transition-all active:scale-95`}
          >
            {t('quests.claim')}
            {x3.pack && <span className="tabular-nums"> +{money(questReward(game, quest) * QUEST_AD_MULTIPLIER)}</span>}
            {x3.pack && <PackMark />}
            {guided && <PointingHand className="-bottom-6 -right-1" />}
          </button>
          {/* The same goal paid three times over, for an ad. */}
          {x3.offered && !x3.pack && (
            <AdButton small placement="quest_x3" onReward={x3.take}>
              ×{QUEST_AD_MULTIPLIER} +{money(questReward(game, quest) * QUEST_AD_MULTIPLIER)}
            </AdButton>
          )}
        </div>
      ) : (
        canGo && (
          <button
            type="button"
            onClick={() => {
              haptic('light');
              onGo(quest);
            }}
            className="relative v2-hit shrink-0 flex items-center rounded-full border-2 border-white bg-gradient-to-b from-violet-400 to-indigo-600 v2-glossy pl-2.5 pr-1.5 py-1.5 v2-display text-[12px] text-white v2-shadow transition-all active:scale-95"
          >
            {t('quests.go')}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )
      )}
    </li>
  );
}
