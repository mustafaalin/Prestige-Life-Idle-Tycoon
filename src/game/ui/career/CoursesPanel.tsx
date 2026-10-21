import { GraduationCap } from 'lucide-react';
import { COURSE_RUSH_PER_COURSE } from '../../core/config/ads';
import { courseDef } from '../../core/config/courses';
import { SECONDS_PER_MONTH } from '../../core/config/life';
import { availableCourses, careersNeedingCourse, courseProgress } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { adGift, canRushCourse, canWatch, courseRushSeconds, marked } from '../../runtime/adRewards';
import { ActionAd, PayAd } from '../ads/AdOffers';
import { HelpAd } from '../ads/AdButton';
import { useAdText } from '../ads/useAdText';
import { Focusable } from '../home/Focusable';
import { GameButton, ImageTile, Panel, SectionLabel } from '../kit';

// The Courses tab of the career screen (docs/game-design-v2.md §4.4): the course running, the ones
// that can be started ("Opens: …") and the ones finished. One course at a time.

export function CoursesPanel() {
  const { game, state, actions } = useGameV2();
  const { t, name, money } = useT();
  const adText = useAdText();
  const now = Date.now();

  const running = game.course ? courseDef(game.course.id) : undefined;
  const monthsLeft = running ? Math.max(1, Math.ceil(running.months - (game.course?.seconds ?? 0) / SECONDS_PER_MONTH)) : 0;
  const courses = availableCourses(game);
  const done = game.coursesDone.map((id) => courseDef(id)).filter((course) => course !== undefined);
  // The newest finished course whose diploma gift was not taken yet (an ad, once per course).
  const diploma = [...done].reverse().find((course) => marked(state.ads, `diploma_gift:${course.id}`) === 0);
  const rushMonths = Math.max(1, Math.round(courseRushSeconds(game) / SECONDS_PER_MONTH));

  const start = (courseId: string) => {
    if (!actions.startCourse(courseId)) return;
    playSfx('purchase');
    haptic('medium');
  };

  return (
    <section className="flex flex-col gap-3">
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
    </section>
  );
}
