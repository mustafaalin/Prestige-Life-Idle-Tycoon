import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { canLeaveCareer, canTakeCareer, careersAfter, currentSalary, globalMultiplier, jobView, paysLess } from '../../core/formulas';
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
  const mastery = masteryOf(state, career.id);
  const canTake = view === 'open' && canTakeCareer(state, career);
  const leadsTo = careersAfter(career.id);

  return createPortal(
    <div className="fixed inset-0 z-[70] bg-black/35 flex items-center justify-center p-5" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-title"
        onClick={(event) => event.stopPropagation()}
        className="v2-pop-in relative w-full max-w-[320px] max-h-full overflow-y-auto rounded-[28px] bg-white border-4 border-white shadow-2xl"
      >
        <div className="relative px-4 pt-4 pb-3 flex flex-col items-center text-center bg-gradient-to-b from-sky-100 to-white rounded-t-[24px]">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="absolute right-1.5 top-1.5 w-10 h-10 rounded-full flex items-center justify-center text-slate-400 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="rounded-full bg-white/90 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-900/50">
            {t(`career.tracks.${career.track}` as MessageKey)} · {t('career.level', { level: career.level })}
          </span>
          <div className="mt-2">
            <JobIcon career={career} size={84} hidden={hidden} mastery={view === 'held' || view === 'done' ? mastery : undefined} />
          </div>
          <h3 id="job-title" className="mt-1.5 v2-display text-[21px] leading-tight text-indigo-950">
            {hidden ? '???' : name('career', career)}
          </h3>
          <p className={`mt-1 rounded-full px-3 py-0.5 text-[12px] font-black ${hidden ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
            {t('career.salary', { amount: hidden ? t('career.hiddenSalary') : perMonth(career.salaryPerSecond * multiplier) })}
          </p>
        </div>

        <div className="px-4 pb-4 flex flex-col gap-3">
          {view === 'held' ? (
            <div className="flex flex-col gap-1.5">
              <GlossyBar
                progress={mastery}
                fill={mastery >= 1 ? 'from-emerald-400 to-green-500' : 'from-amber-300 to-orange-500'}
                label={isMastered(state, career.id) ? t('career.mastered') : t('career.mastery', { percent: Math.floor(mastery * 100) })}
              />
              {!isMastered(state, career.id) && <p className="text-[11px] font-bold text-slate-500 text-center">{t('career.masterFirst')}</p>}
            </div>
          ) : (
            !hidden && <p className="text-[11px] font-bold text-slate-500 text-center">{t('career.masteryTime', { count: career.masteryMonths })}</p>
          )}

          {(view === 'open' || view === 'next' || hidden) && (
            <div className="rounded-2xl bg-indigo-50/70 px-3 py-2.5">
              <p className="mb-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-900/40">{t('career.needs')}</p>
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
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span className="text-[11px] font-bold text-slate-400">{t('career.leadsToLabel')}</span>
              {leadsTo.map((next) => (
                <span key={next.id} className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-black text-violet-600">
                  {name('career', next)}
                </span>
              ))}
            </div>
          )}

          {view === 'open' && !canLeaveCareer(state) && (
            <p className="text-[11px] font-bold text-slate-500 text-center">{t('career.masterFirst')}</p>
          )}
          {canTake && paysLess(state, career) && (
            <p className="rounded-2xl bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-600 text-center">
              {t('career.paysLess', {
                from: perMonth(currentSalary(state) * multiplier),
                to: perMonth(career.salaryPerSecond * multiplier),
              })}
            </p>
          )}
          {view === 'open' && (
            <GameButton
              disabled={!canTake}
              onClick={() => {
                onTake(career);
                onClose();
              }}
              className="w-full py-3"
            >
              <span className="v2-display text-[17px] v2-shadow">{t('career.take')}</span>
            </GameButton>
          )}
        </div>
      </section>
    </div>,
    portalRoot(),
  );
}
