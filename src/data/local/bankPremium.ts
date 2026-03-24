export const PREMIUM_BANK_CARD_PRICE_GEMS = 50;
export const PREMIUM_BANK_CARD_PRICE_USD = 1.49;

type PremiumProfileLike = {
  gems?: number | null;
  premium_bank_card_owned?: boolean;
  premium_bank_card_purchased_at?: string | null;
  premium_bank_card_purchase_source?: 'gems' | 'cash' | null;
};

export type PremiumPurchaseMethod = 'gems' | 'cash';

export function hasPremiumBankCard(profile: PremiumProfileLike | null | undefined) {
  return Boolean(profile?.premium_bank_card_owned);
}

export function canPurchasePremiumBankCard(
  profile: PremiumProfileLike | null | undefined,
  purchaseMethod: PremiumPurchaseMethod
) {
  if (!profile || hasPremiumBankCard(profile)) {
    return false;
  }

  if (purchaseMethod === 'cash') {
    return true;
  }

  return Math.floor(Number(profile.gems || 0)) >= PREMIUM_BANK_CARD_PRICE_GEMS;
}

export function applyPremiumBankCardPurchase<T extends PremiumProfileLike>(
  profile: T,
  purchaseMethod: PremiumPurchaseMethod
) {
  if (!canPurchasePremiumBankCard(profile, purchaseMethod)) {
    return null;
  }

  const currentGems = Math.floor(Number(profile.gems || 0));

  return {
    ...profile,
    gems: purchaseMethod === 'gems' ? currentGems - PREMIUM_BANK_CARD_PRICE_GEMS : currentGems,
    premium_bank_card_owned: true,
    premium_bank_card_purchased_at: new Date().toISOString(),
    premium_bank_card_purchase_source: purchaseMethod,
  };
}

export function getPremiumRealEstateIncomeMultiplier(profile: PremiumProfileLike | null | undefined) {
  return hasPremiumBankCard(profile) ? 2 : 1;
}
