import { Car, Heart, Home, Shirt } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  COLLECT_END_CLASS,
  COLLECT_MAX_ON_SCREEN,
  COLLECT_SPAWN_SECONDS,
  FETCH_MAX_SECONDS,
  FETCH_MIN_SECONDS,
  FETCH_WINDOW_SECONDS,
} from '../../core/config/scene';
import { AD_FIND_MULTIPLIER } from '../../core/config/ads';
import { HOUSES } from '../../core/config/housing';
import { OUTFITS, VEHICLES } from '../../core/config/lifestyle';
import { fetchReward, tapValue } from '../../core/formulas';
import { bestOwnedLifestyle, houseIndex, parkedVehicle } from '../../core/state';
import type { GameStateV2 } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { pendingCeremony, sceneClass } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { useAdsUnlocked } from '../ads/useAdsUnlocked';
import { useGuideTarget } from '../guide/guideSteps';
import { burstCoins } from '../home/coins';
import { PointingHand } from '../home/Focusable';
import { RewardCard } from '../home/RewardCard';
import { useCoverFit } from './coverFit';
import { onFindRequest } from './sceneEvents';
import { poseBox, spriteBox, spriteFilter, vehicleStyle } from './place';
import {
  classLook,
  FEET_Y,
  heroLook,
  homeArt,
  lookImages,
  vehicleArt,
  vehicleBox,
  type Pose,
} from './stages';

// The home scene (plan 1.6, discussion-notes §7): the hero and Şans, always on screen, in front of
// the home you live in, with your best vehicle parked beside them, the hero in the best outfit you own
// (stages.ts). Moving house cross-fades the place; a new vehicle drives in; a new outfit is put on.
// Bottles and cans appear on the ground; tapping one collects it (one tap's money). Now and then
// Şans brings a wallet he found; catching it in time pays a bonus. The hero's pose follows what
// happens: collecting, petting Şans, a purchase. Positions are fractions of the 9:16 background;
// where things stand and how big they are comes from the stage in stages.ts.

type NewsKind = 'home' | 'vehicle' | 'outfit';

/** A stronger moment is not cut short by a weaker one. */
const POSE_RANK: Record<Pose, number> = { idle: 0, collect: 1, pet: 2, joy: 3 };
const POSE_LIST = Object.keys(POSE_RANK) as Pose[];

/** Ground spots where items show up; x stays inside what tall phones show, y above the menu and in
 * front of where the vehicle stands. */
const SPOTS: [number, number][] = [
  [0.18, 0.7],
  [0.24, 0.79],
  [0.17, 0.85],
  [0.32, 0.84],
  [0.55, 0.79],
  [0.46, 0.84],
  [0.68, 0.84],
  [0.79, 0.77],
  [0.8, 0.85],
];

const ITEM_FILTER = 'drop-shadow(0 0 6px rgba(255,230,150,0.85)) brightness(1.05)';

interface Item {
  id: number;
  spot: number;
  art: number;
  rotate: number;
  flip: boolean;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text?: string;
}

