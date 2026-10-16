import type { EventOutcome } from '../../core/config/events';
import type { MessageKey } from '../../i18n/translate';
import { managerKey, managerPortrait } from '../businesses/managers';
import { FACES, portraitOf, type CastId } from '../story/ceremonyScript';

// Who calls with each event card (core/config/events.ts) and with which face. People with expression
// portraits change face with the outcome; managers keep their one portrait. Names are the ones the
// player already knows them by.

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

const SPEAKERS: Record<string, Speaker> = {
  wedding: {
    cast: 'riza',
    name: managerKey('flower-stand', 'name', 'old'),
    ask: 'warm',
    win: 'laugh',
    lose: 'concerned',
  },
  fair: {
    cast: 'nevin',
    name: 'ceremony.cast.nevin',
    ask: 'smile',
    win: 'laugh',
    lose: 'surprised',
  },
  coin: { manager: 'tech-startup' },
  festival: { manager: 'coffee-cart' },
  bun: { manager: 'bakery' },
  film: { manager: 'car-wash' },
  neighbor: { manager: 'mini-market' },
  celebrity: { manager: 'beauty-salon' },
  ducks: { manager: 'logistics-warehouse' },
  cake: {
    cast: 'bryce',
    name: managerKey('hotel', 'name', 'old'),
    ask: 'sly',
    win: 'smug',
    lose: 'shocked',
  },
};

export function eventSpeaker(cardId: string, moment: 'ask' | EventOutcome): { name: MessageKey; portrait: string } {
  const speaker = SPEAKERS[cardId];
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

type CardLine = 'ask' | 'safe' | 'bold' | 'win' | 'lose';

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
