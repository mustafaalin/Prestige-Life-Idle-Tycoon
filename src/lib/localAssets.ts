export const LOCAL_ASSET_PATHS = {
  profile: '/assets/placeholders/profile.svg',
  character: '/assets/placeholders/character.svg',
  car: '/assets/placeholders/car.svg',
  house: '/assets/placeholders/house.svg',
  outfit: '/assets/placeholders/outfit.svg',
  business: '/assets/placeholders/business.svg',
  job: '/assets/placeholders/job.svg',
} as const;

export const LOCAL_ICON_ASSETS = {
  money: '/assets/icons/money.png',
  wallet: '/assets/icons/wallet.png',
  healthy: '/assets/icons/healthy.png',
  happiness: '/assets/icons/happiness.png',
  gem: '/assets/icons/gem.png',
  settings: '/assets/icons/settings.png',
  prestige: '/assets/icons/prestige-points.png',
  shop: '/assets/icons/shop.png',
  job: '/assets/icons/job.png',
  business: '/assets/icons/business.png',
  investments: '/assets/icons/investments.png',
  stuff: '/assets/icons/stuff.png',
  buyMoreMoney: '/assets/icons/money-pack-1.png',
  gemBox: '/assets/icons/gem.png',
  ads: '/assets/icons/ads.png',
  // Money pack tier icons
  moneyPack0: '/assets/icons/money.png',
  moneyPack1: '/assets/icons/money-pack-1.png',
  moneyPack2: '/assets/icons/money-pack-2.png',
  moneyPack3: '/assets/icons/money-pack-3.png',
  moneyPack4: '/assets/icons/money-pack-4.png',
  // Gem pack tier icons
  gemPack1: '/assets/icons/gem-pack-1.png',
  gemPack2: '/assets/icons/gem-pack-2.png',
  gemPack3: '/assets/icons/gem-pack-3.png',
  gemPack4: '/assets/icons/gem-pack-4.png',
} as const;

export const LOCAL_PROFILE_PLACEHOLDER = LOCAL_ASSET_PATHS.profile;

export const LOCAL_CHARACTER_PLACEHOLDER = LOCAL_ASSET_PATHS.character;

export function resolveLocalAsset(
  src: string | null | undefined,
  kind: keyof typeof LOCAL_ASSET_PATHS
) {
  if (typeof src === 'string' && src.trim().length > 0) {
    return src;
  }

  return LOCAL_ASSET_PATHS[kind];
}

export function getHouseIconAsset(level: number) {
  return `/assets/houses/icons/house-${level}.webp`;
}

export function getHouseBackgroundAsset(level: number) {
  return `/assets/houses/backgrounds/house-${level}.webp`;
}

export function getPremiumHouseIconAsset(premiumTier: 1 | 2 | 3) {
  return `/assets/houses/icons/p-house-${premiumTier}.webp`;
}

export function getPremiumHouseBackgroundAsset(premiumTier: 1 | 2 | 3) {
  return `/assets/houses/backgrounds/p-house-${premiumTier}.webp`;
}
