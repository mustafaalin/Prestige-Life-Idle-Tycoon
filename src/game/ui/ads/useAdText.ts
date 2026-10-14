import type { MessageKey, MessageParams } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { adFree } from '../../runtime/purchases';
import { useGameV2 } from '../../runtime/useGameV2';

/** Whether the player owns the Comfort Pack: ad offers give their reward without the ad. */
export function useAdFree() {
  const { state } = useGameV2();
  return adFree(state.purchases);
}

/** An ad button's text: "Watch an ad: …", or "Get it now: …" with the Comfort Pack. */
export function useAdText() {
  const { t } = useT();
  const free = useAdFree();
  return (key: MessageKey, params: MessageParams = {}) => t(key, { ...params, watch: t(free ? 'ads.take' : 'ads.watch') });
}
