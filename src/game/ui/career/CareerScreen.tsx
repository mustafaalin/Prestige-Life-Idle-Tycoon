import { Briefcase, Check, Lock } from 'lucide-react';
import { CAREERS } from '../../core/config/careers';
import { autoIncomePerSecond, careerBonus, globalMultiplier, salaryPerSecond } from '../../core/formulas';
import { nextCareer, promote } from '../../core/state';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';

const percent = (fraction: number) => Math.round(fraction * 100);

/** Current job, the next promotion as the one big call to action, and the whole ladder for ambition. */
export function CareerScreen() {
  const { game, actions } = useGameV2();
  const { t, name, money, duration } = useT();

  const current = game.careerIndex >= 0 ? CAREERS[game.careerIndex] : null;
  const next = nextCareer(game);
  const promoted = next ? promote({ ...game, cash: Number.POSITIVE_INFINITY }) : null;
  const incomeGain = promoted ? autoIncomePerSecond(promoted) - autoIncomePerSecond(game) : 0;
  const income = autoIncomePerSecond(game);
  const canPromote = next !== null && game.cash >= next.cost;
  const secondsToAfford = next && !canPromote && income > 0 ? (next.cost - game.cash) / income : null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('career.current')}</h2>
      <div className="bg-white rounded-2xl shadow-sm p-3 flex items-center gap-3">
        <div className="shrink-0 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden">
          {current ? (
            <img src={current.image} alt="" className="w-14 h-14 object-contain" draggable={false} />
          ) : (
            <Briefcase className="w-7 h-7 text-slate-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-slate-900 truncate">
            {current ? name('career', current) : t('career.unemployed')}
          </p>
          <p className="text-[11px] font-semibold text-slate-500">
            {current
              ? t('career.salary', { amount: money(salaryPerSecond(game) * globalMultiplier(game)) })
              : t('career.unemployedBody')}
          </p>
          {current && (
            <p className="text-[11px] font-black text-violet-600">
              {t('career.totalBonus', { percent: percent(careerBonus(game)) })}
            </p>
          )}
        </div>
      </div>

      {next ? (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-violet-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-violet-50 flex items-center justify-center overflow-hidden">
              <img src={next.image} alt="" className="w-[72px] h-[72px] object-contain" draggable={false} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{current ? t('career.next') : t('career.firstJobLabel')}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{name('career', next)}</p>
              <p className="text-lg font-black text-emerald-500 tabular-nums">
                {t('career.gain', { amount: money(incomeGain) })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('career.salaryLabel')}</p>
              <p className="text-sm font-black text-slate-900 tabular-nums">
                {t('hud.perSecond', { amount: money(next.salaryPerSecond * globalMultiplier(promoted ?? game)) })}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('career.bonusLabel')}</p>
              <p className="text-sm font-black text-violet-600">{t('career.bonusShort', { percent: percent(next.incomeBonus) })}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={actions.promote}
            disabled={!canPromote}
            className="rounded-2xl py-3.5 px-4 flex items-center justify-between font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{current ? t('career.promote') : t('career.firstJob')}</span>
            <span className="tabular-nums">{money(next.cost)}</span>
          </button>
          {secondsToAfford !== null && (
            <p className="text-[11px] font-semibold text-slate-500 text-center -mt-1">
              {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-amber-200 text-center">
          <p className="text-lg font-black text-slate-900">{t('career.top')}</p>
        </div>
      )}

      <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('career.ladder')}</h2>
      <ol className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
        {CAREERS.map((career, index) => {
          const done = index < game.careerIndex;
          const isCurrent = index === game.careerIndex;
          const isNext = index === game.careerIndex + 1;
          return (
            <li key={career.id} className={`flex items-center gap-3 px-3 py-2 ${isCurrent ? 'bg-violet-50' : ''}`}>
              <span
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  done || isCurrent ? 'bg-violet-500 text-white' : isNext ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : isNext || isCurrent ? index + 1 : <Lock className="w-3 h-3" />}
              </span>
              <span
                className={`flex-1 min-w-0 truncate text-[13px] font-bold ${
                  isCurrent ? 'text-violet-700 font-black' : done ? 'text-slate-500' : 'text-slate-700'
                }`}
              >
                {name('career', career)}
              </span>
              <span className="shrink-0 text-[11px] font-black text-slate-400 tabular-nums">
                {t('career.bonusShort', { percent: percent(career.incomeBonus) })}
              </span>
              <span className={`shrink-0 w-16 text-right text-[11px] font-black tabular-nums ${done || isCurrent ? 'text-slate-300' : 'text-slate-600'}`}>
                {money(career.cost)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
