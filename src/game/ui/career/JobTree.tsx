import { Lock } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CAREERS } from '../../core/config/careers';
import { SECONDS_PER_MONTH } from '../../core/config/life';
import { canTakeCareer, currentSalary, globalMultiplier, jobView, paysLess, type JobView } from '../../core/formulas';
import { firstUnmet, isMastered, masteryOf } from '../../core/requirements';
import type { CareerDef, CareerTrack, GameStateV2 } from '../../core/types';
import { useT } from '../../i18n/useT';
import { MoneyIcon } from '../CashAmount';
import { Focusable } from '../home/Focusable';
import { JobIcon } from './JobIcon';
import { requirementText } from './requirementText';

// One tab of the job tree (docs/career-redesign.md §4, look redone 2026-10-23 after the reference game):
// each row in its own band, the jobs of a row side by side as game tiles whose colour tells their state.
// Between two rows one junction: the jobs above drop to a bar, the jobs below rise from it (any job
// above opens any job below). The path walked is gold, a path open now blue, the rest dotted. Lines
// to a job in another tab are not drawn; its conditions name the job before it.

type Tone = 'walked' | 'open' | 'future';

interface Segment {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: Tone;
}

const TONE_ORDER: Tone[] = ['future', 'open', 'walked'];

const worked = (state: GameStateV2, id: string) => state.careerId === id || (state.jobSeconds[id] ?? 0) > 0;

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
  // Rows past the "???" one are not drawn at all.
  const jobs = CAREERS.filter((career) => career.track === track && jobView(state, career) !== 'beyond');
  const rows = [...new Set(jobs.map((career) => career.level))].sort((a, b) => a - b);
  const area = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, HTMLDivElement>());
  const [segments, setSegments] = useState<Segment[]>([]);
  const [width, setWidth] = useState(0);
  const { t } = useT();

  // The junctions are measured from the cards after layout, and again when the column changes width.
  useLayoutEffect(() => {
    const root = area.current;
    if (!root) return;
    const measure = () => {
      const origin = root.getBoundingClientRect();
      const rect = (id: string) => boxes.current.get(id)?.getBoundingClientRect();
      const centre = (box: DOMRect) => box.left + box.width / 2 - origin.left;
      const next: Segment[] = [];
      for (let index = 0; index + 1 < rows.length; index += 1) {
        const upper = jobs.filter((career) => career.level === rows[index]);
        const lower = jobs.filter((career) => career.level === rows[index + 1]);
        const links = lower.flatMap((to) => upper.filter((from) => to.after.includes(from.id)).map((from) => ({ from, to })));
        if (links.length === 0) continue;
        const froms = [...new Set(links.map((link) => link.from))];
        const tos = [...new Set(links.map((link) => link.to))];
        const fromBoxes = froms.map((career) => rect(career.id)).filter((box): box is DOMRect => box !== undefined);
        const toBoxes = tos.map((career) => rect(career.id)).filter((box): box is DOMRect => box !== undefined);
        if (fromBoxes.length === 0 || toBoxes.length === 0) continue;
        // The tiles' 3D edge sits under the box: the drop starts below it.
        const top = Math.max(...fromBoxes.map((box) => box.bottom)) - origin.top + 3;
        const bottom = Math.min(...toBoxes.map((box) => box.top)) - origin.top;
        const bar = (top + bottom) / 2;
        const xs = [...fromBoxes, ...toBoxes].map(centre);
        const anyMastered = froms.some((career) => isMastered(state, career.id));
        next.push({ key: `bar-${index}`, x1: Math.min(...xs), y1: bar, x2: Math.max(...xs), y2: bar, tone: anyMastered ? 'open' : 'future' });
        for (const from of froms) {
          const box = rect(from.id);
          if (!box) continue;
          const walkedOn = isMastered(state, from.id) && links.some((link) => link.from === from && worked(state, link.to.id));
          const tone: Tone = walkedOn ? 'walked' : isMastered(state, from.id) ? 'open' : 'future';
          next.push({ key: `drop-${from.id}`, x1: centre(box), y1: top, x2: centre(box), y2: bar, tone });
        }
        for (const to of tos) {
          const box = rect(to.id);
          if (!box) continue;
          const view = jobView(state, to);
          const tone: Tone = view === 'held' || view === 'done' ? 'walked' : view === 'open' ? 'open' : 'future';
          next.push({ key: `rise-${to.id}`, x1: centre(box), y1: bar, x2: centre(box), y2: box.top - origin.top, tone });
        }
        // The path walked: from the mastered job above to the job taken below it, in gold over the bar.
        for (const { from, to } of links) {
          const a = rect(from.id);
          const b = rect(to.id);
          if (!a || !b || !isMastered(state, from.id) || !worked(state, to.id)) continue;
          next.push({ key: `walk-${from.id}-${to.id}`, x1: centre(a), y1: bar, x2: centre(b), y2: bar, tone: 'walked' });
        }
      }
      setSegments(next);
      setWidth(origin.width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
    // The layout changes with the tab and with what each card shows.
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

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Lock className="w-8 h-8 text-indigo-300" />
        <p className="px-6 text-[13px] font-bold text-indigo-900/50">{t('career.trackLocked')}</p>
      </div>
    );
  }

  const here = jobs.find((career) => career.id === state.careerId)?.level;
  return (
    <div ref={area} className="relative -mx-3 flex flex-col gap-6 pb-2">
      {rows.map((level, index) => (
        <div
          key={level}
          className={`relative grid grid-cols-[38px_1fr] items-center gap-1 py-2.5 pl-1.5 pr-3 ${index % 2 === 0 ? 'bg-white/45' : 'bg-white/15'}`}
        >
          <span
            className={`justify-self-center whitespace-nowrap rounded-full px-1.5 py-0.5 v2-display text-[11px] ${
              level === here ? 'bg-gradient-to-b from-amber-200 to-amber-500 text-amber-900 shadow-[0_2px_0_#b45309]' : 'bg-white text-indigo-700 shadow-[0_2px_0_#c7d2fe]'
            }`}
          >
            {t('career.level', { level })}
          </span>
          <div className="flex justify-center gap-2.5">
            {jobs
              .filter((career) => career.level === level)
              .map((career) => (
                <div
                  key={career.id}
                  className="w-[calc(50%-5px)]"
                  ref={(node) => {
                    if (node) boxes.current.set(career.id, node);
                    else boxes.current.delete(career.id);
                  }}
                >
                  <JobCard career={career} view={jobView(state, career)} state={state} onOpen={onOpen} onTake={onTake} />
                </div>
              ))}
          </div>
        </div>
      ))}
      {/* Drawn over the bands, under nothing: the lines run in the gaps between the rows. */}
      <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height="100%" aria-hidden="true">
        {TONE_ORDER.flatMap((tone) =>
          segments
            .filter((segment) => segment.tone === tone)
            .map((segment) => (
              <line
                key={segment.key}
                x1={segment.x1}
                y1={segment.y1}
                x2={segment.x2}
                y2={segment.y2}
                strokeLinecap="round"
                strokeWidth={tone === 'future' ? 4 : 5}
                strokeDasharray={tone === 'future' ? '0.1 8' : undefined}
                className={
                  tone === 'walked'
                    ? 'stroke-amber-400 [filter:drop-shadow(0_0_3px_rgba(245,158,11,0.8))]'
                    : tone === 'open'
                      ? 'stroke-sky-400'
                      : 'stroke-indigo-300'
                }
              />
            )),
        )}
      </svg>
    </div>
  );
}

function JobCard({
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
  const words = useT();
  const { t, name, perMonth, money } = words;
  const hidden = view === 'hidden';
  const multiplier = globalMultiplier(state);
  const canTake = view === 'open' && canTakeCareer(state, career);
  const raise = (career.salaryPerSecond - currentSalary(state)) * multiplier * SECONDS_PER_MONTH;
  const mastery = masteryOf(state, career.id);
  const mastered = isMastered(state, career.id);
  const light = view === 'held' || view === 'open';
  const missing = view === 'next' ? firstUnmet(state, career.requires) : null;

  return (
    <Focusable focusKey={`career:take:${career.id}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(career)}
        onKeyDown={(event) => event.key === 'Enter' && onOpen(career)}
        className={`v2-job v2-job-${view} min-h-[172px] px-1.5 pt-2.5 flex flex-col items-center text-center transition-all active:scale-[0.97]`}
      >
        {view === 'held' && (
          <span className="absolute z-[2] top-2.5 -left-6 w-[92px] -rotate-[35deg] bg-gradient-to-b from-orange-500 to-orange-600 py-0.5 v2-display text-[10px] tracking-wider text-white shadow-[0_2px_0_#9a3412]">
            {t('career.now')}
          </span>
        )}
        {view === 'done' && mastered && (
          <span className="absolute z-[2] top-1.5 right-1 w-[42px] h-[42px] rotate-[14deg] rounded-full border-2 border-dashed border-white/85 bg-emerald-500 grid place-items-center v2-display text-[9px] text-white shadow-[0_3px_0_#14532d]">
            {t('career.seal')}
          </span>
        )}
        {view === 'open' && raise > 0 && (
          <>
            <span className="v2-bob absolute z-[2] top-1.5 right-1.5 w-[26px] h-[26px] rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 grid place-items-center v2-display text-[16px] text-orange-900 shadow-[0_2px_0_#b45309]">
              !
            </span>
            <span className="absolute z-[2] top-2 left-1.5 rounded-full bg-gradient-to-b from-green-500 to-green-700 px-1.5 v2-display text-[11px] text-white shadow-[0_2px_0_#14532d]">
              ▲ {money(raise)}
            </span>
          </>
        )}
        {view === 'next' && (
          <span className="absolute z-[2] top-2 right-2 w-[26px] h-[26px] rounded-full bg-indigo-500 grid place-items-center shadow-[0_2px_0_#3730a3]">
            <Lock className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </span>
        )}

        <div className="v2-job-medal">
          {view === 'held' && <span className="v2-job-rays" />}
          <JobIcon career={career} size={60} hidden={hidden} plain />
          {hidden && <span className="absolute v2-display text-[34px] text-white [text-shadow:0_2px_0_#64748b]">?</span>}
        </div>
        <p
          className={`relative mt-1.5 min-h-[34px] flex items-center v2-display text-[15px] leading-[1.1] line-clamp-2 ${
            light ? 'v2-job-light' : hidden ? 'text-slate-500' : view === 'done' ? 'text-green-900' : 'text-indigo-950'
          }`}
        >
          {hidden ? '???' : name('career', career)}
        </p>
        <span
          className={`relative mt-1 mb-2 inline-flex items-center gap-1 rounded-full pl-1 pr-2.5 py-0.5 v2-display text-[14px] tabular-nums shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)] ${
            hidden ? 'bg-slate-500/50 text-slate-100' : 'bg-indigo-950/80 text-green-300'
          }`}
        >
          <MoneyIcon tier={2} size={19} />
          {hidden ? t('career.hiddenSalary') : perMonth(career.salaryPerSecond * multiplier)}
        </span>

        {view === 'held' && (
          <>
            <span className="relative mb-1 h-2 w-[calc(100%-4px)] rounded-full bg-amber-900/20 overflow-hidden">
              <span className="block h-full rounded-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${Math.round(mastery * 100)}%` }} />
            </span>
            <Foot className={mastered ? 'bg-gradient-to-b from-green-400 to-green-600 text-white v2-shadow' : 'bg-amber-200/80 text-amber-900'}>
              {mastered ? t('career.masteredNow') : t('career.mastery', { percent: Math.floor(mastery * 100) })}
            </Foot>
          </>
        )}
        {view === 'open' && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              // A job that pays less opens its card first, which says so.
              if (canTake && !paysLess(state, career)) onTake(career);
              else onOpen(career);
            }}
            className={`relative mt-auto -mx-1.5 w-[calc(100%+12px)] py-2 v2-display text-[17px] transition-all active:brightness-95 shadow-[inset_0_2px_0_rgba(255,255,255,0.4),inset_0_-3px_0_rgba(0,0,0,0.15)] ${
              // Not yet (the job held is not mastered): a quiet strip, the card still shows what comes.
              canTake ? 'bg-gradient-to-b from-green-400 to-green-600 text-white v2-shadow' : 'bg-indigo-900/25 text-white/85'
            }`}
          >
            {t('career.takeShort')}
          </button>
        )}
        {view === 'next' && (
          <Foot className="bg-indigo-200 text-indigo-700 text-[12px]">{missing ? requirementText(missing, words) : t('career.soon')}</Foot>
        )}
        {view === 'done' && !mastered && <Foot className="bg-green-200 text-green-800">{t('career.left')}</Foot>}
        {hidden && <Foot className="bg-white/40 text-slate-500 text-[12px]">{t('career.soon')}</Foot>}
      </div>
    </Focusable>
  );
}

/** The strip along a card's bottom edge. */
function Foot({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`relative mt-auto -mx-1.5 w-[calc(100%+12px)] px-1 py-2 v2-display text-[14px] leading-tight ${className}`}>{children}</span>
  );
}
