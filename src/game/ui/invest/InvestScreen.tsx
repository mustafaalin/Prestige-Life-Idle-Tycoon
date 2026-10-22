import { Clock, Lock, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { INVEST_CAP_MONTHS, investPlan, OFFERED_PLANS, type InvestPlan } from '../../core/config/investments';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx, useMusic } from '../../runtime/feedback';
import { dealDue, investAvailable, investCap, runningDeals, type Investment } from '../../runtime/investment';
import { useGameV2 } from '../../runtime/useGameV2';
import { adsLeft, canRushInvest, canWatch } from '../../runtime/adRewards';
import { AdButton } from '../ads/AdButton';
import { CashAmount, MoneyIcon } from '../CashAmount';
import { payout } from '../home/coins';
import { GameButton, Panel, Segmented } from '../kit';
import { portalRoot } from '../stage';

// Old Ray's deals (runtime/investment.ts, game-design-v2.md §4.14), redrawn after Idle Guy's bank
// (2026-10-22, user: "a game, not an accounting app"): Ray says one line, the running deal shows its
// money and a bar, and the deals sit side by side as small tiles, a money picture and a big "+%". A tap
// on a tile opens the amount card; the special deal opens with an ad. Every deal can run at once
// (2026-10-22, user): a running deal stays on its own tile, same size, with its bar, what comes back
// and its button (halve the time with an ad, then collect). Stocks and real estate are tabs that open
// in a later update.

const PORTRAIT = (face: 'warm' | 'laugh' | 'concerned') => `/assets/story/portraits/riza-${face}.webp`;

const SHARES = [0.25, 0.5, 1] as const;
type Share = (typeof SHARES)[number];

/** Each deal's colours: the tile's top band and its button. */
const PLAN_LOOK: Record<InvestPlan['id'], { band: string; tone: 'buy' | 'manager' | 'gold' }> = {
  quick: { band: 'from-sky-400 to-blue-500', tone: 'manager' },
  night: { band: 'from-violet-400 to-indigo-600', tone: 'manager' },
  safe: { band: 'from-emerald-400 to-green-600', tone: 'buy' },
  balanced: { band: 'from-violet-400 to-indigo-600', tone: 'manager' },
  bold: { band: 'from-amber-400 to-orange-600', tone: 'gold' },
  special: { band: 'from-rose-400 to-pink-600', tone: 'gold' },
};

const percent = (fraction: number) => Math.round(Math.abs(fraction) * 100);
const planName = (plan: InvestPlan) => `invest.plans.${plan.id}.name` as MessageKey;

/** The screen's tabs: the deals now, stocks and real estate in a later update (2026-10-22, user). */
const TABS = [
  { id: 'deals', open: true },
  { id: 'stocks', open: false },
  { id: 'estate', open: false },
] as const;

