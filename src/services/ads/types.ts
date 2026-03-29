import { useEffect, useState } from 'react';

export type AdPlacement =
  | 'quest_reward_x2'
  | 'offline_x2'
  | 'daily_streak_rescue'
  | 'shop_ad_reward'
  | 'earnings_x3'
  | 'business_upgrade_discount'
  | 'job_unlock_skip'
  | 'bank_premium_deposit';

export interface RewardedAdRequest {
  id: number;
  placement: AdPlacement;
  title: string;
  description: string;
  ctaLabel: string;
  minWatchSeconds: number;
}

export interface RewardedAdResult {
  rewarded: boolean;
}

export interface AdServiceState {
  activeRequest: RewardedAdRequest | null;
  providerName: 'mock' | 'capacitor-admob';
}

export interface RewardedAdProvider {
  readonly name: AdServiceState['providerName'];
  showRewardedAd: (placement: AdPlacement) => Promise<RewardedAdResult>;
  rewardActiveAd?: () => void;
  dismissActiveAd?: () => void;
  getState: () => AdServiceState;
  subscribe: (listener: () => void) => () => void;
}

export function createEmptyAdState(
  providerName: AdServiceState['providerName']
): AdServiceState {
  return {
    activeRequest: null,
    providerName,
  };
}

export function useExternalAdState(
  subscribe: (listener: () => void) => () => void,
  getState: () => AdServiceState
) {
  const [snapshot, setSnapshot] = useState<AdServiceState>(getState());

  useEffect(() => {
    return subscribe(() => {
      setSnapshot(getState());
    });
  }, [getState, subscribe]);

  return snapshot;
}
