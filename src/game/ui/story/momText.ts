import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';

/**
 * Mom's message text (i18n `mom.<id>`), on her card and in the phone reminder alike. The ones about
 * the hero's daughter name her by the name the player gave ({daughter}).
 */
export function useMomText() {
  const { state } = useGameV2();
  const { t } = useT();
  const daughter = state.story.daughterName || t('moments.defaultName');
  return (id: string) => t(`mom.${id}` as MessageKey, { daughter });
}
