import { ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { BUSINESSES } from '../../core/config/businesses';
import { awaitsHandover } from '../../core/formulas';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { playSfx } from '../../runtime/feedback';
import { pendingCeremony } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { portraitOf } from '../story/ceremonyScript';
import { NameSheet } from '../story/NameSheet';
import { guideStep, setGuideTarget, TALKS_EARLY, type GuideStepId } from './guideSteps';

// Old Ray's guide on the home screen (plan 1.12; steps in guideSteps.ts): his line in a small bubble (under
// the goals card on the scene, where the bottles are not; above the menu in a tab), the hand on what to tap, and the sheet that asks the hero's name. It steps aside while a
// ceremony, the offline card or the end of life is on screen.

/** A line goes away by itself after this long (it counts as read). */
const LINE_MS = 9000;

const FACE: Record<GuideStepId, 'warm' | 'laugh' | 'concerned'> = {
  bottles: 'warm',
  claim: 'warm',
  job: 'warm',
  stand: 'warm',
  name: 'laugh',
  run: 'laugh',
  manager: 'concerned',
};

const STAND_ID = BUSINESSES[0].id;

export function Guide({ tabOpen }: { tabOpen: boolean }) {
  const { game, state, actions } = useGameV2();
  const { t } = useT();
  const step = guideStep(state);
  const hidden = pendingCeremony(game, state.story) !== null || state.offline !== null || awaitsHandover(game);
  const stepId = step?.id ?? null;

  // A new object every render; setGuideTarget only tells the screens when the target really changes.
  const target = hidden ? null : (step?.target ?? null);
  useEffect(() => setGuideTarget(target), [target]);
  useEffect(() => () => setGuideTarget(null), []);

  // The first run of the stand ends the "run" step (it has no counter in the game state).
  const standRunning = state.cycles[STAND_ID].running;
  useEffect(() => {
    if (stepId === 'run' && standRunning) actions.story.guideDone('run');
  }, [stepId, standRunning, actions]);

  // Steps reached in this session (not the one a save opens on), for the funnel.
  const lastStep = useRef(stepId);
  useEffect(() => {
    if (lastStep.current === stepId) return;
    lastStep.current = stepId;
    track('tutorial_step', { step: stepId ?? 'done' });
  }, [stepId]);

  const speaking =
    step !== null &&
    step.talks &&
    !state.story.guideSeen.includes(step.id) &&
    (step.ready || TALKS_EARLY.includes(step.id));

  if (hidden || !step) return null;
  // Asked right after the first business (story §3).
  if (step.id === 'name') {
    return (
      <NameSheet
        speaker={t('ceremony.cast.riza')}
        portrait={portraitOf('riza', 'laugh')}
        tone="emerald"
        question={t('guide.name')}
        label={t('guide.nameLabel')}
        defaultName={t('guide.defaultName')}
        confirm={t('guide.nameOk')}
        onDone={(name) => actions.story.setHeroName(name)}
      />
    );
  }
  if (!speaking) return null;
  return (
    <GuideLine
      key={step.id}
      portrait={portraitOf('riza', FACE[step.id]) ?? ''}
      speaker={t('ceremony.cast.riza')}
      atTop={!tabOpen}
      text={t(`guide.${step.id}` as MessageKey, { name: state.story.heroName })}
      onRead={() => actions.story.guideSeen(step.id)}
    />
  );
}

/**
 * A guide's line in a small bubble with the speaker's face (Old Ray's steps, a feature's first look).
 * It stays lit and tappable when the screen dims around the hand (Spotlight.tsx, `data-spot-keep`).
 */
export function GuideLine({
  portrait,
  speaker,
  text,
  atTop,
  onRead,
}: {
  portrait: string;
  speaker: string;
  text: string;
  atTop: boolean;
  onRead: () => void;
}) {
  const { t } = useT();

  // The game re-renders every tick, so the timer reads the latest callback instead of restarting.
  const read = useRef(onRead);
  useEffect(() => {
    read.current = onRead;
  });
  useEffect(() => {
    const timer = window.setTimeout(() => read.current(), LINE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      data-spot-keep
      onClick={() => {
        playSfx('click');
        onRead();
      }}
      className={`v2-pop-in pointer-events-auto absolute left-3 right-3 z-20 text-left ${atTop ? 'top-[150px]' : 'bottom-3'}`}
    >
      <img
        src={portrait}
        alt=""
        draggable={false}
        className="absolute z-10 left-1 -top-11 w-[72px] h-[72px] rounded-full object-cover border-[3px] border-white shadow-lg bg-slate-200"
      />
      <div className="relative rounded-[20px] bg-white/95 border-2 border-white shadow-xl pl-[84px] pr-3 pt-2 pb-1.5 min-h-[64px]">
        <span className="absolute left-[84px] -top-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow">
          {speaker}
        </span>
        <p className="pt-1.5 text-[14px] font-bold leading-snug text-slate-800">{text}</p>
        <p className="flex items-center justify-end text-[10px] font-black text-slate-400">
          {t('common.close')}
          <ChevronRight className="w-3.5 h-3.5" />
        </p>
      </div>
    </button>
  );
}
