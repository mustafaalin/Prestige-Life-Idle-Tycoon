import { useEffect, useSyncExternalStore, type RefObject } from 'react';

// Where the bottom menu starts on screen, so the scene keeps what it draws for tapping (bottles, cans)
// above it. The menu's height changes with the phone (safe area, font size) and with the dreams row,
// so it is measured, not assumed (telefon testi 2026-10-21: bottles sat behind the buttons).

let menuTop = Number.POSITIVE_INFINITY;
const listeners = new Set<() => void>();

function setMenuTop(top: number) {
  if (top === menuTop) return;
  menuTop = top;
  listeners.forEach((listener) => listener());
}

/** Measures the menu element's top (viewport px) while it is mounted. */
export function useMeasureMenuTop(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setMenuTop(element.getBoundingClientRect().top);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      setMenuTop(Number.POSITIVE_INFINITY);
    };
  }, [ref]);
}

/** The menu's top in viewport px; Infinity while no menu is on screen. */
export function useMenuTop() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => menuTop,
  );
}
