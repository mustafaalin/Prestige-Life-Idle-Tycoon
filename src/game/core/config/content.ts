// What this build ships (docs/game-design-v2.md §4.10, decided 2026-10-21): the launch is generation 1.
// Systems built for later generations stay in the code and the save, switched off here, so the
// generation-2 update turns them on instead of rewriting them. Every screen, the story and the
// simulator read these flags; nothing else decides what is in the game.

export const CONTENT = {
  /**
   * At 80 the heir takes over and goes on with everything (decided 2026-10-20). Off at launch: the
   * hero stays at 80, a card says the grandchild's story is coming, and the game goes on.
   */
  handover: false,
  /** Legacy points, heirlooms, "Hand over now" and the Family tab: re-thought with generation 2. */
  legacy: false,
  /** Brad's partnership and betrayal (removed 2026-10-21, user): Brad is only the warehouse manager. */
  bradStory: false,
} as const;
