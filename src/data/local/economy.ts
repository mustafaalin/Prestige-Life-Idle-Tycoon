import type {
  BusinessWithPlayerData,
  CharacterOutfit,
  InvestmentWithPlayerData,
  Job,
  PlayerJob,
  PlayerProfile,
} from '../../types/game';
import { LOCAL_CARS } from './cars';
import { LOCAL_HOUSES } from './houses';
import { LOCAL_OUTFITS } from './outfits';

interface RecalculateIncomeInput {
  profile: PlayerProfile;
  jobs: Job[];
  playerJobs: PlayerJob[];
  businesses: BusinessWithPlayerData[];
  investments?: InvestmentWithPlayerData[];
}

export function recalculateLocalIncome({
  profile,
  jobs,
  playerJobs,
  businesses,
  investments = [],
}: RecalculateIncomeInput): PlayerProfile {
  const activePlayerJob = playerJobs.find((job) => job.is_active);
  const activeJob = activePlayerJob ? jobs.find((job) => job.id === activePlayerJob.job_id) : null;
  const selectedHouse = LOCAL_HOUSES.find((house) => house.id === profile.selected_house_id);
  const selectedCar = LOCAL_CARS.find((car) => car.id === profile.selected_car_id);

  const jobIncome = Number(activeJob?.hourly_income || 0);
  const businessIncome = businesses
    .filter((business) => business.is_owned)
    .reduce((sum, business) => sum + Number(business.current_hourly_income || 0), 0);
  const investmentIncome = investments.length
    ? investments
        .filter((investment) => investment.is_owned)
        .reduce((sum, investment) => sum + Number(investment.current_rental_income || 0), 0)
    : Number(profile.investment_income || 0);
  const houseRentExpense = Number(selectedHouse?.hourly_rent_cost || 0);
  const vehicleExpense = Number(selectedCar?.hourly_maintenance_cost || 0);
  const otherExpenses = Number(profile.other_expenses || 0);
  const grossIncome = jobIncome + businessIncome + investmentIncome;
  const totalExpenses = houseRentExpense + vehicleExpense + otherExpenses;
  const hourlyIncome = grossIncome - totalExpenses;

  return {
    ...profile,
    current_job_id: activePlayerJob?.job_id || null,
    job_income: jobIncome,
    business_income: businessIncome,
    investment_income: investmentIncome,
    house_rent_expense: houseRentExpense,
    vehicle_expense: vehicleExpense,
    other_expenses: otherExpenses,
    gross_income: grossIncome,
    total_expenses: totalExpenses,
    hourly_income: hourlyIncome,
    last_played_at: new Date().toISOString(),
  };
}

interface RecalculatePrestigeInput {
  profile: PlayerProfile;
  jobs: Job[];
  playerJobs: PlayerJob[];
  businesses: BusinessWithPlayerData[];
  investments?: InvestmentWithPlayerData[];
  selectedOutfit?: CharacterOutfit | null;
}

export function recalculateLocalPrestige({
  profile,
  jobs,
  playerJobs,
  businesses,
  investments,
  selectedOutfit,
}: RecalculatePrestigeInput): PlayerProfile {
  const bonusPrestige = Number(profile.bonus_prestige_points || 0);

  void jobs;
  void playerJobs;
  void businesses;
  void investments;
  void selectedOutfit;
  void LOCAL_HOUSES;
  void LOCAL_CARS;
  void LOCAL_OUTFITS;

  return {
    ...profile,
    prestige_points: bonusPrestige,
  };
}

interface RecalculateEconomyInput extends RecalculateIncomeInput {
  selectedOutfit?: CharacterOutfit | null;
}

export function recalculateLocalEconomy({
  profile,
  jobs,
  playerJobs,
  businesses,
  investments = [],
  selectedOutfit,
}: RecalculateEconomyInput): PlayerProfile {
  const incomeProfile = recalculateLocalIncome({
    profile,
    jobs,
    playerJobs,
    businesses,
    investments,
  });

  return recalculateLocalPrestige({
    profile: incomeProfile,
    jobs,
    playerJobs,
    businesses,
    investments,
    selectedOutfit,
  });
}
