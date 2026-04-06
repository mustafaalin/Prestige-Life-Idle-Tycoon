import { getLocalOwnedCars, getLocalOwnedCharacters, getLocalOwnedHouses, getLocalProfile, saveLocalGameState } from '../data/local/storage';
import { LOCAL_CARS } from '../data/local/cars';
import { LOCAL_HOUSES } from '../data/local/houses';
import { recalculateLocalEconomy, recalculateLocalPrestige } from '../data/local/economy';
import { getLocalBusinesses, getLocalInvestments, getLocalJobs, getLocalPlayerJobs } from '../data/local/storage';
import { awardCashback } from '../data/local/bankRewards';
import { getJobRequirementMinimum } from '../data/local/jobRequirements';
import { getCarProgressionLevel } from '../data/local/cars';

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
  const jobs = getLocalJobs();
  const playerJobs = getLocalPlayerJobs();
  const activePlayerJob = playerJobs.find((entry) => entry.is_active);
  const activeJob = activePlayerJob
    ? jobs.find((entry) => entry.id === activePlayerJob.job_id) || null
    : null;
  const minimumSupportedCarLevel = getJobRequirementMinimum(activeJob, 'car_level');

  if (ownedCars.includes(carId)) {
    throw new Error('Car already owned');
  }

  if (minimumSupportedCarLevel > 0 && getCarProgressionLevel(car) < minimumSupportedCarLevel) {
    throw new Error('Current job requires a higher vehicle level');
  }

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
    jobs,
    playerJobs,
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

export async function sellOwnedCar(playerId: string, carId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const ownedCars = getLocalOwnedCars();
  if (!ownedCars.includes(carId)) {
    throw new Error('Car not owned');
  }

  if (profile.selected_car_id === carId) {
    throw new Error('Selected car cannot be sold');
  }

  const car = LOCAL_CARS.find((entry) => entry.id === carId);
  if (!car) throw new Error('Car not found');

  const purchaseCurrency = car.purchase_currency || 'cash';
  const cashSellValue = Math.floor(Number(car.price || 0) / 2);
  const gemSellValue = Math.floor(Number(car.gem_price || 0) / 2);

  saveLocalGameState({
    profile: {
      ...profile,
      total_money:
        purchaseCurrency === 'cash'
          ? Number(profile.total_money || 0) + cashSellValue
          : Number(profile.total_money || 0),
      gems:
        purchaseCurrency === 'gems'
          ? Number(profile.gems || 0) + gemSellValue
          : Number(profile.gems || 0),
    },
    ownedCars: ownedCars.filter((ownedCarId) => ownedCarId !== carId),
  });

  return true;
}

export async function purchasePremiumHouseWithGems(playerId: string, houseId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const house = LOCAL_HOUSES.find((entry) => entry.id === houseId);
  if (!house || !house.is_premium) throw new Error('Premium house not found');

  const gemPrice = Number(house.gem_price || 0);
  if (Number(profile.gems || 0) < gemPrice) throw new Error('Not enough gems');

  if (getLocalOwnedHouses().includes(houseId)) throw new Error('House already owned');

  const nextProfile = recalculateLocalEconomy({
    profile: {
      ...profile,
      gems: Number(profile.gems || 0) - gemPrice,
      selected_house_id: houseId,
      house_rent_expense: 0,
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    investments: getLocalInvestments(),
  });

  saveLocalGameState({
    profile: nextProfile,
    ownedHouses: Array.from(new Set([...getLocalOwnedHouses(), houseId])),
  });

  return true;
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
