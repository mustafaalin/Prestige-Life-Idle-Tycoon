import type { WealthClassDef } from '../types';

// The rags-to-riches ladder. Thresholds are generation earnings, so spending never drops you a class.
// Every step is a full-screen ceremony in the UI.
export const WEALTH_CLASSES: WealthClassDef[] = [
  { id: 'street', name: 'Living on the Street', threshold: 0 },
  { id: 'day-laborer', name: 'Day Laborer', threshold: 1e3 },
  { id: 'employee', name: 'Working Class', threshold: 1e5 },
  { id: 'millionaire', name: 'Millionaire', threshold: 1e6 },
  { id: 'multimillionaire', name: 'Multimillionaire', threshold: 1e8 },
  { id: 'billionaire', name: 'Billionaire', threshold: 1e9 },
  { id: 'richest', name: 'Richest Person Alive', threshold: 1e12 },
];
