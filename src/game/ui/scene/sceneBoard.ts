import { WEALTH_CLASSES } from '../../core/config/classes';
import { HOUSES } from '../../core/config/housing';
import { SPECIAL_SHOP_CEREMONY } from '../../core/config/iap';
import { COLLECT_END_CLASS } from '../../core/config/scene';
import { OUTFITS, VEHICLES } from '../../core/config/lifestyle';
import { trContent } from '../../i18n/content/tr';
import { coverFit, type CoverFit } from './coverFit';
import { poseBox, spriteBox, spriteFilter, vehicleStyle } from './place';
import { sceneCombos, type SceneCombo } from './sceneCombos';
import { classLook, FEET_Y, heroLook, homeArt, vehicleArt, vehicleBox, type HeroLook, type Pose } from './stages';

// Scene board (scene-board.html, dev server only): every scene a first life can show (sceneCombos.ts),
// home, parked vehicle, outfit and Şans's collar, each drawn at phone size by the scene's own rules, with
// a note box under it. Notes are saved to scene-notes.json by the dev server (vite.config.ts) so a
// review can name the exact scene. Turkish only: a review tool, not part of the game.

/** Index into OUTFITS, or -1: the grandfather look. */
function heroFor(outfit: number, houseId: string): HeroLook {
  return outfit < 0 ? heroLook(0, undefined, true) : heroLook(outfit, houseId);
}

const outfitName = (outfit: number) => (outfit < 0 ? 'Dede (60+)' : trContent.lifestyle[OUTFITS[outfit].id] ?? OUTFITS[outfit].name);
const className = (index: number) => trContent.wealthClass[WEALTH_CLASSES[index].id] ?? WEALTH_CLASSES[index].name;

const POSES: { id: Pose; label: string }[] = [
  { id: 'idle', label: 'Duruş' },
  { id: 'joy', label: 'Sevinç' },
  { id: 'pet', label: "Şans'ı sevme" },
  { id: 'collect', label: 'Yerden toplama' },
];

const SCREENS = [
  { id: 's24', label: 'S24+ (384×832)', width: 384, height: 832 },
  { id: 'narrow', label: 'Dar (360×780)', width: 360, height: 780 },
  { id: 'tall', label: 'Uzun (412×915)', width: 412, height: 915 },
];

/** Şans's collar by class (stages.ts LOOK_ART): its name and its code on the card. */
const COLLARS = [
  { name: 'ip', code: 'T1' },
  { name: 'ip', code: 'T1' },
  { name: 'ip', code: 'T1' },
  { name: 'deri', code: 'T2' },
  { name: 'gümüş', code: 'T3' },
  { name: 'altın', code: 'T4' },
];
const collarOf = (classIndex: number) => COLLARS[Math.min(classIndex, COLLARS.length - 1)];

/** SceneLab's lines: what the bars hide, the narrow phones' edges. */
const TOP_BAR_Y = 0.15;
const MENU_Y = 0.9;
const SAFE_X = [0.12, 0.88];

const COMBOS = sceneCombos();

const settings = {
  home: 'all',
  pose: 'idle' as Pose,
  scarf: false,
  screen: SCREENS[0].id,
  guides: false,
  notedOnly: false,
};

type Note = { text: string; label: string; screen: string; updated: string };
let notes: Record<string, Note> = {};

const status = document.getElementById('status') as HTMLElement;
const board = document.getElementById('board') as HTMLElement;
const controls = document.getElementById('controls') as HTMLElement;

const homeName = (id: string) => trContent.lifestyle[id] ?? id;
const vehicleName = (index: number) => (index >= 0 ? trContent.lifestyle[VEHICLES[index].id] ?? VEHICLES[index].name : 'Araçsız');

