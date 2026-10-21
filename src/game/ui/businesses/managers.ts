import type { MessageKey } from '../../i18n/translate';
import { cityManagerPortrait, cityManagers, type City } from '../../runtime/city';

// Each business has its own manager, a person met on the way up (story-v2 §3): a portrait and a few
// lines of their own, in i18n under `managers.<businessId>` (Lumen's under `managersLumen`, runtime/city.ts).
// The event and Rich List cards are written for the old city's people and ask for them by passing 'old'.

export const managerPortrait = (businessId: string, city?: City) =>
  city === 'old' ? `/assets/managers/${businessId}.webp` : cityManagerPortrait(businessId);

export type ManagerLine = 'name' | 'hire' | 'line1' | 'line2';

export const managerKey = (businessId: string, line: ManagerLine, city?: City) =>
  `${city === 'old' ? 'managers' : cityManagers()}.${businessId}.${line}` as MessageKey;
