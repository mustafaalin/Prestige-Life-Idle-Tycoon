import { useSyncExternalStore } from 'react';

// Guide lines on screen right now (Guide.tsx GuideLine): the hero's own remark waits while someone
// talks (scene/heroQuips.ts), so the two bubbles never meet over his head.

let linesOpen = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Counts a line in while it is mounted (an effect with no dependencies). */
export function lineOpened() {
  linesOpen += 1;
  notify();
  return () => {
    linesOpen -= 1;
    notify();
  };
}

/** Whether a guide's line is on screen. */
export function useGuideLineOpen() {
  return useSyncExternalStore(subscribe, () => linesOpen > 0);
}
