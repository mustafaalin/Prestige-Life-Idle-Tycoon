import { CashAmount } from '../CashAmount';
import { MONEY } from '../icons';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { dailyWeek } from '../../core/config/daily';
import { autoIncomePerSecond } from '../../core/formulas';
import { SECONDS_PER_MONTH } from '../../core/config/life';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import type { DailyOffer } from '../../runtime/daily';
import { haptic, playSfx } from '../../runtime/feedback';
import { hasScarf } from '../../runtime/purchases';
import { sceneClass } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { AdCollect } from '../ads/AdButton';
import { classLook } from '../scene/stages';
import { payout } from './coins';
import { portalRoot } from '../stage';
import { UiIcon } from '../UiIcon';

// The daily reward (runtime/daily.ts): the week's seven days as a calendar, today's amount in big
// figures and how it was worked out ("your monthly income × 15"). Days ahead show their multiplier,
// never a dollar figure: that is only known on the day. Day seven is Lucky's: he brings the wallet.

/** The money grows over the week (the money series, 2026-10-22): a note, a bundle, three, a pyramid. */
const DAY_ART = [MONEY[0], MONEY[0], MONEY[1], MONEY[1], MONEY[2], MONEY[3]];

type DayState = 'done' | 'today' | 'ahead';

/** `onCollected`: the reward was paid (the card goes away with the offer). */
export function DailyCard({ offer, onCollected }: { offer: DailyOffer; onCollected: () => void }) {
  const { game, state, actions } = useGameV2();
  const { t, money } = useT();
  const { week, days, dayIndex } = dailyWeek(state.daily.claimed);
  const monthly = autoIncomePerSecond(game) * SECONDS_PER_MONTH;
  const wallet = classLook(sceneClass(game, state.story), hasScarf(state.purchases)).find.src;

  const collect = (multiplier: number) => {
    const amount = actions.claimDaily(multiplier);
    if (amount <= 0) return;
    playSfx(multiplier > 1 ? 'reward' : 'payout');
    haptic('medium');
    payout({ amount, label: `+${money(amount)}`, count: multiplier > 1 ? 18 : 12 });
    onCollected();
  };

  // Android back collects (the card's only way out).
  useBackButton(true, 70, () => collect(1));

  const stateOf = (index: number): DayState => (index < dayIndex ? 'done' : index === dayIndex ? 'today' : 'ahead');

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-4">
      <div className="v2-pop-in w-full max-w-[360px] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-[28px] bg-[#fff9ec] shadow-2xl">
        {/* Header: sunburst, title, the week. */}
        <div className="relative overflow-hidden bg-gradient-to-b from-amber-300 to-orange-500 px-5 pt-4 pb-9 text-center">
          <div className="v2-rays absolute left-1/2 top-1/2 w-[200%] aspect-square" />
          {week > 0 && (
            <span className="relative inline-block mb-1 rounded-full bg-white/25 border border-white/60 px-2.5 py-0.5 v2-display text-[11px] text-white v2-shadow">
              {t('daily.week', { week: week + 1 })}
            </span>
          )}
          <h2 className="relative v2-display v2-outline-thin text-[30px] leading-none text-white">{t('daily.title')}</h2>
          <p className="relative mt-1.5 text-[12px] font-bold text-white v2-shadow">{t('daily.subtitle')}</p>
        </div>

        {/* The calendar overlaps the header a little, like a page laid on it. */}
        <div className="relative -mt-6 px-3.5">
          <div className="grid grid-cols-3 gap-2">
            {days.slice(0, 6).map((months, index) => (
              <DayTile
                key={index}
                day={index + 1}
                months={months}
                art={DAY_ART[index]}
                state={stateOf(index)}
                delay={index * 40}
              />
            ))}
          </div>
          <LuckyDay months={days[6]} wallet={wallet} state={stateOf(6)} />
        </div>

        {/* Today's reward: the figure, and where it comes from. */}
        <div className="px-5 pt-3 pb-5 text-center">
          <p className="v2-display text-[12px] uppercase tracking-wide text-indigo-900/50">{t('daily.todayReward')}</p>
          <p
            className="v2-display v2-outline text-[40px] leading-tight text-emerald-400 tabular-nums"
          >
            <CashAmount amount={offer.amount}>+{money(offer.amount)}</CashAmount>
          </p>
          <p className="text-[12px] font-bold text-slate-500 mb-3">
            {t('daily.formula', { income: money(monthly), months: offer.months })}
          </p>
          <AdCollect
            placement="daily_x2"
            adLabel={t('ads.double', { amount: money(offer.amount * 2), factor: 2 })}
            onReward={() => collect(2)}
            collectLabel={t('common.collect')}
            onCollect={() => collect(1)}
            packAmount={`+${money(offer.amount * 2)}`}
            plainAmount={`+${money(offer.amount)}`}
            packBadge="×2"
          />
          <p className="mt-2.5 text-[11px] font-semibold text-slate-400">{t('daily.noPenalty')}</p>
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}

