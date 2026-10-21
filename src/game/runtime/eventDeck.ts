// Who calls next (config/events.ts): the cards are dealt like a deck, so every caller who can call
// has called before anyone calls again (2026-10-21: with ten cards the same few rang again and again).
// No daily limit: a long session gets a call every few minutes (user, 2026-10-21).

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

/** The cards heard after `cardId` was answered: a round ends when every available card was heard. */
export function afterAnswer(heard: string[], cardId: string, available: string[]): string[] {
  const next = heard.includes(cardId) ? heard : [...heard, cardId];
  return available.every((id) => next.includes(id)) ? [] : next;
}