/** Grows with every purchase, promotion, move or class; a rise makes the hero cheer. */
function progressMark(game: GameStateV2) {
  let owned = 0;
  for (const business of Object.values(game.businesses)) owned += business.owned + (business.managed ? 1 : 0);
  return (
    owned +
    game.careerIndex +
    game.classIndex +
    game.lifestyleOwned.length +
    game.homesOwned.length +
    houseIndex(game.home)
  );
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

function newItem(id: number, taken: Item[]): Item {
  const free = SPOTS.map((_, index) => index).filter((index) => !taken.some((item) => item.spot === index));
  return {
    id,
    spot: free[Math.floor(Math.random() * free.length)],
    art: Math.floor(Math.random() * 6),
    rotate: random(-25, 25),
    flip: Math.random() < 0.5,
  };
}

/** The alley starts with a full set, so there is something to collect right away. */
function startingItems(): Item[] {
  const items: Item[] = [];
  for (let id = 1; id <= COLLECT_MAX_ON_SCREEN; id += 1) items.push(newItem(-id, items));
  return items;
}

export function Scene() {
  const { game, state, actions } = useGameV2();
  const shownClass = sceneClass(game, state.story);
  const stage = classLook(shownClass);
  const wornOutfit = OUTFITS.findIndex((outfit) => outfit.id === bestOwnedLifestyle(game, 'outfit')?.id);
  const itemArt = (item: Item) => stage.items[item.art % stage.items.length];
  // From Middle Class on the ground is empty; it empties when the ceremony ends, with the rest of the look.
  const collecting = shownClass < COLLECT_END_CLASS;
  // A ceremony that moves the hero (housing.ts CLASS_HOME_FLOOR) reveals the new home when it ends.
  const ceremonyWaiting = pendingCeremony(game, state.story) !== null;
  // Old Ray's first step: the hand rests on a bottle until a few are collected.
  const pointAtItem = useGuideTarget()?.key === 'scene:item';

  // The next look and place load while the ceremony plays, so they are there the moment it ends.
  useEffect(() => {
    if (game.classIndex > shownClass) {
      for (const src of lookImages(classLook(game.classIndex), heroLook(wornOutfit))) new Image().src = src;
    }
  }, [game.classIndex, shownClass, wornOutfit]);
  useEffect(() => {
    new Image().src = homeArt(game.home).background;
  }, [game.home]);
  const { t, money, name } = useT();
  const rootRef = useRef<HTMLDivElement>(null);
  const fit = useCoverFit(rootRef);
  const pictureWidth = fit.h(9 / 16);

  const nextId = useRef(1);
  const timers = useRef(new Set<number>());
  const later = useCallback((run: () => void, ms: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  }, []);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // ── Hero pose ──
  const [pose, setPose] = useState<Pose>('idle');
  const poseState = useRef({ pose: 'idle' as Pose, until: 0, timer: 0 });
  const flashPose = useCallback((next: Pose, ms: number) => {
    const current = poseState.current;
    const now = performance.now();
    if (now < current.until && POSE_RANK[current.pose] > POSE_RANK[next]) return;
    window.clearTimeout(current.timer);
    const timer = window.setTimeout(() => {
      poseState.current = { pose: 'idle', until: 0, timer: 0 };
      setPose('idle');
    }, ms);
    poseState.current = { pose: next, until: now + ms, timer };
    setPose(next);
  }, []);
  useEffect(() => () => window.clearTimeout(poseState.current.timer), []);

  const mark = useMemo(() => progressMark(game), [game]);
  const lastMark = useRef(mark);
  useEffect(() => {
    if (mark > lastMark.current) {
      flashPose('joy', 1500);
      playSfx('purchase');
    }
    lastMark.current = mark;
  }, [mark, flashPose]);

  // ── Home and vehicle ──
  const [shownHome, setShownHome] = useState(game.home);
  const home = homeArt(shownHome);
  const light = spriteFilter(home.light);
  const [fadingBackground, setFadingBackground] = useState<string | null>(null);
  const [news, setNews] = useState<{ id: number; kind: NewsKind; text: string } | null>(null);
  const announce = useCallback(
    (kind: NewsKind, text: string) => {
      const id = nextId.current++;
      setNews({ id, kind, text });
      later(() => setNews((current) => (current?.id === id ? null : current)), 2800);
    },
    [later],
  );

  useEffect(() => {
    if (ceremonyWaiting || game.home === shownHome) return;
    setFadingBackground(homeArt(shownHome).background);
    later(() => setFadingBackground(null), 800);
    setShownHome(game.home);
    const house = HOUSES.find((item) => item.id === game.home);
    if (house) announce('home', t('scene.newHome', { home: name('lifestyle', house) }));
  }, [ceremonyWaiting, game.home, shownHome, later, announce, t, name]);

  // An outfit a ceremony gives is put on when the ceremony ends, like the new home.
  const [shownOutfit, setShownOutfit] = useState(wornOutfit);
  const hero = heroLook(shownOutfit, shownHome);
  // An outfit without a collect pose stands in with its idle picture: each picture is drawn once.
  const heroPoses = POSE_LIST.filter(
    (key, index) => POSE_LIST.findIndex((other) => hero[other].src === hero[key].src) === index,
  );
  useEffect(() => {
    if (ceremonyWaiting || wornOutfit === shownOutfit) return;
    setShownOutfit(wornOutfit);
    const outfit = OUTFITS[wornOutfit];
    // No label while the outfit's art is pending and the hero looks the same.
    if (outfit && heroLook(wornOutfit) !== heroLook(shownOutfit)) {
      announce('outfit', t('scene.newOutfit', { outfit: name('lifestyle', outfit) }));
    }
  }, [ceremonyWaiting, wornOutfit, shownOutfit, announce, t, name]);

  // The home shown decides which vehicle has room out front, so both change together after a ceremony.
  const parked = parkedVehicle({ ...game, home: shownHome });
  const vehicle = parked ? vehicleArt(parked.id) : null;
  const parking = vehicle ? vehicleBox(vehicle, home.layout) : null;
  const lastVehicle = useRef(vehicle?.id);
  const [arrivedVehicle, setArrivedVehicle] = useState<string | null>(null);
  useEffect(() => {
    if (vehicle?.id === lastVehicle.current) return;
    lastVehicle.current = vehicle?.id;
    const def = VEHICLES.find((item) => item.id === vehicle?.id);
    if (!def) return;
    setArrivedVehicle(def.id);
    announce('vehicle', t('scene.newVehicle', { vehicle: name('lifestyle', def) }));
  }, [vehicle?.id, announce, t, name]);

  // ── Floating numbers and hearts ──
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const float = useCallback(
    (floater: Omit<Floater, 'id'>) => {
      const id = nextId.current++;
      setFloaters((list) => [...list, { ...floater, id }]);
      later(() => setFloaters((list) => list.filter((item) => item.id !== id)), 950);
    },
    [later],
  );

  // ── Bottles and cans ──
  const [items, setItems] = useState<Item[]>(startingItems);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((current) =>
        current.length >= COLLECT_MAX_ON_SCREEN ? current : [...current, newItem(nextId.current++, current)],
      );
    }, COLLECT_SPAWN_SECONDS * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const collect = (item: Item, event: MouseEvent) => {
    event.stopPropagation();
    const value = tapValue(game);
    actions.tap();
    playSfx('coin');
    haptic('light');
    flashPose('collect', 650);
    setItems((current) => current.filter((other) => other.id !== item.id));

    const [sx, sy] = SPOTS[item.spot];
    const x = fit.x(sx);
    const y = fit.y(sy);
    const root = rootRef.current?.getBoundingClientRect();
    if (root) burstCoins({ x: root.left + x, y: root.top + y, count: 2 });
    float({ x, y: y - 24, text: `+${money(value)}` });
  };

  // ── Şans ──
  const petSans = (event: MouseEvent) => {
    event.stopPropagation();
    haptic('light');
    flashPose('pet', 1700);
    float({ x: fit.x(stage.sans.x + home.castX), y: fit.y(stage.sans.y - stage.sans.height) });
  };

  const [finding, setFinding] = useState(false);
  const [findRound, setFindRound] = useState(0);

  useEffect(() => {
    if (finding) {
      // Şans waits with the find, then gives up.
      const timer = window.setTimeout(() => setFinding(false), FETCH_WINDOW_SECONDS * 1000);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setFinding(true), random(FETCH_MIN_SECONDS, FETCH_MAX_SECONDS) * 1000);
    return () => window.clearTimeout(timer);
  }, [finding, findRound]);

  useEffect(
    () =>
      onFindRequest(() => {
        setFinding(true);
        setFindRound((round) => round + 1);
      }),
    [],
  );

  // Tapping Şans with the wallet shows what it's worth; the money comes when the card is collected.
  const [findOffer, setFindOffer] = useState<number | null>(null);
  const adsOpen = useAdsUnlocked();

  const openFind = (event: MouseEvent) => {
    event.stopPropagation();
    haptic('light');
    setFinding(false);
    setFindOffer(fetchReward(game));
  };

  const collectFind = (from: { x: number; y: number }, multiplier = 1) => {
    actions.claimFind(multiplier);
    playSfx('levelUp');
    haptic('medium');
    flashPose('joy', 1800);
    setFindOffer(null);
    burstCoins({ ...from, count: multiplier > 1 ? 18 : 12 });
  };

  // A bottle near the middle (on screen also on wide phones) and not down by the menu, where the hand
  // below it would sit on the buttons.
  const guideScore = (item: Item) => Math.abs(SPOTS[item.spot][0] - 0.45) + (SPOTS[item.spot][1] > 0.8 ? 1 : 0);
  const guidedItem = pointAtItem
    ? items.reduce<Item | null>((best, item) => (!best || guideScore(item) < guideScore(best) ? item : best), null)?.id
    : undefined;

  // The "while you were away" card shows Şans asleep, so he is not also sitting behind it; when the
  // card closes he is back with a small pop.
  const asleep = state.offline !== null;
  const wasAsleep = useRef(asleep);
  const [woke, setWoke] = useState(false);
  useEffect(() => {
    if (wasAsleep.current && !asleep) {
      setWoke(true);
      later(() => setWoke(false), 400);
    }
    wasAsleep.current = asleep;
  }, [asleep, later]);

  const ready = fit.width > 0;
  const sansVisible = !finding && !asleep && pose !== 'pet';

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-[#0d1530]">
      <img
        src={home.background}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {fadingBackground && (
        <img
          key={fadingBackground}
          src={fadingBackground}
          alt=""
          draggable={false}
          className="v2-fade-out absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {ready && (
        <>
          {vehicle && parking && (
            <img
              key={vehicle.id}
              src={vehicle.src}
              alt=""
              draggable={false}
              className={`absolute pointer-events-none ${arrivedVehicle === vehicle.id ? (parking.facesLeft ? 'v2-drive-in-left' : 'v2-drive-in') : ''}`}
              style={{ ...vehicleStyle(fit, parking), filter: light }}
            />
          )}

          {/* Soft ground shadows keep the cut-out characters standing on the cobbles. */}
          <span
            className="absolute rounded-[50%] bg-black/40 blur-[6px]"
            style={{
              left: fit.x(0.4 + home.castX) - pictureWidth * 0.11,
              top: fit.y(FEET_Y) - 8,
              width: pictureWidth * 0.22,
              height: 16,
            }}
          />

          {heroPoses.map((key) => {
            const art = hero[key];
            return (
              <img
                key={key}
                src={art.src}
                alt=""
                draggable={false}
                className="absolute pointer-events-none transition-opacity duration-150"
                style={{
                  ...poseBox(fit, art, home.castX),
                  opacity: hero[pose].src === art.src ? 1 : 0,
                  transform: art.flip ? 'scaleX(-1)' : undefined,
                  filter: light,
                }}
              />
            );
          })}

          {sansVisible && (
            <button
              type="button"
              onClick={petSans}
              aria-label={t('scene.sans')}
              className={`absolute transition-transform active:scale-95 ${woke ? 'v2-pop-in' : ''}`}
              style={spriteBox(fit, stage.sans, home.castX)}
            >
              <img
                src={stage.sans.src}
                alt=""
                draggable={false}
                className="w-full h-full"
                style={{ filter: light }}
              />
            </button>
          )}

          {finding && !asleep && (
            <button
              type="button"
              onClick={openFind}
              aria-label={t('scene.findHint')}
              className="absolute v2-run-in transition-transform active:scale-95"
              style={spriteBox(fit, stage.find, home.castX)}
            >
              <span className="v2-pulse-ring absolute left-1/2 top-1/2 w-full aspect-square rounded-full border-4 border-amber-300" />
              <img
                src={stage.find.src}
                alt=""
                draggable={false}
                className="relative w-full h-full"
                style={{ filter: light }}
              />
              <span className="absolute right-0 -top-9 whitespace-nowrap rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white v2-glossy px-3 py-1 v2-display text-[13px] text-white v2-shadow">
                {t('scene.findHint')}
              </span>
            </button>
          )}

          {collecting && items.map((item) => {
            const [sx, sy] = SPOTS[item.spot];
            const art = itemArt(item);
            const width = pictureWidth * art.width;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(event) => collect(item, event)}
                className="absolute flex items-center justify-center"
                style={{ left: fit.x(sx) - 32, top: fit.y(sy) - 32, width: 64, height: 64 }}
              >
                <span className="v2-pop-in block">
                  <img
                    src={art.src}
                    alt=""
                    draggable={false}
                    className="v2-bob block"
                    style={{
                      width,
                      transform: `rotate(${item.rotate}deg) scaleX(${item.flip ? -1 : 1})`,
                      filter: ITEM_FILTER,
                    }}
                  />
                </span>
                {pointAtItem && item.id === guidedItem && <PointingHand className="-bottom-4 -right-3" />}
              </button>
            );
          })}

          {floaters.map((floater) => (
            <span
              key={floater.id}
              className="v2-float-up absolute pointer-events-none v2-display v2-outline-thin whitespace-nowrap text-xl text-emerald-300"
              style={{ left: floater.x, top: floater.y }}
            >
              {floater.text ?? <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />}
            </span>
          ))}
        </>
      )}

      {news && (
        <div
          key={news.id}
          className="v2-pop-in absolute inset-x-0 flex justify-center pointer-events-none"
          style={{ top: fit.y(0.27) }}
        >
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white v2-glossy px-3.5 py-1.5 v2-display text-[15px] text-white v2-shadow">
            {news.kind === 'home' ? (
              <Home className="w-4 h-4" />
            ) : news.kind === 'outfit' ? (
              <Shirt className="w-4 h-4" />
            ) : (
              <Car className="w-4 h-4" />
            )}
            {news.text}
          </span>
        </div>
      )}

      {findOffer !== null && (
        <RewardCard
          image={stage.find.src}
          title={t('scene.findTitle')}
          body={t('scene.findBody')}
          amount={`+${money(findOffer)}`}
          onCollect={collectFind}
          ad={
            adsOpen
              ? {
                  placement: 'find_x2',
                  label: t('ads.double', { amount: money(findOffer * AD_FIND_MULTIPLIER), factor: AD_FIND_MULTIPLIER }),
                  onReward: (from) => collectFind(from, AD_FIND_MULTIPLIER),
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