const TILE_LOOK: Record<DayState, string> = {
  done: 'bg-emerald-50 border-emerald-200',
  today: 'v2-daily-today bg-gradient-to-b from-amber-100 to-amber-200 border-amber-400',
  ahead: 'bg-white border-indigo-100',
};

function DayTile({ day, months, art, state, delay }: { day: number; months: number; art: string; state: DayState; delay: number }) {
  const { t } = useT();
  return (
    <div
      className={`v2-daily-tile relative rounded-2xl border-2 px-1 pt-1.5 pb-2 flex flex-col items-center shadow-[0_3px_8px_rgba(30,41,99,0.10)] ${TILE_LOOK[state]}`}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {state === 'today' ? (
        <span className="rounded-full bg-gradient-to-b from-amber-400 to-orange-500 border border-white/80 px-2 v2-display text-[11px] text-white v2-shadow">
          {t('daily.today')}
        </span>
      ) : (
        <span className="v2-display text-[11px] text-indigo-900/45">{t('daily.day', { day })}</span>
      )}
      <img
        src={art}
        alt=""
        draggable={false}
        className={`h-11 w-full object-contain my-0.5 drop-shadow ${state === 'today' ? 'v2-bob' : ''} ${state === 'done' ? 'opacity-35' : ''}`}
      />
      <span
        className={`v2-display text-[20px] leading-none tabular-nums ${
          state === 'ahead' ? 'text-indigo-900/70' : state === 'done' ? 'text-emerald-700/50' : 'text-white v2-outline-thin'
        }`}
      >
        ×{months}
      </span>
      {state === 'done' && <DoneMark />}
    </div>
  );
}

/** Day seven: Lucky trots in with the wallet, the biggest multiplier of the week. */
function LuckyDay({ months, wallet, state }: { months: number; wallet: string; state: DayState }) {
  const { t } = useT();
  return (
    <div
      className={`v2-daily-tile relative mt-5 rounded-2xl border-2 flex items-center gap-2 pl-2 pr-4 h-[78px] shadow-[0_4px_12px_rgba(76,29,149,0.25)] bg-gradient-to-br from-violet-500 to-indigo-600 ${
        state === 'today' ? 'v2-daily-today border-amber-300' : 'border-white/70'
      }`}
      style={{ '--d': '240ms' } as CSSProperties}
    >
      <div className="absolute inset-0 rounded-[14px] overflow-hidden">
        <div className="v2-rays absolute left-[18%] top-1/2 w-[70%] aspect-square opacity-40" />
      </div>
      <img
        src={wallet}
        alt=""
        draggable={false}
        className={`relative self-end h-[96px] w-[96px] object-contain object-bottom mb-1 drop-shadow-lg ${state === 'today' ? 'v2-bob' : ''} ${state === 'done' ? 'opacity-40' : ''}`}
      />
      <div className="relative flex-1 min-w-0">
        <p className="v2-display text-[11px] text-white/75">{state === 'today' ? t('daily.today') : t('daily.day', { day: 7 })}</p>
        <p className="v2-display text-[17px] leading-tight text-white v2-shadow">{t('daily.luckyDay')}</p>
      </div>
      <span className="relative v2-display v2-outline-thin text-[30px] leading-none text-amber-300 tabular-nums">×{months}</span>
      {state === 'done' && <DoneMark />}
    </div>
  );
}

function DoneMark() {
  return (
    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <UiIcon name="check" className="w-9 h-9 drop-shadow-md" />
    </span>
  );
}
