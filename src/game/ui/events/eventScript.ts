import { EVENT_CARDS, type EventKind, type EventOutcome } from '../../core/config/events';
import type { MessageKey } from '../../i18n/translate';
import { managerKey, managerPortrait } from '../businesses/managers';
import { FACES, portraitOf, type CastId } from '../story/ceremonyScript';

// Who calls with each event card (core/config/events.ts) and with which face. People with expression
// portraits change face with the outcome; managers keep their one portrait. Names are the ones the
// player already knows them by. A pick card's reply is spoken with the 'win' face.

type Faced = keyof typeof FACES;
type Speaker =
  | {
      [C in Faced]: {
        cast: C;
        name: MessageKey;
        ask: (typeof FACES)[C][number];
        win: (typeof FACES)[C][number];
        lose: (typeof FACES)[C][number];
      };
    }[Faced]
  | { manager: string };

const RIZA: Speaker = { cast: 'riza', name: managerKey('flower-stand', 'name', 'old'), ask: 'warm', win: 'laugh', lose: 'concerned' };
const BRYCE: Speaker = { cast: 'bryce', name: managerKey('hotel', 'name', 'old'), ask: 'sly', win: 'smug', lose: 'shocked' };
const NEVIN: Speaker = { cast: 'nevin', name: 'ceremony.cast.nevin', ask: 'smile', win: 'laugh', lose: 'surprised' };
const DEFNE: Speaker = { cast: 'defne', name: 'ceremony.cast.defne', ask: 'smile', win: 'laugh', lose: 'surprised' };
/** The cousin runs the Tech Startup later; his own calls show his manager portrait. */
const COUSIN: Speaker = { manager: 'tech-startup' };

/** Old Ray and Mr. Bryce speak with their faces on their business's cards; everyone else's card is told
 * here. A card left out is its business's manager. */
const BY_BUSINESS: Record<string, Speaker> = { 'flower-stand': RIZA, hotel: BRYCE };
const BY_CARD: Record<string, Speaker> = {
  fair: NEVIN,
  nevincookies: NEVIN,
  nevingarden: NEVIN,
  library: DEFNE,
  album: DEFNE,
  birthday: DEFNE,
  coin: COUSIN,
  cousincar: COUSIN,
};

function speakerOf(cardId: string): Speaker {
  const businessId = EVENT_CARDS.find((card) => card.id === cardId)?.businessId;
  return BY_CARD[cardId] ?? (businessId ? (BY_BUSINESS[businessId] ?? { manager: businessId }) : COUSIN);
}

export function eventSpeaker(cardId: string, moment: 'ask' | EventOutcome): { name: MessageKey; portrait: string } {
  const speaker = speakerOf(cardId);
  if ('manager' in speaker) {
    return {
      name: managerKey(speaker.manager, 'name', 'old'),
      portrait: managerPortrait(speaker.manager, 'old'),
    };
  }
  // The safe answer leaves the caller as they were.
  const face = moment === 'win' ? speaker.win : moment === 'lose' ? speaker.lose : speaker.ask;
  return {
    name: speaker.name,
    portrait: portraitOf(speaker.cast as CastId, face) ?? '',
  };
}

/** A choice card has ask, safe, bold, win, lose; a thank-you only ask; a pick ask, a, b and a reply to each. */
type CardLine = 'ask' | 'safe' | 'bold' | 'win' | 'lose' | 'a' | 'b' | 'aReply' | 'bReply';

export const eventKind = (cardId: string): EventKind => EVENT_CARDS.find((card) => card.id === cardId)?.kind ?? 'choice';

export const eventKey = (cardId: string, line: CardLine) => `events.cards.${cardId}.${line}` as MessageKey;

// Dev menu → the next call comes right away.
const listeners = new Set<() => void>();

export function requestEventCard() {
  listeners.forEach((listener) => listener());
}

export function onEventCardRequest(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
