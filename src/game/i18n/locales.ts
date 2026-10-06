import { EN_NUMBER_STYLE, type NumberStyle } from '../core/format';
import { trContent } from './content/tr';
import { en, type Messages } from './messages/en';
import { tr } from './messages/tr';
import type { ContentNames } from './types';

// Adding a language: messages/<code>.ts (typed as Messages), content/<code>.ts, a number style,
// and one entry in LOCALES.

export type Locale = 'en' | 'tr';

export interface LocaleDef {
  code: Locale;
  /** Shown in the language picker, always in its own language. */
  nativeName: string;
  messages: Messages;
  /** null = use the English names from the game config. */
  content: ContentNames | null;
  numbers: NumberStyle;
}

const TR_NUMBER_STYLE: NumberStyle = {
  decimal: ',',
  // "Bin" is spelled out: a bare "B" reads as billion to anyone used to English games.
  suffixes: ['', 'Bin', 'Mn', 'Mr', 'Tn', 'Ktn', 'Kn', 'Sks', 'Spt', 'Okt', 'Non', 'Des'],
  spaceBeforeSuffix: true,
  duration: { day: 'g', hour: 'sa', minute: 'dk', second: 'sn' },
};

export const LOCALES: Record<Locale, LocaleDef> = {
  en: { code: 'en', nativeName: 'English', messages: en, content: null, numbers: EN_NUMBER_STYLE },
  tr: { code: 'tr', nativeName: 'Türkçe', messages: tr, content: trContent, numbers: TR_NUMBER_STYLE },
};

export const DEFAULT_LOCALE: Locale = 'en';
const STORAGE_KEY = 'prestige_life_v2_locale';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in LOCALES;
}

/** Saved choice first, then the device language, then English. */
export function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Storage blocked: fall through to the device language.
  }
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  for (const language of languages) {
    const code = language?.slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not saved; the device language is used next launch.
  }
}
