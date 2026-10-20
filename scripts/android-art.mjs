// v2 Android launcher icons and splash screens, rendered from art/store-v2/icon-1024.png and the scene art.
// Usage: PLAYWRIGHT=/path/to/playwright-core/index.mjs node scripts/android-art.mjs   (writes into android/app/src/main/res;
// playwright-core is not a project dependency, any local copy works; renders with the installed Chrome)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RES = `${ROOT}/android/app/src/main/res`;
const FONTS = `${ROOT}/node_modules/@fontsource/fredoka/files`;
const SCENE = `${ROOT}/public/assets/scene`;
const data = (path, type) => `data:${type};base64,${readFileSync(path).toString('base64')}`;
const ICON = data(`${ROOT}/art/store-v2/icon-1024.png`, 'image/png');
const art = (file) => data(`${SCENE}/${file}`, 'image/webp');
const font = (file) => data(`${FONTS}/${file}`, 'font/woff2');

// Behind the adaptive icon and around the splash; also android/.../values (ic_launcher_background, splash_bg).
export const NAVY = '#1A1446';

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const page0 = (body, css = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
* { margin: 0; box-sizing: border-box; } html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
${css}</style></head><body>${body}</body></html>`;

// Legacy icon (before Android 8): rounded square; round icon: circle. Adaptive foreground: the art at 84 of 108 dp,
// so every mask (≤ 72 dp) shows ~86% of it and the dog stays in.
const ICONS = {
  ic_launcher: { dp: 48, html: page0(`<img src="${ICON}" style="width:100%;height:100%;border-radius:12%">`) },
  ic_launcher_round: { dp: 48, html: page0(`<img src="${ICON}" style="width:100%;height:100%;border-radius:50%">`) },
  ic_launcher_foreground: {
    dp: 108,
    html: page0(`<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${NAVY}">
      <img src="${ICON}" style="width:${(84 / 108) * 100}%;height:${(84 / 108) * 100}%"></div>`),
  },
};

// Splash: the opening street, the hero with Şans, the name. Shown CENTER_CROP, so everything stays in the middle.
const SPLASH = page0(
  `<div class="bg"></div><div class="shade"></div>
  <div class="title"><h1>Prestige Life</h1><h2>IDLE TYCOON</h2></div>
  <img class="sprite" src="${art('hero-street-idle.webp')}" style="height:46vh;left:calc(50% - 15vh);bottom:6vh">
  <img class="sprite" src="${art('sans-sit.webp')}" style="height:15vh;left:calc(50% + 4vh);bottom:6vh">`,
  `@font-face { font-family: F; font-weight: 700; src: url(${font('fredoka-latin-700-normal.woff2')}); }
  body { position: relative; font-family: F, sans-serif; background: ${NAVY}; }
  .bg { position: absolute; inset: 0; background: url(${art('alley.webp')}) center bottom / cover no-repeat; }
  .shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(26,20,70,0.85), rgba(26,20,70,0.35) 40%, transparent 60%, rgba(0,0,0,0.35)); }
  .sprite { position: absolute; filter: drop-shadow(0 1vh 1.4vh rgba(0,0,0,0.5)); }
  .title { position: absolute; left: 0; right: 0; top: 17vh; text-align: center; }
  h1 { font-weight: 700; font-size: min(6.3vh, 13vw); line-height: 1; color: #fff; -webkit-text-stroke: 0.8vh #1a1446; paint-order: stroke fill;
    text-shadow: 0 0.7vh 0 rgba(10,8,40,0.5); }
  h2 { margin-top: 0.8vh; font-weight: 700; font-size: min(3.1vh, 6.4vw); color: #fcd34d; -webkit-text-stroke: 0.55vh #1a1446; paint-order: stroke fill; letter-spacing: 0.1vh; }`,
);

const SPLASHES = {
  drawable: [1280, 1920],
  'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
  'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
};

const { chromium } = await import(process.env.PLAYWRIGHT ?? 'playwright-core');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
for (const [name, { dp, html }] of Object.entries(ICONS)) {
  for (const [density, scale] of Object.entries(DENSITIES)) {
    const size = Math.round(dp * scale);
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(html);
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${RES}/mipmap-${density}/${name}.png`, omitBackground: true });
    await page.close();
  }
}
for (const [dir, [width, height]] of Object.entries(SPLASHES)) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(SPLASH);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${RES}/${dir}/splash.png` });
  await page.close();
}
await browser.close();
console.log('done');
