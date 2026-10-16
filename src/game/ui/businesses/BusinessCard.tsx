import { ArrowBigUpDash, Lock, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PROFIT_MILESTONES } from '../../core/config/economy';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { businessCapAt, businessUnitCap, costForUnits, cycleRevenue, globalMultiplier, maxAffordableUnits, nextMilestone } from '../../core/formulas';
import { canBuyUpgrade, nextUpgrade } from '../../core/state';
import type { BusinessDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { Focusable } from '../home/Focusable';
import { upgradeNameKey } from '../home/questText';
import { RewardCard } from '../home/RewardCard';
import { Chip, GameButton, ImageTile, Panel } from '../kit';
import { CycleBar } from './CycleBar';
import { managerKey, managerPortrait, type ManagerLine } from './managers';

// One business line. Buying adds units (more money per run); without a manager each run needs a
// tap on "Run"; a manager runs it forever, also while the app is closed. Milestones double profit.

export type BuyMode = 1 | 10 | 'max';

/**
 * Units a buy button buys: the fixed amount, or as many as the player can afford (at least 1 to show
 * a price), never past what the class allows (`room`, game-design-v2 §4.2).
 */
function unitsToBuy(def: BusinessDef, owned: number, cash: number, mode: BuyMode, room: number) {
  if (mode !== 'max') return Math.max(1, Math.min(mode, room));
  let count = Math.min(maxAffordableUnits(def, owned, cash), room);
  // The closed-form max can overshoot by one unit through float rounding.
  while (count > 1 && costForUnits(def, owned, count) > cash) count -= 1;
  return Math.max(1, count);
}

export function BusinessCard({ def, buyMode }: { def: BusinessDef; buyMode: BuyMode }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();
  const { owned, managed } = game.businesses[def.id];
  const cycle = state.cycles[def.id];
  const speed = actions.dev.getSpeed();

  // Each class lets a line grow further; at the cap the button waits for the next ceremony.
  const room = businessUnitCap(game, def) - owned;
  const atCap = room <= 0;
  const nextClass = WEALTH_CLASSES[game.classIndex + 1];
  const nextCap = nextClass ? businessCapAt(def, game.classIndex + 1) : null;
  const count = unitsToBuy(def, owned, game.cash, buyMode, room);
  const cost = costForUnits(def, owned, count);
  const canBuy = !atCap && game.cash >= cost;
  const canStart = owned > 0 && !managed && !cycle.running;
  const secondsLeft = (def.cycleSeconds * (1 - cycle.progress)) / Math.max(speed, 1e-9);

  const perRun = cycleRevenue(game, def);
  const monthly = perMonth(perRun / def.cycleSeconds);
  const target = nextMilestone(owned);
  const previous = [...PROFIT_MILESTONES].reverse().find((milestone) => milestone <= owned) ?? 0;

  const upgrade = owned > 0 ? nextUpgrade(game, def.id) : null;
  const upgradeOpen = upgrade !== null && canBuyUpgrade(game, upgrade);

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
      <div className={`flex gap-3 ${owned > 0 ? 'pb-1.5' : ''}`}>
        <Focusable focusKey={`business:${def.id}:run`} className="shrink-0">
          <button
            type="button"
            onClick={() => actions.startCycle(def.id)}
            disabled={!canStart}
            aria-label={canStart ? t('business.run') : name('business', def)}
            className="relative shrink-0 transition-all active:scale-95 disabled:active:scale-100"
          >
            <ImageTile className={owned > 0 ? 'w-20 h-20' : 'w-[88px] h-[88px]'}>
              <img
                src={def.image}
                alt=""
                draggable={false}
                className={owned > 0 ? 'w-[70px] h-[70px] object-contain' : 'w-[78px] h-[78px] object-contain grayscale opacity-60'}
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

          {owned > 0 ? (
            <>
              {/* The income drops to its own line when both do not fit, instead of being cut. */}
              <p className="flex flex-wrap gap-x-1.5 text-[12px] font-bold leading-tight">
                <span className="text-indigo-700 whitespace-nowrap">{t('business.owned', { count: owned })}</span>
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
              {t('business.unitIncome', {
                amount: perMonth((def.baseRevenue * globalMultiplier(game)) / def.cycleSeconds),
              })}
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
        <Focusable focusKey={`business:${def.id}:buy`} className="flex-1">
          <GameButton
            onClick={() => actions.buyBusiness(def.id, count)}
            disabled={!canBuy}
            className="w-full h-full min-h-11 py-2 px-3 flex items-center justify-between gap-2"
          >
            {atCap ? (
              <span className="flex-1 v2-display text-[14px] v2-shadow">{t('business.capFull')}</span>
            ) : (
              <>
                <span className="v2-display text-[14px] v2-shadow">{t('business.buy', { count })}</span>
                <span className="v2-display text-[14px] v2-shadow tabular-nums">{money(cost)}</span>
              </>
            )}
          </GameButton>
        </Focusable>
        {owned > 0 && !managed && (
          <Focusable focusKey={`business:${def.id}:manager`} className="shrink-0">
            <GameButton
              tone="manager"
              onClick={hire}
              disabled={game.cash < def.managerCost}
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
                <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(def.managerCost)}</span>
              </span>
            </GameButton>
          </Focusable>
        )}
      </div>
      {atCap && nextClass && nextCap !== null && (
        <p className="flex items-center gap-1 px-1 text-[11px] font-bold text-indigo-900/50">
          <Lock className="w-3 h-3 shrink-0" />
          {Number.isFinite(nextCap)
            ? t('business.capReached', { class: name('wealthClass', nextClass), cap: nextCap })
            : t('business.capUnlimited', { class: name('wealthClass', nextClass) })}
        </p>
      )}
      {owned > 0 && !managed && <HelpAd cost={def.managerCost} />}

      {owned > 0 && !managed && (
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

      {owned > 0 &&
        (target === null ? (
          <p className="px-1 text-[11px] font-bold text-indigo-900/50">{t('business.allMilestones')}</p>
        ) : (
          // A thin line with its text beside it: the thick green bar above is production, this is the long goal.
          <div className="flex items-center gap-2 px-1">
            <span className="shrink-0 text-[11px] font-bold text-indigo-900/60 tabular-nums">
              {t('business.milestone', { owned, target })}
            </span>
            <div className="flex-1 h-2 rounded-full bg-indigo-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-300"
                style={{ width: `${((owned - previous) / (target - previous)) * 100}%` }}
              />
            </div>
          </div>
        ))}

      {upgrade && (
        <Focusable focusKey={`business:${def.id}:upgrade`}>
          {upgradeOpen ? (
            <GameButton
              tone="gold"
              onClick={() => {
                if (actions.buyUpgrade(upgrade.id)) {
                  playSfx('levelUp');
                  haptic('medium');
                }
              }}
              disabled={game.cash < upgrade.cost}
              className="w-full min-h-11 py-2 px-3 flex items-center gap-2"
            >
              <ArrowBigUpDash className="w-5 h-5 shrink-0" />
              <span className="flex-1 min-w-0 text-left v2-display text-[13px] v2-shadow truncate">
                {t(upgradeNameKey(upgrade.id))} · {t('business.upgradeEffect', { multiplier: upgrade.multiplier })}
              </span>
              <span className="v2-display text-[13px] v2-shadow tabular-nums">{money(upgrade.cost)}</span>
            </GameButton>
          ) : (
            <p className="flex items-center gap-1 px-1 text-[11px] font-bold text-indigo-900/50">
              <Lock className="w-3 h-3 shrink-0" />
              {t('business.upgradeLocked', {
                count: upgrade.requiredOwned,
                upgrade: t(upgradeNameKey(upgrade.id)),
                multiplier: upgrade.multiplier,
              })}
            </p>
          )}
        </Focusable>
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