export function InvestScreen() {
  useMusic('calm');
  const { state } = useGameV2();
  const { t } = useT();
  // What the last collected deal did, until a new one goes in.
  const [result, setResult] = useState<number | null>(null);
  const [picked, setPicked] = useState<InvestPlan | null>(null);
  const now = Date.now();
  const deals = runningDeals(state.invest);
  // A deal from an old save whose plan is no longer offered still shows, after the offered ones.
  const plans = [...OFFERED_PLANS, ...deals.map((deal) => investPlan(deal.planId)).filter((plan) => plan?.retired)].filter(
    (plan): plan is InvestPlan => plan !== undefined,
  );

  const line =
    result !== null
      ? { face: result >= 0 ? 'laugh' : 'concerned', text: t(result >= 0 ? 'invest.rizaWon' : 'invest.rizaLost') }
      : deals.length > 0
        ? { face: 'warm', text: t(deals.some((deal) => dealDue(deal, now)) ? 'invest.rizaDue' : 'invest.rizaRunning') }
        : { face: 'warm', text: t('invest.rizaIdle') };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex gap-1 rounded-2xl bg-white/70 border-2 border-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <div
            key={tab.id}
            className={`flex-1 min-h-9 rounded-xl px-1.5 py-1 flex flex-col items-center justify-center leading-none ${
              tab.open ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-white v2-shadow v2-glossy' : 'text-indigo-900/40'
            }`}
          >
            <span className="flex items-center gap-1 v2-display text-[13px]">
              {!tab.open && <Lock className="w-3 h-3" strokeWidth={3} />}
              {t(`invest.tabs.${tab.id}` as MessageKey)}
            </span>
            {!tab.open && <span className="mt-0.5 text-[9px] font-black uppercase tracking-wider">{t('invest.soon')}</span>}
          </div>
        ))}
      </div>

      <Panel className="p-3 flex items-center gap-3">
        <img
          src={PORTRAIT(line.face as 'warm' | 'laugh' | 'concerned')}
          alt=""
          draggable={false}
          className="shrink-0 w-14 h-14 rounded-full object-cover border-[3px] border-white shadow-md bg-amber-100"
        />
        <div className="flex-1 min-w-0">
          <p className="v2-display text-[13px] text-violet-700">{t('ceremony.cast.riza')}</p>
          <p className="text-[13px] font-bold leading-snug text-slate-700">{line.text}</p>
        </div>
      </Panel>

      {result !== null && <ResultBanner gain={result} />}

      <div className="flex flex-wrap justify-center gap-2">
        {plans.map((plan) => {
          const deal = state.invest.deals[plan.id];
          return deal ? (
            <RunningTile key={plan.id} plan={plan} deal={deal} onCollected={setResult} />
          ) : (
            <PlanTile key={plan.id} plan={plan} onPick={() => setPicked(plan)} />
          );
        })}
      </div>

      <p className="text-[11px] font-semibold text-slate-500 text-center px-4">{t('invest.allAtOnce')}</p>

      {picked && (
        <DealCard
          plan={picked}
          onClose={() => setPicked(null)}
          onStarted={() => {
            setResult(null);
            setPicked(null);
          }}
        />
      )}
    </section>
  );
}

function ResultBanner({ gain }: { gain: number }) {
  const { t, money } = useT();
  const won = gain >= 0;
  return (
    <div
      className={`v2-pop-in rounded-2xl border-2 border-white/80 v2-glossy bg-gradient-to-b px-4 py-2.5 text-center ${
        won ? 'from-emerald-400 to-green-600' : 'from-rose-400 to-rose-600'
      }`}
    >
      <p className="v2-display text-[20px] text-white v2-shadow tabular-nums">
        {won ? t('invest.won', { amount: money(gain) }) : t('invest.lost', { amount: `−${money(-gain)}` })}
      </p>
    </div>
  );
}

/** The figure of a deal's return on its tile: "+7%", or the bold one's win and loss. */
function PlanGain({ plan, big = false }: { plan: InvestPlan; big?: boolean }) {
  const { t } = useT();
  return (
    <span className="flex flex-col items-center leading-none">
      <span className={`v2-display v2-outline-thin tabular-nums text-emerald-400 ${big ? 'text-[28px]' : 'text-[22px]'}`}>
        +%{percent(plan.gain)}
      </span>
      {plan.chance !== undefined && (
        <span className="mt-0.5 text-[10px] font-black text-rose-500 tabular-nums">
          {t('invest.orLoss', { percent: percent(plan.loss ?? 0) })}
        </span>
      )}
    </span>
  );
}

/** A deal's tile, the same size whether it waits for money or runs: band, top chip, picture, figure, button. */
function TileShell({
  plan,
  chip,
  figure,
  button,
  corner,
  dimmed = false,
  onClick,
}: {
  plan: InvestPlan;
  chip: ReactNode;
  figure: ReactNode;
  button: ReactNode;
  corner?: ReactNode;
  dimmed?: boolean;
  onClick?: () => void;
}) {
  const { t } = useT();
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick, disabled: dimmed } : {})}
      className={`relative w-[calc(33.333%-6px)] min-w-[100px] overflow-hidden rounded-[18px] border-2 border-white bg-gradient-to-b from-white to-indigo-50 shadow-[0_3px_0_rgba(90,70,160,0.18),0_6px_14px_rgba(56,42,106,0.08)] flex flex-col items-center pb-2 transition-all ${
        onClick ? 'active:scale-95' : ''
      } ${dimmed ? 'opacity-60' : ''}`}
    >
      <span className={`w-full bg-gradient-to-r ${PLAN_LOOK[plan.id].band} px-1 py-1 v2-display text-[12px] text-white v2-shadow truncate`}>
        {t(planName(plan))}
      </span>
      <span className="mt-1 h-[18px] flex items-center">{chip}</span>
      <MoneyIcon tier={plan.moneyTier} size={50} />
      {figure}
      <span className="h-1.5 shrink-0" aria-hidden />
      <span className="mt-auto self-stretch mx-1.5">{button}</span>
      {corner}
    </Tag>
  );
}

