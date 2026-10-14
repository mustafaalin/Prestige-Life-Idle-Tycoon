import { useEffect, useState } from 'react';
import { isLifeOver, offlineCapHours, offlineEarnings } from '../../core/formulas';
import { applyClassFloors, createInitialState } from '../../core/state';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import {
  cancelReminders,
  notificationsSupported,
  requestNotificationPermission,
  scheduleReminders,
} from '../../runtime/notifications';
import {
  daughterNeedsName,
  LIFE_MOMENT_GAP_MS,
  MOM_MESSAGES,
  MOM_MIN_GAP_MS,
  momMessageOnReturn,
  nextMomMessage,
  pendingCeremony,
  pendingLifeMoment,
  pendingRichMoment,
  type LifeMomentId,
} from '../../runtime/story';
import { useGameV2, useGameV2Events } from '../../runtime/useGameV2';
import { RichMoment } from '../richList/RichList';
import { Ceremony, LifeMoment } from './Ceremony';
import { portraitOf } from './ceremonyScript';
import { MomMessage, NotifyPrompt } from './MomMessage';
import { NameSheet } from './NameSheet';
import { onStoryRequest } from './storyEvents';

// Decides which story moment is on screen (story-v2.md §4): a waiting class-up ceremony first, then a
// life moment whose age has come (§4c), then (after the offline card) Mom's message on a return
// session, and once, after the first ceremony, the reminder opt-in. A new place on the Rich List
// brings its short card when nothing else is on screen. Also schedules the reminders when
// the app goes to the background.

/** A replayed ceremony (dev menu) shows the story's own step: the class before it, then the class itself. */
function storyStep(classIndex: number) {
  const at = (index: number) => applyClassFloors({ ...createInitialState(), classIndex: index });
  return { before: at(classIndex - 1), now: at(classIndex) };
}

