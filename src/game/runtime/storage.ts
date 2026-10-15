import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { CAREERS } from '../core/config/careers';
import { WEALTH_CLASSES } from '../core/config/classes';
import { HOUSES, LEGACY_HOUSE_TO_HOME } from '../core/config/housing';
import { LIFE_SECONDS } from '../core/config/life';
import { legacyOutfitIndex, legacyVehicleCount, LIFESTYLE_ITEMS, OUTFITS, VEHICLES } from '../core/config/lifestyle';
import { RICH_MILESTONES } from '../core/config/richList';
import { UPGRADES } from '../core/config/upgrades';
import { classIndexFor } from '../core/formulas';
import { applyClassFloors, createInitialState } from '../core/state';
import type { GameStateV2 } from '../core/types';
import { createAdProgress, type AdProgress } from './adRewards';
import { createRuntimeState, emptyCycles, type CycleState, type PendingOffline, type RuntimeState } from './engine';
import { createDailyProgress, type DailyProgress } from './daily';
import { createInvestProgress, type InvestProgress } from './investment';
import { investPlan } from '../core/config/investments';
import { createPurchaseProgress, withAccessories, type PurchaseProgress } from './purchases';
import { createStoryProgress, HERO_NAME_MAX, LIFE_MOMENT_IDS, MOM_MESSAGES, type StoryProgress } from './story';

// Local save for v2. Separate key from v1 so both games can live side by side until v1 is removed.
// On phones the save lives in Preferences (SharedPreferences / UserDefaults): the OS may clear a
// WebView's localStorage. localStorage keeps a copy as the synchronous web fallback.
//
// Players' saves must survive every update (docs/session-handoff.md, "Kayıt uyumluluğu"): never
// rename or remove a saved id without a legacy map here, give new fields defaults in normalize*(),
// and bump SAVE_SCHEMA only together with a step in migrate(). A save that cannot be read is kept
// under BACKUP_KEY before a new life starts, so a bug never loses it for good.

export const STORAGE_KEY = 'prestige_life_v2';
const BACKUP_KEY = 'prestige_life_v2_unreadable';
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

const knownUpgrades = new Set(UPGRADES.map((upgrade) => upgrade.id));

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : [];
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
  // Saves from before the four story outfits: the best old outfit becomes the closest new one.
  const oldOutfit = Math.max(0, ...savedIds.map((id) => Number(/^outfit-(\d+)$/.exec(id)?.[1] ?? 0)));
  const legacyOutfits = OUTFITS.slice(0, legacyOutfitIndex(oldOutfit) + 1).map((outfit) => outfit.id);
  // Saves from before the story vehicles (16 old ones): the best old vehicle becomes as many new ones as keep its bonus.
  const oldVehicle = Math.max(0, ...savedIds.map((id) => Number(/^vehicle-(\d+)$/.exec(id)?.[1] ?? 0)));
  const legacyVehicles = VEHICLES.slice(0, legacyVehicleCount(oldVehicle)).map((vehicle) => vehicle.id);

  const houseIds = HOUSES.map((house) => house.id);
  const buyable = new Set(HOUSES.filter((house) => house.buyCost !== null).map((house) => house.id));
  // Saves from before the 12 homes name one of the 25 old houses (housing.ts).
  const homeId = (id: unknown) => (typeof id === 'string' ? (LEGACY_HOUSE_TO_HOME[id] ?? id) : undefined);
  const homesOwned = Array.isArray(raw.homesOwned)
    ? [...new Set(raw.homesOwned.map(homeId).filter((id): id is string => id !== undefined && buyable.has(id)))]
    : [];
  // Saves from before the housing model kept houses in lifestyleOwned: move into the best one, rented.
  const legacyHome = houseIds.filter((id) => savedIds.map(homeId).includes(id)).pop();
  const savedHome = homeId(raw.home);
  const home = savedHome !== undefined && houseIds.includes(savedHome) ? savedHome : (legacyHome ?? base.home);

  const generationEarnings = finite(raw.generationEarnings, 0);
  const savedClass = Math.min(Math.floor(finite(raw.classIndex, 0)), WEALTH_CLASSES.length - 1);

  // A class reached before the class homes and outfits existed still gets them.
  return applyClassFloors({
    version: 2,
    cash: finite(raw.cash, base.cash),
    generationEarnings,
    totalEarnings: Math.max(finite(raw.totalEarnings, 0), generationEarnings),
    generation: Math.floor(finite(raw.generation, 1, 1)),
    legacyPoints: Math.floor(finite(raw.legacyPoints, 0)),
    businesses,
    careerIndex: Math.min(Math.floor(finite(raw.careerIndex, -1, -1)), CAREERS.length - 1),
    lifestyleOwned: [...new Set([...base.lifestyleOwned, ...legacyOutfits, ...legacyVehicles, ...savedItems])],
    home,
    homesOwned,
    classIndex: Math.max(savedClass, classIndexFor(generationEarnings)),
    // Saves from before the life clock start at 17.
    lifeSeconds: Math.min(finite(raw.lifeSeconds, 0), LIFE_SECONDS),
    // Saves from before upgrades and goals start with none.
    upgrades: stringList(raw.upgrades).filter((id) => knownUpgrades.has(id)),
    questsDone: stringList(raw.questsDone),
    bottles: Math.floor(finite(raw.bottles, 0)),
    finds: Math.floor(finite(raw.finds, 0)),
    // Set from the purchases right after (parseRuntime); saves from before 2026-10-15 have none.
    accessoryMultiplier: 1,
  });
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

