import { Briefcase, ChevronDown, ChevronUp, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { CAREER_TRACKS, CAREERS } from '../../core/config/careers';
import { courseDef } from '../../core/config/courses';
import { SECONDS_PER_MONTH } from '../../core/config/life';
import {
  availableCourses,
  betterOpenCareers,
  careersNeedingCourse,
  canLeaveCareer,
  courseProgress,
  currentCareer,
  currentSalary,
  globalMultiplier,
  hasWorked,
} from '../../core/formulas';
import { allMet, isMastered, masteryOf, unmet } from '../../core/requirements';
import type { CareerDef, GameStateV2, Requirement } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { COURSE_RUSH_PER_COURSE, EXPERIENCE_RUSH_MONTHS } from '../../core/config/ads';
import {
  adGift,
  canFirstSalary,
  canRushCourse,
  canRushExperience,
  canWatch,
  courseRushSeconds,
  firstSalaryBonus,
  marked,
} from '../../runtime/adRewards';
import { ActionAd, PayAd } from '../ads/AdOffers';
import { HelpAd } from '../ads/AdButton';
import { useAdText } from '../ads/useAdText';
import type { FocusTarget } from '../home/focus';
import { Focusable } from '../home/Focusable';
import { Chip, GameButton, ImageTile, Panel, SectionLabel } from '../kit';
import { RequirementList } from './Requirements';

// The job board (docs/game-design-v2.md §4.4): the job held, the course running, the better jobs that
// are open now, the ones to aim for with what they still need, courses, and every job by field.

/** Jobs to aim for at most, so the board stays short. */
const GOAL_JOBS = 6;

/**
 * A job worth aiming for: everything it still needs can be worked on now (a course whose own
 * prerequisites are done, an item, a home, the mastery of the job held). Jobs behind a job never
 * held stay out of the list until that job is taken.
 */
function isReachable(state: GameStateV2, career: CareerDef) {
  const reachable = (requirement: Requirement): boolean => {
    switch (requirement.type) {
      case 'mastered':
        return state.careerId === requirement.careerId || isMastered(state, requirement.careerId);
      case 'anyOf':
        return requirement.options.some(reachable);
      case 'course':
        return allMet(state, courseDef(requirement.courseId)?.requires ?? []);
      default:
        return true;
    }
  };
  return !hasWorked(state, career.id) && unmet(state, career.requires).every(reachable);
}

export function CareerScreen({ onGoTo }: { onGoTo: (target: FocusTarget) => void }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, perMonth } = useT();
  const adText = useAdText();
  const [showAll, setShowAll] = useState(false);
  const now = Date.now();

  const current = currentCareer(game);
  const multiplier = globalMultiplier(game);
  const salary = (career: CareerDef) => perMonth(career.salaryPerSecond * multiplier);
  const open = betterOpenCareers(game).sort((a, b) => b.salaryPerSecond - a.salaryPerSecond);
  const paid = currentSalary(game);
  const goals = CAREERS.filter((career) => career.salaryPerSecond > paid && !open.includes(career) && isReachable(game, career))
    .sort((a, b) => a.salaryPerSecond - b.salaryPerSecond)
    .slice(0, GOAL_JOBS);

  const running = game.course ? courseDef(game.course.id) : undefined;
  const monthsLeft = running ? Math.max(1, Math.ceil(running.months - (game.course?.seconds ?? 0) / SECONDS_PER_MONTH)) : 0;
  const courses = availableCourses(game);
  const done = game.coursesDone.map((id) => courseDef(id)).filter((course) => course !== undefined);
  // The newest finished course whose diploma gift was not taken yet (an ad, once per course).
  const diploma = [...done].reverse().find((course) => marked(state.ads, `diploma_gift:${course.id}`) === 0);
  const rushMonths = Math.max(1, Math.round(courseRushSeconds(game) / SECONDS_PER_MONTH));

  const take = (career: CareerDef) => {
    if (!actions.takeCareer(career.id)) return;
    playSfx('levelUp');
    haptic('medium');
  };
  const start = (courseId: string) => {
    if (!actions.startCourse(courseId)) return;
    playSfx('purchase');
    haptic('medium');
  };

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
          <p className="v2-display text-[17px] leading-tight text-indigo-950">
            {current ? name('career', current) : t('career.unemployed')}
          </p>
          <p className="text-[12px] font-bold text-emerald-600">
            {current ? t('career.salary', { amount: perMonth(paid * multiplier) }) : t('career.unemployedBody')}
          </p>
          {current && (
            <p className="text-[11px] font-bold text-violet-600">
              {isMastered(game, current.id)
                ? t('career.mastered')
                : t('career.mastery', { percent: Math.floor(masteryOf(game, current.id) * 100) })}
            </p>
          )}
        </div>
      </Panel>
      {current && canFirstSalary(state, now) && (
        <PayAd
          placement="first_salary"
          label={adText('ads.firstSalary', { amount: money(firstSalaryBonus(current)) })}
          run={actions.ads.firstSalary}
        />
      )}
      {current && canRushExperience(state, now) && (
        <ActionAd
          placement="experience_rush"
          label={adText('ads.experienceRush', { count: EXPERIENCE_RUSH_MONTHS })}
          run={actions.ads.rushExperience}
        />
      )}

      {running && (
        <Panel className="p-3 flex items-center gap-3">
          <ImageTile className="w-12 h-12">
            <GraduationCap className="w-7 h-7 text-violet-500" />
          </ImageTile>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-700/70">{t('career.courseRunning')}</p>
            <p className="v2-display text-[15px] leading-tight text-indigo-950">{name('course', running)}</p>
            <div className="mt-1 h-2 rounded-full bg-violet-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${(courseProgress(game) ?? 0) * 100}%` }}
              />
            </div>
            <p className="mt-0.5 text-[11px] font-bold text-slate-500">{t('career.courseLeft', { count: monthsLeft })}</p>
          </div>
        </Panel>
      )}
      {running && canRushCourse(state, now) && (
        <ActionAd
          placement="course_rush"
          label={`${adText('ads.courseRush', { count: rushMonths })} · ${COURSE_RUSH_PER_COURSE - marked(state.ads, `course_rush:${running.id}`)}/${COURSE_RUSH_PER_COURSE}`}
          run={actions.ads.rushCourse}
        />
      )}
      {diploma && canWatch(state.ads, 'diploma_gift', now) && (
        <PayAd
          placement="diploma_gift"
          label={adText('ads.diploma', { course: name('course', diploma), amount: money(adGift(game)) })}
          run={() => actions.ads.diploma(diploma.id)}
        />
      )}

      <SectionLabel>{t('career.openJobs')}</SectionLabel>
      {open.length === 0 ? (
        <p className="px-1 text-[12px] font-bold text-slate-500">{t(canLeaveCareer(game) ? 'career.noOpen' : 'career.masterFirst')}</p>
      ) : (
        <Panel accent className="overflow-hidden">
          <ul className="divide-y divide-indigo-50">
            {open.map((career) => (
              <li key={career.id} className="p-2.5 flex items-center gap-2.5">
                <ImageTile className="w-12 h-12">
                  <img src={career.image} alt="" className="w-10 h-10 object-contain" draggable={false} />
                </ImageTile>
                <div className="flex-1 min-w-0">
                  <p className="v2-display text-[15px] leading-tight text-indigo-950">{name('career', career)}</p>
                  <p className="text-[12px] font-bold text-emerald-600">{t('career.salary', { amount: salary(career) })}</p>
                </div>
                <Focusable focusKey={`career:take:${career.id}`} className="shrink-0">
                  <GameButton onClick={() => take(career)} className="py-2 px-3">
                    <span className="v2-display text-[13px] v2-shadow">{t('career.take')}</span>
                  </GameButton>
                </Focusable>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {goals.length > 0 && (
        <>
          <SectionLabel>{t('career.goalJobs')}</SectionLabel>
          {goals.map((career) => (
            <Panel key={career.id} className="p-3 flex gap-3">
              <ImageTile className="w-12 h-12">
                <img src={career.image} alt="" className="w-10 h-10 object-contain grayscale opacity-70" draggable={false} />
              </ImageTile>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="v2-display text-[15px] leading-tight text-indigo-950">{name('career', career)}</span>
                  <span className="text-[11px] font-bold text-emerald-600">{salary(career)}</span>
                </p>
                <RequirementList state={game} requirements={career.requires} onGo={onGoTo} />
              </div>
            </Panel>
          ))}
        </>
      )}

      <SectionLabel>{t('career.courses')}</SectionLabel>
      {running && <p className="px-1 -mt-1 text-[11px] font-bold text-slate-500">{t('career.courseBusy')}</p>}
      <Panel className="overflow-hidden">
        <ul className="divide-y divide-indigo-50">
          {courses.map((course) => {
            const opens = careersNeedingCourse(course.id).map((career) => name('career', career));
            return (
              <li key={course.id} className="px-3 py-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 shrink-0 text-violet-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold leading-tight text-indigo-950">
                    {name('course', course)}
                    <span className="ml-1.5 text-[11px] text-slate-400">{t('career.courseMonths', { count: course.months })}</span>
                  </p>
                  {opens.length > 0 && (
                    <p className="text-[11px] font-bold leading-snug text-violet-600">{t('career.opens', { jobs: opens.join(', ') })}</p>
                  )}
                </div>
                <Focusable focusKey={`career:course:${course.id}`} className="shrink-0">
                  <GameButton
                    tone="soft"
                    onClick={() => start(course.id)}
                    disabled={running !== undefined || game.cash < course.cost}
                    className="py-1.5 px-2.5 flex flex-col items-center leading-tight"
                  >
                    <span className="v2-display text-[12px]">{t('career.courseStart')}</span>
                    <span className="v2-display text-[12px] tabular-nums">{money(course.cost)}</span>
                  </GameButton>
                </Focusable>
              </li>
            );
          })}
        </ul>
        {!running && courses[0] && <HelpAd cost={Math.min(...courses.map((course) => course.cost))} className="p-2.5" />}
        {done.length > 0 && (
          <p className="px-3 py-2 text-[11px] font-bold text-emerald-600 border-t border-indigo-50">
            {t('career.coursesDone', { count: done.length })}: {done.map((course) => name('course', course)).join(', ')}
          </p>
        )}
      </Panel>

      <button
        type="button"
        onClick={() => setShowAll((value) => !value)}
        className="flex items-center justify-center gap-1 py-1 text-[12px] font-black text-violet-600"
      >
        {showAll ? t('career.hideJobs') : t('career.allJobs')}
        {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {showAll &&
        CAREER_TRACKS.map((track) => (
          <Panel key={track} className="overflow-hidden">
            <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t(`career.tracks.${track}` as MessageKey)}
            </p>
            <ul className="divide-y divide-indigo-50">
              {CAREERS.filter((career) => career.track === track).map((career) => {
                const held = career.id === game.careerId;
                const worked = hasWorked(game, career.id);
                const locked = !worked && !allMet(game, career.requires);
                return (
                  <li key={career.id} className={`px-3 py-1.5 flex items-center gap-2 ${held ? 'bg-amber-50' : ''}`}>
                    {locked && <Lock className="w-3 h-3 shrink-0 text-indigo-300" />}
                    <span className={`flex-1 min-w-0 text-[12px] font-bold ${worked ? 'text-indigo-950' : 'text-slate-500'}`}>
                      {name('career', career)}
                    </span>
                    {held && <Chip tone="gold">{t('career.current')}</Chip>}
                    <span className="shrink-0 text-[11px] font-black text-emerald-600 tabular-nums">{salary(career)}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
    </section>
  );
}
