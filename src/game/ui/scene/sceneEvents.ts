// Dev-menu hooks into the scene (the scene owns its timers; this only nudges them).

const findListeners = new Set<() => void>();

/** Makes Şans bring something right away. */
export function requestFind() {
  findListeners.forEach((listener) => listener());
}

export function onFindRequest(listener: () => void) {
  findListeners.add(listener);
  return () => {
    findListeners.delete(listener);
  };
}
