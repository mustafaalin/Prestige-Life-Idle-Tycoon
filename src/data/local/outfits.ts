import type { CharacterOutfit, PlayerOutfit } from '../../types/game';
import { LOCAL_MIKE_CHARACTER_ID } from './characters';

export const LOCAL_STARTER_OUTFIT_ID = 'local-outfit-1';

const now = new Date().toISOString();

const rows = [
  ['ch-1',  'Bare Basics',     0,      0,  1],
  ['ch-2',  'Street Casual',   500,    1,  2],
  ['ch-3',  'Daily Grind',     800,    2,  3],
  ['ch-4',  'Summer Ease',     2500,   4,  4],
  ['ch-5',  'Clean Start',     3000,   6,  5],
  ['ch-6',  'Urban Comfort',   4000,   9,  6],
  ['ch-7',  'Street Edge',     5000,   13, 7],
  ['ch-8',  'Smart Casual',    10000,  16, 8],
  ['ch-9',  'Easy Boss',       12500,  20, 9],
  ['ch-10', 'Laid Back Chic',  15000,  25, 10],
  ['ch-11', 'Low Key Sharp',   22000,  29, 11],
  ['ch-12', 'Off Duty',        32000,  34, 12],
  ['ch-13', 'Rising Pro',      50000,  40, 13],
  ['ch-14', 'The Coat',        65000,  46, 14],
  ['ch-15', 'All White',       75000,  52, 15],
  ['ch-16', 'Sharp Suit',      90000,  58, 16],
  ['ch-17', 'Power Move',      120000, 64, 17],
  ['ch-18', 'Black Tie',       150000, 70, 18],
  ['ch-19', 'Icon',            175000, 77, 19],
  ['ch-20', 'Elite',           200000, 83, 20],
] as const;

export const LOCAL_OUTFITS: CharacterOutfit[] = rows.map(
  ([code, name, price, prestige_points, unlock_order]) => ({
    id: `local-outfit-${unlock_order}`,
    character_id: LOCAL_MIKE_CHARACTER_ID,
    code,
    name,
    description: null,
    image_url: `/assets/outfits/${code}.png`,
    price,
    prestige_points,
    unlock_order,
    unlock_type: unlock_order === 1 ? 'always' : 'prestige',
    unlock_value: 0,
    is_active: true,
    created_at: now,
  })
);

export function createStarterPlayerOutfit(playerId: string): PlayerOutfit {
  return {
    player_id: playerId,
    outfit_id: LOCAL_STARTER_OUTFIT_ID,
    is_unlocked: true,
    unlocked_at: now,
    is_owned: true,
    purchased_at: now,
    created_at: now,
  };
}
