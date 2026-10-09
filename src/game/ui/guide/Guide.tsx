import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { BUSINESSES } from '../../core/config/businesses';
import { isLifeOver } from '../../core/formulas';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { HERO_NAME_MAX, pendingCeremony } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { GameButton } from '../kit';
import { portraitOf } from '../story/ceremonyScript';
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
  const hidden = pendingCeremony(game, state.story) !== null || state.offline !== null || isLifeOver(game);
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
  if (step.id === 'name') return <NameSheet onDone={(name) => actions.story.setHeroName(name)} />;
  if (!speaking) return null;
  return (
    <GuideLine
      key={step.id}
      face={FACE[step.id]}
      atTop={!tabOpen}
      text={t(`guide.${step.id}` as MessageKey, { name: state.story.heroName })}
      onRead={() => actions.story.guideSeen(step.id)}
    />
  );
}

function GuideLine({ face, text, atTop, onRead }: { face: string; text: string; atTop: boolean; onRead: () => void }) {
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
      onClick={() => {
        playSfx('click');
        onRead();
      }}
      className={`v2-pop-in pointer-events-auto absolute left-3 right-3 z-20 text-left ${atTop ? 'top-[150px]' : 'bottom-3'}`}
    >
      <img
        src={portraitOf('riza', face) ?? ''}
        alt=""
        draggable={false}
        className="absolute left-1 -top-11 w-[72px] h-[72px] rounded-full object-cover border-[3px] border-white shadow-lg bg-slate-200"
      />
      <div className="relative rounded-[20px] bg-white/95 border-2 border-white shadow-xl pl-[84px] pr-3 pt-2 pb-1.5 min-h-[64px]">
        <span className="absolute left-[84px] -top-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow">
          {t('ceremony.cast.riza')}
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

/** Asked right after the first business (story §3): the default name is filled in, one tap to keep it. */
function NameSheet({ onDone }: { onDone: (name: string) => void }) {
  const { t } = useT();
  const defaultName = t('guide.defaultName');
  const [name, setName] = useState(defaultName);

  const finish = () => {
    playSfx('levelUp');
    haptic('medium');
    onDone(name.trim() || defaultName);
  };

  useBackButton(true, 80, finish);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    finish();
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-black/35 flex items-end">
      <form
        onSubmit={submit}
        className="v2-sheet-in w-full rounded-t-[28px] bg-white shadow-2xl px-5 pt-5 pb-[calc(var(--safe-bottom)+20px)]"
      >
        <div className="flex items-start gap-3">
          <img
            src={portraitOf('riza', 'laugh') ?? ''}
            alt=""
            draggable={false}
            className="shrink-0 w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg bg-slate-200"
          />
          <div className="flex-1 rounded-[18px] rounded-tl-md bg-emerald-50 border-2 border-emerald-100 px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{t('ceremony.cast.riza')}</p>
            <p className="text-[15px] font-bold leading-snug text-slate-800">{t('guide.name')}</p>
          </div>
        </div>
        <label className="block mt-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('guide.nameLabel')}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value.slice(0, HERO_NAME_MAX))}
            onFocus={(event) => event.target.select()}
            maxLength={HERO_NAME_MAX}
            autoComplete="off"
            enterKeyHint="done"
            className="mt-1 w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50/60 px-4 py-3 v2-display text-xl text-indigo-950 outline-none focus:border-violet-400"
          />
        </label>
        <GameButton tone="buy" type="submit" className="w-full mt-4 py-3 v2-display text-lg v2-shadow">
          {t('guide.nameOk')}
        </GameButton>
      </form>
    </div>,
    document.body,
  );
}
