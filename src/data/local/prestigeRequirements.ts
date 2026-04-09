import type { Car, House } from '../../types/game';

const HOUSE_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,   // Ch0 start
  2:  5,   // Ch0 mid
  3:  10,  // Ch0 mid
  4:  18,  // Ch0 end
  5:  28,  // Ch1 end
  6:  40,  // Ch2 start
  7:  52,  // Ch2 end
  8:  65,  // Ch3 start
  9:  80,  // Ch3 end
  10: 95,  // Ch3-4 transition
  11: 112, // Ch4 end
  12: 130, // Ch4-5 transition
  13: 148, // Ch5 end
  14: 168, // Ch6 start
  15: 186, // Ch6 mid
  16: 205, // Ch6 end
  17: 225, // Ch7 start
  18: 245, // Ch7 mid
  19: 268, // Ch7-8 transition
  20: 290, // Ch8 start
  21: 312, // Ch8 mid
  22: 335, // Ch8 end
  23: 358, // Ch9 start
  24: 380, // Ch9 mid
  25: 402, // Ch9 end
  // Premium houses (level 50/51/52) — interleaved after houses 6, 13, 20
  50: 40,  // Ch2 start (same as house-6)
  51: 148, // Ch5 end   (same as house-13)
  52: 290, // Ch8 start (same as house-20)
};

const CAR_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1:  0,   // Ch0 start
  2:  5,   // Ch0 mid
  3:  16,  // Ch0 end
  4:  28,  // Ch1 end
  5:  42,  // Ch2 start
  6:  57,  // Ch2 end
  7:  73,  // Ch3 start
  8:  90,  // Ch3 end
  9:  108, // Ch4 start
  10: 126, // Ch4-5 transition
  11: 145, // Ch5 mid
  12: 165, // Ch5 end
  13: 185, // Ch6 start
  14: 206, // Ch6 end
  15: 228, // Ch7 start
  16: 250, // Ch7 mid
  17: 274, // Ch7 end
  18: 300, // Ch8 start
  19: 328, // Ch8 end
  20: 370, // Ch9 mid
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
  return Number(prestigePoints || 0) >= getRequiredPrestigeForHouse(house);
}

export function canAccessCarWithPrestige(car: Pick<Car, 'level' | 'is_premium'>, prestigePoints: number) {
  if (car.is_premium) {
    return true;
  }
  return Number(prestigePoints || 0) >= getRequiredPrestigeForCar(car);
}
