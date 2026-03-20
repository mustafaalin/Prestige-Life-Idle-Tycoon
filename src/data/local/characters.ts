import type { Character } from '../../types/game';

export const LOCAL_MIKE_CHARACTER_ID = 'local-character-mike';

const now = new Date().toISOString();

export const LOCAL_CHARACTERS: Character[] = [
  {
    id: LOCAL_MIKE_CHARACTER_ID,
    name: 'Mike',
    gender: 'male',
    description: 'A determined young man starting from scratch.',
    image_url: '',
    price: 0,
    unlock_order: 1,
    created_at: now,
  },
];
