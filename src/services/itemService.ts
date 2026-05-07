import {
  getLocalBusinesses,
  getLocalCharacters,
  getLocalInvestments,
  getLocalJobs,
  getLocalOutfits,
  getLocalOwnedCars,
  getLocalOwnedCharacters,
  getLocalOwnedHouses,
  getLocalPlayerJobs,
  getLocalPlayerOutfits,
  getLocalProfile,
  saveLocalGameState,
} from '../data/local/storage';
import { LOCAL_HOUSES } from '../data/local/houses';
import { LOCAL_CARS } from '../data/local/cars';
import { recalculateLocalEconomy, recalculateLocalPrestige } from '../data/local/economy';
import { awardCashback } from '../data/local/bankRewards';

export async function getCharacters() {
  return getLocalCharacters();
}

export async function getHouses() {
  return LOCAL_HOUSES;
}

export async function getCars() {
  return LOCAL_CARS;
}

export async function getOwnedCharacters(playerId: string) {
  void playerId;
  return getLocalOwnedCharacters();
}

export async function getOwnedHouses(playerId: string) {
  void playerId;
  return getLocalOwnedHouses();
}

export async function getOwnedCars(playerId: string) {
  void playerId;
  return getLocalOwnedCars();
}

export async function getSelectedOutfit(playerId: string) {
  const profile = getLocalProfile();
  const outfits = getLocalOutfits();
  if (!profile || profile.id !== playerId || !profile.selected_outfit_id) return null;
  return outfits.find((outfit) => outfit.id === profile.selected_outfit_id) || null;
}

export async function getCharacterOutfits(playerId: string) {
  const outfits = getLocalOutfits();
  const playerOutfits = getLocalPlayerOutfits().filter((entry) => entry.player_id === playerId);
  return outfits
    .map((outfit) => {
      const ownedEntry = playerOutfits.find((entry) => entry.outfit_id === outfit.id);
      return {
        ...outfit,
        is_owned: Boolean(ownedEntry?.is_owned),
        is_unlocked: Boolean(ownedEntry?.is_unlocked),
      };
    })
    .sort((a, b) => a.unlock_order - b.unlock_order);
}

export async function purchaseOutfit(playerId: string, outfitId: string, setAsSelected: boolean) {
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const outfits = getLocalOutfits();
  const outfit = outfits.find((entry) => entry.id === outfitId && entry.is_active);
  if (!outfit) {
    return { success: false, message: 'Outfit not found or not active' };
  }

  const playerOutfits = getLocalPlayerOutfits();
  const alreadyOwned = playerOutfits.find(
    (entry) => entry.player_id === playerId && entry.outfit_id === outfitId && entry.is_owned
  );

  if (alreadyOwned) {
    return { success: false, message: 'Outfit already owned' };
  }

  if (Number(profile.total_money) < Number(outfit.price || 0)) {
    return { success: false, message: 'Not enough money to purchase outfit' };
  }

  const now = new Date().toISOString();
  const nextPlayerOutfits = [
    ...playerOutfits,
    {
      player_id: playerId,
      outfit_id: outfitId,
      is_owned: true,
      is_unlocked: true,
      purchased_at: now,
      unlocked_at: now,
      created_at: now,
    },
  ];

  const nextProfile = recalculateLocalPrestige({
    profile: {
      ...profile,
      total_money: Number(profile.total_money) - Number(outfit.price || 0),
      selected_outfit_id: setAsSelected ? outfitId : profile.selected_outfit_id,
      last_played_at: now,
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    selectedOutfit: setAsSelected ? outfit : undefined,
  });
  const cashbackResult = awardCashback(nextProfile, Number(outfit.price || 0));

  saveLocalGameState({
    profile: cashbackResult.updatedProfile,
    playerOutfits: nextPlayerOutfits,
    selectedOutfit:
      outfits.find((entry) => entry.id === cashbackResult.updatedProfile.selected_outfit_id) || null,
  });

  return {
    success: true,
    message: 'Outfit purchased successfully',
    prestige_earned: outfit.prestige_points,
    money_spent: outfit.price,
  };
}

export async function selectOutfit(playerId: string, outfitId: string) {
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');

  const owned = getLocalPlayerOutfits().find(
    (entry) => entry.player_id === playerId && entry.outfit_id === outfitId && entry.is_owned
  );

  if (!owned) throw new Error('Outfit not owned');

  const outfits = getLocalOutfits();
  const selectedOutfit = outfits.find((entry) => entry.id === outfitId) || null;
  const nextProfile = recalculateLocalPrestige({
    profile: {
      ...profile,
      selected_outfit_id: outfitId,
      last_played_at: new Date().toISOString(),
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    selectedOutfit,
  });

  saveLocalGameState({
    profile: nextProfile,
    selectedOutfit,
  });
  return true;
}

// -------------------------------------------------------------
// DÜZELTİLEN KISIM: Supabase'deki doğru RPC isimleri ve argümanları eklendi
// -------------------------------------------------------------

export async function selectCharacter(playerId: string, characterId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  saveLocalGameState({ profile: { ...profile, selected_character_id: characterId } });
  return true;
}

export async function selectHouse(playerId: string, houseId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const house = LOCAL_HOUSES.find((entry) => entry.id === houseId);
  if (!house) throw new Error('House not found');
  const nextProfile = recalculateLocalEconomy({
    profile: {
      ...profile,
      selected_house_id: houseId,
      house_rent_expense: Number(house?.hourly_rent_cost || 0),
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    investments: getLocalInvestments(),
  });
  saveLocalGameState({ profile: nextProfile });
  return true;
}

export async function selectCar(playerId: string, carId: string) {
  void playerId;
  const profile = getLocalProfile();
  if (!profile) throw new Error('Player not found');
  const car = LOCAL_CARS.find((entry) => entry.id === carId);
  if (!car) throw new Error('Car not found');
  const nextProfile = recalculateLocalEconomy({
    profile: {
      ...profile,
      selected_car_id: carId,
      vehicle_expense: Number(car?.hourly_maintenance_cost || 0),
    },
    jobs: getLocalJobs(),
    playerJobs: getLocalPlayerJobs(),
    businesses: getLocalBusinesses(),
    investments: getLocalInvestments(),
  });
  saveLocalGameState({ profile: nextProfile });
  return true;
}
