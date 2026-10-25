import type { Requirement, SkillId } from '../types';
import { SECOND_SKILL_GAP, SKILL_IDS, THIRD_SKILL_GAP, skillLevelForRow } from './skills';

// The skills each job asks for (docs/game-design-v2.md §4.15, 2026-10-25): a main skill that fits the
// work (a porter's strength, a salesman's charisma, an accountant's smarts) and from row 10 a second
// one; the top jobs ask for all three. The levels come from the row (skills.ts skillLevelForRow), so a
// job here is only which skills, in order. A job not listed asks for none (the first job).

const S: Record<string, SkillId> = { G: 'strength', Z: 'smarts', K: 'charisma' };

/** Main skill first, then the second (G strength, Z smarts, K charisma). */
const JOB_SKILLS: Record<string, string> = {
  // Worker
  porter: 'GK',
  dishwasher: 'GK',
  cleaner: 'GZ',
  'bike-courier': 'GZ',
  'warehouse-worker': 'GZ',
  waiter: 'KG',
  'construction-laborer': 'GZ',
  'hospital-porter': 'GK',
  'carpenter-apprentice': 'GZ',
  'delivery-driver': 'GK',
  'security-guard': 'GK',
  'line-cook': 'GZ',
  'apprentice-electrician': 'ZG',
  carpenter: 'GZ',
  'taxi-driver': 'KG',
  'senior-security-guard': 'GK',
  electrician: 'ZG',
  'sous-chef': 'GK',
  'master-carpenter': 'GZ',
  'truck-driver': 'GK',
  'warehouse-supervisor': 'KG',
  'master-electrician': 'ZG',
  'head-chef': 'KG',
  'furniture-workshop-chief': 'KZ',
  dispatcher: 'ZK',
  'site-foreman': 'GK',
  'site-manager': 'KG',
  contractor: 'KZ',
  // Office
  cashier: 'ZK',
  'call-center-agent': 'KZ',
  'shop-assistant': 'KZ',
  'office-clerk': 'ZK',
  'sales-representative': 'KZ',
  'bank-teller': 'ZK',
  'executive-assistant': 'ZK',
  'social-media-assistant': 'KZ',
  'senior-sales': 'KZ',
  accountant: 'ZK',
  'hr-specialist': 'KZ',
  'content-creator': 'KZ',
  'store-manager': 'KZ',
  'real-estate-agent': 'KZ',
  'logistics-coordinator': 'ZK',
  'financial-analyst': 'ZK',
  'office-manager': 'ZK',
  'restaurant-manager': 'KG',
  'regional-sales-manager': 'KZ',
  'food-beverage-manager': 'KZ',
  'operations-manager': 'ZK',
  'finance-manager': 'ZK',
  'hr-manager': 'KZ',
  'national-sales-manager': 'KZ',
  'supply-chain-manager': 'ZK',
  'marketing-manager': 'KZ',
  'hotel-manager': 'KZ',
  'investment-banker': 'ZK',
  // Expert
  'street-photographer': 'KG',
  'it-support': 'ZK',
  'nursing-assistant': 'GK',
  'junior-web-developer': 'ZK',
  nurse: 'GZ',
  journalist: 'KZ',
  paramedic: 'GZ',
  'web-developer': 'ZK',
  teacher: 'KZ',
  editor: 'ZK',
  'head-nurse': 'GK',
  'software-engineer': 'ZK',
  lawyer: 'KZ',
  'editor-in-chief': 'ZK',
  doctor: 'ZG',
  'senior-engineer': 'ZK',
  'senior-lawyer': 'KZ',
  architect: 'ZK',
  'specialist-doctor': 'ZG',
  pilot: 'GZ',
  veterinarian: 'GZ',
  'team-leader': 'KZ',
  judge: 'ZK',
  'construction-project-manager': 'GZ',
  surgeon: 'GZ',
  captain: 'GK',
  professor: 'ZK',
  'tv-producer': 'KZ',
  'hospital-director': 'ZK',
  'engineering-manager': 'ZK',
  rector: 'ZK',
  'chief-architect': 'ZK',
  // The top: all three
  director: 'KZ',
  'logistics-director': 'ZG',
  'hospitality-director': 'KZ',
  'media-director': 'KZ',
  'legal-director': 'ZK',
  'airline-ops-director': 'ZG',
  'portfolio-manager': 'ZK',
  'chief-commercial-officer': 'KZ',
  cto: 'ZK',
  cfo: 'ZK',
  coo: 'ZK',
  ceo: 'KZ',
  'board-member': 'KZ',
  'fund-founder': 'ZK',
  'board-chair': 'KZ',
};

/** From this row a job asks for a second skill; from the top tab for all three. */
const SECOND_SKILL_ROW = 10;
const THIRD_SKILL_ROW = 46;

/** The skill conditions of a job in `row`, none for a job not listed. */
export function jobSkillRequirements(careerId: string, row: number): Requirement[] {
  const letters = JOB_SKILLS[careerId];
  const level = skillLevelForRow(row);
  if (!letters || level <= 0) return [];
  const order = [...letters].map((letter) => S[letter]);
  const third = SKILL_IDS.find((id) => !order.includes(id));
  if (third) order.push(third);
  const asked = [{ skillId: order[0], level }];
  if (row >= SECOND_SKILL_ROW) asked.push({ skillId: order[1], level: level - SECOND_SKILL_GAP });
  if (row >= THIRD_SKILL_ROW) asked.push({ skillId: order[2], level: level - THIRD_SKILL_GAP });
  return asked.filter((ask) => ask.level > 0).map((ask) => ({ type: 'skill', skillId: ask.skillId, level: ask.level }));
}
