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

/**
 * The same text for a small ad chip inside a card (2026-10-21, user: full-width ad bars everywhere
 * were too much): the ticket on the chip already says "ad", so "Watch an ad: " is left out.
 */
export function useAdChipText() {
  const { t, locale } = useT();
  return (key: MessageKey, params: MessageParams = {}) => {
    const text = t(key, { ...params, watch: '' }).replace(/^\s*:\s*/, '');
    return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
  };
}
