import { adFree } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';

/** Whether the player owns the Comfort Pack: ad offers give their reward without the ad. */
export function useAdFree() {
  const { state } = useGameV2();
  return adFree(state.purchases);
}
