import type { MessageKey } from '../../i18n/translate';

// Each business has its own manager, a person met on the way up (story-v2 §3): a portrait and a few
// lines of their own, in i18n under `managers.<businessId>`.

export const managerPortrait = (businessId: string) => `/assets/managers/${businessId}.webp`;

export type ManagerLine = 'name' | 'hire' | 'line1' | 'line2';

export const managerKey = (businessId: string, line: ManagerLine) => `managers.${businessId}.${line}` as MessageKey;
