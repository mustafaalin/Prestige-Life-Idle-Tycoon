import type { Car, House } from '../../types/game';

const HOUSE_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,
  2:  5,
  3:  10,
  4:  15,
  5:  22,
  6:  28,
  7:  35,
  8:  42,
  9:  50,
  10: 60,
  11: 70,
  12: 80,
  13: 90,
  14: 100,
  15: 110,
  16: 120,
  17: 130,
  18: 140,
  19: 150,
  20: 165,
  21: 175,
  22: 185,
  23: 195,
  24: 200,
  25: 225,
  // Premium houses (level 50/51/52) — interleaved after houses 6, 13, 20
  50: 28,  // same as house-6
  51: 90,  // same as house-13
  52: 165, // same as house-20
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
  1:  0,
  2:  5,
  3:  15,
  4:  30,
  5:  45,
  6:  60,
  7:  80,
  8:  100,
  9:  120,
  10: 140,
  11: 150,
  12: 175,
  13: 200,
  14: 220,
  15: 240,
  16: 250,
  17: 250,
  18: 250,
  19: 250,
  20: 250,
};

export function getRequiredPrestigeForOutfit(unlockOrder: number): number {
  return OUTFIT_PRESTIGE_REQUIREMENTS[unlockOrder] ?? 0;
}

export function canAccessOutfitWithPrestige(unlockOrder: number, prestigePoints: number): boolean {
  return Number(prestigePoints || 0) >= getRequiredPrestigeForOutfit(unlockOrder);
}
