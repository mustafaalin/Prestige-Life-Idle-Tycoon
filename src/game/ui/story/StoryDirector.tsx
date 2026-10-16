import { STORY_GIFT_FROM_CLASS } from '../../core/config/economy';
import { RETIREMENT_AGE } from '../../core/config/life';
import { useEffect, useRef, useState } from 'react';
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
  grandchildNeedsName,
  LIFE_MOMENT_GAP_MS,
  LIFE_MOMENTS,
  luxuryMomentsBelow,
  MOM_MESSAGES,
  MOM_MIN_GAP_MS,
  momMessageOnReturn,
  nameNeeded,
  nextMomMessage,
  pendingCeremony,
  pendingLifeMoment,
  pendingRichMoment,
  type LifeMomentId,
} from '../../runtime/story';
import { useGameV2, useGameV2Events } from '../../runtime/useGameV2';
import { adsUnlocked } from '../../runtime/adRewards';
import { offerCardDue } from '../../runtime/purchases';
import { requestReview, reviewDue } from '../../runtime/review';
import { RichMoment } from '../richList/RichList';
import { COINS_LAND_MS } from '../home/coins';
import { DailyCard } from '../home/DailyCard';
import { OfferCard } from '../shop/OfferCard';
import { Ceremony, LifeMoment } from './Ceremony';
import { portraitOf } from './ceremonyScript';
import { MomMessage, NotifyPrompt } from './MomMessage';
import { NameSheet } from './NameSheet';
import { onStoryRequest } from './storyEvents';
import { YearsPassed } from './YearsPassed';

