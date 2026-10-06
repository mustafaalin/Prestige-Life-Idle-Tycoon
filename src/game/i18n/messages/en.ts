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
  business: {
    title: 'Businesses',
    max: 'Max',
    buy: 'Buy ×{count}',
    manager: 'Manager',
    auto: 'AUTO',
    tapToRun: 'Tap to run',
    earns: 'Earns {amount} every {duration}',
    milestone: '{left} more to {target} → ×2 profit',
    allMilestones: 'All milestones reached',
    teaser: 'Next · {price}',
  },
  career: {
    current: 'Current job',
    unemployed: 'No job yet',
    unemployedBody: 'A job pays a salary every second, even while you are away.',
    salary: 'Salary {amount}/s',
    totalBonus: '+{percent}% to all income',
    next: 'Next promotion',
    firstJobLabel: 'Your first job',
    gain: '+{amount}/s income',
    salaryLabel: 'Salary',
    bonusLabel: 'Income bonus',
    bonusShort: '+{percent}%',
    promote: 'Get promoted',
    firstJob: 'Get the job',
    affordIn: 'Affordable in ~{duration}',
    top: 'You reached the top of your career',
    ladder: 'Career ladder',
  },
  tabs: {
    businesses: 'Businesses',
    career: 'Career',
    shop: 'Shop',
    soon: 'Soon',
  },
  offline: {
    title: 'Welcome back!',
    body: 'You were away for {duration}. Your managers earned:',
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
