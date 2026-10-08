import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Sound effects and haptics for player actions (CLAUDE.md "Sound Effects"). Fire-and-forget:
// a blocked autoplay or a missing vibrator never throws.

export type Sfx = 'coin' | 'purchase' | 'levelUp' | 'click';

const SFX_FILES: Record<Sfx, string> = {
  coin: '/assets/audio/sfx/coin_collect.mp3',
  purchase: '/assets/audio/sfx/purchase_success.mp3',
  levelUp: '/assets/audio/sfx/level_up.mp3',
  click: '/assets/audio/sfx/button_click.mp3',
};

/** A few players per sound, so quick repeats (bottle after bottle) overlap instead of cutting off. */
const POOL_SIZE = 4;
/** The same sound again within this window is dropped (a ×10 buy is one sound, not ten). */
const MIN_GAP_MS = 70;

const pools = new Map<Sfx, { players: HTMLAudioElement[]; next: number; lastAt: number }>();

function poolFor(sound: Sfx) {
  let pool = pools.get(sound);
  if (!pool) {
    const players = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(SFX_FILES[sound]);
      audio.preload = 'auto';
      audio.volume = sound === 'coin' ? 0.45 : 0.7;
      return audio;
    });
    pool = { players, next: 0, lastAt: 0 };
    pools.set(sound, pool);
  }
  return pool;
}

export function playSfx(sound: Sfx) {
  try {
    const pool = poolFor(sound);
    const now = performance.now();
    if (now - pool.lastAt < MIN_GAP_MS) return;
    pool.lastAt = now;
    const player = pool.players[pool.next];
    pool.next = (pool.next + 1) % POOL_SIZE;
    player.currentTime = 0;
    player.play().catch(() => {});
  } catch {
    // No audio on this device.
  }
}

/** Loads the sounds ahead of the first tap. */
export function preloadSfx() {
  (Object.keys(SFX_FILES) as Sfx[]).forEach(poolFor);
}

const native = Capacitor.isNativePlatform();

export function haptic(strength: 'light' | 'medium' = 'light') {
  if (native) {
    Haptics.impact({ style: strength === 'light' ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {});
  } else {
    navigator.vibrate?.(strength === 'light' ? 8 : 20);
  }
}
