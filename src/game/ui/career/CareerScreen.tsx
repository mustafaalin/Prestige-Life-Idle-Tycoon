import { Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EXPERIENCE_RUSH_MONTHS } from '../../core/config/ads';
import { CAREER_TRACKS, careerDef } from '../../core/config/careers';
import { availableCourses, betterOpenCareers, currentCareer, currentSalary, globalMultiplier } from '../../core/formulas';
import { isMastered, masteryOf } from '../../core/requirements';
import type { CareerDef, CareerTrack } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { haptic } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { canFirstSalary, canRushExperience, firstSalaryBonus } from '../../runtime/adRewards';
import { ActionAd, PayAd } from '../ads/AdOffers';
import { AdStrip } from '../ads/AdButton';
import { useAdChipText } from '../ads/useAdText';
import type { FocusTarget } from '../home/focus';
import { useFocus } from '../home/focus';
import { ImageTile, Panel, Segmented } from '../kit';
import { CoursesPanel } from './CoursesPanel';
import { JobIcon } from './JobIcon';
import { JobSheet } from './JobSheet';
import { JobShow } from './JobShow';
import { JobTree } from './JobTree';

// The career screen (docs/career-redesign.md §4): the job held with its mastery ring, then two
// tabs: the job tree (Worker, Office, Expert, The top) and the courses.

type Section = 'jobs' | 'courses';

export function CareerScreen({ onGoTo }: { onGoTo: (target: FocusTarget) => void }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, perMonth } = useT();
  const adText = useAdChipText();
  const focus = useFocus();
  const now = Date.now();

  const current = currentCareer(game);
  const [section, setSection] = useState<Section>('jobs');
  const [track, setTrack] = useState<CareerTrack>(current?.track ?? 'worker');
  const [opened, setOpened] = useState<CareerDef | null>(null);

  // "Go" from a goal or a condition: a job opens its tab, a course the Courses tab.
  const focusKey = focus?.target.key;
  useEffect(() => {
    if (!focusKey) return;
    const [, kind, id] = focusKey.split(':');
    if (kind === 'course') setSection('courses');
    const career = kind === 'take' ? careerDef(id) : undefined;
    if (career) {
      setSection('jobs');
      setTrack(career.track);
    }
  }, [focusKey, focus?.id]);

  const open = betterOpenCareers(game);
  const courseReady = !game.course && availableCourses(game).some((course) => game.cash >= course.cost);

  // Taking a job plays its show (JobShow), which has its own sound.
  const [show, setShow] = useState<{ from: CareerDef | undefined; to: CareerDef; fromPay: number; toPay: number } | null>(null);
  const take = (career: CareerDef) => {
    const from = current;
    const fromPay = currentSalary(game) * globalMultiplier(game);
    if (!actions.takeCareer(career.id)) return;
    haptic('medium');
    setShow({ from, to: career, fromPay, toPay: career.salaryPerSecond * globalMultiplier(game) });
  };

  return (
    <section className="flex flex-col gap-3">
      <Panel accent={current !== undefined && isMastered(game, current.id) && open.length > 0} className="p-3 flex items-center gap-3">
        {current ? (
          <JobIcon career={current} size={64} mastery={masteryOf(game, current.id)} />
        ) : (
          <ImageTile className="w-16 h-16">
            <Briefcase className="w-7 h-7 text-indigo-300" />
          </ImageTile>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('career.current')}</p>
          <p className="v2-display text-[17px] leading-tight text-indigo-950">{current ? name('career', current) : t('career.unemployed')}</p>
          <p className="text-[12px] font-bold text-emerald-600">
            {current ? t('career.salary', { amount: perMonth(currentSalary(game) * globalMultiplier(game)) }) : t('career.unemployedBody')}
          </p>
          {current && (
            <p className="text-[11px] font-bold text-violet-600">
              {isMastered(game, current.id)
                ? open.length > 0
                  ? t('career.readyToMove')
                  : t('career.mastered')
                : t('career.mastery', { percent: Math.floor(masteryOf(game, current.id) * 100) })}
            </p>
          )}
        </div>
      </Panel>
      <AdStrip className="-mt-1">
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
      </AdStrip>

      <Segmented
        options={[
          { value: 'jobs' as const, label: t('career.jobs') },
          { value: 'courses' as const, label: t('career.courses') },
        ]}
        value={section}
        onChange={setSection}
        dot={(value) => (value === 'jobs' ? open.length > 0 : courseReady)}
      />

      {section === 'courses' ? (
        <CoursesPanel />
      ) : (
        <>
          <Segmented
            options={CAREER_TRACKS.map((value) => ({ value, label: t(`career.tracks.${value}` as MessageKey) }))}
            value={track}
            onChange={setTrack}
            dot={(value) => open.some((career) => career.track === value)}
          />
          <JobTree track={track} state={game} onOpen={setOpened} onTake={take} />
        </>
      )}

      {show && <JobShow {...show} onClose={() => setShow(null)} />}
      {opened && (
        <JobSheet
          career={opened}
          state={game}
          onClose={() => setOpened(null)}
          onTake={take}
          onGoTo={onGoTo}
        />
      )}
    </section>
  );
}
