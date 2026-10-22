import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { incomeBreakdown } from '../../core/formulas';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { boostFactor } from '../../runtime/adRewards';
import { useBackButton } from '../../runtime/backButton';
import { useGameV2 } from '../../runtime/useGameV2';
import { SectionLabel } from '../kit';
import { Cash } from '../CashAmount';

// Income breakdown (phone test, 2026-10-15): a tap on the top bar's income shows where the monthly
// income comes from (businesses with managers, salary, rent) and every bonus on it, so the scarf's and
// the collar's share is visible somewhere. Lines that are zero stay hidden.

const percent = (fraction: number) => Math.round(fraction * 100);

export function IncomeSheet({ onClose }: { onClose: () => void }) {
  const { game, state } = useGameV2();
  const { t, perMonth } = useT();
  const parts = incomeBreakdown(game);
  const boost = boostFactor(state.ads, Date.now());

  useBackButton(true, 60, onClose);

  const sources: [MessageKey, number][] = [
    ['income.businesses', parts.businesses],
    ['income.salary', parts.salary],
    ['income.rent', parts.rent],
  ];
  const total = sources.reduce((sum, [, amount]) => sum + amount, 0);
  const bonuses: [MessageKey, number][] = [
    ['income.home', parts.home],
    ['income.collar', parts.collar],
    ['income.items', parts.items],
    ['income.legacy', parts.legacy],
    ['income.scarf', parts.accessory],
  ];
  const shownBonuses = bonuses.filter(([, bonus]) => percent(bonus) > 0);

  return (
    <div className="fixed inset-0 z-[60] bg-black/35 flex items-end" onClick={onClose}>
      <div
        className="v2-sheet-in w-full rounded-t-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 shadow-2xl pb-[calc(var(--safe-bottom)+20px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-t-[28px] bg-gradient-to-r from-violet-500 to-indigo-500">
          <h2 className="flex-1 v2-display v2-outline-thin text-xl text-white">{t('income.title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="relative v2-hit p-1.5 rounded-full bg-white/20 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-3">
          <div className="rounded-2xl bg-white shadow px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-600">{t('income.total')}</span>
            <span className="v2-display text-2xl text-emerald-500 tabular-nums">
              <Cash size={28}>+{perMonth(total * boost)}</Cash>
              {boost > 1 && <span className="text-amber-500"> ×{boost}</span>}
            </span>
          </div>

          {total > 0 ? (
            <>
              <SectionLabel>{t('income.sources')}</SectionLabel>
              <Rows>
                {sources
                  .filter(([, amount]) => amount > 0)
                  .map(([key, amount]) => (
                    <Row key={key} label={t(key)} value={`+${perMonth(amount * boost)}`} />
                  ))}
              </Rows>
            </>
          ) : (
            <p className="text-[11px] font-semibold text-slate-500 px-1">{t('income.empty')}</p>
          )}

          {(shownBonuses.length > 0 || boost > 1) && (
            <>
              <SectionLabel>{t('income.bonuses')}</SectionLabel>
              <Rows>
                {shownBonuses.map(([key, bonus]) => (
                  <Row key={key} label={t(key)} value={t('income.percent', { percent: percent(bonus) })} />
                ))}
                {boost > 1 && <Row label={t('income.boost')} value={`×${boost}`} accent />}
              </Rows>
            </>
          )}

          {parts.unmanaged && <p className="text-[11px] font-semibold text-slate-500 px-1">{t('income.unmanaged')}</p>}
        </div>
      </div>
    </div>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <ul className="rounded-2xl bg-white shadow divide-y divide-slate-100">{children}</ul>;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-2.5">
      <span className="text-sm font-bold text-slate-600 min-w-0">{label}</span>
      <span className={`text-sm font-black tabular-nums ${accent ? 'text-amber-500' : 'text-emerald-500'}`}>{value}</span>
    </li>
  );
}
