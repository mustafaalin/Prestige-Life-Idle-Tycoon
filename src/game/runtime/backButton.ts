import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

// Android back button. Open UI layers (sheets, modals, a non-home tab) register a handler with a
// layer number that matches their z-index; back goes to the highest layer, the newest one on ties.
// With nothing open, the first back shows "press again" (ExitHint) and a second one within
// EXIT_WINDOW_MS sends the app to the background instead of closing it (phone test, 2026-10-15).

interface Entry {
  layer: number;
  handle: () => void;
}

const entries: Entry[] = [];

const EXIT_WINDOW_MS = 2000;
let exitArmedAt = 0;
const exitHintListeners = new Set<() => void>();

/** The first back on the home screen: show the "press again to exit" hint. */
export function onExitHint(listener: () => void) {
  exitHintListeners.add(listener);
  return () => {
    exitHintListeners.delete(listener);
  };
}

export const EXIT_HINT_MS = EXIT_WINDOW_MS;

function topEntry() {
  let top: Entry | null = null;
  for (const entry of entries) {
    if (!top || entry.layer >= top.layer) top = entry;
  }
  return top;
}

/** Installs the native listener once at boot; returns the remove function. */
export function installBackButton(): () => void {
  if (Capacitor.getPlatform() !== 'android') return () => {};
  const handle = App.addListener('backButton', () => {
    const top = topEntry();
    if (top) {
      exitArmedAt = 0;
      top.handle();
    } else if (Date.now() - exitArmedAt < EXIT_WINDOW_MS) {
      exitArmedAt = 0;
      App.minimizeApp().catch(() => {});
    } else {
      exitArmedAt = Date.now();
      exitHintListeners.forEach((listener) => listener());
    }
  });
  return () => {
    handle.then((h) => h.remove()).catch(() => {});
  };
}

/** While `active`, the back button calls `onBack` (if no higher layer is open). */
export function useBackButton(active: boolean, layer: number, onBack: () => void) {
  const latest = useRef(onBack);

  useEffect(() => {
    latest.current = onBack;
  });

  useEffect(() => {
    if (!active) return;
    const entry: Entry = { layer, handle: () => latest.current() };
    entries.push(entry);
    return () => {
      entries.splice(entries.indexOf(entry), 1);
    };
  }, [active, layer]);
}
