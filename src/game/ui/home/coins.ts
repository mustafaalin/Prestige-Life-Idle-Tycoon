// Coins flying into the wallet in the top bar. Anything that pays can ask for a burst from a point
// on screen; the top bar listens for arrivals to bump the balance.

export interface CoinBurst {
  /** Viewport px the coins start from. */
  x: number;
  y: number;
  count: number;
  /** The amount, shown where the coins start for a moment before they fly (a big one-off payment). */
  label?: string;
}

/** About how long the biggest burst takes to reach the wallet; a card opened sooner would have coins flying over it. */
export const COINS_LAND_MS = 1600;

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

// A reward that is already paid but not collected yet (an answered event card): the balance in the
// top bar shows without it until the player taps "Collect".
let held = 0;
const heldListeners = new Set<() => void>();

export function holdBalance(amount: number) {
  held = amount;
  heldListeners.forEach((listener) => listener());
}

export const heldBalance = () => held;

export function onHeldBalance(listener: () => void) {
  heldListeners.add(listener);
  return () => {
    heldListeners.delete(listener);
  };
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
