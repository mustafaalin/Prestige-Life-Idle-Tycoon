// Dev menu → story director: replay a ceremony or show Mom's next message without playing up to it.

type Request = { type: 'ceremony'; classIndex: number } | { type: 'mom' };

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

export function requestMomMessage() {
  listeners.forEach((listener) => listener({ type: 'mom' }));
}