const knownMomMessages = new Set(MOM_MESSAGES.map((message) => message.id));
const knownLifeMoments = new Set<string>(LIFE_MOMENT_IDS);
const knownRichMoments = new Set<string>(RICH_MILESTONES.map((milestone) => milestone.id));

/** Saves from before the ceremonies count every class reached as seen, so nobody gets a flood of them. */
function normalizeStory(raw: unknown, game: GameStateV2): StoryProgress {
  if (!isRecord(raw)) return createStoryProgress(game.classIndex);
  return {
    ceremonySeen: Math.min(Math.floor(finite(raw.ceremonySeen, game.classIndex)), game.classIndex),
    momSeen: stringList(raw.momSeen).filter((id) => knownMomMessages.has(id)),
    momShownAt: finite(raw.momShownAt, 0),
    notificationsAsked: raw.notificationsAsked === true,
    heroName: typeof raw.heroName === 'string' ? raw.heroName.trim().slice(0, HERO_NAME_MAX) : '',
    lifeSeen: stringList(raw.lifeSeen).filter((id) => knownLifeMoments.has(id)),
    daughterName: typeof raw.daughterName === 'string' ? raw.daughterName.trim().slice(0, HERO_NAME_MAX) : '',
    guideSeen: stringList(raw.guideSeen),
    guideDone: stringList(raw.guideDone),
    eventAnsweredAt: finite(raw.eventAnsweredAt, 0),
    richSeen: stringList(raw.richSeen).filter((id) => knownRichMoments.has(id)),
    reviewAsks: Math.floor(finite(raw.reviewAsks, 0)),
    reviewAskedAt: finite(raw.reviewAskedAt, 0),
  };
}

/** Saves from before the ad placements start with no boost and ads still locked. */
function normalizeAds(raw: unknown): AdProgress {
  const base = createAdProgress();
  if (!isRecord(raw)) return base;
  return {
    boostUntil: finite(raw.boostUntil, 0),
    day: typeof raw.day === 'string' ? raw.day : '',
    boostsToday: Math.floor(finite(raw.boostsToday, 0)),
    helpsToday: Math.floor(finite(raw.helpsToday, 0)),
    returned: raw.returned === true,
  };
}

