// The daily reward (plan 2.7, decided 2026-10-15; game-design-v2.md §4.12). Once a calendar day the
// player collects some months of income, shown as "monthly income ×N". Missing a day costs nothing:
// the calendar goes on from where it stopped. Rules: runtime/daily.ts. Checked by `npm run sim`.

/** Months of income on the first seven days: grows each day, Şans brings the last one. */
export const DAILY_FIRST_WEEK = [5, 10, 15, 20, 30, 40, 50];
/** From the second week on, the week repeats like this (the seventh day stays the big one). */
export const DAILY_LATER_WEEK = [15, 15, 15, 15, 15, 15, 50];

/** Months of income paid on the reward with this index (0 = the first day ever claimed). */
export function dailyMonths(claimed: number): number {
  const index = Math.max(0, Math.floor(claimed));
  if (index < DAILY_FIRST_WEEK.length) return DAILY_FIRST_WEEK[index];
  return DAILY_LATER_WEEK[(index - DAILY_FIRST_WEEK.length) % DAILY_LATER_WEEK.length];
}

/** The seven days of the week that reward `claimed` belongs to (first week or a later one). */
export function dailyWeek(claimed: number): { week: number; days: number[]; dayIndex: number } {
  const index = Math.max(0, Math.floor(claimed));
  const week = Math.floor(index / 7);
  return { week, days: week === 0 ? DAILY_FIRST_WEEK : DAILY_LATER_WEEK, dayIndex: index % 7 };
}
