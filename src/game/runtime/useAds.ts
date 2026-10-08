import { useSyncExternalStore } from 'react';
import { getAdsState, subscribeAds } from './ads';

/** Ad and consent state for components (privacy options button, mock ad overlay). */
export function useAdsState() {
  return useSyncExternalStore(subscribeAds, getAdsState);
}
