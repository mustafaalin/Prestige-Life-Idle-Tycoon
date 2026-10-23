import { useEffect, useRef } from 'react';
import { useT } from '../../i18n/useT';
import { pendingCeremony, pendingLifeMoment, storyRuns } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { portraitOf } from '../story/ceremonyScript';
import { GuideLine } from './Guide';
import { guideStep, setIntroTarget } from './guideSteps';
import { FEATURE_INTROS, introSeenId } from './intros';
import { SPOT_OUTSIDE_EVENT } from './spotMode';

// Plays a feature's first look (intros.ts) on the home scene once Old Ray's guide is over: the speaker's
// line in the guide's bubble, the hand on the feature's button and a soft dim around it (Spotlight.tsx).
// It ends when the player opens the feature, taps the bubble or taps the dim; one at a time, and never
// over a ceremony, a life moment, the offline card or an event call.

export function FeatureIntro({ sheetOpen, eventOpen, albumStarted }: { sheetOpen: boolean; eventOpen: boolean; albumStarted: boolean }) {
  const { game, state, actions } = useGameV2();
  const { t } = useT();

  const calm =
    storyRuns(game) &&
    guideStep(state) === null &&
    !sheetOpen &&
    !eventOpen &&
    state.offline === null &&
    pendingCeremony(game, state.story) === null &&
    pendingLifeMoment(game, state.story) === null;
  const intro = calm
    ? FEATURE_INTROS.find((def) => !state.story.guideSeen.includes(introSeenId(def.id)) && def.ready(state, albumStarted))
    : undefined;
  const id = intro?.id ?? null;

  const target = intro?.target ?? null;
  useEffect(() => setIntroTarget(target), [target]);
  useEffect(() => () => setIntroTarget(null), []);

  // A tap on the dim closes it (Spotlight.tsx).
  useEffect(() => {
    if (!id) return;
    const close = () => actions.story.guideSeen(introSeenId(id));
    window.addEventListener(SPOT_OUTSIDE_EVENT, close);
    return () => window.removeEventListener(SPOT_OUTSIDE_EVENT, close);
  }, [id, actions]);

  // Opening the feature is what the intro asked for. The open sheet hides the intro at once, so the one
  // on screen just before is remembered; it is forgotten when something else hid it.
  const shown = useRef<string | null>(null);
  if (id) shown.current = id;
  else if (!sheetOpen) shown.current = null;
  useEffect(() => {
    if (!sheetOpen || !shown.current) return;
    actions.story.guideSeen(introSeenId(shown.current));
    shown.current = null;
  }, [sheetOpen, actions]);

  if (!intro) return null;
  return (
    <GuideLine
      key={intro.id}
      portrait={portraitOf(intro.speaker, intro.face) ?? ''}
      speaker={intro.speaker === 'mom' ? t('mom.from') : t('ceremony.cast.riza')}
      atTop
      text={t(intro.line)}
      onRead={() => actions.story.guideSeen(introSeenId(intro.id))}
    />
  );
}
