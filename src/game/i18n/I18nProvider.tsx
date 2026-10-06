import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { I18nContext } from './context';
import { initialLocale, saveLocale, type Locale } from './locales';
import { createTranslator } from './translate';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      ...createTranslator(locale),
      setLocale: (next: Locale) => {
        saveLocale(next);
        setLocaleState(next);
      },
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
