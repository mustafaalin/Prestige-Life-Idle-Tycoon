// Coins flying into the wallet in the top bar. Anything that pays can ask for a burst from a point
// on screen; the top bar listens for arrivals to bump the balance.

export interface CoinBurst {
  /** Viewport px the coins start from. */
  x: number;
  y: number;
  count: number;
}

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