function PlanTile({ plan, onPick }: { plan: InvestPlan; onPick: () => void }) {
  const { game, state } = useGameV2();
  const { t, duration } = useT();
  const now = Date.now();
  const adOpen = !plan.ad || canWatch(state.ads, 'invest_special', now);
  const ready = adOpen && investAvailable(game) > 0;
  const pick = () => {
    if (!ready) return;
    playSfx('click');
    haptic('light');
    onPick();
  };
  return (
    <TileShell
      plan={plan}
      dimmed={!ready}
      onClick={pick}
      chip={
        <span className="flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-black text-indigo-700 tabular-nums">
          <Clock className="w-3 h-3" strokeWidth={3} />
          {duration(plan.hours * 3600)}
        </span>
      }
      figure={<PlanGain plan={plan} />}
      button={
        <span
          className={`flex items-center justify-center gap-1 rounded-full border-2 border-white/70 bg-gradient-to-b v2-glossy py-1 v2-display text-[12px] text-white v2-shadow ${
            plan.ad ? 'from-orange-400 to-orange-600' : 'from-emerald-400 to-green-600'
          }`}
        >
          {plan.ad && <img src="/assets/icons/v2/ad-reward.webp" alt="" draggable={false} className="w-4 h-4 object-contain" />}
          {plan.ad ? t('invest.open') : t('invest.put')}
        </span>
      }
      corner={
        plan.ad && (
          <span className="absolute top-7 right-1 rounded-full bg-rose-500 px-1.5 text-[9px] font-black text-white tabular-nums">
            {t('invest.adLeft', { count: adsLeft(state.ads, 'invest_special', now) })}
          </span>
        )
      }
    />
  );
}

/** The amount card: how much goes in and what it brings back, then "Invest" (or the ad). */
function DealCard({ plan, onClose, onStarted }: { plan: InvestPlan; onClose: () => void; onStarted: () => void }) {
  const { game, actions } = useGameV2();
  const { t, money, duration } = useT();
  const [share, setShare] = useState<Share>(1);
  const stake = investAvailable(game) * share;
  useBackButton(true, 70, onClose);

  const started = () => {
    playSfx('purchase');
    haptic('medium');
    onStarted();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center px-6" onClick={onClose}>
      <div className="v2-pop-in w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center" onClick={(event) => event.stopPropagation()}>
        <div className={`relative flex items-center justify-center px-12 py-2.5 bg-gradient-to-r ${PLAN_LOOK[plan.id].band}`}>
          <p className="v2-display v2-outline-thin text-xl text-white">{t(planName(plan))}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute right-2.5 p-1.5 rounded-full bg-white/25 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="px-5 pt-3 pb-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <MoneyIcon tier={plan.moneyTier} size={76} />
            <div className="flex flex-col items-center gap-1">
              <PlanGain plan={plan} big />
              <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-black text-indigo-700 tabular-nums">
                <Clock className="w-3.5 h-3.5" strokeWidth={3} />
                {duration(plan.hours * 3600)}
              </span>
            </div>
          </div>
          <p className="text-[12px] font-bold text-slate-500">{t(`invest.plans.${plan.id}.body` as MessageKey)}</p>

          <div className="w-full">
            <Segmented
              options={SHARES.map((value) => ({ value, label: value === 1 ? t('invest.all') : t('dreams.percent', { percent: value * 100 }) }))}
              value={share}
              onChange={(value) => {
                playSfx('click');
                setShare(value);
              }}
            />
          </div>
          <p className="text-[12px] font-bold text-slate-600 tabular-nums">{t('invest.stake', { amount: money(stake) })}</p>

          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('invest.profit')}</p>
          <p className="v2-display v2-outline text-[34px] leading-none text-emerald-400 tabular-nums">
            <CashAmount amount={stake * plan.gain} size={40}>+{money(stake * plan.gain)}</CashAmount>
          </p>
          {plan.chance !== undefined && (
            <p className="text-[12px] font-black text-rose-500 tabular-nums">
              {t('invest.boldOdds', { chance: percent(plan.chance), loss: money(stake * -(plan.loss ?? 0)) })}
            </p>
          )}
          <p className="text-[10px] font-semibold text-slate-400 tabular-nums">
            {t('invest.cap', { months: INVEST_CAP_MONTHS, amount: money(investCap(game)) })}
          </p>

          {plan.ad ? (
            <AdButton
              placement="invest_special"
              className="w-full mt-1"
              onReward={() => {
                if (actions.ads.investSpecial(stake)) started();
              }}
            >
              {t('invest.openSpecial')}
            </AdButton>
          ) : (
            <GameButton
              tone="buy"
              disabled={stake <= 0}
              onClick={() => {
                if (actions.invest.start(plan.id, stake)) started();
              }}
              className="w-full mt-1 py-3 v2-display text-lg v2-shadow"
            >
              {t('invest.put')}
            </GameButton>
          )}
        </div>
      </div>
    </div>,
    portalRoot(),
  );
}

