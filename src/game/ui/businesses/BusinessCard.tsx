import { ArrowBigUpDash, Lock, Play, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WEALTH_CLASSES } from '../../core/config/classes';
import {
  branchCapAt,
  branchCost,
  businessImage,
  businessState,
  cycleRevenue,
  globalMultiplier,
  isMaxLevel,
  levelRevenue,
  locations,
  managerCost,
  nextLevel,
} from '../../core/formulas';
import type { BusinessDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { Focusable } from '../home/Focusable';
import { levelNameKey } from '../home/questText';
import { RewardCard } from '../home/RewardCard';
import { Chip, GameButton, ImageTile, Panel } from '../kit';
import { CycleBar } from './CycleBar';
import { managerKey, managerPortrait, type ManagerLine } from './managers';

// One business line (docs/economy-rebuild.md §3): opened once, then grown level by level (stand →
// shop → store) and, at the top level, by branches on this same card. Without a manager each run
// needs a tap on "Run" and counts nowhere in the monthly income; a manager runs every location,
// also while the app is closed.

/** Most branch icons drawn in the row; more shows as the count alone. */
const BRANCH_ICONS = 8;

export function BusinessCard({ def }: { def: BusinessDef }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();
  const business = businessState(game, def.id);
  const { level, branches, managed } = business;
  const opened = level > 0;
  const cycle = state.cycles[def.id];
  const speed = actions.dev.getSpeed();
  const multiplier = globalMultiplier(game);

  const canStart = opened && !managed && !cycle.running;
  const secondsLeft = (def.cycleSeconds * (1 - cycle.progress)) / Math.max(speed, 1e-9);
  const perRun = cycleRevenue(game, def);
  const monthly = perMonth(perRun / def.cycleSeconds);

  // The next level (or opening the line): what it costs, what a run pays after, how fast it repays.
  const next = nextLevel(def, business);
  const places = Math.max(1, locations(business));
  const runNow = levelRevenue(def, level) * places * multiplier;
  const runNext = next ? next.revenue * places * multiplier : runNow;
  const paybackSeconds = next && runNext > runNow ? (next.cost * def.cycleSeconds) / (runNext - runNow) : null;

  // Branches: at the top level, as many as the class allows; a ceremony raises the limit.
  const atTop = isMaxLevel(def, business);
  const cap = branchCapAt(def, game.classIndex);
  const atCap = branches >= cap;
  const nextClass = WEALTH_CLASSES[game.classIndex + 1];
  const nextCap = nextClass ? branchCapAt(def, game.classIndex + 1) : null;
  const branchPrice = branchCost(def, branches);
  const branchRun = levelRevenue(def, level) * multiplier;
  const hirePrice = managerCost(game, def);

  const managerName = t(managerKey(def.id, 'name'));
  const portrait = managerPortrait(def.id);
  const [hired, setHired] = useState(false);
  // Tapping a manager's portrait shows one of their lines for a moment.
  const [quote, setQuote] = useState<ManagerLine | null>(null);
  useEffect(() => {
    if (!quote) return;
    const timer = window.setTimeout(() => setQuote(null), 3500);
    return () => window.clearTimeout(timer);
  }, [quote]);

  const hire = () => {
    if (!actions.hireManager(def.id)) return;
    playSfx('levelUp');
    haptic('medium');
    setHired(true);
  };

  const talk = () => {
    haptic('light');
    setQuote((current) => (current === 'line1' ? 'line2' : 'line1'));
  };

  return (
    <Panel className="p-3 flex flex-col gap-2.5">
      <div className={`flex gap-3 ${opened ? 'pb-1.5' : ''}`}>
        <Focusable focusKey={`business:${def.id}:run`} className="shrink-0">
          <button
            type="button"
            onClick={() => actions.startCycle(def.id)}
            disabled={!canStart}
            aria-label={canStart ? t('business.run') : name('business', def)}
            className="relative shrink-0 transition-all active:scale-95 disabled:active:scale-100"
          >
            <ImageTile className={opened ? 'w-20 h-20' : 'w-[88px] h-[88px]'}>
              <img
                src={businessImage(def, Math.max(level, 1))}
                alt=""
                draggable={false}
                className={opened ? 'w-[70px] h-[70px] object-contain' : 'w-[78px] h-[78px] object-contain grayscale opacity-60'}
              />
            </ImageTile>
            {canStart && (
              <span className="v2-nudge absolute left-1/2 -bottom-2.5 flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 v2-glossy pl-1.5 pr-2.5 py-0.5 v2-display text-[12px] text-white v2-shadow">
                <Play className="w-3 h-3 fill-white" />
                {t('business.run')}
              </span>
            )}
          </button>
          {/* Under the picture, where "Run" sits on a line without a manager: the name keeps the whole row. */}
          {managed && (
            <button
              type="button"
              onClick={talk}
              aria-label={managerName}
              className="v2-hit absolute -left-2.5 -bottom-2.5 flex transition-all active:scale-95"
            >
              <Chip>
                <img
                  src={portrait}
                  alt=""
                  draggable={false}
                  className="-ml-1.5 w-6 h-6 rounded-full object-cover border-2 border-white"
                />
                {t('business.auto')}
              </Chip>
            </button>
          )}
        </Focusable>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <p className="v2-display text-[17px] leading-tight text-indigo-950 line-clamp-2 break-words">
            {name('business', def)}
          </p>

          {opened ? (
            <>
              {/* The income drops to its own line when both do not fit, instead of being cut. */}
              <p className="flex flex-wrap gap-x-1.5 text-[12px] font-bold leading-tight">
                <span className="text-indigo-700 whitespace-nowrap">
                  {t(levelNameKey(def.id, level))} · {t('business.level', { level, max: def.levels.length })}
                </span>
                <span className={managed ? 'text-emerald-600' : 'text-violet-600'}>
                  {t(managed ? 'business.income' : 'business.withManager', { amount: monthly })}
                </span>
              </p>
              <CycleBar
                progress={cycle.progress}
                running={managed || cycle.running}
                managed={managed}
                cycleSeconds={def.cycleSeconds}
                lastActiveAt={state.lastActiveAt}
                speed={speed}
                label={t('business.perRun', { amount: money(perRun) })}
                detail={!canStart && def.cycleSeconds / speed >= 2 ? duration(Math.ceil(secondsLeft)) : undefined}
              />
            </>
          ) : (
            <p className="text-[12px] font-bold text-emerald-600">
              {t('business.openIncome', { amount: perMonth(runNext / def.cycleSeconds) })}
            </p>
          )}
        </div>
      </div>

      {quote && (
        <div className="v2-pop-in flex items-center gap-2 rounded-2xl bg-violet-50 border-2 border-violet-100 px-2 py-1.5">
          <img
            src={portrait}
            alt=""
            draggable={false}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
          />
          <p className="text-[12px] font-bold leading-snug text-violet-800">
            <span className="v2-display text-violet-600">{managerName}: </span>“{t(managerKey(def.id, quote))}”
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {next && (
          <Focusable focusKey={`business:${def.id}:level`} className="flex-1">
            <GameButton
              onClick={() => {
                if (actions.levelUpBusiness(def.id)) {
                  playSfx(opened ? 'levelUp' : 'purchase');
                  haptic('medium');
                }
              }}
              disabled={game.cash < next.cost}
              className="w-full h-full min-h-11 py-2 px-3 flex items-center justify-between gap-2"
            >
              <span className="min-w-0 flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                {opened && <ArrowBigUpDash className="w-5 h-5 shrink-0" />}
                <span className="truncate">
                  {opened ? t(levelNameKey(def.id, level + 1)) : t('business.open')}
                </span>
              </span>
              <span className="v2-display text-[14px] v2-shadow tabular-nums">{money(next.cost)}</span>
            </GameButton>
          </Focusable>
        )}
        {atTop && (
          <Focusable focusKey={`business:${def.id}:branch`} className="flex-1">
            <GameButton
              onClick={() => {
                if (actions.openBranch(def.id)) {
                  playSfx('purchase');
                  haptic('medium');
                }
              }}
              disabled={atCap || game.cash < branchPrice}
              className="w-full h-full min-h-11 py-2 px-3 flex items-center justify-between gap-2"
            >
              {atCap ? (
                <span className="flex-1 v2-display text-[14px] v2-shadow">{t('business.branchCapFull')}</span>
              ) : (
                <>
                  <span className="min-w-0 flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                    <Store className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('business.openBranch')}</span>
                  </span>
                  <span className="v2-display text-[14px] v2-shadow tabular-nums">{money(branchPrice)}</span>
                </>
              )}
            </GameButton>
          </Focusable>
        )}
        {opened && !managed && (
          <Focusable focusKey={`business:${def.id}:manager`} className="shrink-0">
            <GameButton
              tone="manager"
              onClick={hire}
              disabled={game.cash < hirePrice}
              className="h-full py-1 px-2.5 flex items-center gap-1.5"
            >
              <img
                src={portrait}
                alt=""
                draggable={false}
                className="w-7 h-7 rounded-full object-cover border-2 border-white"
              />
              <span className="flex flex-col items-start leading-tight">
                <span className="v2-display text-[12px] v2-shadow">{t('business.manager')}</span>
                <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(hirePrice)}</span>
              </span>
            </GameButton>
          </Focusable>
        )}
      </div>

      {/* What the next level changes: the run before and after, and how soon it pays for itself. */}
      {opened && next && (
        <p className="px-1 text-[11px] font-bold text-indigo-900/60">
          {t('business.nextRun', { from: money(runNow), to: money(runNext) })}
          {paybackSeconds !== null && ` · ${t('business.payback', { time: duration(Math.ceil(paybackSeconds)) })}`}
        </p>
      )}

      {atTop && (
        <div className="flex items-center gap-2 px-1">
          <span className="shrink-0 text-[11px] font-bold text-indigo-900/60 tabular-nums">
            {Number.isFinite(cap)
              ? t('business.branchesCap', { count: branches, cap })
              : t('business.branches', { count: branches })}
          </span>
          <span className="flex-1 min-w-0 flex items-center gap-0.5 overflow-hidden" aria-hidden>
            {Array.from({ length: Math.min(branches, BRANCH_ICONS) }, (_, index) => (
              <Store key={index} className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            ))}
          </span>
          {!atCap && (
            <span className="shrink-0 text-[11px] font-bold text-emerald-600">
              {t('business.branchRun', { amount: money(branchRun) })}
            </span>
          )}
        </div>
      )}
      {atTop && atCap && nextClass && nextCap !== null && (
        <p className="flex items-center gap-1 px-1 text-[11px] font-bold text-indigo-900/50">
          <Lock className="w-3 h-3 shrink-0" />
          {Number.isFinite(nextCap)
            ? t('business.branchCapReached', { class: name('wealthClass', nextClass), cap: nextCap })
            : t('business.branchCapUnlimited', { class: name('wealthClass', nextClass) })}
        </p>
      )}

      {opened && !managed && <HelpAd cost={hirePrice} />}

      {opened && !managed && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-2 py-1.5">
          <img
            src={portrait}
            alt=""
            draggable={false}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
          />
          <p className="text-[11px] font-bold leading-snug text-violet-700">
            {t('business.managerHint', { name: managerName })}
          </p>
        </div>
      )}

      {hired && (
        <RewardCard
          image={portrait}
          portrait
          title={managerName}
          body={`“${t(managerKey(def.id, 'hire'))}”`}
          note={t('business.managerJoined', { name: managerName, business: name('business', def) })}
          actionLabel={t('business.welcome')}
          onCollect={() => setHired(false)}
        />
      )}
    </Panel>
  );
}
