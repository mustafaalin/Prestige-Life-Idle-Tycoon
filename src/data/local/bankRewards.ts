export const BASE_CASHBACK_RATE = 0.02;
export const PREMIUM_CASHBACK_RATE = 0.04;
export const MIN_CASHBACK_POOL_CAP = 5000;

type CashbackProfileLike = {
  total_money?: number | null;
  hourly_income?: number | null;
  cashback_pool?: number;
  cashback_claimed_total?: number;
  premium_bank_card_owned?: boolean;
};

export function getCashbackRate(profile?: CashbackProfileLike | null) {
  return profile?.premium_bank_card_owned ? PREMIUM_CASHBACK_RATE : BASE_CASHBACK_RATE;
}

export function getCashbackPoolCap(profile: CashbackProfileLike) {
  return Math.max(
    MIN_CASHBACK_POOL_CAP,
    Math.floor(Number(profile.hourly_income || 0) * 6)
  );
}

export function awardCashback<T extends CashbackProfileLike>(profile: T, spentAmount: number) {
  const normalizedSpentAmount = Math.max(0, Math.floor(spentAmount));
  const currentPool = Math.max(0, Math.floor(Number(profile.cashback_pool || 0)));
  const earnedCashbackBase = Math.floor(normalizedSpentAmount * getCashbackRate(profile));

  if (normalizedSpentAmount <= 0 || earnedCashbackBase <= 0) {
    return {
      updatedProfile: {
        ...profile,
        cashback_pool: currentPool,
      },
      earnedCashback: 0,
      cap: getCashbackPoolCap(profile),
      capped: false,
    };
  }

  const cap = getCashbackPoolCap(profile);
  const nextPool = Math.min(cap, currentPool + earnedCashbackBase);

  return {
    updatedProfile: {
      ...profile,
      cashback_pool: nextPool,
    },
    earnedCashback: Math.max(0, nextPool - currentPool),
    cap,
    capped: nextPool < currentPool + earnedCashbackBase,
  };
}

export function claimCashback<T extends CashbackProfileLike>(profile: T) {
  const claimableAmount = Math.max(0, Math.floor(Number(profile.cashback_pool || 0)));

  if (claimableAmount <= 0) {
    return null;
  }

  return {
    updatedProfile: {
      ...profile,
      total_money: Math.floor(Number(profile.total_money || 0)) + claimableAmount,
      cashback_pool: 0,
      cashback_claimed_total:
        Math.floor(Number(profile.cashback_claimed_total || 0)) + claimableAmount,
    },
    claimedAmount: claimableAmount,
  };
}
