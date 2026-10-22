import { Clock, X } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { INVEST_CAP_MONTHS, INVEST_PLANS, investPlan, type InvestPlan } from '../../core/config/investments';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx, useMusic } from '../../runtime/feedback';
import { investAvailable, investCap, investmentDue, type Investment } from '../../runtime/investment';
import { useGameV2 } from '../../runtime/useGameV2';
import { adsLeft, canRushInvest, canWatch } from '../../runtime/adRewards';
import { ActionAd } from '../ads/AdOffers';
import { useAdChipText } from '../ads/useAdText';
import { AdButton, AdStrip } from '../ads/AdButton';
import { CashAmount, MoneyIcon } from '../CashAmount';
import { payout } from '../home/coins';
import { GameButton, Panel, SectionLabel, Segmented } from '../kit';
import { portalRoot } from '../stage';

// Old Ray's deals (runtime/investment.ts, game-design-v2.md §4.14), redrawn after Idle Guy's bank
// (2026-10-22, user: "a game, not an accounting app"): Ray says one line, the running deal shows its
// money and a bar, and the deals sit side by side as small tiles, a money picture and a big "+%". A tap
// on a tile opens the amount card; the special deal opens with an ad. One deal at a time.

const PORTRAIT = (face: 'warm' | 'laugh' | 'concerned') => `/assets/story/portraits/riza-${face}.webp`;

const SHARES = [0.25, 0.5, 1] as const;
type Share = (typeof SHARES)[number];

/** Each deal's colours: the tile's top band and its button. */
const PLAN_LOOK: Record<InvestPlan['id'], { band: string; tone: 'buy' | 'manager' | 'gold' }> = {
  quick: { band: 'from-sky-400 to-blue-500', tone: 'manager' },
  safe: { band: 'from-emerald-400 to-green-600', tone: 'buy' },
  balanced: { band: 'from-violet-400 to-indigo-600', tone: 'manager' },
  bold: { band: 'from-amber-400 to-orange-600', tone: 'gold' },
  special: { band: 'from-rose-400 to-pink-600', tone: 'gold' },
};

const percent = (fraction: number) => Math.round(Math.abs(fraction) * 100);
const planName = (plan: InvestPlan) => `invest.plans.${plan.id}.name` as MessageKey;

