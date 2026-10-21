import { EVENT_DAILY_MAX } from '../core/config/events';
import { dayKey } from './adRewards';
import type { StoryProgress } from './story';

// Who calls next (config/events.ts): the cards are dealt like a deck, so every caller who can call
// has called before anyone calls again, and a day has at most EVENT_DAILY_MAX calls. With ten cards
// the same few callers rang again and again (discussion-notes §3, 2026-10-21).

type DeckProgress = Pick<StoryProgress, 'eventsHeard' | 'eventDay' | 'eventsToday'>;

/** Calls still to come today. */
export function callsLeftToday(story: DeckProgress, now: number) {
  return story.eventDay === dayKey(now) ? Math.max(0, EVENT_DAILY_MAX - story.eventsToday) : EVENT_DAILY_MAX;
}

/**
 * The next caller among `available` (the cards that can call now): one not heard in this round,
 * never the last one twice in a row unless no one else can call. Null when nobody can.
 */
export function nextCaller(available: string[], heard: string[], last: string | null, random = Math.random): string | null {
  const fresh = available.filter((id) => !heard.includes(id) && id !== last);
  const others = available.filter((id) => id !== last);
  const pool = fresh.length > 0 ? fresh : others.length > 0 ? others : available;
  return pool.length > 0 ? pool[Math.floor(random() * pool.length)] : null;
}

/** The deck after `cardId` was answered: a round ends when every available card was heard. */
export function afterAnswer(story: DeckProgress, cardId: string, available: string[], now: number): DeckProgress {
  const heard = story.eventsHeard.includes(cardId) ? story.eventsHeard : [...story.eventsHeard, cardId];
  const day = dayKey(now);
  return {
    eventsHeard: available.every((id) => heard.includes(id)) ? [] : heard,
    eventDay: day,
    eventsToday: (story.eventDay === day ? story.eventsToday : 0) + 1,
  };
}
