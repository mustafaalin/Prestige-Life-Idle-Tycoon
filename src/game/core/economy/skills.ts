import { CAREERS } from '../config/careers';
import { MAX_SKILL_LEVEL, SKILL_BANK_MAX, SKILL_IDS, trainingSeconds } from '../config/skills';
import { jobRowReached } from '../requirements';
import type { CareerDef, GameStateV2, SkillId } from '../types';

// Skills (docs/game-design-v2.md §4.15): levels, the levels waiting to be collected, the training
// running, and what the jobs ask of them. Transitions (start, collect, time passing) are in core/state.ts.

/** The "Me" tab opens with the first job (the first job asks for no skill; the second ones do). */
export function skillsOpen(state: GameStateV2) {
  return state.careerId !== null || state.training !== null || SKILL_IDS.some((id) => skillLevel(state, id) + skillBank(state, id) > 0);
}

/** Levels collected (the ones jobs count). */
export function skillLevel(state: GameStateV2, skillId: SkillId) {
  return state.skills[skillId] ?? 0;
}

/** Levels trained but not collected yet. */
export function skillBank(state: GameStateV2, skillId: SkillId) {
  return state.skillBank[skillId] ?? 0;
}

/** The level being trained toward is past the collected and the waiting ones. */
function nextLevelSeconds(state: GameStateV2, skillId: SkillId) {
  return trainingSeconds(skillLevel(state, skillId) + skillBank(state, skillId));
}

/** The skill can still go up (the top is not reached, counting the waiting levels). */
export function canTrainSkill(state: GameStateV2, skillId: SkillId) {
  return skillLevel(state, skillId) + skillBank(state, skillId) < MAX_SKILL_LEVEL;
}

/** The ad levels are open: unused since this skill's last level finished by training (state.ts train). */
export function skillAdOpen(state: GameStateV2, skillId: SkillId) {
  return !state.skillAdUsed.includes(skillId);
}

/** The skill trains but waits: its uncollected levels are full. */
export function skillBankFull(state: GameStateV2, skillId: SkillId) {
  return skillBank(state, skillId) >= SKILL_BANK_MAX;
}

/** Share of the next level done (0–1), kept while the skill is not training. */
export function skillProgressShare(state: GameStateV2, skillId: SkillId) {
  const length = nextLevelSeconds(state, skillId);
  return length > 0 ? Math.min(1, (state.skillProgress[skillId] ?? 0) / length) : 1;
}

/** Real seconds left on the next level. */
export function trainingLeft(state: GameStateV2, skillId: SkillId) {
  return Math.max(0, nextLevelSeconds(state, skillId) - (state.skillProgress[skillId] ?? 0));
}

/** The tab asks for a look: nothing trains, or levels wait to be collected. */
export function skillsNeedLook(state: GameStateV2) {
  return state.training === null || SKILL_IDS.some((id) => skillBank(state, id) > 0);
}

/**
 * The nearest job up the tree that asks more of this skill than the player has, and the level it asks
 * (the skill screen says what each skill is for next), or null.
 */
export function nextSkillAsk(state: GameStateV2, skillId: SkillId): { career: CareerDef; level: number } | null {
  const current = skillLevel(state, skillId);
  const reached = jobRowReached(state);
  let best: { career: CareerDef; level: number } | null = null;
  for (const career of CAREERS) {
    if (career.level <= reached) continue;
    for (const requirement of career.requires) {
      if (requirement.type !== 'skill' || requirement.skillId !== skillId || requirement.level <= current) continue;
      if (!best || career.level < best.career.level || (career.level === best.career.level && requirement.level < best.level)) {
        best = { career, level: requirement.level };
      }
    }
    if (best && career.level > best.career.level) break;
  }
  return best;
}
