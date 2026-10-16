// Coins flying into the wallet in the top bar. Anything that pays can ask for a burst from a point
// on screen; the top bar listens for arrivals to bump the balance. A collected one-off payment goes
// through `payout`: its amount shows in the middle of the screen, then flies into the wallet, and the
// balance waits for it.

export interface CoinBurst {
  /** Viewport px the coins start from. */
  x: number;
  y: number;
  count: number;
  /** The amount, shown where the coins start for a moment before they fly (a big one-off payment). */
  label?: string;
  /** The label flies into the wallet with the coins instead of fading where it showed. */
  flyLabel?: boolean;
  /** Called as each coin reaches the wallet. */
  onHit?: () => void;
}

/** About how long the biggest payout takes to reach the wallet; a card opened sooner would have coins flying over it. */
export const COINS_LAND_MS = 2400;

const burstListeners = new Set<(burst: CoinBurst) => void>();
const hitListeners = new Set<() => void>();

export function burstCoins(burst: CoinBurst) {
  burstListeners.forEach((listener) => listener(burst));
}

export function onCoinBurst(listener: (burst: CoinBurst) => void) {
  burstListeners.add(listener);
  return () => {
    burstListeners.delete(listener);
  };
}

/** A coin reached the wallet. */
export function emitWalletHit() {
  hitListeners.forEach((listener) => listener());
}

export function onWalletHit(listener: () => void) {
  hitListeners.add(listener);
  return () => {
    hitListeners.delete(listener);
  };
}

// Money already paid that the balance does not show yet: an answered event card's reward until
// "Collect", and payouts whose coins are still flying. The top bar shows the balance without it.
let held = 0;
let flying = 0;
const heldListeners = new Set<() => void>();
const notifyHeld = () => heldListeners.forEach((listener) => listener());

export function holdBalance(amount: number) {
  held = amount;
  notifyHeld();
}

export const heldBalance = () => held + flying;

export function onHeldBalance(listener: () => void) {
  heldListeners.add(listener);
  return () => {
    heldListeners.delete(listener);
  };
}

/** How long a payout's amount waits for the card under it to close before it shows. */
const PAYOUT_START_MS = 120;
/** If the coins never land (no wallet on screen), the balance still gets the money by then. */
const PAYOUT_SAFETY_MS = 4000;

/**
 * A collected one-off payment (offline earnings, Şans's wallet, the day's reward, a goal, a gift, an
 * ad's reward, an event card, a deal; user 2026-10-16): the card closes, the amount shows in the
 * middle of the screen for a moment, then flies with the coins into the wallet. The balance waits and
 * counts up as the coins land. Call it in the same handler as the action that paid, so the balance
 * never shows the money early.
 */
export function payout({ amount, label, count }: { amount: number; label: string; count: number }) {
  if (amount <= 0) return;
  flying += amount;
  notifyHeld();
  let left = amount;
  let coinsLeft = count;
  const release = (share: number) => {
    const part = Math.min(share, left);
    if (part <= 0) return;
    left -= part;
    flying = Math.max(0, flying - part);
    notifyHeld();
  };
  window.setTimeout(() => {
    burstCoins({
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.42,
      count,
      label,
      flyLabel: true,
      onHit: () => {
        coinsLeft -= 1;
        release(coinsLeft <= 0 ? left : amount / count);
      },
    });
  }, PAYOUT_START_MS);
  window.setTimeout(() => release(left), PAYOUT_SAFETY_MS);
}

// Money leaving the wallet (a bold event answer that failed): coins tumble out of the wallet with the
// amount in red under it, and the balance flashes. The other side of a burst.
export interface CoinSpill {
  count: number;
  label: string;
}

const spillListeners = new Set<(spill: CoinSpill) => void>();

export function spillCoins(spill: CoinSpill) {
  spillListeners.forEach((listener) => listener(spill));
}

export function onCoinSpill(listener: (spill: CoinSpill) => void) {
  spillListeners.add(listener);
  return () => {
    spillListeners.delete(listener);
  };
}
