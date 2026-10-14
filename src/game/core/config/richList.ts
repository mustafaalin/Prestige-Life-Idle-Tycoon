// The Rich List (discussion-notes §10): a fictional ranking of the world's richest, measured by what the
// hero earned in this life, the same number the wealth class follows. Spending never drops a place, and
// passing the top rival happens at $1T, the Richest Person Alive ceremony. Names are light parodies;
// no portraits, company names or logos.

export interface RichRivalDef {
  name: string;
  /** A family fortune: shown as i18n `richList.family` ("the {name} family"). */
  family?: boolean;
  /** i18n `richList.sector.<sector>`. */
  sector: string;
  fortune: number;
}

/** The top 19, richest first; the hero joins them at $100B (Multibillionaire) as #20. */
export const RICH_RIVALS: RichRivalDef[] = [
  { name: 'Alan Trusk', sector: 'rockets', fortune: 880e9 },
  { name: 'Larry Elsin', sector: 'database', fortune: 410e9 },
  { name: 'Larry Paige', sector: 'search', fortune: 350e9 },
  { name: 'Geoff Bezel', sector: 'shopping', fortune: 290e9 },
  { name: 'Mark Zuckerbird', sector: 'social', fortune: 260e9 },
  { name: 'Sergei Brine', sector: 'search', fortune: 230e9 },
  { name: 'Jensen Hwang', sector: 'chips', fortune: 210e9 },
  { name: 'Bernard Arnot', sector: 'fashion', fortune: 190e9 },
  { name: 'Steve Ballmore', sector: 'software', fortune: 175e9 },
  { name: 'Warren Buffay', sector: 'investor', fortune: 160e9 },
  { name: 'Michael Dale', sector: 'computers', fortune: 150e9 },
  { name: 'Walden', family: true, sector: 'supermarkets', fortune: 140e9 },
  { name: 'Bill Gaits', sector: 'software', fortune: 130e9 },
  { name: 'Amancio Orteca', sector: 'clothing', fortune: 125e9 },
  { name: 'Carlos Slimm', sector: 'telecom', fortune: 120e9 },
  { name: 'Mukesh Amberi', sector: 'energy', fortune: 115e9 },
  { name: 'Michael Bloomfield', sector: 'news', fortune: 112e9 },
  { name: 'Gautam Adarni', sector: 'ports', fortune: 108e9 },
  { name: 'Zhong Shanyu', sector: 'water', fortune: 105e9 },
];

/** The list starts here: the Billionaire class. Below it the hero is not on the list. */
export const RICH_LIST_ENTRY = 1e9;

/**
 * Below the named top 20 the place comes from these points (earnings, rank), roughly the real
 * spread of the world's billionaires; between two points it runs straight on a log-log scale.
 */
export const RICH_LIST_ANCHORS: [earnings: number, rank: number][] = [
  [1e9, 3400],
  [4e9, 1000],
  [25e9, 100],
  [100e9, 20],
];

export type RichMilestoneId = 'entry' | 'top1000' | 'top100' | 'top10' | 'top5' | 'second';

/** Who reacts on the card; `news` is a headline with no portrait. */
export type RichSpeaker = 'bryce' | 'news' | 'cousin' | 'mom' | 'riza';

export interface RichMilestoneDef {
  id: RichMilestoneId;
  /** Reached at this place or better. */
  rank: number;
  speaker: RichSpeaker;
}

/**
 * The places worth a short card (text in i18n `richList.moments.<id>`), in order. Top 20 and #1 have
 * no card: the Multibillionaire and Richest ceremonies are those moments.
 */
export const RICH_MILESTONES: RichMilestoneDef[] = [
  { id: 'entry', rank: 3400, speaker: 'bryce' },
  { id: 'top1000', rank: 1000, speaker: 'news' },
  { id: 'top100', rank: 100, speaker: 'cousin' },
  { id: 'top10', rank: 10, speaker: 'mom' },
  { id: 'top5', rank: 5, speaker: 'riza' },
  { id: 'second', rank: 2, speaker: 'news' },
];