export function StoryDirector({
  tabOpen,
  hold = false,
  onOpenRichList,
}: {
  tabOpen: boolean;
  hold?: boolean;
  onOpenRichList: () => void;
}) {
  const { game, state, actions } = useGameV2();
  const { t } = useT();
  const [replay, setReplay] = useState<number | null>(null);
  const [replayLife, setReplayLife] = useState<LifeMomentId | null>(null);
  // A story beat just ended: the next life moment waits, so two never play back to back.
  const [quiet, setQuiet] = useState(false);
  // `dev`: shown from the dev menu, so it does not count as Mom's real message.
  const [mom, setMom] = useState<{ id: string; dev: boolean } | null>(null);
  const [askNotify, setAskNotify] = useState(false);
  // Away time of the latest return; the effect below reads it with fresh state.
  const [returned, setReturned] = useState<{ awaySeconds: number } | null>(null);
  const [devMomIndex, setDevMomIndex] = useState(0);

  // `hold`: the family album is playing a moment again; a new one waits until it is over.
  const ceremony = hold ? null : (replay ?? pendingCeremony(game, state.story));
  // A life moment never cuts into a shop sheet, a card or the end of life: it waits for the home scene.
  const lifeCanPlay =
    ceremony === null && !quiet && !tabOpen && !state.offline && !mom && !askNotify && !isLifeOver(game);
  const life = hold ? null : (replayLife ?? (lifeCanPlay ? (pendingLifeMoment(game, state.story)?.id ?? null) : null));
  const playing = ceremony !== null || life !== null;
  const rich = lifeCanPlay && life === null && !daughterNeedsName(state.story) ? pendingRichMoment(game, state.story) : null;

  useEffect(() => {
    if (!playing) return;
    actions.story.setPaused(true);
    return () => actions.story.setPaused(false);
  }, [playing, actions]);

  useEffect(() => {
    if (!quiet) return;
    const timer = window.setTimeout(() => setQuiet(false), LIFE_MOMENT_GAP_MS);
    return () => window.clearTimeout(timer);
  }, [quiet]);

  useGameV2Events((event) => {
    if (event.type === 'returned') {
      void cancelReminders();
      setReturned({ awaySeconds: event.awaySeconds });
    } else if (event.type === 'background') {
      scheduleFor();
    }
  });

  useEffect(() => {
    if (!returned) return;
    setReturned(null);
    // A ceremony or a life moment that waited for this return is enough story for one opening.
    if (pendingCeremony(game, state.story) !== null || pendingLifeMoment(game, state.story) !== null) return;
    const message = momMessageOnReturn(game, state.story, returned.awaySeconds, Date.now());
    if (message) setMom({ id: message.id, dev: false });
  }, [returned, game, state.story]);

  useEffect(
    () =>
      onStoryRequest((request) => {
        if (request.type === 'ceremony') {
          setReplay(request.classIndex);
        } else if (request.type === 'life') {
          setReplayLife(request.id);
        } else {
          setMom({ id: MOM_MESSAGES[devMomIndex % MOM_MESSAGES.length].id, dev: true });
          setDevMomIndex(devMomIndex + 1);
        }
      }),
    [devMomIndex],
  );

  function scheduleFor() {
    const now = Date.now();
    const offlinePerHour = offlineEarnings(game, 3600, 1);
    const lucky =
      offlinePerHour > 0
        ? { title: t('notify.luckyTitle'), body: t('notify.luckyBody'), at: now + offlineCapHours(game) * 3600 * 1000 }
        : null;
    const next = nextMomMessage(game, state.story);
    const momReminder = next
      ? {
          title: t('mom.from'),
          body: t(`mom.${next.id}` as Parameters<typeof t>[0]),
          at: Math.max(now, state.story.momShownAt) + MOM_MIN_GAP_MS,
        }
      : null;
    void scheduleReminders({ lucky, mom: momReminder }, t('notify.channel'));
  }

  const finishCeremony = (classIndex: number, skipped: boolean) => {
    track('story_view', { kind: 'ceremony', class_index: classIndex, skipped, replay: replay !== null });
    if (replay !== null) {
      setReplay(null);
      return;
    }
    actions.story.ceremonySeen(classIndex);
    setQuiet(true);
    if (notificationsSupported && !state.story.notificationsAsked) setAskNotify(true);
  };

  const finishLife = (id: LifeMomentId, skipped: boolean) => {
    track('story_view', { kind: 'life', id, skipped, replay: replayLife !== null });
    if (replayLife !== null) {
      setReplayLife(null);
      return;
    }
    actions.story.lifeSeen(id);
    setQuiet(true);
  };

  if (hold) return null;

  if (ceremony !== null) {
    const step = replay !== null ? storyStep(ceremony) : { before: actions.story.classUpFrom(ceremony), now: game };
    return <Ceremony key={ceremony} classIndex={ceremony} {...step} onDone={(skipped) => finishCeremony(ceremony, skipped)} />;
  }

  if (life !== null) {
    return <LifeMoment key={life} id={life} onDone={(skipped) => finishLife(life, skipped)} />;
  }

  // Right after the birth; also on the next opening if the app closed before she was named.
  if (daughterNeedsName(state.story) && !state.offline) {
    return (
      <NameSheet
        speaker={t('ceremony.cast.defne')}
        portrait={portraitOf('defne', 'smile')}
        tone="pink"
        question={t('moments.nameAsk')}
        label={t('moments.nameLabel')}
        defaultName={t('moments.defaultName')}
        confirm={t('moments.nameOk')}
        onDone={(name) => {
          actions.story.setDaughterName(name);
          track('daughter_named', { is_default: name === t('moments.defaultName') });
        }}
      />
    );
  }

  if (askNotify) {
    return (
      <NotifyPrompt
        onAnswer={(yes) => {
          setAskNotify(false);
          actions.story.notificationsAsked();
          track('notification_prompt', { accepted: yes });
          if (yes) void requestNotificationPermission();
        }}
      />
    );
  }

  if (rich) {
    const done = (openList: boolean) => {
      actions.story.richSeen(rich.id);
      track('story_view', { kind: 'rich_list', id: rich.id });
      setQuiet(true);
      if (openList) onOpenRichList();
    };
    return <RichMoment key={rich.id} milestone={rich} onClose={() => done(false)} onOpenList={() => done(true)} />;
  }

  if (mom && !state.offline) {
    return (
      <MomMessage
        messageId={mom.id}
        onClose={() => {
          if (!mom.dev) {
            actions.story.momShown(mom.id);
            track('story_view', { kind: 'mom', id: mom.id });
          }
          setMom(null);
        }}
      />
    );
  }

  return null;
}
