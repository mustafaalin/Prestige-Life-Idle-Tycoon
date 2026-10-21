import { Clock, Flame, Scale, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { INVEST_PLANS, investPlan, type InvestPlan, type InvestPlanId } from '../../core/config/investments';
import { useT } from '../../i18n/useT';
import { haptic, playSfx, useMusic } from '../../runtime/feedback';
import { investAvailable, investCap, investmentDue, type Investment } from '../../runtime/investment';
import { useGameV2 } from '../../runtime/useGameV2';
import { canRushInvest } from '../../runtime/adRewards';
import { ActionAd } from '../ads/AdOffers';
import { useAdChipText } from '../ads/useAdText';
import { AdStrip } from '../ads/AdButton';
import { payout } from '../home/coins';
import { Chip, GameButton, GlossyBar, Panel, SectionLabel } from '../kit';

// Old Ray's deals (runtime/investment.ts, game-design-v2.md §4.14): Ray says one line, then either the
// running deal (time left, what comes back, "Collect" when it is due) or a new one: how much to put
// in, and the three deals with what each would bring back for that amount.

const PORTRAIT = (face: 'warm' | 'laugh' | 'concerned') => `/assets/story/portraits/riza-${face}.webp`;

const SHARES = [0.25, 0.5, 1] as const;
type Share = (typeof SHARES)[number];

const PLAN_LOOK: Record<InvestPlanId, { icon: LucideIcon; tile: string; tone: 'buy' | 'manager' | 'gold' }> = {
  safe: { icon: ShieldCheck, tile: 'from-emerald-300 to-green-500', tone: 'buy' },
  balanced: { icon: Scale, tile: 'from-sky-300 to-blue-500', tone: 'manager' },
  bold: { icon: Flame, tile: 'from-amber-300 to-orange-500', tone: 'gold' },
};

const percent = (fraction: number) => Math.round(Math.abs(fraction) * 100);

export function InvestScreen() {
  useMusic('calm');
  const { state, actions } = useGameV2();
  const { t } = useT();
  const adText = useAdChipText();
  // What the last collected deal did, until a new one goes in.
  const [result, setResult] = useState<number | null>(null);
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
          className="shrink-0 w-16 h-16 rounded-full object-cover border-[3px] border-white shadow-md bg-amber-100"
        />
        <div className="flex-1 min-w-0">
          <p className="v2-display text-[13px] text-violet-700">{t('ceremony.cast.riza')}</p>
          <p className="text-[13px] font-bold leading-snug text-slate-700">{line.text}</p>
        </div>
      </Panel>

      {result !== null && <ResultBanner gain={result} />}

      {active ? (
        <>
          <ActiveDeal deal={active} due={due} onCollected={setResult} />
          {!due && canRushInvest(state, Date.now()) && (
            <AdStrip>
              <ActionAd placement="invest_rush" label={adText('ads.investRush')} run={actions.ads.rushInvest} />
            </AdStrip>
          )}
        </>
      ) : (
        <NewDeal onStarted={() => setResult(null)} />
      )}

      <p className="text-[11px] font-semibold text-slate-500 text-center px-4">{t('invest.oneAtATime')}</p>
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

function ActiveDeal({ deal, due, onCollected }: { deal: Investment; due: boolean; onCollected: (gain: number) => void }) {
  const { actions } = useGameV2();
  const { t, money, duration } = useT();
  const plan = investPlan(deal.planId)!;
  const look = PLAN_LOOK[plan.id];
  const total = deal.until - deal.startedAt;
  const left = Math.max(0, deal.until - Date.now());

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
  const expect =
    plan.chance === undefined
      ? t('invest.expect', { amount: money(deal.payout) })
      : t('invest.expectBold', {
          win: money(deal.stake * (1 + plan.gain)),
          loss: money(deal.stake * (1 + (plan.loss ?? 0))),
        });

  return (
    <Panel accent className="overflow-hidden">
      <div className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r ${look.tile}`}>
        <look.icon className="w-4 h-4 text-white" strokeWidth={3} />
        <p className="flex-1 v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">
          {t('invest.running')} · {t(`invest.plans.${plan.id}.name`)}
        </p>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <p className="text-[13px] font-bold text-slate-600">{t('invest.putIn', { amount: money(deal.stake) })}</p>
        <GlossyBar
          progress={total > 0 ? 1 - left / total : 1}
          fill={due ? 'from-emerald-300 to-green-500' : 'from-amber-300 to-orange-500'}
          label={due ? t('invest.due') : t('invest.left', { duration: duration(Math.ceil(left / 1000)) })}
        />
        <p className="v2-display text-[16px] text-emerald-600 tabular-nums">{expect}</p>
        <GameButton
          onClick={collect}
          disabled={!due}
          className={`w-full py-3 v2-display text-[17px] v2-shadow ${due ? 'v2-bob' : ''}`}
        >
          {t('common.collect')}
        </GameButton>
      </div>
    </Panel>
  );
}

function NewDeal({ onStarted }: { onStarted: () => void }) {
  const { game, actions } = useGameV2();
  const { t, money } = useT();
  const [share, setShare] = useState<Share>(1);
  const available = investAvailable(game);
  const stake = available * share;

  const start = (plan: InvestPlan) => {
    if (!actions.invest.start(plan.id, stake)) return;
    playSfx('purchase');
    haptic('medium');
    onStarted();
  };

  return (
    <>
      <SectionLabel>{t('invest.amount')}</SectionLabel>
      <Panel className="p-3 flex flex-col gap-2.5">
        <div className="v2-segmented flex gap-1 rounded-2xl bg-indigo-50 border-2 border-white p-1 shadow-sm">
          {SHARES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                playSfx('click');
                setShare(value);
              }}
              className={`relative v2-hit flex-1 min-h-9 rounded-xl px-2.5 py-1.5 v2-display text-[14px] transition-all active:scale-95 ${
                value === share ? 'bg-gradient-to-b from-amber-300 to-orange-500 text-white v2-shadow v2-glossy' : 'text-indigo-900/60'
              }`}
            >
              {value === 1 ? t('invest.all') : t('dreams.percent', { percent: value * 100 })}
            </button>
          ))}
        </div>
        {available > 0 ? (
          <p className="v2-display text-[22px] text-center text-emerald-500 v2-outline-thin tabular-nums">
            {t('invest.stake', { amount: money(stake) })}
          </p>
        ) : (
          <p className="text-[13px] font-bold text-center text-slate-500">{t('invest.noCash')}</p>
        )}
        <p className="text-[11px] font-semibold text-center text-slate-500">
          {t('invest.cap', { amount: money(investCap(game)) })}
        </p>
      </Panel>

      {INVEST_PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} stake={stake} onStart={() => start(plan)} />
      ))}
    </>
  );
}

function PlanCard({ plan, stake, onStart }: { plan: InvestPlan; stake: number; onStart: () => void }) {
  const { t, money, duration } = useT();
  const look = PLAN_LOOK[plan.id];
  return (
    <Panel className="p-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <span
          className={`shrink-0 w-12 h-12 rounded-2xl border-2 border-white v2-glossy bg-gradient-to-b ${look.tile} flex items-center justify-center`}
        >
          <look.icon className="w-6 h-6 text-white drop-shadow" strokeWidth={2.5} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="v2-display text-[17px] leading-tight text-indigo-950">{t(`invest.plans.${plan.id}.name`)}</p>
            <Chip tone="soft">
              <Clock className="w-3 h-3" strokeWidth={3} />
              {duration(plan.hours * 3600)}
            </Chip>
          </div>
          <p className="text-[11px] font-semibold text-slate-500 leading-snug">{t(`invest.plans.${plan.id}.body`)}</p>
        </div>
      </div>
      {plan.chance === undefined ? (
        <p className="v2-display text-[15px] text-emerald-600 tabular-nums">
          {t('invest.gain', { percent: percent(plan.gain), amount: money(stake * plan.gain) })}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          <p className="v2-display text-[14px] text-emerald-600 tabular-nums">
            {t('invest.boldWin', { chance: percent(plan.chance), percent: percent(plan.gain), amount: money(stake * plan.gain) })}
          </p>
          <p className="v2-display text-[14px] text-rose-500 tabular-nums">
            {t('invest.boldLoss', {
              chance: percent(1 - plan.chance),
              percent: percent(plan.loss ?? 0),
              amount: money(stake * -(plan.loss ?? 0)),
            })}
          </p>
        </div>
      )}
      <GameButton tone={look.tone} onClick={onStart} disabled={stake <= 0} className="w-full py-2.5 v2-display text-[16px] v2-shadow">
        {t('invest.put')}
      </GameButton>
    </Panel>
  );
}
