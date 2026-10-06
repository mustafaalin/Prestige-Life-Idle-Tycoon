import { createContext } from 'react';
import type { Locale } from './locales';
import type { Translator } from './translate';

export interface I18nContextValue extends Translator {
  setLocale(locale: Locale): void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
