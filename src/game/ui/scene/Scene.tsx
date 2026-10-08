import { Heart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  COLLECT_MAX_ON_SCREEN,
  COLLECT_SPAWN_SECONDS,
  FETCH_MAX_SECONDS,
  FETCH_MIN_SECONDS,
  FETCH_WINDOW_SECONDS,
} from '../../core/config/scene';
import { fetchReward, tapValue } from '../../core/formulas';
import type { GameStateV2 } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { burstCoins } from '../home/coins';
import { RewardCard } from '../home/RewardCard';
import { useCoverFit } from './coverFit';
import { onFindRequest } from './sceneEvents';

// The home scene (plan 1.6, discussion-notes §9): the hero and Şans in the alley, always on screen.
// Bottles and cans appear on the ground; tapping one collects it (one tap's money). Now and then
// Şans brings a wallet he found; catching it in time pays a bonus. The hero's pose follows what
// happens: collecting, petting Şans, a purchase. Positions are fractions of the 9:16 background.

const DIR = '/assets/scene';

type Pose = 'idle' | 'collect' | 'joy' | 'pet';

interface PoseArt {
  src: string;
  /** Height as a share of the background's height. */
  height: number;
  /** Width / height of the image file. */
  aspect: number;
  /** Center x of the image. */
  x: number;
  /** Mirrored, so Şans ends up on the hero's right like in the scene. */
  flip?: boolean;
}

const FEET_Y = 0.735;

const POSES: Record<Pose, PoseArt> = {
  idle: { src: `${DIR}/hero-street-idle.webp`, height: 0.4, aspect: 0.34, x: 0.4 },
  collect: { src: `${DIR}/hero-street-collect.webp`, height: 0.27, aspect: 0.681, x: 0.4 },
  joy: { src: `${DIR}/hero-street-joy.webp`, height: 0.41, aspect: 0.528, x: 0.4 },
  pet: { src: `${DIR}/hero-street-pet-sans.webp`, height: 0.31, aspect: 0.816, x: 0.48, flip: true },
};
const POSE_LIST = Object.keys(POSES) as Pose[];
/** A stronger moment is not cut short by a weaker one. */
const POSE_RANK: Record<Pose, number> = { idle: 0, collect: 1, pet: 2, joy: 3 };

const SANS = { src: `${DIR}/sans-sit.webp`, x: 0.66, y: 0.748, height: 0.15, aspect: 0.645 };
const FIND = { src: `${DIR}/sans-wallet.webp`, x: 0.72, y: 0.752, height: 0.15, aspect: 0.929 };

const ITEM_ART = [
  { src: `${DIR}/bottle-green.webp`, width: 0.14 },
  { src: `${DIR}/bottle-brown.webp`, width: 0.14 },
  { src: `${DIR}/can-red.webp`, width: 0.1 },
];
/** Ground spots where items show up; x stays inside what tall phones show, y above the menu. */
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
  [0.8, 0.69],
];

const SPRITE_FILTER = 'brightness(0.9) saturate(0.95) drop-shadow(0 8px 10px rgba(0,0,0,0.35))';
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
  return owned + game.careerIndex + game.classIndex + game.lifestyleOwned.length + game.homesOwned.length;
}

const random = (min: number, max: number) => min + Math.random() * (max - min);

function newItem(id: number, taken: Item[]): Item {
  const free = SPOTS.map((_, index) => index).filter((index) => !taken.some((item) => item.spot === index));
  return {
    id,
    spot: free[Math.floor(Math.random() * free.length)],
    art: Math.floor(Math.random() * ITEM_ART.length),
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
  const { game, actions } = useGameV2();
  const { t, money } = useT();
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
    float({ x: fit.x(SANS.x), y: fit.y(SANS.y - SANS.height) });
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

  const openFind = (event: MouseEvent) => {
    event.stopPropagation();
    haptic('light');
    setFinding(false);
    setFindOffer(fetchReward(game));
  };

  const collectFind = (from: { x: number; y: number }) => {
    actions.claimFind();
    playSfx('levelUp');
    haptic('medium');
    flashPose('joy', 1800);
    setFindOffer(null);
    burstCoins({ ...from, count: 12 });
  };

  const ready = fit.width > 0;
  const sansVisible = !finding && pose !== 'pet';

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-[#0d1530]">
      <img src={`${DIR}/alley.webp`} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />

      {ready && (
        <>
          {/* Soft ground shadows keep the cut-out characters standing on the cobbles. */}
          <span
            className="absolute rounded-[50%] bg-black/40 blur-[6px]"
            style={{
              left: fit.x(0.4) - pictureWidth * 0.11,
              top: fit.y(FEET_Y) - 8,
              width: pictureWidth * 0.22,
              height: 16,
            }}
          />

          {POSE_LIST.map((key) => {
            const art = POSES[key];
            const height = fit.h(art.height);
            const width = height * art.aspect;
            return (
              <img
                key={key}
                src={art.src}
                alt=""
                draggable={false}
                className="absolute pointer-events-none transition-opacity duration-150"
                style={{
                  left: fit.x(art.x) - width / 2,
                  top: fit.y(FEET_Y) - height,
                  width,
                  height,
                  opacity: pose === key ? 1 : 0,
                  transform: art.flip ? 'scaleX(-1)' : undefined,
                  filter: SPRITE_FILTER,
                }}
              />
            );
          })}

          {sansVisible && (
            <button
              type="button"
              onClick={petSans}
              aria-label={t('scene.sans')}
              className="absolute transition-transform active:scale-95"
              style={{
                left: fit.x(SANS.x) - (fit.h(SANS.height) * SANS.aspect) / 2,
                top: fit.y(SANS.y) - fit.h(SANS.height),
                width: fit.h(SANS.height) * SANS.aspect,
                height: fit.h(SANS.height),
              }}
            >
              <img
                src={SANS.src}
                alt=""
                draggable={false}
                className="w-full h-full"
                style={{ filter: SPRITE_FILTER }}
              />
            </button>
          )}

          {finding && (
            <button
              type="button"
              onClick={openFind}
              aria-label={t('scene.findHint')}
              className="absolute v2-run-in transition-transform active:scale-95"
              style={{
                left: fit.x(FIND.x) - (fit.h(FIND.height) * FIND.aspect) / 2,
                top: fit.y(FIND.y) - fit.h(FIND.height),
                width: fit.h(FIND.height) * FIND.aspect,
                height: fit.h(FIND.height),
              }}
            >
              <span className="v2-pulse-ring absolute left-1/2 top-1/2 w-full aspect-square rounded-full border-4 border-amber-300" />
              <img
                src={FIND.src}
                alt=""
                draggable={false}
                className="relative w-full h-full"
                style={{ filter: SPRITE_FILTER }}
              />
              <span className="absolute right-0 -top-9 whitespace-nowrap rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white v2-glossy px-3 py-1 v2-display text-[13px] text-white v2-shadow">
                {t('scene.findHint')}
              </span>
            </button>
          )}

          {items.map((item) => {
            const [sx, sy] = SPOTS[item.spot];
            const width = pictureWidth * ITEM_ART[item.art].width;
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
                    src={ITEM_ART[item.art].src}
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

      {findOffer !== null && (
        <RewardCard
          image={FIND.src}
          title={t('scene.findTitle')}
          body={t('scene.findBody')}
          amount={`+${money(findOffer)}`}
          onCollect={collectFind}
        />
      )}
    </div>
  );
}
