import { BUSINESSES } from '../core/config/businesses';
import { HOUSES } from '../core/config/housing';
import { LUXURY_TOYS, VEHICLES } from '../core/config/lifestyle';
import type { Locale } from '../i18n/locales';
import type { ContentKind } from '../i18n/types';

// The two cities the generations take turns in (story-v2.md §6, decided 2026-10-16): odd generations
// live in the old city with the first hero's pictures, even ones in Lumen. The numbers are the same in
// both (game-design §4.10), so Lumen is a skin over the same ids: a business, home, vehicle or luxury
// keeps its id, price and save entry, and only its name, picture and manager change. Art:
// docs/lumen-art-handoff.md.

export type City = 'old' | 'lumen';

export const cityOf = (generation: number): City => (generation % 2 === 0 ? 'lumen' : 'old');

let current: City = 'old';
export const currentCity = () => current;

/** DEV only: shows a city whatever the generation, to look at its art (null = the real one). */
let preview: City | null = null;
export const cityPreview = () => preview;
export function setCityPreview(city: City | null) {
  preview = city;
}

const LUMEN_SCENE = '/assets/scene/lumen';
const LUMEN_BUSINESS = '/assets/businesses/lumen';
const LUMEN_VEHICLE = '/assets/vehicles/lumen';

/** Lumen's pictures by id; the Flower Stand keeps its icon (the grandfather's stand). */
const LUMEN_IMAGES: Record<string, string> = {
  ...Object.fromEntries(
    ['coffee-cart', 'bakery', 'car-wash', 'mini-market', 'beauty-salon', 'logistics-warehouse', 'factory', 'hotel', 'tech-startup'].map(
      (id) => [id, `${LUMEN_BUSINESS}/${id}.webp`],
    ),
  ),
  ...Object.fromEntries(HOUSES.map((house, index) => [house.id, `${LUMEN_SCENE}/home-${index + 1}.webp`])),
  ...Object.fromEntries(VEHICLES.map((vehicle) => [vehicle.id, `${LUMEN_VEHICLE}/${vehicle.id}.webp`])),
  'toy-1': `${LUMEN_VEHICLE}/luxury-hydrofoil.webp`,
  'toy-2': `${LUMEN_VEHICLE}/luxury-solar-yacht.webp`,
  'toy-3': `${LUMEN_VEHICLE}/luxury-helicopter.webp`,
  'toy-4': `${LUMEN_VEHICLE}/luxury-jet.webp`,
};

type Names = Partial<Record<ContentKind, Record<string, string>>>;

