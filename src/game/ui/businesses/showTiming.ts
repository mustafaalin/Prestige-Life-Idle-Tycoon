import { useEffect, useState, useSyncExternalStore } from 'react';

// Timing for the short shows (a business growing, a manager joining, a new job): steps on a timeline
// that a tap can jump to the end of, and numbers that count up.

/** When each step of a show begins, in ms from the start; the last step is the finished card. */
export type Timeline = readonly number[];

const COUNT_MS = 900;

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// Shows on screen right now: Old Ray's guide waits while one plays, so his line is not lost under it.
let showsOpen = 0;
const showListeners = new Set<() => void>();
const subscribeShows = (listener: () => void) => {
  showListeners.add(listener);
  return () => showListeners.delete(listener);
};

/** Whether a show is on screen. */
export function useShowOpen() {
  return useSyncExternalStore(subscribeShows, () => showsOpen > 0);
}

/** The step a show has reached; `skip` jumps to the last one. */
export function useShowStep(steps: Timeline) {
  const last = steps.length - 1;
  useEffect(() => {
    showsOpen += 1;
    showListeners.forEach((listener) => listener());
    return () => {
      showsOpen -= 1;
      showListeners.forEach((listener) => listener());
    };
  }, []);
  const [step, setStep] = useState(() => (reducedMotion() ? last : 0));
  useEffect(() => {
    if (step >= last) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), steps[step + 1] - steps[step]);
    return () => window.clearTimeout(timer);
  }, [step, steps, last]);
  return { step, done: step >= last, skip: () => setStep(last) };
}

/** A number running from `from` to `to` once `active`; at once when `instant`. */
export function useCountUp(from: number, to: number, active: boolean, instant: boolean) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!active) return;
    if (instant) {
      setValue(to);
      return;
    }
    const began = performance.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - began) / COUNT_MS);
      setValue(from + (to - from) * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to, active, instant]);
  return value;
}
