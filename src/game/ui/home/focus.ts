import { useSyncExternalStore } from 'react';
import type { LifestyleKind } from '../../core/types';
import type { TabId } from './tabs';

// "Go" from a goal (plan 1.12): opens the right tab, scrolls to the button the goal needs and makes it
// glow with a pointing hand for a few seconds. Screens mark those buttons with <Focusable> (Focusable.tsx).

export type ShopTabId = 'house' | LifestyleKind;

export interface FocusTarget {
  tab: TabId;
  shopTab?: ShopTabId;
  /** Which <Focusable> to light up, e.g. "business:flower-stand:buy". */
  key: string;
}

interface Focus {
  target: FocusTarget;
  /** Changes on every "Go", so the same target can be shown again. */
  id: number;
}

/** How long the glow stays if the player doesn't tap it. */
const FOCUS_MS = 5000;

let current: Focus | null = null;
let nextId = 1;
let timer: number | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showFocus(target: FocusTarget) {
  current = { target, id: nextId++ };
  window.clearTimeout(timer);
  timer = window.setTimeout(clearFocus, FOCUS_MS);
  emit();
}

export function clearFocus() {
  if (!current) return;
  current = null;
  emit();
}

export function useFocus() {
  return useSyncExternalStore(subscribe, () => current);
}
