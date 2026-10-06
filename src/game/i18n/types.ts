export type ContentKind = 'business' | 'career' | 'wealthClass' | 'lifestyle';

/** Translated names of game content, keyed by config id. Missing ids fall back to the English config name. */
export type ContentNames = Record<ContentKind, Record<string, string>>;
