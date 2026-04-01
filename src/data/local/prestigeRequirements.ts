import type { Car, House } from '../../types/game';

const HOUSE_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 3,
  3: 5,
  4: 8,
  5: 12,
  6: 16,
  7: 21,
  8: 27,
  9: 33,
  10: 40,
  11: 48,
  12: 57,
  13: 62,
  14: 70,
  15: 77,
  16: 85,
  17: 93,
  18: 100,
  19: 108,
  20: 115,
  21: 121,
  22: 127,
  23: 132,
  24: 136,
  25: 140,
};

const CAR_PRESTIGE_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
  6: 14,
  7: 18,
  8: 23,
  9: 28,
  10: 34,
  11: 40,
  12: 45,
  13: 52,
  14: 58,
  15: 65,
  16: 71,
  17: 78,
  18: 84,
  19: 91,
  20: 98,
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

export function canAccessHouseWithPrestige(house: Pick<House, 'level'>, prestigePoints: number) {
  return Number(prestigePoints || 0) >= getRequiredPrestigeForHouse(house);
}

export function canAccessCarWithPrestige(car: Pick<Car, 'level' | 'is_premium'>, prestigePoints: number) {
  if (car.is_premium) {
    return true;
  }
  return Number(prestigePoints || 0) >= getRequiredPrestigeForCar(car);
}
