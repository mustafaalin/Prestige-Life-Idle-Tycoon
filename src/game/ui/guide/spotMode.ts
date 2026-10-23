import type { GuideTarget } from './guideSteps';

/**
 * How the screen around the hand dims (Spotlight.tsx): `block` for Old Ray's steps (only the lit
 * element takes a tap), `soft` for a feature's first look (a tap on the dim closes it).
 */
export type SpotMode = 'block' | 'soft';

export const spotOf = (target: GuideTarget | null | undefined): SpotMode | undefined =>
  target ? (target.soft ? 'soft' : 'block') : undefined;

/** A tap on the dim around a soft spot: the intro that lit it closes (FeatureIntro.tsx). */
export const SPOT_OUTSIDE_EVENT = 'v2-spot-outside';
