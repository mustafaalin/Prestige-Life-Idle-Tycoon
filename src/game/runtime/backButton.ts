import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useRef } from 'react';

// Android back button. Open UI layers (sheets, modals, a non-home tab) register a handler with a
// layer number that matches their z-index; back goes to the highest layer, the newest one on ties.
// With nothing open, back sends the app to the background instead of closing it.

interface Entry {
  layer: number;
  handle: () => void;
}

const entries: Entry[] = [];

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
    if (top) top.handle();
    else App.minimizeApp().catch(() => {});
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
