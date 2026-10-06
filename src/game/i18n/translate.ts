import { formatAmount, formatDuration, formatMoney } from '../core/format';
import { LOCALES, type Locale } from './locales';
import { en, type Messages } from './messages/en';
import type { ContentKind } from './types';

type Plural = { one: string; other: string };
type Leaf = string | Plural;
type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Paths<Messages>;
export type MessageParams = Record<string, string | number>;

function lookup(messages: Messages, key: string): Leaf | undefined {
  let node: unknown = messages;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' || (typeof node === 'object' && node !== null && 'other' in node)
    ? (node as Leaf)
    : undefined;
}

export interface Translator {
  locale: Locale;
  /** UI text: t('offline.title'), t('hud.perSecond', { amount }), plurals via { count }. */
  t(key: MessageKey, params?: MessageParams): string;
  /** Localized name of a business, job, wealth class or lifestyle item. */
  name(kind: ContentKind, def: { id: string; name: string }): string;
  money(value: number): string;
  amount(value: number): string;
  duration(seconds: number): string;
}

/** Plain (non-React) translator, so the same text can be used outside components. */
export function createTranslator(locale: Locale): Translator {
  const def = LOCALES[locale];
  const plurals = new Intl.PluralRules(locale);

  return {
    locale,

    t(key, params) {
      const leaf = lookup(def.messages, key) ?? lookup(en, key) ?? key;
      const template =
        typeof leaf === 'string'
          ? leaf
          : leaf[plurals.select(Number(params?.count ?? 0)) === 'one' ? 'one' : 'other'];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
    },

    name(kind, item) {
      return def.content?.[kind][item.id] ?? item.name;
    },

    money: (value) => formatMoney(value, def.numbers),
    amount: (value) => formatAmount(value, def.numbers),
    duration: (seconds) => formatDuration(seconds, def.numbers),
  };
}
