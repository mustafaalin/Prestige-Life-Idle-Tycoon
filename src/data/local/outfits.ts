import type { CharacterOutfit, PlayerOutfit } from '../../types/game';
import { LOCAL_MIKE_CHARACTER_ID } from './characters';

export const LOCAL_STARTER_OUTFIT_ID = 'local-outfit-1';

const now = new Date().toISOString();

const rows = [
  ['ch-1', 'Starter Outfit', 0, 0, 1],
  ['ch-2', 'Outfit 2', 500, 1, 2],
  ['ch-3', 'Outfit 3', 800, 2, 3],
  ['ch-4', 'Outfit 4', 2500, 4, 4],
  ['ch-5', 'Outfit 5', 3000, 6, 5],
  ['ch-6', 'Outfit 6', 4000, 9, 6],
  ['ch-7', 'Outfit 7', 5000, 13, 7],
  ['ch-8', 'Outfit 8', 10000, 16, 8],
  ['ch-9', 'Outfit 9', 12500, 20, 9],
  ['ch-10', 'Outfit 10', 15000, 25, 10],
  ['ch-11', 'Outfit 11', 22000, 29, 11],
  ['ch-12', 'Outfit 12', 32000, 34, 12],
  ['ch-13', 'Outfit 13', 50000, 40, 13],
  ['ch-14', 'Outfit 14', 65000, 46, 14],
  ['ch-15', 'Outfit 15', 75000, 52, 15],
  ['ch-16', 'Outfit 16', 90000, 58, 16],
  ['ch-17', 'Outfit 17', 120000, 64, 17],
  ['ch-18', 'Outfit 18', 150000, 70, 18],
  ['ch-19', 'Outfit 19', 175000, 77, 19],
  ['ch-20', 'Outfit 20', 200000, 83, 20],
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
