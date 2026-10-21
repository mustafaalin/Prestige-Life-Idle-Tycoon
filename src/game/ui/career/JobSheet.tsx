import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { YEARLY_RAISE } from '../../core/config/careers';
import { careersAfter, globalMultiplier, jobView, monthsToNextRaise, salaryOf } from '../../core/formulas';
import { isMastered, masteryOf } from '../../core/requirements';
import type { CareerDef, GameStateV2 } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import type { FocusTarget } from '../home/focus';
import { GameButton, GlossyBar } from '../kit';
import { portalRoot } from '../stage';
import { JobIcon } from './JobIcon';
import { RequirementList } from './Requirements';

// A job's card (docs/career-redesign.md §4): what it pays, how long mastery takes, what it still
// needs (each with "Go") and which jobs it opens. Opens from a box in the job tree.

export function JobSheet({
  career,
  state,
  onClose,
  onTake,
  onGoTo,
}: {
  career: CareerDef;
  state: GameStateV2;
  onClose: () => void;
  onTake: (career: CareerDef) => void;
  onGoTo: (target: FocusTarget) => void;
}) {
  const { t, name, perMonth } = useT();
  useBackButton(true, 70, onClose);

  const view = jobView(state, career);
  const hidden = view === 'hidden';
  const multiplier = globalMultiplier(state);
  const atMastery = career.salaryPerSecond * (1 + YEARLY_RAISE) ** Math.floor(career.masteryMonths / 12);
  const mastery = masteryOf(state, career.id);
  const raiseIn = view === 'held' ? monthsToNextRaise(state) : null;
  const leadsTo = careersAfter(career.id);

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-end" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-h-[85%] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl px-5 pb-5 pt-3"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="-mr-2 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 -mt-4">
          <JobIcon career={career} size={84} hidden={hidden} mastery={view === 'held' || view === 'done' ? mastery : undefined} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t(`career.tracks.${career.track}` as MessageKey)} · {t('career.level', { level: career.level })}
            </p>
            <h3 className="v2-display text-[21px] leading-tight text-indigo-950">{hidden ? '???' : name('career', career)}</h3>
            {view === 'held' ? (
              <p className="text-[13px] font-black text-emerald-600">
                {t('career.salary', { amount: perMonth(salaryOf(state, career) * multiplier) })}
              </p>
            ) : view === 'next' || hidden ? (
              <p className="text-[13px] font-black text-slate-400">{t('career.salary', { amount: t('career.hiddenSalary') })}</p>
            ) : (
              <p className="text-[12px] font-black text-emerald-600">
                {t('career.payRange', { start: perMonth(career.salaryPerSecond * multiplier), end: perMonth(atMastery * multiplier) })}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {view === 'held' ? (
            <>
              <GlossyBar
                progress={mastery}
                fill={mastery >= 1 ? 'from-emerald-400 to-green-500' : 'from-amber-300 to-orange-500'}
                label={isMastered(state, career.id) ? t('career.mastered') : t('career.mastery', { percent: Math.floor(mastery * 100) })}
              />
              {raiseIn !== null && (
                <p className="text-[12px] font-bold text-slate-500">
                  {t('career.nextRaise', { count: raiseIn, percent: Math.round(YEARLY_RAISE * 100) })}
                </p>
              )}
              {!isMastered(state, career.id) && <p className="text-[12px] font-bold text-slate-500">{t('career.masterFirst')}</p>}
            </>
          ) : (
            !hidden && <p className="text-[12px] font-bold text-slate-500">{t('career.masteryTime', { count: career.masteryMonths })}</p>
          )}
        </div>

        {(view === 'open' || view === 'next' || hidden) && (
          <div className="mt-3">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('career.needs')}</p>
            <RequirementList
              state={state}
              requirements={career.requires}
              onGo={(target) => {
                onClose();
                onGoTo(target);
              }}
            />
          </div>
        )}

        {leadsTo.length > 0 && !hidden && (
          <p className="mt-3 text-[12px] font-bold text-violet-600">
            {t('career.leadsTo', {
              jobs: leadsTo.map((next) => (jobView(state, next) === 'hidden' ? '???' : name('career', next))).join(', '),
            })}
          </p>
        )}

        {view === 'open' && (
          <GameButton
            onClick={() => {
              onTake(career);
              onClose();
            }}
            className="mt-4 w-full py-3"
          >
            <span className="v2-display text-[17px] v2-shadow">{t('career.take')}</span>
          </GameButton>
        )}
      </section>
    </div>,
    portalRoot(),
  );
}
