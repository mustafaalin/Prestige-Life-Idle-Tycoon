import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { CAREERS } from '../core/config/careers';
import { WEALTH_CLASSES } from '../core/config/classes';
import { HOUSES } from '../core/config/housing';
import { LIFE_SECONDS } from '../core/config/life';
import { LIFESTYLE_ITEMS } from '../core/config/lifestyle';
import { classIndexFor } from '../core/formulas';
import { createInitialState } from '../core/state';
import type { GameStateV2 } from '../core/types';
import { createRuntimeState, emptyCycles, type CycleState, type PendingOffline, type RuntimeState } from './engine';

// Local save for v2. Separate key from v1 so both games can live side by side until v1 is removed.
// On phones the save lives in Preferences (SharedPreferences / UserDefaults): the OS may clear a
// WebView's localStorage. localStorage keeps a copy as the synchronous web fallback.

export const STORAGE_KEY = 'prestige_life_v2';
const SAVE_SCHEMA = 1;

interface SaveFile {
  schema: number;
  savedAt: number;
  runtime: RuntimeState;
}

type Raw = Record<string, unknown>;

function isRecord(value: unknown): value is Raw {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finite(value: unknown, fallback: number, min = 0) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min ? value : fallback;
}

/** Rebuilds a game state from whatever was saved: unknown ids are dropped, new config entries get defaults. */
function normalizeGame(raw: unknown): GameStateV2 {
  const base = createInitialState();
  if (!isRecord(raw)) return base;

  const savedBusinesses = isRecord(raw.businesses) ? raw.businesses : {};
  const businesses = { ...base.businesses };
  for (const id of Object.keys(businesses)) {
    const saved = savedBusinesses[id];
    if (isRecord(saved)) businesses[id] = { owned: Math.floor(finite(saved.owned, 0)), managed: saved.managed === true };
  }

  const knownItems = new Set(LIFESTYLE_ITEMS.map((item) => item.id));
  const savedIds = Array.isArray(raw.lifestyleOwned)
    ? raw.lifestyleOwned.filter((id): id is string => typeof id === 'string')
    : [];
  const savedItems = savedIds.filter((id) => knownItems.has(id));

  const houseIds = HOUSES.map((house) => house.id);
  const buyable = new Set(HOUSES.filter((house) => house.buyCost !== null).map((house) => house.id));
  const homesOwned = Array.isArray(raw.homesOwned)
    ? [...new Set(raw.homesOwned.filter((id): id is string => typeof id === 'string' && buyable.has(id)))]
    : [];
  // Saves from before the housing model kept houses in lifestyleOwned: move into the best one, rented.
  const legacyHome = houseIds.filter((id) => savedIds.includes(id)).pop();
  const home =
    typeof raw.home === 'string' && houseIds.includes(raw.home) ? raw.home : (legacyHome ?? base.home);

  const generationEarnings = finite(raw.generationEarnings, 0);
  const savedClass = Math.min(Math.floor(finite(raw.classIndex, 0)), WEALTH_CLASSES.length - 1);

  return {
    version: 2,
    cash: finite(raw.cash, base.cash),
    generationEarnings,
    totalEarnings: Math.max(finite(raw.totalEarnings, 0), generationEarnings),
    generation: Math.floor(finite(raw.generation, 1, 1)),
    legacyPoints: Math.floor(finite(raw.legacyPoints, 0)),
    businesses,
    careerIndex: Math.min(Math.floor(finite(raw.careerIndex, -1, -1)), CAREERS.length - 1),
    lifestyleOwned: [...new Set([...base.lifestyleOwned, ...savedItems])],
    home,
    homesOwned,
    classIndex: Math.max(savedClass, classIndexFor(generationEarnings)),
    // Saves from before the life clock start at 17.
    lifeSeconds: Math.min(finite(raw.lifeSeconds, 0), LIFE_SECONDS),
  };
}

function normalizeCycles(raw: unknown): Record<string, CycleState> {
  const cycles = emptyCycles();
  if (!isRecord(raw)) return cycles;
  for (const id of Object.keys(cycles)) {
    const saved = raw[id];
    if (isRecord(saved)) {
      cycles[id] = { progress: Math.min(finite(saved.progress, 0), 0.999), running: saved.running === true };
    }
  }
  return cycles;
}

function normalizeOffline(raw: unknown): PendingOffline | null {
  if (!isRecord(raw)) return null;
  const amount = finite(raw.amount, 0);
  return amount > 0 ? { amount, awaySeconds: finite(raw.awaySeconds, 0) } : null;
}

const native = Capacitor.isNativePlatform();

function savedAtOf(text: string | null) {
  if (!text) return -1;
  try {
    const file: unknown = JSON.parse(text);
    return isRecord(file) ? finite(file.savedAt, 0) : -1;
  } catch {
    return -1;
  }
}

function readLocal() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Reads the newest save text from native storage and localStorage. Never throws. */
export async function readSave(): Promise<string | null> {
  const local = readLocal();
  if (!native) return local;
  let stored: string | null = null;
  try {
    stored = (await Preferences.get({ key: STORAGE_KEY })).value;
  } catch {
    // Native storage unavailable: fall back to the local copy.
  }
  return savedAtOf(local) > savedAtOf(stored) ? local : stored;
}

/** Builds the runtime from save text, or starts a new life. Never throws. */
export function parseRuntime(text: string | null, now: number): RuntimeState {
  try {
    if (!text) return createRuntimeState(now);
    const file: unknown = JSON.parse(text);
    if (!isRecord(file) || file.schema !== SAVE_SCHEMA || !isRecord(file.runtime)) return createRuntimeState(now);
    const runtime = file.runtime;
    return {
      game: normalizeGame(runtime.game),
      cycles: normalizeCycles(runtime.cycles),
      offline: normalizeOffline(runtime.offline),
      // A clock set forward and back again must not count as time away.
      lastActiveAt: Math.min(finite(runtime.lastActiveAt, now), now),
    };
  } catch {
    return createRuntimeState(now);
  }
}

// Native writes are async; only the newest pending save is written, one at a time, in order.
let nativeWriting = false;
let nativePending: string | null = null;

async function flushNative() {
  if (nativeWriting) return;
  nativeWriting = true;
  while (nativePending !== null) {
    const value = nativePending;
    nativePending = null;
    try {
      await Preferences.set({ key: STORAGE_KEY, value });
    } catch {
      // Keep playing; the next save will try again.
    }
  }
  nativeWriting = false;
}

export function saveRuntime(runtime: RuntimeState, now: number) {
  const file: SaveFile = { schema: SAVE_SCHEMA, savedAt: now, runtime };
  const text = JSON.stringify(file);
  try {
    localStorage.setItem(STORAGE_KEY, text);
  } catch {
    // Storage full or blocked (private mode): keep playing; the next save will try again.
  }
  if (native) {
    nativePending = text;
    void flushNative();
  }
}

/** Drops the local copy. The native save is not removed: a reset saves a fresh life right after. */
export function clearSave() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
