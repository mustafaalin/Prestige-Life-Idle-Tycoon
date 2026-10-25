import type { SkillDef, SkillId } from '../types';

// Skills (docs/game-design-v2.md §4.15, decided 2026-10-25, user: "something to do without money while
// waiting", after Idle Guy's skills). Three of them, trained for free on a timer that runs in real
// time, open or closed. One skill trains at a time and goes on level after level by itself, up to
// SKILL_BANK_MAX levels the player has not collected; then it waits for the player to come and collect
// them (2026-10-25, user). A rewarded ad gives the training skill two levels (config/ads.ts
// `skill_levels`), once until one of its levels finishes by training (2026-10-25, user). Jobs ask for levels (config/jobSkills.ts). Ids are saved: never rename one.

export const SKILLS: SkillDef[] = [
  { id: 'strength', name: 'Strength' },
  { id: 'smarts', name: 'Smarts' },
  { id: 'charisma', name: 'Charisma' },
];

export const SKILL_IDS: SkillId[] = SKILLS.map((skill) => skill.id);

export function skillDef(id: string | null | undefined): SkillDef | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

/**
 * Real seconds to train each level (index 0 = level 1). The first levels take seconds, so the player
 * who just took the first job has something to do while saving up for the stand; the last ones take
 * hours, so they finish while the player is away.
 */
export const SKILL_LEVEL_SECONDS = [
  15, 30, 45, 60, 90, 120, 180, 240, 300, 420,
  600, 900, 1_200, 1_800, 2_400, 3_600, 4_800, 6_000, 7_200, 9_000,
  10_800, 14_400, 18_000, 21_600, 25_200, 28_800, 32_400, 36_000, 39_600, 43_200,
];

export const MAX_SKILL_LEVEL = SKILL_LEVEL_SECONDS.length;

/** Seconds to train from `level` to the next one (0 at the top). */
export function trainingSeconds(level: number) {
  return SKILL_LEVEL_SECONDS[level] ?? 0;
}

/** Levels a skill trains ahead before it waits for the player to collect them. */
export const SKILL_BANK_MAX = 3;

/**
 * The level a job in this row of the job tree asks of its main skill: 2 at the second row (about a
 * minute of training), then about one level every two rows, 25 at the top. A second skill is asked
 * a few levels lower (config/jobSkills.ts).
 */
export function skillLevelForRow(row: number) {
  if (row <= 1) return 0;
  return Math.min(25, Math.round(1 + row * 0.45));
}

/** How much lower the second and third skills of a job are asked. */
export const SECOND_SKILL_GAP = 3;
export const THIRD_SKILL_GAP = 6;