/** Lumen's names; anything missing keeps the old city's name. */
const LUMEN_NAMES: Record<Locale, Names> = {
  en: {
    business: {
      'coffee-cart': 'Coffee Bar',
      bakery: 'Phone Repair',
      'car-wash': 'E-Scooter Rental',
      'mini-market': 'Vertical Farm',
      'beauty-salon': 'VR Arcade',
      'logistics-warehouse': 'Drone Delivery',
      factory: 'Solar Farm',
      hotel: 'Biotech Lab',
      'tech-startup': 'AI Campus',
    },
    lifestyle: {
      'home-1': 'Capsule Room',
      'home-2': 'Old Houseboat',
      'home-3': 'Co-living Room',
      'home-4': 'Container Flat',
      'home-5': 'Green-Balcony Flat',
      'home-6': 'Garden Complex',
      'home-7': 'Modular House',
      'home-8': 'Green-Roof Family House',
      'home-9': 'Terrace Villa',
      'home-10': 'Hilltop Glass House',
      'home-11': 'Seafront Mansion',
      'home-12': 'Sky Mansion',
      'vehicle-bike': 'City E-Bike',
      'vehicle-scooter': 'Electric Moped',
      'vehicle-old-sedan': 'First-Gen Electric',
      'vehicle-motorcycle': 'Electric Motorcycle',
      'vehicle-hatchback': 'Electric City Car',
      'vehicle-suv': 'Electric Crossover',
      'vehicle-pickup': 'Electric Pickup',
      'vehicle-executive': 'Electric Executive Saloon',
      'vehicle-coupe': 'Electric Sports Coupe',
      'vehicle-offroader': 'Expedition 4x4',
      'vehicle-supercar': 'Electric Hypercar',
      'vehicle-grand': 'Grand Tourer',
      'toy-1': 'Hydrofoil Boat',
      'toy-2': 'Solar Yacht',
      'toy-3': 'Electric Helicopter',
      'toy-4': 'Supersonic Jet',
    },
  },
  tr: {
    business: {
      'coffee-cart': 'Kahve Barı',
      bakery: 'Telefon Tamircisi',
      'car-wash': 'E-Scooter Kiralama',
      'mini-market': 'Dikey Tarla',
      'beauty-salon': 'Sanal Gerçeklik Salonu',
      'logistics-warehouse': 'Dron Kargo',
      factory: 'Güneş Santrali',
      hotel: 'Biyoteknoloji Laboratuvarı',
      'tech-startup': 'Yapay Zekâ Kampüsü',
    },
    lifestyle: {
      'home-1': 'Kapsül Oda',
      'home-2': 'Eski Tekne Ev',
      'home-3': 'Ortak Yaşam Odası',
      'home-4': 'Konteyner Daire',
      'home-5': 'Yeşil Balkonlu Daire',
      'home-6': 'Bahçeli Site',
      'home-7': 'Modüler Ev',
      'home-8': 'Yeşil Çatılı Aile Evi',
      'home-9': 'Teras Villa',
      'home-10': 'Tepedeki Cam Ev',
      'home-11': 'Kıyı Malikânesi',
      'home-12': 'Kule Tepesi Malikânesi',
      'vehicle-bike': 'E-Bisiklet',
      'vehicle-scooter': 'E-Moped',
      'vehicle-old-sedan': 'İlk Elektrikli',
      'vehicle-motorcycle': 'Elektrikli Motosiklet',
      'vehicle-hatchback': 'Şehir Arabası',
      'vehicle-suv': 'Elektrikli Crossover',
      'vehicle-pickup': 'Elektrikli Pikap',
      'vehicle-executive': 'Elektrikli Makam Sedanı',
      'vehicle-coupe': 'Elektrikli Spor Coupe',
      'vehicle-offroader': 'Keşif Aracı',
      'vehicle-supercar': 'Hiper Araba',
      'vehicle-grand': 'Grand Tourer',
      'toy-1': 'Hidrofil Tekne',
      'toy-2': 'Güneş Yatı',
      'toy-3': 'Elektrikli Helikopter',
      'toy-4': 'Süpersonik Jet',
    },
  },
};

/** The current city's name for a piece of content, or undefined to keep the old city's. */
export function cityName(locale: Locale, kind: ContentKind, id: string): string | undefined {
  return current === 'lumen' ? LUMEN_NAMES[locale]?.[kind]?.[id] : undefined;
}

/** The i18n branch holding the current city's managers. Business level names are the old city's until generation 2 writes Lumen's. */
export const cityManagers = () => (current === 'lumen' ? 'managersLumen' : 'managers');

/** Lumen's managers drawn so far; the lines added in 2026-10 keep the old city's portrait there until generation 2 draws theirs. */
const LUMEN_MANAGERS = new Set(['flower-stand', 'coffee-cart', 'bakery', 'car-wash', 'mini-market', 'beauty-salon', 'logistics-warehouse', 'factory', 'hotel', 'tech-startup']);

/** The current city's manager portrait for a business. */
export const cityManagerPortrait = (businessId: string) =>
  current === 'lumen' && LUMEN_MANAGERS.has(businessId) ? `/assets/managers/lumen/${businessId}.webp` : `/assets/managers/${businessId}.webp`;

const SKINNED = [...BUSINESSES, ...HOUSES, ...VEHICLES, ...LUXURY_TOYS];
const OLD_IMAGES = new Map(SKINNED.map((def) => [def.id, def.image]));
const OLD_STAGES = new Map(BUSINESSES.map((def) => [def.id, def.stageImages]));

/**
 * Puts the city's pictures on the shared definitions (only `image` and a business's `stageImages`
 * change: the economy never reads them). Lumen draws one look per business so far, so it has no stages.
 * Called by the store whenever the state changes, so every screen draws the city of the generation
 * being played; it does nothing while the city stays the same.
 */
export function applyCity(generationCity: City) {
  const city = preview ?? generationCity;
  if (city === current) return;
  current = city;
  for (const def of SKINNED) {
    def.image = (city === 'lumen' ? LUMEN_IMAGES[def.id] : undefined) ?? OLD_IMAGES.get(def.id) ?? def.image;
  }
  for (const def of BUSINESSES) {
    const lumen = city === 'lumen' ? LUMEN_IMAGES[def.id] : undefined;
    def.stageImages = lumen ? [lumen] : (OLD_STAGES.get(def.id) ?? def.stageImages);
  }
}