/** A running deal on its tile: a bar with the time left, what comes back, and halve (ad) or collect. */
function RunningTile({ plan, deal, onCollected }: { plan: InvestPlan; deal: Investment; onCollected: (gain: number) => void }) {
  const { state, actions } = useGameV2();
  const { t, money, duration } = useT();
  const now = Date.now();
  const due = dealDue(deal, now);
  const left = Math.max(0, deal.until - now);
  // Against the deal's full term, so halving the time left (an ad) moves the bar halfway at once.
  const progress = due ? 1 : Math.min(1, Math.max(0, 1 - left / (plan.hours * 3600 * 1000)));
  // The old bold deal did not say which way it went until it was collected.
  const back = plan.chance !== undefined ? deal.stake * (1 + plan.gain) : deal.payout;

  const collect = () => {
    const gain = actions.invest.collect(plan.id);
    if (gain === null) return;
    playSfx(gain >= 0 ? 'payout' : 'loss');
    haptic('medium');
    // What comes back: the stake and the gain, or what is left of the stake.
    payout({ amount: deal.payout, label: `+${money(deal.payout)}`, count: gain >= 0 ? 16 : 8 });
    onCollected(gain);
  };

  const button = due ? (
    <GameButton onClick={collect} className="w-full min-h-0 py-1 v2-display text-[12px] v2-shadow v2-bob">
      {t('common.collect')}
    </GameButton>
  ) : canRushInvest(state, plan.id, now) ? (
    <AdButton
      small
      placement="invest_rush"
      onReward={() => {
        if (!actions.ads.rushInvest(plan.id)) return;
        playSfx('levelUp');
        haptic('medium');
      }}
    >
      {t('invest.rushShort')}
    </AdButton>
  ) : (
    <span className="flex items-center justify-center rounded-full bg-slate-200 py-1 v2-display text-[12px] text-slate-500">
      {t('invest.runningShort')}
    </span>
  );

  return (
    <TileShell
      plan={plan}
      chip={
        // A dark track, so the white time reads on it (2026-10-22, user: white on white).
        <span className="relative block w-[84px] h-[18px] rounded-full bg-indigo-900/80 border border-white overflow-hidden">
          <span
            className={`block h-full rounded-full bg-gradient-to-r transition-all duration-500 ${due ? 'from-emerald-300 to-green-500' : 'from-amber-300 to-orange-500'}`}
            style={{ width: `${progress * 100}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white v2-shadow tabular-nums">
            {due ? t('invest.dueShort') : duration(Math.ceil(left / 1000))}
          </span>
        </span>
      }
      figure={
        <span className="flex flex-col items-center leading-none">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{t('invest.back')}</span>
          <span className="v2-display v2-outline-thin tabular-nums text-emerald-400 text-[18px] max-w-full truncate">{money(back)}</span>
        </span>
      }
      button={button}
    />
  );
}
