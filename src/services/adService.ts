import { selectRewardedAdProvider } from './ads/providerSelector';
import { useExternalAdState } from './ads/types';
import type { AdPlacement, RewardedAdResult } from './ads/types';
import { initializeCapacitorAdMob } from './ads/providers/capacitorAdmobProvider';

const rewardedAdProvider = selectRewardedAdProvider();

export type { AdPlacement, RewardedAdRequest, RewardedAdResult } from './ads/types';

export async function showRewardedAd(placement: AdPlacement): Promise<RewardedAdResult> {
  return rewardedAdProvider.showRewardedAd(placement);
}

export function rewardActiveAd() {
  rewardedAdProvider.rewardActiveAd?.();
}

export function dismissActiveAd() {
  rewardedAdProvider.dismissActiveAd?.();
}

export function getAdServiceState() {
  return rewardedAdProvider.getState();
}

export function subscribeToAdService(listener: () => void) {
  return rewardedAdProvider.subscribe(listener);
}

export function useAdServiceState() {
  return useExternalAdState(subscribeToAdService, getAdServiceState);
}

export function getAdProviderName() {
  return rewardedAdProvider.name;
}

export async function initializeAds() {
  if (rewardedAdProvider.name !== 'capacitor-admob') {
    return;
  }

  await initializeCapacitorAdMob();
}
