import { useContext } from 'react';
import { I18nContext, type I18nContextValue } from './context';

/** Current language: `t` for UI text, `name` for content, `money`/`duration` for numbers. */
export function useT(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useT must be used inside <I18nProvider>');
  return value;
}
