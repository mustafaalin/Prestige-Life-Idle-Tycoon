import { useSyncExternalStore } from 'react';

// The look trial on the Businesses screen (docs/claude-design-implementation-prompt.md, step d).
// `a`: today's palette, calmer (flatter buttons, thinner edges, no outline on small text). `b`: the
// same layout in a navy frame with off-white cards; a preview only, picked from the dev menu.
// `classic`: the look every other screen has. The styles live in mobile.css under `[data-look]`.

export type Look = 'classic' | 'a' | 'b';

export const LOOKS: Look[] = ['classic', 'a', 'b'];
/** `b` never becomes the default without the user choosing it. */
const DEFAULT_LOOK: Look = 'a';
const STORAGE_KEY = 'prestige_life_v2_look';

const listeners = new Set<() => void>();

function read(): Look {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LOOKS.find((look) => look === saved) ?? DEFAULT_LOOK;
  } catch {
    return DEFAULT_LOOK;
  }
}

let current = read();

export function setLook(look: Look) {
  current = look;
  try {
    localStorage.setItem(STORAGE_KEY, look);
  } catch {
    // A preview choice; losing it is fine.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLook(): Look {
  return useSyncExternalStore(subscribe, () => current);
}
