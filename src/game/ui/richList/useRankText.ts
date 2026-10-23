import { useT } from '../../i18n/useT';

/** A Rich List place in the game's language: "#1,204" / "#1.204". */
export function useRankText() {
  const { locale } = useT();
  const format = new Intl.NumberFormat(locale);
  return (rank: number) => `#${format.format(rank)}`;
}
