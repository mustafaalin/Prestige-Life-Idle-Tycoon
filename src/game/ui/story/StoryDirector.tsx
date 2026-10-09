import { useEffect, useState } from 'react';
import { offlineCapHours, offlineEarnings } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { track } from '../../runtime/analytics';
import {
  cancelReminders,
  notificationsSupported,
  requestNotificationPermission,
  scheduleReminders,
} from '../../runtime/notifications';
import {
  MOM_MESSAGES,
  MOM_MIN_GAP_MS,
  momMessageOnReturn,
  nextMomMessage,
  pendingCeremony,
} from '../../runtime/story';
import { useGameV2, useGameV2Events } from '../../runtime/useGameV2';
import { Ceremony } from './Ceremony';
import { MomMessage, NotifyPrompt } from './MomMessage';
import { onStoryRequest } from './storyEvents';

// Decides which story moment is on screen (story-v2.md §4): a waiting class-up ceremony first, then
// (after the offline card) Mom's message on a return session, and once, after the first ceremony,
// the reminder opt-in. Also schedules the reminders when the app goes to the background.

export function StoryDirector() {
  const { game, state, actions } = useGameV2();
  const { t } = useT();
  const [replay, setReplay] = useState<number | null>(null);
  // `dev`: shown from the dev menu, so it does not count as Mom's real message.
  const [mom, setMom] = useState<{ id: string; dev: boolean } | null>(null);
  const [askNotify, setAskNotify] = useState(false);
  // Away time of the latest return; the effect below reads it with fresh state.
  const [returned, setReturned] = useState<{ awaySeconds: number } | null>(null);
  const [devMomIndex, setDevMomIndex] = useState(0);

  const ceremony = replay ?? pendingCeremony(game, state.story);

  useEffect(() => {
    if (ceremony === null) return;
    actions.story.setPaused(true);
    return () => actions.story.setPaused(false);
  }, [ceremony, actions]);

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
    // A ceremony that waited for this return is enough story for one opening.
    if (pendingCeremony(game, state.story) !== null) return;
    const message = momMessageOnReturn(game, state.story, returned.awaySeconds, Date.now());
    if (message) setMom({ id: message.id, dev: false });
  }, [returned, game, state.story]);

  useEffect(
    () =>
      onStoryRequest((request) => {
        if (request.type === 'ceremony') {
          setReplay(request.classIndex);
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
    if (notificationsSupported && !state.story.notificationsAsked) setAskNotify(true);
  };

  if (ceremony !== null) {
    return <Ceremony key={ceremony} classIndex={ceremony} onDone={(skipped) => finishCeremony(ceremony, skipped)} />;
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