// Decides which story moment is on screen (story-v2.md §4): a waiting class-up ceremony first, then a
// life moment whose age has come (§4c), then (after the offline card) the day's reward, then Mom's
// message on a return session, and once, after the first ceremony, the reminder opt-in. A new place on the Rich List
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
  onOpenStore,
}: {
  tabOpen: boolean;
  hold?: boolean;
  onOpenRichList: () => void;
  onOpenStore: () => void;
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
  // "Hand over now": the age the hero had, while the skipped years pass on screen.
  const [yearsFrom, setYearsFrom] = useState<number | null>(null);
  // The offline card was just collected: its coins are still flying to the wallet, so the next card waits.
  const [landing, setLanding] = useState(false);
  const offlineOpen = state.offline !== null;
  const wasOffline = useRef(offlineOpen);
  useEffect(() => {
    if (wasOffline.current && !offlineOpen) setLanding(true);
    wasOffline.current = offlineOpen;
  }, [offlineOpen]);
  useEffect(() => {
    if (!landing) return;
    const timer = window.setTimeout(() => setLanding(false), COINS_LAND_MS);
    return () => window.clearTimeout(timer);
  }, [landing]);

  // `hold`: the family album is playing a moment again; a new one waits until it is over.
  const ceremony = hold || yearsFrom !== null ? null : (replay ?? pendingCeremony(game, state.story));
  // At the end of life the last moments (grandchild, grandpa, hand-over) play one after another before
  // the retirement panel; during a life one story beat at a time.
  const ending = isLifeOver(game);
  // A life moment never cuts into a shop sheet, a card or an open name question: it waits for the home scene.
  const calm = ceremony === null && yearsFrom === null && !landing && !tabOpen && !state.offline && !mom && !askNotify;
  const lifeCanPlay = calm && !nameNeeded(state.story) && (ending || !quiet);
  const life = hold ? null : (replayLife ?? (lifeCanPlay ? (pendingLifeMoment(game, state.story)?.id ?? null) : null));
  const playing = ceremony !== null || life !== null;
  // The lighter cards wait for a quiet moment of a life still going.
  const extrasCanPlay = lifeCanPlay && !quiet && !ending && life === null;
  const rich = extrasCanPlay ? pendingRichMoment(game, state.story) : null;
  // The welcome card for the limited offer: once, at a quiet moment with nothing else on screen.
  const offer = extrasCanPlay && rich === null && offerCardDue(state, Date.now());

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
        } else if (request.type === 'years') {
          setYearsFrom(request.fromAge);
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
    const deal = state.invest.active;
    const invest = deal
      ? { title: t('ceremony.cast.riza'), body: t('invest.notifyBody'), at: Math.max(now, deal.until) }
      : null;
    // The day's reward: from tomorrow morning, once rewards are offered at all (runtime/daily.ts).
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const daily = adsUnlocked(state)
      ? { title: t('notify.dailyTitle'), body: t('notify.dailyBody'), at: tomorrow.getTime() }
      : null;
    // At the end of life only the heir writes: nothing else moves until the hand-over.
    if (isLifeOver(game)) {
      const heir = state.story.grandchildName || t('moments.grandchildDefault');
      void scheduleReminders(
        { retire: { title: t('life.title'), body: t('notify.retireBody', { name: heir }), at: now + 3 * 3600 * 1000 } },
        t('notify.channel'),
      );
      return;
    }
    void scheduleReminders({ lucky, mom: momReminder, invest, daily }, t('notify.channel'));
  }

  const finishCeremony = (classIndex: number, skipped: boolean, giftMultiplier?: number) => {
    track('story_view', { kind: 'ceremony', class_index: classIndex, skipped, replay: replay !== null });
    if (replay !== null) {
      setReplay(null);
      return;
    }
    actions.story.ceremonySeen(classIndex, giftMultiplier);
    // A happy moment (Millionaire and after): the store's rating dialog, once the card is gone.
    if (reviewDue(state.story, state.ads, classIndex, Date.now())) {
      actions.story.reviewAsked();
      window.setTimeout(() => void requestReview(classIndex), 900);
    }
    setQuiet(true);
    if (notificationsSupported && !state.story.notificationsAsked) setAskNotify(true);
  };

  const finishLife = (id: LifeMomentId, skipped: boolean, giftMultiplier?: number) => {
    track('story_view', { kind: 'life', id, skipped, replay: replayLife !== null });
    if (replayLife !== null) {
      setReplayLife(null);
      return;
    }
    actions.story.lifeSeen([...luxuryMomentsBelow(id), id], giftMultiplier);
    setQuiet(true);
  };

  if (hold) return null;

  if (yearsFrom !== null) {
    return <YearsPassed from={yearsFrom} to={RETIREMENT_AGE} onDone={() => setYearsFrom(null)} />;
  }

  if (ceremony !== null) {
    const step = replay !== null ? storyStep(ceremony) : { before: actions.story.classUpFrom(ceremony), now: game };
    return (
      <Ceremony
        key={ceremony}
        classIndex={ceremony}
        {...step}
        gift={replay === null && ceremony >= STORY_GIFT_FROM_CLASS}
        onDone={(skipped, giftMultiplier) => finishCeremony(ceremony, skipped, giftMultiplier)}
      />
    );
  }

  if (life !== null) {
    // The moments told by age close with a gift; the luxury moments follow a purchase and do not, and
    // nothing does once the life is over (the money would only go to the heir's legacy by a hair).
    const gift = replayLife === null && !ending && LIFE_MOMENTS.some((moment) => moment.id === life && moment.gift !== false);
    return <LifeMoment key={life} id={life} gift={gift} onDone={(skipped, giftMultiplier) => finishLife(life, skipped, giftMultiplier)} />;
  }

  // Right after the birth; also on the next opening if the app closed before she was named.
  if (daughterNeedsName(state.story) && !state.offline && !landing) {
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

  // The heir is named the same way, by her mother.
  if (grandchildNeedsName(state.story) && !state.offline && !landing) {
    return (
      <NameSheet
        speaker={state.story.daughterName || t('moments.defaultName')}
        portrait={portraitOf('elif', 'smile')}
        tone="emerald"
        question={t('moments.grandchildAsk')}
        label={t('moments.grandchildLabel')}
        defaultName={t('moments.grandchildDefault')}
        confirm={t('moments.nameOk')}
        onDone={(name) => {
          actions.story.setGrandchildName(name);
          track('grandchild_named', { is_default: name === t('moments.grandchildDefault') });
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

  // The day's reward: after the offline card and any story beat of this opening, before the lighter cards.
  if (extrasCanPlay && state.daily.offer) {
    return <DailyCard offer={state.daily.offer} onCollected={() => setQuiet(true)} />;
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

  if (offer) {
    const done = (look: boolean) => {
      actions.purchases.offerCardShown();
      track('offer_card', { opened: look });
      setQuiet(true);
      if (look) onOpenStore();
    };
    return <OfferCard onLook={() => done(true)} onLater={() => done(false)} />;
  }

  if (mom && !state.offline && !landing) {
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
