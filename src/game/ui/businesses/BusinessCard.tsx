import type { BusinessDef } from '../../core/types';
import { costForUnits, cycleRevenue, globalMultiplier, maxAffordableUnits, nextMilestone } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { CycleBar } from './CycleBar';

export type BuyMode = 1 | 10 | 'max';

/** Units a buy button buys: the fixed amount, or as many as the player can afford (at least 1 to show a price). */
function unitsToBuy(def: BusinessDef, owned: number, cash: number, mode: BuyMode) {
  if (mode !== 'max') return mode;
  let count = maxAffordableUnits(def, owned, cash);
  // The closed-form max can overshoot by one unit through float rounding.
  while (count > 1 && costForUnits(def, owned, count) > cash) count -= 1;
  return Math.max(1, count);
}

export function BusinessCard({ def, buyMode }: { def: BusinessDef; buyMode: BuyMode }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration } = useT();
  const { owned, managed } = game.businesses[def.id];
  const cycle = state.cycles[def.id];
  const speed = actions.dev.getSpeed();

  const count = unitsToBuy(def, owned, game.cash, buyMode);
  const cost = costForUnits(def, owned, count);
  const canBuy = game.cash >= cost;
  const canStart = owned > 0 && !managed && !cycle.running;
  const milestone = nextMilestone(owned);
  const secondsLeft = (def.cycleSeconds * (1 - cycle.progress)) / Math.max(speed, 1e-9);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 flex gap-3">
      <button
        type="button"
        onClick={() => actions.startCycle(def.id)}
        disabled={!canStart}
        aria-label={canStart ? t('business.tapToRun') : name('business', def)}
        className={`relative shrink-0 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center transition-all active:scale-90 ${
          canStart ? 'ring-2 ring-amber-400 animate-pulse' : ''
        }`}
      >
        <img src={def.image} alt="" className={`w-14 h-14 object-contain ${owned === 0 ? 'grayscale opacity-60' : ''}`} draggable={false} />
        {owned > 0 && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-black tabular-nums">
            {owned}
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-black text-slate-900 truncate">{name('business', def)}</p>
          {managed && (
            <span className="shrink-0 rounded-full bg-violet-100 text-violet-600 px-2 py-0.5 text-[10px] font-black">
              {t('business.auto')}
            </span>
          )}
        </div>

        {owned > 0 ? (
          <CycleBar
            progress={cycle.progress}
            running={managed || cycle.running}
            managed={managed}
            cycleSeconds={def.cycleSeconds}
            lastActiveAt={state.lastActiveAt}
            speed={speed}
            label={money(cycleRevenue(game, def))}
            detail={
              canStart
                ? t('business.tapToRun')
                : def.cycleSeconds / speed >= 2
                  ? duration(Math.ceil(secondsLeft))
                  : undefined
            }
          />
        ) : (
          <p className="text-[11px] font-semibold text-slate-500">
            {t('business.earns', {
              amount: money(def.baseRevenue * globalMultiplier(game)),
              duration: duration(def.cycleSeconds),
            })}
          </p>
        )}

        {owned > 0 && (
          <p className="text-[11px] font-semibold text-slate-500">
            {milestone === null
              ? t('business.allMilestones')
              : t('business.milestone', { target: milestone, left: milestone - owned })}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => actions.buyBusiness(def.id, count)}
            disabled={!canBuy}
            className="flex-1 rounded-xl py-2 px-3 flex items-center justify-between gap-2 text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-[11px] font-black">{t('business.buy', { count })}</span>
            <span className="text-[11px] font-black tabular-nums">{money(cost)}</span>
          </button>
          {owned > 0 && !managed && (
            <button
              type="button"
              onClick={() => actions.hireManager(def.id)}
              disabled={game.cash < def.managerCost}
              className="shrink-0 rounded-xl py-2 px-3 flex flex-col items-center leading-tight text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="text-[10px] font-black">{t('business.manager')}</span>
              <span className="text-[10px] font-black tabular-nums">{money(def.managerCost)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
