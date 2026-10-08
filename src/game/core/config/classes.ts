import type { WealthClassDef } from '../types';

// The rags-to-riches ladder. Thresholds are generation earnings, so spending never drops you a class.
// Every step is a full-screen ceremony in the UI.
export const WEALTH_CLASSES: WealthClassDef[] = [
  { id: 'street', name: 'Living on the Street', threshold: 0 },
  { id: 'day-laborer', name: 'Day Laborer', threshold: 1e3 },
  { id: 'employee', name: 'Working Class', threshold: 1e5 },
  // Middle Class replaced Multimillionaire (2026-10-08): Working Class → Millionaire was too big a jump,
  // and "Millionaire" now means millions (10M), reached on the first return session.
  { id: 'middle-class', name: 'Middle Class', threshold: 1e6 },
  { id: 'millionaire', name: 'Millionaire', threshold: 1e7 },
  { id: 'billionaire', name: 'Billionaire', threshold: 1e9 },
  // Splits the long 1B → 1T climb so the story has a beat in the hero's late thirties.
  { id: 'multibillionaire', name: 'Multibillionaire', threshold: 1e11 },
  { id: 'richest', name: 'Richest Person Alive', threshold: 1e12 },
];
