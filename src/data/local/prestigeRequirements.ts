import type { Car, House } from '../../types/game';

const HOUSE_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,   // Ch1
  2:  0,   // Ch1
  3:  8,   // Ch1 end
  4:  15,  // Ch2
  5:  22,  // Ch2 end
  6:  30,  // Ch3
  7:  38,  // Ch3 end
  8:  48,  // Ch4       ← was 65 (caused deadlock)
  9:  58,  // Ch4 end
  10: 70,  // Ch5
  11: 82,  // Ch5 end
  12: 88,  // Ch6
  13: 100, // Ch6 mid
  14: 110, // Ch6 end   ← was 135 (caused deadlock at 120pp)
  15: 128, // Ch7
  16: 140, // Ch7 mid
  17: 150, // Ch7 end
  18: 168, // Ch8
  19: 182, // Ch8 mid
  20: 195, // Ch8 end
  21: 218, // Ch9
  22: 240, // Ch9 mid
  23: 260, // Ch9 end
  24: 295, // Ch10
  25: 335, // Ch10 end
  // Premium houses (level 50/51/52) — interleaved after houses 6, 13, 20
  50: 30,  // same as house-6
  51: 115, // same as house-13
  52: 225, // same as house-20
};

const CAR_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,   // Ch1
  2:  0,   // Ch1 end
  3:  12,  // Ch2
  4:  22,  // Ch2 end
  5:  32,  // Ch3
  6:  40,  // Ch3 end
  7:  50,  // Ch4       ← was 73
  8:  60,  // Ch4 end   ← was 90
  9:  72,  // Ch5
  10: 84,  // Ch5 end
  11: 105, // Ch6
  12: 118, // Ch6 end
  13: 138, // Ch7
  14: 152, // Ch7 end
  15: 178, // Ch8
  16: 198, // Ch8 end
  17: 235, // Ch9
  18: 258, // Ch9 end
  19: 300, // Ch10
  20: 345, // Ch10 end  ← was 370 (impossible)
};

export function getRequiredPrestigeForHouse(house: Pick<House, 'level'>) {
  return HOUSE_PRESTIGE_REQUIREMENTS[Number(house.level || 0)] ?? 0;
}

export function getRequiredPrestigeForCar(car: Pick<Car, 'level' | 'is_premium'>) {
  if (car.is_premium) {
    return 0;
  }
  return CAR_PRESTIGE_REQUIREMENTS[Number(car.level || 0)] ?? 0;
}

export function canAccessHouseWithPrestige(house: Pick<House, 'level' | 'is_premium'>, prestigePoints: number) {
  if (house.is_premium) {
    return true;
  }
  return Number(prestigePoints || 0) >= getRequiredPrestigeForHouse(house);
}

export function canAccessCarWithPrestige(car: Pick<Car, 'level' | 'is_premium'>, prestigePoints: number) {
  if (car.is_premium) {
    return true;
  }
  return Number(prestigePoints || 0) >= getRequiredPrestigeForCar(car);
}

// Outfit unlock thresholds by unlock_order (1-based).
// Tuned so each outfit is available before the quest that requires buying it.
const OUTFIT_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,    // starter, always owned
  2:  5,    // Ch0 — Quest 7  "buy first outfit"
  3:  18,   // Ch1 — Quest 16 "buy second outfit"
  4:  50,   // Ch3 — Quest 35 "buy third outfit"
  5:  88,   // Ch4 — Quest 48 "buy fourth outfit"
  6:  125,  // Ch5 — Quest 57 "buy fifth outfit"
  7:  165,  // Ch6 — Quest 68 "buy sixth outfit"
  8:  208,  // Ch7 — Quest 78 "buy seventh outfit"
  9:  255,  // Ch8 — Quest 88 "buy eighth outfit"
  10: 300,  // Ch9 — Quest 96 "own 10 outfits"
  11: 310,
  12: 320,
  13: 330,
  14: 340,
  15: 350,
  16: 360,
  17: 370,
  18: 380,
  19: 390,
  20: 400,
};

export function getRequiredPrestigeForOutfit(unlockOrder: number): number {
  return OUTFIT_PRESTIGE_REQUIREMENTS[unlockOrder] ?? 0;
}

export function canAccessOutfitWithPrestige(_unlockOrder: number, _prestigePoints: number): boolean {
  return true;
}
