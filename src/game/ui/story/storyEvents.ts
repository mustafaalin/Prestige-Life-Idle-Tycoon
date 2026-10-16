import type { LifeMomentId } from '../../runtime/story';

// Dev menu → story director: replay a ceremony or a life moment, or show Mom's next message, without
// playing up to it. Also "Hand over now" (family tab) → the skipped years pass on screen.

type Request =
  | { type: 'ceremony'; classIndex: number }
  | { type: 'life'; id: LifeMomentId }
  | { type: 'mom' }
  | { type: 'years'; fromAge: number };

const listeners = new Set<(request: Request) => void>();

export function onStoryRequest(listener: (request: Request) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestCeremony(classIndex: number) {
  listeners.forEach((listener) => listener({ type: 'ceremony', classIndex }));
}

export function requestLifeMoment(id: LifeMomentId) {
  listeners.forEach((listener) => listener({ type: 'life', id }));
}

export function requestMomMessage() {
  listeners.forEach((listener) => listener({ type: 'mom' }));
}

/** The years skipped by "Hand over now", from the age the hero had. */
export function requestYearsPassed(fromAge: number) {
  listeners.forEach((listener) => listener({ type: 'years', fromAge }));
}
