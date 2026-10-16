import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useEffect } from 'react';

// Sound effects, music and haptics (docs/audio-v2.md). Fire-and-forget: a blocked autoplay, a missing
// file or a missing vibrator never throws. Sound and music each have a switch in Settings, kept on
// this device only (not in the save).

export type Sfx =
  | 'click'
  | 'coin'
  | 'purchase'
  | 'levelUp'
  | 'payout'
  | 'fanfare'
  | 'page'
  | 'ring'
  | 'message'
  | 'bark'
  | 'arrive'
  | 'reward'
  | 'loss'
  | 'unlock';

const SFX = '/assets/audio/sfx/v2';

/** ElevenLabs, chosen by the user 2026-10-17 (art/audio/sfx-2026-10-17); purchase waits for a new take. */
const SFX_FILES: Record<Sfx, string> = {
  click: `${SFX}/click.mp3`,
  coin: `${SFX}/coin.mp3`,
  purchase: '/assets/audio/sfx/purchase_success.mp3',
  levelUp: `${SFX}/levelup.mp3`,
  payout: `${SFX}/payout.mp3`,
  fanfare: `${SFX}/fanfare.mp3`,
  page: `${SFX}/page.mp3`,
  ring: `${SFX}/ring.mp3`,
  message: `${SFX}/message.mp3`,
  bark: `${SFX}/bark.mp3`,
  arrive: `${SFX}/arrive.mp3`,
  reward: `${SFX}/reward.mp3`,
  loss: `${SFX}/loss.mp3`,
  unlock: `${SFX}/unlock.mp3`,
};

/** The files are evened out (−16 LUFS); the frequent small sounds sit lower. */
const SFX_VOLUME: Partial<Record<Sfx, number>> = { click: 0.45, coin: 0.4, page: 0.4, bark: 0.6 };
const DEFAULT_SFX_VOLUME = 0.7;

/** A few players per sound, so quick repeats (bottle after bottle) overlap instead of cutting off. */
const POOL_SIZE = 4;
/** The same sound again within this window is dropped (a ×10 buy is one sound, not ten). */
const MIN_GAP_MS = 70;

// ── Switches (Settings) ──

const SFX_KEY = 'prestige_v2_sfx';
const MUSIC_KEY = 'prestige_v2_music';

function readSwitch(key: string) {
  try {
    return localStorage.getItem(key) !== 'off';
  } catch {
    return true;
  }
}

function writeSwitch(key: string, on: boolean) {
  try {
    localStorage.setItem(key, on ? 'on' : 'off');
  } catch {
    // Private mode: the switch lasts for this session.
  }
}

let sfxOn = readSwitch(SFX_KEY);
let musicOn = readSwitch(MUSIC_KEY);

export const soundEnabled = () => sfxOn;
export const musicEnabled = () => musicOn;

export function setSoundEnabled(on: boolean) {
  sfxOn = on;
  writeSwitch(SFX_KEY, on);
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  writeSwitch(MUSIC_KEY, on);
  applyMusic();
}

// ── Sound effects ──

const pools = new Map<Sfx, { players: HTMLAudioElement[]; next: number; lastAt: number }>();

function poolFor(sound: Sfx) {
  let pool = pools.get(sound);
  if (!pool) {
    const players = Array.from({ length: POOL_SIZE }, () => {
      const audio = new Audio(SFX_FILES[sound]);
      audio.preload = 'auto';
      audio.volume = SFX_VOLUME[sound] ?? DEFAULT_SFX_VOLUME;
      return audio;
    });
    pool = { players, next: 0, lastAt: 0 };
    pools.set(sound, pool);
  }
  return pool;
}

export function playSfx(sound: Sfx) {
  if (!sfxOn) return;
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

/** Loads the sounds ahead of the first tap, and readies the music for it. */
export function preloadSfx() {
  (Object.keys(SFX_FILES) as Sfx[]).forEach(poolFor);
  initMusic();
}

// ── Music ──

/**
 * `home` the home scene (ukulele), `calm` the Businesses and Invest screens (slower orchestra), `story`
 * ceremonies, life moments and the prologue (piano), `event` an open event card (pizzicato). Each file
 * fades to silence and keeps half a second of it, so the loop breathes instead of cutting.
 */
export type Track = 'home' | 'calm' | 'story' | 'event';

const MUSIC = '/assets/audio/music/v2';
const MUSIC_VOLUME = 0.35;
const FADE_MS = 800;
/** A screen that asks for a track wins over the ones below it: story > event card > calm > home. */
const RANK: Record<Track, number> = { home: 0, calm: 1, event: 2, story: 3 };

const tracks = new Map<Track, HTMLAudioElement>();
const requests = new Map<number, Track>();
let nextRequest = 1;
let playing: Track | null = null;
/** WebViews start no audio before the first touch. */
let unlocked = false;
/** Reasons the music is held: the app in the background, a rewarded ad on screen. */
const holds = new Set<string>();
const fades = new Map<HTMLAudioElement, number>();

function trackFor(track: Track) {
  let audio = tracks.get(track);
  if (!audio) {
    audio = new Audio(`${MUSIC}/${track}.mp3`);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    tracks.set(track, audio);
  }
  return audio;
}

function fadeTo(audio: HTMLAudioElement, target: number, then?: () => void) {
  window.clearInterval(fades.get(audio));
  const start = audio.volume;
  const began = performance.now();
  const timer = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - began) / FADE_MS);
    audio.volume = start + (target - start) * t;
    if (t >= 1) {
      window.clearInterval(timer);
      fades.delete(audio);
      then?.();
    }
  }, 40);
  fades.set(audio, timer);
}

function wanted(): Track | null {
  if (!musicOn || !unlocked || holds.size > 0) return null;
  let best: Track = 'home';
  for (const track of requests.values()) if (RANK[track] > RANK[best]) best = track;
  return best;
}

function applyMusic() {
  const next = wanted();
  if (next === playing) return;
  if (playing) {
    const old = trackFor(playing);
    fadeTo(old, 0, () => old.pause());
  }
  playing = next;
  if (next) {
    const audio = trackFor(next);
    // The story always starts from its beginning; the others resume where they were.
    if (next === 'story') audio.currentTime = 0;
    audio.play().catch(() => {});
    fadeTo(audio, MUSIC_VOLUME);
  }
}

let musicReady = false;
function initMusic() {
  if (musicReady) return;
  musicReady = true;
  const unlock = () => {
    unlocked = true;
    applyMusic();
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  document.addEventListener('visibilitychange', () => holdMusic('hidden', document.hidden));
}

/** Holds the music for a reason (a rewarded ad) until released. */
export function holdMusic(reason: string, held: boolean) {
  if (held) holds.add(reason);
  else holds.delete(reason);
  applyMusic();
}

/** Asks for a track while the calling screen is open; returns the release. */
export function requestMusic(track: Track): () => void {
  const id = nextRequest++;
  requests.set(id, track);
  applyMusic();
  return () => {
    requests.delete(id);
    applyMusic();
  };
}

/** A screen's track while it is mounted (and `active`). */
export function useMusic(track: Track, active = true) {
  useEffect(() => (active ? requestMusic(track) : undefined), [track, active]);
}

// ── Haptics ──

const native = Capacitor.isNativePlatform();

export function haptic(strength: 'light' | 'medium' = 'light') {
  if (native) {
    Haptics.impact({ style: strength === 'light' ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {});
  } else {
    navigator.vibrate?.(strength === 'light' ? 8 : 20);
  }
}
