import { getLocalOwnedCars, getLocalOwnedCharacters, getLocalOwnedHouses, getLocalProfile, saveLocalGameState } from '../data/local/storage';
import { LOCAL_CARS } from '../data/local/cars';
import { recalculateLocalEconomy, recalculateLocalPrestige } from '../data/local/economy';
import { getLocalBusinesses, getLocalInvestments, getLocalJobs, getLocalPlayerJobs } from '../data/local/storage';
import { awardCashback } from '../data/local/bankRewards';

export async function purchaseCarViaRPC(playerId: string, carId: string, price: number) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const ownedCars = getLocalOwnedCars();
  const car = LOCAL_CARS.find((entry) => entry.id === carId);
  if (!car) throw new Error('Car not found');
  const purchaseCurrency = car.purchase_currency || 'cash';
  const cashPrice = Number(car.price || price || 0);
  const gemPrice = Number(car.gem_price || 0);

  if (purchaseCurrency === 'gems') {
    if (Number(profile.gems || 0) < gemPrice) {
      throw new Error('Not enough gems to purchase this car');
    }
  } else if (Number(profile.total_money) < cashPrice) {
    throw new Error('Not enough money to purchase this car');
  }

  const profileAfterSpend = {
    ...profile,
    total_money: purchaseCurrency === 'cash' ? Number(profile.total_money) - cashPrice : Number(profile.total_money),
    gems: purchaseCurrency === 'gems' ? Number(profile.gems || 0) - gemPrice : Number(profile.gems || 0),
    selected_car_id: carId,
    vehicle_expense: Number(car?.hourly_maintenance_cost || 0),
  };
  const finalProfile = recalculateLocalEconomy({
    profile: profileAfterSpend,
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    investments: getLocalInvestments(),
  });
  const cashbackResult =
    purchaseCurrency === 'cash'
      ? awardCashback(finalProfile, cashPrice)
      : { updatedProfile: finalProfile };
  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    ownedCars: ownedCars.includes(carId) ? ownedCars : [...ownedCars, carId],
  });
  return { success: true, message: 'Car purchased', new_balance: Number(cashbackResult.updatedProfile.total_money) };
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
  const cashbackResult =
    itemType === 'character'
      ? awardCashback(finalProfile, price)
      : { updatedProfile: finalProfile };

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
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
