import { Capacitor } from '@capacitor/core';
import { InAppReview } from '@capacitor-community/in-app-review';
import { track } from './analytics';
import type { AdProgress } from './adRewards';
import type { StoryProgress } from './story';

// The store's own rating dialog (Google Play In-App Review; decided 2026-10-14). Asked for, never
// shown by a button: the store has its own quota and may show nothing, and it never says whether the
// player rated. No question of ours comes before it ("Do you like the game?" is against Google's
// guidelines), so there is no "don't ask again" either: our own limit keeps it rare.

/** The ceremonies after which it may be asked: Millionaire first, then the big ones after it. */
export const REVIEW_FROM_CLASS = 4;
/** At most this many times in a player's whole game... */
export const REVIEW_MAX_ASKS = 3;
/** ...at least this far apart. */
export const REVIEW_GAP_MS = 30 * 24 * 3600 * 1000;

/**
 * Whether a ceremony that just closed may ask for a review: Millionaire or later, never in the first
 * session (the player has come back at least once), within the limits above.
 */
export function reviewDue(story: StoryProgress, ads: AdProgress, classIndex: number, now: number) {
  return (
    classIndex >= REVIEW_FROM_CLASS &&
    ads.returned &&
    story.reviewAsks < REVIEW_MAX_ASKS &&
    (story.reviewAskedAt === 0 || now - story.reviewAskedAt >= REVIEW_GAP_MS)
  );
}

/** Asks the store for its review dialog; on the web (dev) it only logs. Never throws. */
export async function requestReview(classIndex: number) {
  track('review_prompt', { class_index: classIndex });
  if (!Capacitor.isNativePlatform()) {
    if (import.meta.env.DEV) console.debug('[review] the store would show its rating dialog now');
    return;
  }
  try {
    await InAppReview.requestReview();
  } catch {
    // No store, no Play services: nothing to show.
  }
}
