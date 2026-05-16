import { Howl } from 'howler';

const SETTINGS_KEY = 'idle_guy_settings';

interface AudioSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number; // 0–1
}

function loadAudioSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        soundEnabled: parsed.soundEnabled ?? true,
        musicEnabled: parsed.musicEnabled ?? true,
        musicVolume: parsed.musicVolume ?? 0.6,
      };
    }
  } catch {}
  return { soundEnabled: true, musicEnabled: true, musicVolume: 0.6 };
}

function persistAudioSettings(patch: Partial<AudioSettings>) {
  try {
    const current = loadAudioSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {}
}

const FADE_DURATION_MS = 400;
const DUCK_RATIO = 0.75;

// Howl nesneleri ilk kullanıcı etkileşimine kadar yaratılmaz —
// browser AudioContext politikası gereği (gesture required)
type SfxKey = 'coin' | 'gem' | 'purchase' | 'click' | 'levelUp';

const SFX_CONFIGS: Record<SfxKey, { src: string; volume: number }> = {
  coin:     { src: '/assets/audio/sfx/coin_collect.mp3',     volume: 0.7 },
  gem:      { src: '/assets/audio/sfx/gem_collect.mp3',      volume: 0.7 },
  purchase: { src: '/assets/audio/sfx/purchase_success.mp3', volume: 0.7 },
  click:    { src: '/assets/audio/sfx/button_click.mp3',     volume: 0.5 },
  levelUp:  { src: '/assets/audio/sfx/level_up.mp3',         volume: 0.8 },
};

const sfxInstances: Partial<Record<SfxKey, Howl>> = {};
let musicInstance: Howl | null = null;

function getSfx(key: SfxKey): Howl {
  if (!sfxInstances[key]) {
    const cfg = SFX_CONFIGS[key];
    sfxInstances[key] = new Howl({ src: [cfg.src], volume: cfg.volume });
  }
  return sfxInstances[key]!;
}

function getMusic(): Howl {
  if (!musicInstance) {
    musicInstance = new Howl({
      src: ['/assets/audio/music/main_theme.mp3'],
      loop: true,
      volume: 0,
      autoplay: false,
    });
  }
  return musicInstance;
}

let musicStarted = false;
let modalOpen = false;

const state = loadAudioSettings();
let sfxEnabled = state.soundEnabled;
let musicEnabled = state.musicEnabled;
let musicVolume = state.musicVolume;

function targetVolume() {
  if (!musicEnabled) return 0;
  return modalOpen ? musicVolume * DUCK_RATIO : musicVolume;
}

function applyVolume(fade = false) {
  const m = getMusic();
  const target = targetVolume();
  if (fade) {
    const current = typeof m.volume() === 'number' ? (m.volume() as number) : target;
    if (Math.abs(current - target) < 0.01) return;
    m.fade(current, target, FADE_DURATION_MS);
  } else {
    m.volume(target);
  }
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  getMusic().play();
  applyVolume(true);
}

export function ensureMusicStarted() {
  if (!musicStarted) startMusic();
}

export function pauseMusic() {
  if (!musicStarted) return;
  getMusic().pause();
}

export function resumeMusic() {
  if (!musicStarted) return;
  if (musicEnabled) getMusic().play();
}

export function playSfx(name: SfxKey) {
  ensureMusicStarted();
  if (!sfxEnabled) return;
  getSfx(name).play();
}

export function setModalOpen(open: boolean) {
  modalOpen = open;
  if (!musicStarted) return;
  applyVolume(true);
}

// Settings controls

export function setSoundEnabled(enabled: boolean) {
  sfxEnabled = enabled;
  persistAudioSettings({ soundEnabled: enabled });
}

export function setMusicEnabled(enabled: boolean) {
  musicEnabled = enabled;
  persistAudioSettings({ musicEnabled: enabled });
  if (!musicStarted && enabled) return; // başlatılmamışsa dokunma
  applyVolume(true);
}

export function setMusicVolume(volume: number) {
  musicVolume = Math.max(0, Math.min(1, volume));
  persistAudioSettings({ musicVolume: musicVolume });
  applyVolume(false); // volume bar sürüklenirken fade gerekmez
}

export function getAudioSettings(): AudioSettings {
  return { soundEnabled: sfxEnabled, musicEnabled, musicVolume };
}
