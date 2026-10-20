import { CAREERS } from '../config/careers';
import { HOUSES, OWNER_HOME_BONUS } from '../config/housing';
import { COLLARS, LIFESTYLE_ITEMS, type CollarDef } from '../config/lifestyle';
import type { GameStateV2 } from '../types';
import { legacyMultiplier } from './legacy';

// What scales all income: career, status (home, collar, items), family legacy and Şans's paid
// accessories. One place, so every income source and every screen agrees on the multiplier.

const LIFESTYLE_BY_ID = new Map(LIFESTYLE_ITEMS.map((item) => [item.id, item]));
const HOUSE_BY_ID = new Map(HOUSES.map((house) => [house.id, house]));

export function careerBonus(state: GameStateV2) {
  let bonus = 0;
  for (let index = 0; index <= state.careerIndex && index < CAREERS.length; index += 1) {
    bonus += CAREERS[index].incomeBonus;
  }
  return bonus;
}

/** Bonus from the house you live in: its tier, plus the owner's extra if it is yours. */
export function homeBonus(state: GameStateV2) {
  const house = HOUSE_BY_ID.get(state.home);
  if (!house) return 0;
  return house.homeBonus + (state.homesOwned.includes(house.id) ? OWNER_HOME_BONUS : 0);
}

/** The collar Şans wears in a class (null: still the rope). */
export function collarAt(classIndex: number): CollarDef | null {
  return COLLARS.filter((collar) => collar.fromClass <= classIndex).pop() ?? null;
}

/** Status = your home, Şans's collar and every owned vehicle, outfit and luxury toy. */
export function statusBonus(state: GameStateV2) {
  let bonus = homeBonus(state) + (collarAt(state.classIndex)?.statusBonus ?? 0);
  for (const id of state.lifestyleOwned) {
    bonus += LIFESTYLE_BY_ID.get(id)?.statusBonus ?? 0;
  }
  return bonus;
}

/** Everything that scales all income: career, status items, family legacy and Şans's paid accessories. */
export function globalMultiplier(state: GameStateV2) {
  return (1 + careerBonus(state)) * (1 + statusBonus(state)) * legacyMultiplier(state) * state.accessoryMultiplier;
}