/** The scenes a first life can show (sceneCombos.ts), as this pose and the scarf see them. */
function shownCombos(): SceneCombo[] {
  const shown = new Map<string, SceneCombo>();
  for (const combo of COMBOS) {
    // Bottles and coins lie on the ground only below Middle Class; the scarf is sold from Day Laborer on.
    let classes = combo.classes;
    if (settings.pose === 'collect') classes = classes.filter((index) => index < COLLECT_END_CLASS);
    if (settings.scarf) classes = classes.filter((index) => index >= SPECIAL_SHOP_CEREMONY);
    if (classes.length === 0) continue;
    // Petting Şans hides him, so his collar makes no difference.
    const id = `${combo.home}|${combo.vehicle}|${combo.outfit}|${settings.pose === 'pet' ? '' : collarOf(classes[0]).code}`;
    const known = shown.get(id);
    shown.set(id, { ...combo, classes: [...new Set([...(known?.classes ?? []), ...classes])].sort((a, b) => a - b) });
  }
  return [...shown.values()];
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function px(style: Record<string, number | string | undefined>) {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${typeof value === 'number' ? `${value}px` : value}`)
    .join(';');
}

function image(src: string, style: string, className?: string) {
  const img = el('img', className);
  img.src = src;
  img.loading = 'lazy';
  img.alt = '';
  img.setAttribute('style', style);
  return img;
}

function drawScene(fit: CoverFit, combo: SceneCombo) {
  const houseId = HOUSES[combo.home].id;
  const frame = el('div', 'frame');
  frame.style.width = `${fit.width}px`;
  frame.style.height = `${fit.height}px`;
  const home = homeArt(houseId);
  const light = spriteFilter(home.light);
  frame.append(image(home.background, '', 'bg'));

  const vehicle = combo.vehicle >= 0 ? vehicleArt(VEHICLES[combo.vehicle].id) : null;
  const box = vehicle ? vehicleBox(vehicle, home.layout) : null;
  if (vehicle && box) frame.append(image(vehicle.src, px({ ...vehicleStyle(fit, box), filter: light })));


  const art = heroFor(combo.outfit, houseId)[settings.pose];
  frame.append(
    image(art.src, px({ ...poseBox(fit, art, home.castX), transform: art.flip ? 'scaleX(-1)' : undefined, filter: light })),
  );
  if (settings.pose !== 'pet') {
    const sans = classLook(combo.classes[0], settings.scarf).sans;
    frame.append(image(sans.src, px({ ...spriteBox(fit, sans, home.castX), filter: light })));
  }

  if (settings.guides) {
    const top = el('span', 'band');
    top.setAttribute('style', px({ top: 0, height: fit.y(TOP_BAR_Y) }));
    const menu = el('span', 'band');
    menu.setAttribute('style', px({ top: fit.y(MENU_Y), bottom: 0 }));
    frame.append(top, menu);
    for (const x of SAFE_X) {
      const line = el('span', 'safe');
      line.style.left = `${fit.x(x)}px`;
      frame.append(line);
    }
    for (const y of [home.layout.car.y, home.layout.near.y, FEET_Y]) {
      const line = el('span', 'ground');
      line.style.top = `${fit.y(y)}px`;
      frame.append(line);
    }
    if (box && box.fit < 1) frame.append(el('span', 'fitTag', `×${box.fit.toFixed(2)}`));
  }
  return frame;
}

let saveTimer = 0;
function scheduleSave() {
  window.clearTimeout(saveTimer);
  status.textContent = 'Kaydediliyor…';
  saveTimer = window.setTimeout(save, 600);
}

async function save() {
  try {
    localStorage.setItem('scene-board-notes', JSON.stringify(notes));
  } catch {
    // Private windows: the server copy still counts.
  }
  try {
    const response = await fetch('/__scene-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes, null, 2),
    });
    status.textContent = response.ok ? `Kaydedildi · ${countNotes()} yorum` : 'Sunucuya yazılamadı (tarayıcıda duruyor)';
  } catch {
    status.textContent = 'Sunucuya yazılamadı (tarayıcıda duruyor)';
  }
}

const countNotes = () => Object.values(notes).filter((note) => note.text.trim()).length;

function card(fit: CoverFit, combo: SceneCombo) {
  const pose = POSES.find((item) => item.id === settings.pose) as (typeof POSES)[number];
  const pet = settings.pose === 'pet';
  const collar = collarOf(combo.classes[0]);
  const code = [
    `E${combo.home + 1}`,
    `A${combo.vehicle + 1}`,
    combo.outfit < 0 ? 'K8' : `K${combo.outfit + 1}`,
    ...(pet ? [] : [collar.code]),
    settings.pose,
    ...(settings.scarf ? ['atki'] : []),
  ].join('-');
  const sans = pet ? 'Şans görünmez' : `Şans: ${collar.name} tasma${settings.scarf ? ' + atkı' : ''}`;
  const classes = combo.classes.map(className).join(', ');
  const label = `${homeName(HOUSES[combo.home].id)} · ${vehicleName(combo.vehicle)} · ${outfitName(combo.outfit)} · ${pose.label} · ${sans} · Sınıf: ${classes}`;
  const note = notes[code];
  if (settings.notedOnly && !note?.text.trim()) return null;

  const root = el('div', 'card');
  root.style.width = `${fit.width}px`;
  if (note?.text.trim()) root.classList.add('noted');
  const head = el('div');
  head.append(el('span', 'code', code), document.createTextNode(' '), el('span', 'title', `${outfitName(combo.outfit)} · ${sans}`));
  const meta = el('div', 'meta', `Sınıf: ${classes}`);
  const area = el('textarea');
  area.placeholder = 'Yorumun…';
  area.value = note?.text ?? '';
  area.addEventListener('input', () => {
    const screen = SCREENS.find((item) => item.id === settings.screen)?.label ?? '';
    notes[code] = { text: area.value, label, screen, updated: new Date().toISOString() };
    root.classList.toggle('noted', area.value.trim() !== '');
    scheduleSave();
  });
  root.append(head, meta, drawScene(fit, combo), area);
  return root;
}

function render() {
  const screen = SCREENS.find((item) => item.id === settings.screen) ?? SCREENS[0];
  const fit = coverFit(screen.width, screen.height);
  const combos = shownCombos();
  board.replaceChildren();
  let total = 0;
  HOUSES.forEach((house, homeIndex) => {
    if (settings.home !== 'all' && settings.home !== house.id) return;
    const here = combos.filter((combo) => combo.home === homeIndex);
    for (const vehicle of [...new Set(here.map((combo) => combo.vehicle))]) {
      const cards = here
        .filter((combo) => combo.vehicle === vehicle)
        .map((combo) => card(fit, combo))
        .filter((node) => node !== null);
      if (cards.length === 0) continue;
      total += cards.length;
      const section = el('section');
      section.append(el('h2', '', `E${homeIndex + 1} · ${homeName(house.id)} — ${vehicleName(vehicle)}`));
      const grid = el('div', 'grid');
      grid.append(...cards);
      section.append(grid);
      board.append(section);
    }
  });
  board.prepend(
    el(
      'p',
      'meta',
      `${total} sahne. Yalnız ilk hayatta görülebilenler: araç, kıyafet ve ev sırayla alınır; araç evini, kıyafet sınıfını bekler; ` +
        'üst eve geçmek alttaki evlerin araçlarını ister; sınıf atlamak bir ev yukarı taşır (Milyoner ilk satın alınabilir eve). ' +
        "Eve, araca ve kıyafete harcanan para bir sonraki sınıfın eşiğinin yarısını geçmez; sınıfa girerken kazanılanın %1'inden ucuz bir sonraki adım alınmış sayılır. " +
        'Kod: E ev, A araç (A0 araçsız), K kıyafet (K8 dede), T tasma (T1 ip, T2 deri, T3 gümüş, T4 altın), duruş.',
    ),
  );
  if (total === 0) board.append(el('p', 'meta', 'Bu filtrede sahne yok.'));
}

function chips(title: string, options: { id: string; label: string }[], current: () => string, pick: (id: string) => void) {
  const row = el('div', 'row');
  row.append(el('span', 'label', title));
  for (const option of options) {
    const button = el('button', `chip${current() === option.id ? ' on' : ''}`, option.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      pick(option.id);
      buildControls();
      render();
    });
    row.append(button);
  }
  return row;
}

function buildControls() {
  controls.replaceChildren(
    chips(
      'Ev',
      [{ id: 'all', label: 'Hepsi' }, ...HOUSES.map((house, index) => ({ id: house.id, label: `E${index + 1} ${homeName(house.id)}` }))],
      () => settings.home,
      (id) => (settings.home = id),
    ),
    chips('Duruş', POSES, () => settings.pose, (id) => (settings.pose = id as Pose)),
    chips('Ekran', SCREENS, () => settings.screen, (id) => (settings.screen = id)),
    chips(
      'Göster',
      [
        { id: 'scarf', label: "Şans'ta atkı" },
        { id: 'guides', label: 'Çizgiler' },
        { id: 'notedOnly', label: 'Yalnız yorumlular' },
      ],
      () => '',
      (id) => {
        const key = id as 'scarf' | 'guides' | 'notedOnly';
        settings[key] = !settings[key];
      },
    ),
  );
  // Toggles light up by their own state, not as one choice.
  const toggles = controls.lastElementChild?.querySelectorAll('button') ?? [];
  (['scarf', 'guides', 'notedOnly'] as const).forEach((key, index) => toggles[index]?.classList.toggle('on', settings[key]));
}

async function load() {
  try {
    const response = await fetch('/__scene-notes');
    if (response.ok) notes = (await response.json()) as Record<string, Note>;
  } catch {
    // No dev server hook: fall back to what this browser kept.
  }
  if (Object.keys(notes).length === 0) {
    try {
      notes = JSON.parse(localStorage.getItem('scene-board-notes') ?? '{}') as Record<string, Note>;
    } catch {
      notes = {};
    }
  }
  status.textContent = `${countNotes()} yorum`;
  buildControls();
  render();
}

void load();
