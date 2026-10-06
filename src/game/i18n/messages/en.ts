// Source language. Every other language must have exactly this shape (enforced by the Messages type).
// Placeholders: {name}. Plurals: { one, other } picked by the `count` param.

export const en = {
  common: {
    collect: 'Collect',
    close: 'Close',
  },
  hud: {
    perSecond: '{amount}/s',
    toNextClass: '{percent}% to {name}',
    topClass: 'Top of the world',
  },
  tap: {
    button: 'Tap to earn',
  },
  offline: {
    title: 'Welcome back!',
    body: 'You were away for {duration}. Your managers earned:',
  },
  placeholder: {
    body: 'Business, career and shopping screens are on the way.',
  },
  dev: {
    open: 'DEV',
    title: 'Developer menu',
    speed: 'Game speed',
    addCash: 'Add money',
    away: 'Simulate time away',
    language: 'Language',
    reset: 'Reset save',
    resetConfirm: 'Tap again to wipe the save',
  },
};

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Messages = Widen<typeof en>;
