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

const SFX: Record<string, Howl> = {
  coin:     new Howl({ src: ['/assets/audio/sfx/coin_collect.mp3'],     volume: 0.7 }),
  gem:      new Howl({ src: ['/assets/audio/sfx/gem_collect.mp3'],      volume: 0.7 }),
  purchase: new Howl({ src: ['/assets/audio/sfx/purchase_success.mp3'], volume: 0.7 }),
  click:    new Howl({ src: ['/assets/audio/sfx/button_click.mp3'],     volume: 0.5 }),
  levelUp:  new Howl({ src: ['/assets/audio/sfx/level_up.mp3'],         volume: 0.8 }),
};

const music = new Howl({
  src: ['/assets/audio/music/main_theme.mp3'],
  loop: true,
  volume: 0,
  autoplay: false,
});

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
  const target = targetVolume();
  if (fade) {
    const current = typeof music.volume() === 'number' ? (music.volume() as number) : target;
    if (Math.abs(current - target) < 0.01) return;
    music.fade(current, target, FADE_DURATION_MS);
  } else {
    music.volume(target);
  }
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  music.play();
  applyVolume(true);
}

export function ensureMusicStarted() {
  if (!musicStarted) startMusic();
}

export function playSfx(name: keyof typeof SFX) {
  ensureMusicStarted();
  if (!sfxEnabled) return;
  SFX[name]?.play();
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