export function InvestScreen() {
  useMusic('calm');
  const { state, actions } = useGameV2();
  const { t } = useT();
  const adText = useAdChipText();
  // What the last collected deal did, until a new one goes in.
  const [result, setResult] = useState<number | null>(null);
  const [picked, setPicked] = useState<InvestPlan | null>(null);
  const active = state.invest.active;
  const due = investmentDue(state.invest, Date.now());

  const line =
    result !== null
      ? { face: result >= 0 ? 'laugh' : 'concerned', text: t(result >= 0 ? 'invest.rizaWon' : 'invest.rizaLost') }
      : active
        ? { face: 'warm', text: t(due ? 'invest.rizaDue' : 'invest.rizaRunning') }
        : { face: 'warm', text: t('invest.rizaIdle') };

  return (
    <section className="flex flex-col gap-3">
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

      {active && (
        <>
          <ActiveDeal deal={active} due={due} onCollected={setResult} />
          {!due && canRushInvest(state, Date.now()) && (
            <AdStrip>
              <ActionAd placement="invest_rush" label={adText('ads.investRush')} run={actions.ads.rushInvest} />
            </AdStrip>
          )}
        </>
      )}

      <SectionLabel>{t('invest.deals')}</SectionLabel>
      <div className="flex flex-wrap justify-center gap-2">
        {INVEST_PLANS.map((plan) => (
          <PlanTile key={plan.id} plan={plan} busy={active !== null} onPick={() => setPicked(plan)} />
        ))}
      </div>

      <p className="text-[11px] font-semibold text-slate-500 text-center px-4">{t('invest.oneAtATime')}</p>

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

function PlanTile({ plan, busy, onPick }: { plan: InvestPlan; busy: boolean; onPick: () => void }) {
  const { game, state } = useGameV2();
  const { t, duration } = useT();
  const look = PLAN_LOOK[plan.id];
  const now = Date.now();
  const adOpen = !plan.ad || canWatch(state.ads, 'invest_special', now);
  const ready = !busy && adOpen && investAvailable(game) > 0;
  const pick = () => {
    if (!ready) return;
    playSfx('click');
    haptic('light');
    onPick();
  };
  return (
    <button
      type="button"
      onClick={pick}
      disabled={!ready}
      className={`relative w-[calc(33.333%-6px)] min-w-[100px] overflow-hidden rounded-[18px] border-2 border-white bg-gradient-to-b from-white to-indigo-50 shadow-[0_3px_0_rgba(90,70,160,0.18),0_6px_14px_rgba(56,42,106,0.08)] flex flex-col items-center pb-2 transition-all active:scale-95 ${
        ready ? '' : 'opacity-60'
      }`}
    >
      <span className={`w-full bg-gradient-to-r ${look.band} px-1 py-1 v2-display text-[12px] text-white v2-shadow truncate`}>
        {t(planName(plan))}
      </span>
      <span className="mt-1 flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-px text-[10px] font-black text-indigo-700 tabular-nums">
        <Clock className="w-3 h-3" strokeWidth={3} />
        {duration(plan.hours * 3600)}
      </span>
      <MoneyIcon tier={plan.moneyTier} size={50} />
      <PlanGain plan={plan} />
      <span className="h-1.5 shrink-0" aria-hidden />
      <span
        className={`mt-auto mx-1.5 self-stretch flex items-center justify-center gap-1 rounded-full border-2 border-white/70 bg-gradient-to-b v2-glossy py-1 v2-display text-[12px] text-white v2-shadow ${
          plan.ad ? 'from-orange-400 to-orange-600' : 'from-emerald-400 to-green-600'
        }`}
      >
        {plan.ad && <img src="/assets/icons/v2/ad-reward.webp" alt="" draggable={false} className="w-4 h-4 object-contain" />}
        {plan.ad ? t('invest.open') : t('invest.put')}
      </span>
      {plan.ad && (
        <span className="absolute top-7 right-1 rounded-full bg-rose-500 px-1.5 text-[9px] font-black text-white tabular-nums">
          {t('invest.adLeft', { count: adsLeft(state.ads, 'invest_special', now) })}
        </span>
      )}
    </button>
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

function ActiveDeal({ deal, due, onCollected }: { deal: Investment; due: boolean; onCollected: (gain: number) => void }) {
  const { actions } = useGameV2();
  const { t, money, duration } = useT();
  const plan = investPlan(deal.planId);
  const left = Math.max(0, deal.until - Date.now());
  // Against the deal's full term, so halving the time left (an ad) moves the bar halfway at once.
  const term = (plan?.hours ?? 1) * 3600 * 1000;
  const progress = due ? 1 : Math.min(1, Math.max(0, 1 - left / term));

  const collect = () => {
    const gain = actions.invest.collect();
    if (gain === null) return;
    playSfx(gain >= 0 ? 'payout' : 'loss');
    haptic('medium');
    // What comes back: the stake and the gain, or what is left of the stake.
    payout({ amount: deal.payout, label: `+${money(deal.payout)}`, count: gain >= 0 ? 16 : 8 });
    onCollected(gain);
  };

  // The bold deal does not say which way it went until it is collected.
  const bold = plan?.chance !== undefined;
  const back = bold ? deal.stake * (1 + (plan?.gain ?? 0)) : deal.payout;

  return (
    <Panel accent className="overflow-hidden">
      <div className={`flex items-center justify-center px-4 py-1.5 bg-gradient-to-r ${plan ? PLAN_LOOK[plan.id].band : 'from-emerald-400 to-green-600'}`}>
        <p className="v2-display text-[14px] text-white v2-shadow">
          {t('invest.running')}
          {plan ? ` · ${t(planName(plan))}` : ''}
        </p>
      </div>
      <div className="p-3.5 flex flex-col items-center gap-2.5">
        <div className="flex items-center gap-3">
          <MoneyIcon tier={plan?.moneyTier ?? 3} size={64} />
          <div className="flex flex-col items-start">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('invest.back')}</p>
            <p className="v2-display v2-outline text-[30px] leading-tight text-emerald-400 tabular-nums">{money(back)}</p>
            {bold && (
              <p className="text-[11px] font-black text-rose-500 tabular-nums">
                {t('invest.orBack', { amount: money(deal.stake * (1 + (plan?.loss ?? 0))) })}
              </p>
            )}
            <p className="text-[11px] font-bold text-slate-500 tabular-nums">{t('invest.putIn', { amount: money(deal.stake) })}</p>
          </div>
        </div>
        {/* A dark track, so the white time reads on it (2026-10-22, user: white on white). */}
        <div className="relative w-full h-7 rounded-full bg-indigo-900/80 border-2 border-white shadow-inner overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${due ? 'from-emerald-300 to-green-500' : 'from-amber-300 to-orange-500'}`}
            style={{ width: `${progress * 100}%` }}
          />
          <div className="absolute inset-x-1 top-0.5 h-2 rounded-full bg-white/20" />
          <span className="absolute inset-0 flex items-center justify-center v2-display text-[13px] text-white v2-shadow tabular-nums">
            {due ? t('invest.due') : t('invest.left', { duration: duration(Math.ceil(left / 1000)) })}
          </span>
        </div>
        <GameButton onClick={collect} disabled={!due} className={`w-full py-3 v2-display text-[17px] v2-shadow ${due ? 'v2-bob' : ''}`}>
          {t('common.collect')}
        </GameButton>
      </div>
    </Panel>
  );
}
