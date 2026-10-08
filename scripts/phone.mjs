// `npm run phone`: play the v2 dev build on an Android phone with live reload (like Expo Go).
// Connects to the phone (USB or wireless debugging), installs the live-reload app if it is missing,
// starts the v2 dev server and tunnels it through adb (`adb reverse`), so the Mac's IP never matters.
//
//   npm run phone                    reuse the connected / last phone
//   npm run phone -- 41629           new wireless debugging port (same phone IP as last time)
//   npm run phone -- 192.168.1.5:41629
//   npm run phone -- --install       reinstall the app (after native changes: plugins, icons, config)

import { execFile, spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const PORT = 5173;
const APP_ID = 'com.prestigelife.idletycoon';
const SAVED_FILE = '.phone.local'; // last wireless address; *.local is gitignored
const ANDROID_HOME = process.env.ANDROID_HOME || join(homedir(), 'Library/Android/sdk');
const ADB = existsSync(join(ANDROID_HOME, 'platform-tools/adb')) ? join(ANDROID_HOME, 'platform-tools/adb') : 'adb';
const STUDIO_JAVA = '/Applications/Android Studio.app/Contents/jbr/Contents/Home';

const say = (text) => console.log(`\x1b[36m[phone]\x1b[0m ${text}`);
const fail = (text) => {
  console.error(`\x1b[31m[phone]\x1b[0m ${text}`);
  process.exit(1);
};

async function adb(...args) {
  try {
    const { stdout } = await run(ADB, args, { timeout: 20000 });
    return stdout.trim();
  } catch (error) {
    return (error.stdout ?? '').trim() || null;
  }
}

const isWireless = (serial) => /^[\d.]+:\d+$/.test(serial);

async function devices() {
  const out = (await adb('devices')) ?? '';
  return out
    .split('\n')
    .slice(1)
    .map((line) => line.split('\t'))
    .filter(([, state]) => state === 'device')
    .map(([serial]) => serial);
}

async function connect(address) {
  const out = (await adb('connect', address)) ?? '';
  return out.includes('connected to');
}

function readSaved() {
  try {
    return JSON.parse(readFileSync(SAVED_FILE, 'utf8')).address ?? null;
  } catch {
    return null;
  }
}

function save(address) {
  writeFileSync(SAVED_FILE, JSON.stringify({ address }) + '\n');
}

/** Wireless debugging advertises its connect port over mDNS (not every network passes it). */
async function discover() {
  const out = (await adb('mdns', 'services')) ?? '';
  const match = out.match(/_adb-tls-connect\._tcp\.?\s+([\d.]+:\d+)/);
  return match ? match[1] : null;
}

async function pickDevice(arg) {
  const saved = readSaved();

  if (arg) {
    const address = /^\d+$/.test(arg) ? (saved ? `${saved.split(':')[0]}:${arg}` : null) : arg;
    if (!address) fail('Telefonun IP adresini bilmiyorum: `npm run phone -- 192.168.1.5:PORT` olarak yaz.');
    if (!(await connect(address)))
      fail(`${address} adresine bağlanamadım. Telefonda Kablosuz hata ayıklama açık mı, port doğru mu?`);
    save(address);
    return address;
  }

  const connected = await devices();
  const phone = connected.find((serial) => !serial.startsWith('emulator-')) ?? connected[0];
  if (phone) return phone;

  for (const address of [await discover(), saved]) {
    if (address && (await connect(address))) {
      save(address);
      return address;
    }
  }

  fail(
    [
      'Telefon bulunamadı.',
      '  Kablosuz: telefonda Geliştirici seçenekleri → Kablosuz hata ayıklama → üstteki portu al:',
      '            npm run phone -- PORT     (ilk sefer: npm run phone -- IP:PORT)',
      '  Kablolu:  USB ile bağla, telefonda "USB hata ayıklamaya izin ver" de.',
      '  Yeni telefon: önce eşle → adb pair IP:EŞLEMEPORTU KOD',
    ].join('\n'),
  );
}

async function isInstalled(serial) {
  return ((await adb('-s', serial, 'shell', 'pm', 'list', 'packages', APP_ID)) ?? '').includes(APP_ID);
}

async function install(serial) {
  say('Uygulama derlenip telefona kuruluyor (ilk sefer birkaç dakika sürer)...');
  const javaHome = process.env.JAVA_HOME && existsSync(process.env.JAVA_HOME) ? process.env.JAVA_HOME : STUDIO_JAVA;
  await new Promise((resolve) => {
    const child = spawn(
      'npx',
      ['cap', 'run', 'android', '--target', serial, '-l', '--host', 'localhost', '--port', String(PORT)],
      { stdio: 'inherit', env: { ...process.env, JAVA_HOME: javaHome } },
    );
    child.on('exit', resolve);
  });
  // `cap run` may restart adb when the launch step is slow, which drops a wireless connection.
  if (isWireless(serial)) await connect(serial);
  if (!(await isInstalled(serial))) fail('Kurulum başarısız oldu; yukarıdaki hataya bak.');
}

async function serverUp() {
  try {
    await fetch(`http://localhost:${PORT}/`);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const forceInstall = args.includes('--install');
  const serial = await pickDevice(args.find((arg) => !arg.startsWith('--')));
  say(`Telefon: ${serial}`);

  if (await serverUp()) fail(`Port ${PORT} kullanımda: açık bir \`npm run dev:v2\` varsa kapat, sonra tekrar dene.`);

  if (forceInstall || !(await isInstalled(serial))) {
    // `cap run` syncs the native project from dist/; with live reload the app loads the dev server instead.
    if (!existsSync('dist'))
      await new Promise((resolve) => spawn('npm', ['run', 'build:v2'], { stdio: 'inherit' }).on('exit', resolve));
    await install(serial);
  }

  const vite = spawn('npx', ['vite', '--mode', 'v2', '--port', String(PORT), '--strictPort'], { stdio: 'inherit' });
  vite.on('exit', (code) => process.exit(code ?? 0));
  for (let i = 0; i < 60 && !(await serverUp()); i++) await new Promise((r) => setTimeout(r, 500));

  await adb('-s', serial, 'reverse', `tcp:${PORT}`, `tcp:${PORT}`);
  await adb('-s', serial, 'shell', 'am', 'force-stop', APP_ID);
  await adb('-s', serial, 'shell', 'monkey', '-p', APP_ID, '-c', 'android.intent.category.LAUNCHER', '1');
  say('Oyun telefonda açıldı. Kodu kaydettikçe telefon yenilenir. Durdurmak için Ctrl+C.');

  // Wireless adb drops when the phone sleeps or changes network; reconnect and restore the tunnel.
  let lost = false;
  setInterval(async () => {
    const tunnels = await adb('-s', serial, 'reverse', '--list');
    if (tunnels?.includes(`tcp:${PORT}`)) {
      if (lost) say('Bağlantı geri geldi.');
      lost = false;
      return;
    }
    if (!lost) say('Telefon bağlantısı koptu, yeniden deniyorum...');
    lost = true;
    if (isWireless(serial)) await connect(serial);
    await adb('-s', serial, 'reverse', `tcp:${PORT}`, `tcp:${PORT}`);
  }, 5000);
}

main();
