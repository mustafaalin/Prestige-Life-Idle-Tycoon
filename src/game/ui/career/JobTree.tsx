import { Check, Lock } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CAREERS } from '../../core/config/careers';
import { globalMultiplier, jobView, salaryOf, type JobView } from '../../core/formulas';
import { isMastered, masteryOf } from '../../core/requirements';
import type { CareerDef, CareerTrack, GameStateV2 } from '../../core/types';
import { useT } from '../../i18n/useT';
import { Focusable } from '../home/Focusable';
import { GameButton } from '../kit';
import { JobIcon } from './JobIcon';

// One tab of the job tree (docs/career-redesign.md §4): rows from the first job down, the jobs of a
// row side by side, lines from each job to the jobs it opens. Lines to a job in another tab are not
// drawn; its conditions name the job before it.

interface Line {
  key: string;
  d: string;
  lit: boolean;
}

export function JobTree({
  track,
  state,
  onOpen,
  onTake,
}: {
  track: CareerTrack;
  state: GameStateV2;
  onOpen: (career: CareerDef) => void;
  onTake: (career: CareerDef) => void;
}) {
  const jobs = CAREERS.filter((career) => career.track === track);
  const rows = [...new Set(jobs.map((career) => career.level))].sort((a, b) => a - b);
  const area = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, HTMLDivElement>());
  const [lines, setLines] = useState<Line[]>([]);
  const [width, setWidth] = useState(0);
  const { t } = useT();

  // Lines are measured from the boxes after layout, and again when the column changes width.
  useLayoutEffect(() => {
    const root = area.current;
    if (!root) return;
    const measure = () => {
      const origin = root.getBoundingClientRect();
      const next: Line[] = [];
      for (const career of jobs) {
        const to = boxes.current.get(career.id)?.getBoundingClientRect();
        if (!to) continue;
        for (const id of career.after) {
          const from = boxes.current.get(id)?.getBoundingClientRect();
          if (!from) continue;
          const x1 = from.left + from.width / 2 - origin.left;
          const y1 = from.bottom - origin.top;
          const x2 = to.left + to.width / 2 - origin.left;
          const y2 = to.top - origin.top;
          const bend = Math.max(12, (y2 - y1) / 2);
          next.push({
            key: `${id}>${career.id}`,
            d: `M${x1},${y1} C${x1},${y1 + bend} ${x2},${y2 - bend} ${x2},${y2}`,
            lit: isMastered(state, id),
          });
        }
      }
      setLines(next);
      setWidth(origin.width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
    // The layout changes with the tab and with what each box shows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, state.careerId, Object.keys(state.jobSeconds).length]);

  // Open on the job held (or the first job) so the next step is in sight.
  useEffect(() => {
    const target = boxes.current.get(state.careerId ?? '') ?? boxes.current.get(jobs[0]?.id ?? '');
    const scroll = window.setTimeout(() => target?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 120);
    return () => window.clearTimeout(scroll);
    // Only when the tab opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  return (
    <div ref={area} className="relative flex flex-col gap-5 py-1">
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height="100%" aria-hidden="true">
        {lines.map((line) => (
          <path
            key={line.key}
            d={line.d}
            fill="none"
            strokeWidth={line.lit ? 3 : 2}
            strokeDasharray={line.lit ? undefined : '4 4'}
            className={line.lit ? 'stroke-emerald-400' : 'stroke-indigo-300/80'}
          />
        ))}
      </svg>
      {rows.map((level) => (
        <div key={level} className="relative flex items-start gap-1.5">
          <span className="shrink-0 mt-6 w-8 rounded-full bg-white/80 border border-white py-0.5 text-center v2-display text-[11px] text-indigo-900/60 shadow-sm">
            {t('career.level', { level })}
          </span>
          <div className="flex-1 flex flex-wrap justify-center gap-x-2 gap-y-4">
            {jobs
              .filter((career) => career.level === level)
              .map((career) => (
                <div
                  key={career.id}
                  ref={(node) => {
                    if (node) boxes.current.set(career.id, node);
                    else boxes.current.delete(career.id);
                  }}
                >
                  <JobBox career={career} view={jobView(state, career)} state={state} onOpen={onOpen} onTake={onTake} />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const BOX_TONE: Record<JobView, string> = {
  held: 'bg-amber-50 border-amber-300 shadow-[0_4px_14px_rgba(245,158,11,0.3)]',
  done: 'bg-white border-emerald-200',
  open: 'bg-white border-emerald-400 shadow-[0_4px_14px_rgba(16,185,129,0.3)]',
  next: 'bg-white/90 border-white',
  hidden: 'bg-white/50 border-white/60',
};

function JobBox({
  career,
  view,
  state,
  onOpen,
  onTake,
}: {
  career: CareerDef;
  view: JobView;
  state: GameStateV2;
  onOpen: (career: CareerDef) => void;
  onTake: (career: CareerDef) => void;
}) {
  const { t, name, perMonth } = useT();
  const hidden = view === 'hidden';
  const pay = perMonth((view === 'held' ? salaryOf(state, career) : career.salaryPerSecond) * globalMultiplier(state));
  return (
    <Focusable focusKey={`career:take:${career.id}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(career)}
        onKeyDown={(event) => event.key === 'Enter' && onOpen(career)}
        className={`relative z-[1] w-[92px] min-h-[124px] rounded-2xl border-2 px-1 pt-1.5 pb-1.5 flex flex-col items-center gap-0.5 text-center transition-all active:scale-[0.97] ${BOX_TONE[view]}`}
      >
        <JobIcon
          career={career}
          size={50}
          hidden={hidden}
          mastery={view === 'held' || view === 'done' ? masteryOf(state, career.id) : undefined}
        />
        <p className={`text-[11px] font-black leading-tight line-clamp-2 ${hidden ? 'text-indigo-900/40' : 'text-indigo-950'}`}>
          {hidden ? '???' : name('career', career)}
        </p>
        <p className={`text-[10px] font-black tabular-nums ${view === 'next' || hidden ? 'text-slate-400' : 'text-emerald-600'}`}>
          {view === 'next' || hidden ? t('career.hiddenSalary') : pay}
        </p>
        <div className="mt-auto">
          {view === 'open' && (
            <GameButton
              onClick={(event) => {
                event.stopPropagation();
                onTake(career);
              }}
              className="px-2.5 py-0.5"
            >
              <span className="v2-display text-[11px] v2-shadow">{t('career.take')}</span>
            </GameButton>
          )}
          {view === 'held' && (
            <span className="v2-display text-[10px] text-amber-600">
              {isMastered(state, career.id) ? t('career.mastered') : t('career.mastery', { percent: Math.floor(masteryOf(state, career.id) * 100) })}
            </span>
          )}
          {view === 'done' && (
            <span className="inline-flex items-center gap-0.5 v2-display text-[10px] text-emerald-600">
              {isMastered(state, career.id) && <Check className="w-3 h-3" />}
              {isMastered(state, career.id) ? t('career.mastered') : t('career.left')}
            </span>
          )}
          {(view === 'next' || hidden) && <Lock className="w-3.5 h-3.5 text-indigo-300" />}
        </div>
      </div>
    </Focusable>
  );
}
