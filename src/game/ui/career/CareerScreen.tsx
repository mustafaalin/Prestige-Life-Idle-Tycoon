import { Briefcase, Check, Lock } from 'lucide-react';
import { CAREERS } from '../../core/config/careers';
import { autoIncomePerSecond, careerBonus, globalMultiplier, salaryPerSecond } from '../../core/formulas';
import { nextCareer, promote } from '../../core/state';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { Chip, GameButton, ImageTile, Panel, SectionLabel } from '../kit';

const percent = (fraction: number) => Math.round(fraction * 100);

/** Current job, the next promotion as the one big call to action, and the whole ladder for ambition. */
export function CareerScreen() {
  const { game, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();

  const current = game.careerIndex >= 0 ? CAREERS[game.careerIndex] : null;
  const next = nextCareer(game);
  const promoted = next ? promote({ ...game, cash: Number.POSITIVE_INFINITY }) : null;
  const incomeGain = promoted ? autoIncomePerSecond(promoted) - autoIncomePerSecond(game) : 0;
  const income = autoIncomePerSecond(game);
  const canPromote = next !== null && game.cash >= next.cost;
  const secondsToAfford = next && !canPromote && income > 0 ? (next.cost - game.cash) / income : null;

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{t('career.current')}</SectionLabel>
      <Panel className="p-3 flex items-center gap-3">
        <ImageTile>
          {current ? (
            <img src={current.image} alt="" className="w-14 h-14 object-contain" draggable={false} />
          ) : (
            <Briefcase className="w-7 h-7 text-indigo-300" />
          )}
        </ImageTile>
        <div className="flex-1 min-w-0">
          <p className="v2-display text-[17px] leading-tight text-indigo-950 truncate">
            {current ? name('career', current) : t('career.unemployed')}
          </p>
          <p className="text-[12px] font-bold text-emerald-600">
            {current
              ? t('career.salary', { amount: perMonth(salaryPerSecond(game) * globalMultiplier(game)) })
              : t('career.unemployedBody')}
          </p>
          {current && (
            <p className="text-[11px] font-bold text-violet-600">
              {t('career.totalBonus', { percent: percent(careerBonus(game)) })}
            </p>
          )}
        </div>
      </Panel>

      {next ? (
        <Panel accent className="overflow-hidden">
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-300 to-orange-500">
            <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">
              {current ? t('career.next') : t('career.firstJobLabel')}
            </p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <ImageTile className="w-20 h-20">
                <img src={next.image} alt="" className="w-[72px] h-[72px] object-contain" draggable={false} />
              </ImageTile>
              <div className="flex-1 min-w-0">
                <p className="v2-display text-xl leading-tight text-indigo-950">{name('career', next)}</p>
                <p className="v2-display text-lg text-emerald-500 tabular-nums">
                  {t('career.gain', { amount: perMonth(incomeGain) })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/70">
                  {t('career.salaryLabel')}
                </p>
                <p className="v2-display text-[15px] text-emerald-700 tabular-nums">
                  {perMonth(next.salaryPerSecond * globalMultiplier(promoted ?? game))}
                </p>
              </div>
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-700/70">
                  {t('career.bonusLabel')}
                </p>
                <p className="v2-display text-[15px] text-violet-700">
                  {t('career.bonusShort', { percent: percent(next.incomeBonus) })}
                </p>
              </div>
            </div>

            <GameButton
              onClick={actions.promote}
              disabled={!canPromote}
              className="py-3 px-4 flex items-center justify-between"
            >
              <span className="v2-display text-[16px] v2-shadow">
                {current ? t('career.promote') : t('career.firstJob')}
              </span>
              <span className="v2-display text-[16px] v2-shadow tabular-nums">{money(next.cost)}</span>
            </GameButton>
            {secondsToAfford !== null && (
              <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">
                {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
              </p>
            )}
          </div>
        </Panel>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('career.top')}</p>
        </Panel>
      )}

      <SectionLabel>{t('career.ladder')}</SectionLabel>
      <Panel className="overflow-hidden">
        <ol className="divide-y divide-indigo-50">
          {CAREERS.map((career, index) => {
            const done = index < game.careerIndex;
            const isCurrent = index === game.careerIndex;
            const isNext = index === game.careerIndex + 1;
            return (
              <li key={career.id} className={`flex items-center gap-3 px-3 py-2 ${isCurrent ? 'bg-amber-50' : ''}`}>
                <span
                  className={`shrink-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center v2-display text-[12px] ${
                    done || isCurrent
                      ? 'bg-gradient-to-b from-violet-400 to-indigo-600 text-white v2-glossy'
                      : isNext
                        ? 'bg-gradient-to-b from-emerald-300 to-green-500 text-white v2-glossy'
                        : 'bg-indigo-50 text-indigo-300'
                  }`}
                >
                  {done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : isNext || isCurrent ? (
                    index + 1
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </span>
                <span
                  className={`flex-1 min-w-0 truncate text-[13px] ${
                    isCurrent
                      ? 'v2-display text-indigo-950'
                      : done
                        ? 'font-bold text-slate-400'
                        : 'font-bold text-slate-700'
                  }`}
                >
                  {name('career', career)}
                </span>
                {isCurrent && <Chip tone="gold">{t('career.current')}</Chip>}
                <span className="shrink-0 text-[11px] font-black text-violet-500 tabular-nums">
                  {t('career.bonusShort', { percent: percent(career.incomeBonus) })}
                </span>
                <span
                  className={`shrink-0 w-16 text-right text-[11px] font-black tabular-nums ${
                    done || isCurrent ? 'text-slate-300' : 'text-indigo-900/70'
                  }`}
                >
                  {money(career.cost)}
                </span>
              </li>
            );
          })}
        </ol>
      </Panel>
    </section>
  );
}