/**
 * Saves from before the store start with nothing bought; the store's restore fills it in. Owned ids
 * are kept even when a product is no longer on sale (config/iap.ts PRODUCT_LIST): what was paid for
 * is never dropped.
 */
function normalizePurchases(raw: unknown): PurchaseProgress {
  const base = createPurchaseProgress();
  if (!isRecord(raw)) return base;
  return {
    owned: [...new Set(stringList(raw.owned))],
    offersFrom: finite(raw.offersFrom, 0),
    offerCardShown: raw.offerCardShown === true,
  };
}

/** Saves from before the daily reward (2026-10-15) start on its first day, nothing waiting. */
function normalizeDaily(raw: unknown): DailyProgress {
  const base = createDailyProgress();
  if (!isRecord(raw)) return base;
  const offer = isRecord(raw.offer) ? raw.offer : null;
  const amount = offer ? finite(offer.amount, 0) : 0;
  return {
    claimed: Math.floor(finite(raw.claimed, 0)),
    claimedDay: typeof raw.claimedDay === 'string' ? raw.claimedDay : '',
    offer:
      offer && amount > 0 && typeof offer.day === 'string'
        ? { day: offer.day, months: finite(offer.months, 0), amount }
        : null,
  };
}

/** Saves from before the investment account (2026-10-15) have none running. A deal is never dropped: its money is the player's. */
function normalizeInvest(raw: unknown): InvestProgress {
  const base = createInvestProgress();
  if (!isRecord(raw)) return base;
  const active = isRecord(raw.active) ? raw.active : null;
  const plan = active && typeof active.planId === 'string' ? investPlan(active.planId) : undefined;
  const stake = active ? finite(active.stake, 0) : 0;
  return {
    active:
      active && plan && stake > 0
        ? {
            planId: plan.id,
            stake,
            payout: finite(active.payout, stake),
            startedAt: finite(active.startedAt, 0),
            until: finite(active.until, 0),
          }
        : null,
    made: Math.floor(finite(raw.made, 0)),
  };
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

/** Keeps a save that could not be read, so a fix in a later update can still bring it back. */
function keepUnreadable(text: string) {
  try {
    localStorage.setItem(BACKUP_KEY, text);
  } catch {
    // Storage full or blocked.
  }
  if (native) void Preferences.set({ key: BACKUP_KEY, value: text }).catch(() => undefined);
}

/**
 * Brings an older save file up to SAVE_SCHEMA, one step per schema. A file from a newer app (the
 * player went back a version) is read as it is: normalize*() drops what this version does not know.
 */
function migrate(file: Raw): Raw | null {
  const schema = finite(file.schema, 0);
  if (schema < 1 || !isRecord(file.runtime)) return null;
  // Add steps here when SAVE_SCHEMA goes up: if (schema < 2) file = { ...file, schema: 2, runtime: ... }.
  return file;
}

/** Builds the runtime from save text, or starts a new life. Never throws. */
export function parseRuntime(text: string | null, now: number): RuntimeState {
  if (!text) return createRuntimeState(now);
  try {
    const parsed: unknown = JSON.parse(text);
    const file = isRecord(parsed) ? migrate(parsed) : null;
    if (!file || !isRecord(file.runtime)) {
      keepUnreadable(text);
      return createRuntimeState(now);
    }
    const runtime = file.runtime;
    const purchases = normalizePurchases(runtime.purchases);
    const game = withAccessories(normalizeGame(runtime.game), purchases);
    return {
      game,
      cycles: normalizeCycles(runtime.cycles),
      offline: normalizeOffline(runtime.offline),
      // A clock set forward and back again must not count as time away.
      lastActiveAt: Math.min(finite(runtime.lastActiveAt, now), now),
      story: normalizeStory(runtime.story, game),
      ads: normalizeAds(runtime.ads),
      purchases,
      daily: normalizeDaily(runtime.daily),
      invest: normalizeInvest(runtime.invest),
    };
  } catch {
    keepUnreadable(text);
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
