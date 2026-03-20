import { getLocalOwnedCars, getLocalOwnedCharacters, getLocalOwnedHouses, getLocalProfile, saveLocalGameState } from '../data/local/storage';
import { LOCAL_CARS } from '../data/local/cars';
import { recalculateLocalEconomy, recalculateLocalPrestige } from '../data/local/economy';
import { getLocalBusinesses, getLocalInvestments, getLocalJobs, getLocalPlayerJobs } from '../data/local/storage';

export async function purchaseCarViaRPC(playerId: string, carId: string, price: number) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  if (Number(profile.total_money) < price) throw new Error('Not enough money to purchase this car');
  const ownedCars = getLocalOwnedCars();
  const car = LOCAL_CARS.find((entry) => entry.id === carId);
  const finalProfile = recalculateLocalEconomy({
    profile: {
      ...profile,
      total_money: Number(profile.total_money) - price,
      selected_car_id: carId,
      vehicle_expense: Number(car?.hourly_maintenance_cost || 0),
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    investments: getLocalInvestments(),
  });
  saveLocalGameState({
    profile: finalProfile,
    ownedCars: ownedCars.includes(carId) ? ownedCars : [...ownedCars, carId],
  });
  return { success: true, message: 'Car purchased', new_balance: Number(finalProfile.total_money) };
}

export async function purchaseGeneralItem(
  playerId: string, 
  itemType: 'character' | 'house', 
  itemId: string, 
  price: number
) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  if (itemType === 'character' && Number(profile.total_money) < price) throw new Error('Not enough money');

  const nextProfile =
    itemType === 'character'
      ? {
          ...profile,
          total_money: Number(profile.total_money) - price,
          selected_character_id: itemId,
        }
      : {
          ...profile,
          selected_house_id: itemId,
        };
  const finalProfile = itemType === 'house'
    ? recalculateLocalEconomy({
        profile: nextProfile,
        jobs: getLocalJobs(),
        playerJobs: getLocalPlayerJobs(),
        businesses: getLocalBusinesses(),
        investments: getLocalInvestments(),
      })
    : recalculateLocalPrestige({
      profile: nextProfile,
      jobs: getLocalJobs(),
      playerJobs: getLocalPlayerJobs(),
      businesses: getLocalBusinesses(),
    });

  saveLocalGameState({
    profile: finalProfile,
    ownedCharacters:
      itemType === 'character'
        ? Array.from(new Set([...getLocalOwnedCharacters(), itemId]))
        : getLocalOwnedCharacters(),
    ownedHouses:
      itemType === 'house'
        ? Array.from(new Set([...getLocalOwnedHouses(), itemId]))
        : getLocalOwnedHouses(),
  });
  return true;
}
