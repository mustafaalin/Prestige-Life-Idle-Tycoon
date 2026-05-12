import type { InvestmentWithPlayerData, InvestmentUpgradeKey } from '../../types/game';

export const INVESTMENT_UPGRADE_ORDER: InvestmentUpgradeKey[] = [
  'paint',
  'appliances',
  'furniture',
  'internet',
  'parking',
];

export const INVESTMENT_UPGRADE_LABELS: Record<InvestmentUpgradeKey, string> = {
  paint: 'Paint House',
  appliances: 'Add Appliances',
  furniture: 'Add Furniture',
  internet: 'Connect Internet',
  parking: 'Build Parking',
};

export const INVESTMENT_UPGRADE_COST_DIVISORS = [10, 6, 4, 3, 2] as const;
export const INVESTMENT_UPGRADE_INCOME_BOOSTS = [0.2, 0.45, 0.75, 1.1, 1.5] as const;

function getInvestmentImageAsset(id: number) {
  if (id >= 1 && id <= 50) {
    return `/assets/investments/real-estate/inv-house-${id}.webp`;
  }

  return '';
}

const rows = [
  { id: 1, region: 'Detroit, Michigan, USA', price: 30000 },
  { id: 2, region: 'Monterrey, Mexico', price: 45000 },
  { id: 3, region: 'Izmir, Turkey', price: 60000 },
  { id: 4, region: 'Porto Alegre, Brazil', price: 80000 },
  { id: 5, region: 'Kraków, Poland', price: 110000 },
  { id: 6, region: 'Memphis, Tennessee, USA', price: 140000 },
  { id: 7, region: 'Casablanca, Morocco', price: 180000 },
  { id: 8, region: 'Osaka Suburb, Japan', price: 230000 },
  { id: 9, region: 'Valencia Outskirts, Spain', price: 290000 },
  { id: 10, region: 'Cape Town Starter District, South Africa', price: 360000 },
  { id: 11, region: 'Cleveland, Ohio, USA', price: 450000 },
  { id: 12, region: 'Antalya, Turkey', price: 560000 },
  { id: 13, region: 'Medellín, Colombia', price: 700000 },
  { id: 14, region: 'Lisbon Outskirts, Portugal', price: 880000 },
  { id: 15, region: 'Athens Suburb, Greece', price: 1100000 },
  { id: 16, region: 'Prague Outer District, Czech Republic', price: 1400000 },
  { id: 17, region: 'Durban, South Africa', price: 1800000 },
  { id: 18, region: 'Brisbane Suburb, Australia', price: 2300000 },
  { id: 19, region: 'Busan Residential Hills, South Korea', price: 2900000 },
  { id: 20, region: 'Austin, Texas, USA', price: 3600000 },
  { id: 21, region: 'Budapest, Hungary', price: 4500000 },
  { id: 22, region: 'Santiago, Chile', price: 5600000 },
  { id: 23, region: 'Naples, Italy', price: 7000000 },
  { id: 24, region: 'Dubai Suburb, UAE', price: 8800000 },
  { id: 25, region: 'Vancouver Fringe, Canada', price: 11000000 },
  { id: 26, region: 'San Diego, California, USA', price: 14000000 },
  { id: 27, region: 'Gold Coast, Australia', price: 17500000 },
  { id: 28, region: 'Malaga Hills, Spain', price: 22000000 },
  { id: 29, region: 'Abu Dhabi Residential Coast, UAE', price: 27500000 },
  { id: 30, region: 'Berlin Villa District, Germany', price: 34000000 },
  { id: 31, region: 'Miami Waterfront, Florida, USA', price: 42000000 },
  { id: 32, region: 'Toronto Prestige District, Canada', price: 52000000 },
  { id: 33, region: 'Sydney Harbour Hills, Australia', price: 64000000 },
  { id: 34, region: 'Amsterdam Canal Belt Edge, Netherlands', price: 78000000 },
  { id: 35, region: 'Paris Luxury Suburb, France', price: 94000000 },
  { id: 36, region: 'Singapore Prestige Residential, Singapore', price: 112000000 },
  { id: 37, region: 'Hong Kong Hillside Residence, Hong Kong', price: 132000000 },
  { id: 38, region: 'Mallorca Cliffside, Spain', price: 154000000 },
  { id: 39, region: 'Lake Como Villa Zone, Italy', price: 178000000 },
  { id: 40, region: 'Beverly Hills, California, USA', price: 210000000 },
  { id: 41, region: 'Manhattan Riverside Estate, New York, USA', price: 225000000 },
  { id: 42, region: 'Monaco Hillside, Monaco', price: 240000000 },
  { id: 43, region: 'Mayfair Private Residence, London, UK', price: 258000000 },
  { id: 44, region: 'Swiss Alps Modern Estate, Switzerland', price: 278000000 },
  { id: 45, region: 'Santorini Cliff Residence, Greece', price: 295000000 },
  { id: 46, region: 'French Riviera Grand Estate, France', price: 310000000 },
  { id: 47, region: 'Dubai Palm Mansion, UAE', price: 325000000 },
  { id: 48, region: 'Malibu Oceanfront Compound, California, USA', price: 337000000 },
  { id: 49, region: 'The Peak, Hong Kong', price: 344000000 },
  { id: 50, region: 'Futuristic Cliffside Estate, Norway', price: 350000000 },
] as const;

export const LOCAL_INVESTMENTS: InvestmentWithPlayerData[] = rows.map((row) => ({
  id: `investment-property-${row.id}`,
  name: `Property ${row.id}`,
  region: row.region,
  description: `Rental property in ${row.region}`,
  category: 'real-estate',
  price: row.price,
  base_rental_income: Math.floor(row.price / 200),
  image_url: getInvestmentImageAsset(row.id),
  sort_order: row.id,
  is_owned: false,
  current_level: 0,
  current_rental_income: 0,
  total_invested: 0,
  purchased_at: null,
  upgrades_applied: [],
}));

export function calculateInvestmentRentalIncome(
  baseRentalIncome: number,
  upgradesApplied: InvestmentUpgradeKey[]
) {
  if (!upgradesApplied.length) {
    return baseRentalIncome;
  }

  const latestUpgrade = upgradesApplied[upgradesApplied.length - 1];
  const latestUpgradeIndex = INVESTMENT_UPGRADE_ORDER.indexOf(latestUpgrade);
  const latestBoost = INVESTMENT_UPGRADE_INCOME_BOOSTS[latestUpgradeIndex] ?? 0;

  return baseRentalIncome + Math.floor(baseRentalIncome * latestBoost);
}
