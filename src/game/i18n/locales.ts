import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
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

function readLocal(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function deviceLocale(): Locale {
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  for (const language of languages) {
    const code = language?.slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

/**
 * Saved choice first, then the device language, then English. On phones the choice lives in
 * Preferences like the save (the OS may clear a WebView's localStorage); a choice made before that
 * only exists in localStorage and is copied over. Never throws.
 */
export async function loadLocale(): Promise<Locale> {
  const local = readLocal();
  if (Capacitor.isNativePlatform()) {
    try {
      const stored = (await Preferences.get({ key: STORAGE_KEY })).value;
      if (isLocale(stored)) return stored;
      if (isLocale(local)) await Preferences.set({ key: STORAGE_KEY, value: local });
    } catch {
      // Native storage unavailable: fall back to the local copy.
    }
  }
  return isLocale(local) ? local : deviceLocale();
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The native copy below is the one that counts on phones.
  }
  if (Capacitor.isNativePlatform()) Preferences.set({ key: STORAGE_KEY, value: locale }).catch(() => {});
}
