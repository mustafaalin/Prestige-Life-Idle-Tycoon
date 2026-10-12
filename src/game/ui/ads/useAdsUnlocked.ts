import { adsUnlocked } from '../../runtime/adRewards';
import { useGameV2 } from '../../runtime/useGameV2';

/** Ad offers start after the first session (adRewards.ts); cards ask before showing their ad button. */
export function useAdsUnlocked() {
  const { state } = useGameV2();
  return adsUnlocked(state);
}
