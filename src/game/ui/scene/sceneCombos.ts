import { WEALTH_CLASSES } from '../../core/config/classes';
import { HOUSES, RENT_ONLY_COUNT, FIRST_OWNED_HOME_CLASS } from '../../core/config/housing';
import { CLASS_OUTFIT_FLOOR, OUTFITS, VEHICLES } from '../../core/config/lifestyle';
import { classLook } from './stages';

// The scenes a first life can really show (scene board, sceneBoard.ts): walks the shop's and the
// class-ups' rules (core/state.ts) from the first day and keeps every home, parked vehicle, outfit and
// Şans collar that meet. Rules followed: vehicles and outfits are bought in order, a vehicle waits for
// its home, an outfit for its class, moving up needs every vehicle of the homes below, a class-up moves
// one home up (Millionaire: to the first home you can buy, with the skipped homes' vehicles) and gives
// the class's outfit. Money: what is spent on homes, vehicles and outfits stays under LIFESTYLE_SHARE of
// what the next class needs, the rest going into businesses. And a player is not left behind on the
// cheap: a next step costing under SURE_BUY_SHARE of what the class took to reach has been bought.

/** Share of the next class's threshold a player can spend on the shop before reaching it. */
const LIFESTYLE_SHARE = 0.5;

/** A next step costing under this share of the class's threshold has been bought by anyone in that class. */
const SURE_BUY_SHARE = 0.01;

/** The top class a first life reaches (npm run sim: Multibillionaire with ads, Richest never). */
const LAST_CLASS = 6;

/** The lowest class a hero of 60 can be in (npm run sim: the slowest player is a Millionaire by 23). */
export const GRANDPA_FROM_CLASS = 4;

export interface SceneCombo {
  home: number;
  /** Index into VEHICLES, or -1: nothing parked. */
  vehicle: number;
  /** Index into OUTFITS, or -1: the grandfather look. */
  outfit: number;
  /** The classes it can be seen in, lowest first. Şans's collar is the same for all of them. */
  classes: number[];
}

interface Node {
  classIndex: number;
  home: number;
  /** Bit per owned vehicle. */
  vehicles: number;
  outfit: number;
  spent: number;
}

const owns = (mask: number, index: number) => (mask & (1 << index)) !== 0;

function parked(node: Node) {
  let best = -1;
  VEHICLES.forEach((vehicle, index) => {
    if ((vehicle.home ?? 0) <= node.home && owns(node.vehicles, index)) best = index;
  });
  return best;
}

function classUp(node: Node): Node {
  const classIndex = node.classIndex + 1;
  const outfit = Math.max(node.outfit, CLASS_OUTFIT_FLOOR[classIndex]);
  if (classIndex !== FIRST_OWNED_HOME_CLASS) {
    return { ...node, classIndex, outfit, home: Math.min(HOUSES.length - 1, node.home + 1) };
  }
  const target = Math.min(HOUSES.length - 1, Math.max(node.home + 1, RENT_ONLY_COUNT));
  let vehicles = node.vehicles;
  VEHICLES.forEach((vehicle, index) => {
    const home = vehicle.home ?? 0;
    if (home > node.home && home < target) vehicles |= 1 << index;
  });
  return { ...node, classIndex, outfit, home: target, vehicles };
}

/** The shop's next steps from here, whatever they cost: the next vehicle, the next outfit, the next home. */
function shopSteps(node: Node): { cost: number; next: Node }[] {
  const steps: { cost: number; next: Node }[] = [];
  const vehicle = VEHICLES.findIndex((_, index) => !owns(node.vehicles, index));
  if (vehicle >= 0 && (VEHICLES[vehicle].home ?? 0) <= node.home) {
    steps.push({ cost: VEHICLES[vehicle].cost, next: { ...node, vehicles: node.vehicles | (1 << vehicle) } });
  }
  const outfit = OUTFITS[node.outfit + 1];
  if (outfit && (outfit.minClass ?? 0) <= node.classIndex) steps.push({ cost: outfit.cost, next: { ...node, outfit: node.outfit + 1 } });
  const home = HOUSES[node.home + 1];
  const vehiclesReady = VEHICLES.every((item, index) => (item.home ?? 0) > node.home || owns(node.vehicles, index));
  if (home && vehiclesReady) steps.push({ cost: home.moveInCost, next: { ...node, home: node.home + 1 } });
  return steps;
}

function moves(node: Node): Node[] {
  const budget = LIFESTYLE_SHARE * (WEALTH_CLASSES[node.classIndex + 1]?.threshold ?? Infinity);
  const next = shopSteps(node)
    .filter((step) => node.spent + step.cost <= budget)
    .map((step) => ({ ...step.next, spent: node.spent + step.cost }));
  if (node.classIndex < LAST_CLASS) next.push(classUp(node));
  return next;
}

/** A player walks past a next step that costs this little next to what the class took to reach only for a moment. */
function settled(node: Node) {
  const small = SURE_BUY_SHARE * WEALTH_CLASSES[node.classIndex].threshold;
  return shopSteps(node).every((step) => step.cost > small);
}

/** Every scene a first life can show, one entry per distinct picture. */
export function sceneCombos(): SceneCombo[] {
  const key = (node: Node) => `${node.classIndex}|${node.home}|${node.vehicles}|${node.outfit}`;
  const cheapest = new Map<string, number>();
  const queue: Node[] = [{ classIndex: 0, home: 0, vehicles: 0, outfit: 0, spent: 0 }];
  cheapest.set(key(queue[0]), 0);
  while (queue.length > 0) {
    const node = queue.pop() as Node;
    for (const next of moves(node)) {
      const known = cheapest.get(key(next));
      if (known !== undefined && known <= next.spent) continue;
      cheapest.set(key(next), next.spent);
      queue.push(next);
    }
  }

  // One picture per home, vehicle, look and collar; the classes it shows up in are listed with it.
  const pictures = new Map<string, SceneCombo>();
  const add = (home: number, vehicle: number, outfit: number, classIndex: number) => {
    const id = `${home}|${vehicle}|${outfit}|${classLook(classIndex).sans.src}`;
    const combo = pictures.get(id) ?? { home, vehicle, outfit, classes: [] };
    if (!combo.classes.includes(classIndex)) combo.classes.push(classIndex);
    pictures.set(id, combo);
  };
  for (const state of cheapest.keys()) {
    const [classIndex, home, vehicles, outfit] = state.split('|').map(Number);
    const node = { classIndex, home, vehicles, outfit, spent: 0 };
    if (!settled(node)) continue;
    const vehicle = parked(node);
    add(home, vehicle, outfit, classIndex);
    if (classIndex >= GRANDPA_FROM_CLASS) add(home, vehicle, -1, classIndex);
  }
  return [...pictures.values()]
    .map((combo) => ({ ...combo, classes: combo.classes.sort((a, b) => a - b) }))
    .sort((a, b) => a.home - b.home || a.vehicle - b.vehicle || (a.outfit < 0 ? 99 : a.outfit) - (b.outfit < 0 ? 99 : b.outfit) || a.classes[0] - b.classes[0]);
}
