import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BUSINESSES, CLASS_MANAGER_GIFT } from '../../core/config/businesses';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { OFFLINE_CAP_HOURS_BY_CLASS } from '../../core/config/economy';
import { bestOwnedLifestyle, currentHome, ownsHouse } from '../../core/state';
import type { BusinessDef, GameStateV2, HouseDef, LifestyleDef } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { LIFE_MOMENTS, type LifeMomentId } from '../../runtime/story';
import { managerKey, managerPortrait } from '../businesses/managers';
import { GameButton } from '../kit';
import { albumAge, albumShots, type AlbumEntry } from './album';
import {
  CEREMONIES,
  portraitOf,
  type CastId,
  type CeremonyLine,
  type CeremonyShot,
} from './ceremonyScript';
import { LIFE_SCRIPT } from './lifeScript';

// Class-up ceremony (plan 1.10): "new class" title with confetti → story beats (portrait + bubble,
// visual-novel style; hero on the right, everyone else on the left) → closing card (what the class
// really changed). Tap to go on; Skip jumps to the closing card. The store stops the clock while it plays.
// A life moment (story §4c) plays the same way under its own title ("25 · First date") and has no
// closing card: its last line, or Skip, ends it.

const TAP_GUARD_MS = 350;
const FADE_MS = 500;

const TAG_STYLE: Record<CastId, string> = {
  hero: 'from-violet-500 to-indigo-500',
  mom: 'from-amber-400 to-orange-400',
  riza: 'from-emerald-500 to-teal-500',
  bryce: 'from-rose-500 to-rose-600',
  staff: 'from-slate-500 to-slate-600',
  nevin: 'from-sky-500 to-cyan-500',
  defne: 'from-pink-500 to-rose-400',
};

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];

type Phase = 'title' | 'story' | 'summary';

function Confetti() {
  // Fixed per mount, so pieces don't jump on re-render.
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 120,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="v2-confetti absolute top-0 rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--drift' as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

interface CeremonyProps {
  classIndex: number;
  /** The game just before the class was reached; null when it is not known. */
  before: GameStateV2 | null;
  now: GameStateV2;
  onDone: (skipped: boolean) => void;
}

export function Ceremony({ classIndex, before, now, onDone }: CeremonyProps) {
  const { t, name } = useT();
  return (
    <StoryPlayer
      shots={CEREMONIES[classIndex] ?? []}
      pill={t('ceremony.newClass')}
      heading={name('wealthClass', WEALTH_CLASSES[classIndex])}
      summary={(close) => <ClassSummary classIndex={classIndex} before={before} now={now} onClose={close} />}
      onDone={onDone}
    />
  );
}

export function LifeMoment({ id, onDone }: { id: LifeMomentId; onDone: (skipped: boolean) => void }) {
  const { t } = useT();
  const age = LIFE_MOMENTS.find((moment) => moment.id === id)?.age ?? 0;
  return (
    <StoryPlayer
      shots={LIFE_SCRIPT[id]}
      pill={t('hud.ageShort', { age })}
      heading={t(`moments.${id}.title` as MessageKey)}
      onDone={onDone}
    />
  );
}

/**
 * A moment from the family album, played again: the same beats under the album's own label, without
 * the closing card. It records nothing and leaves the clock alone.
 */
export function StoryReplay({ entry, onDone }: { entry: AlbumEntry; onDone: (skipped: boolean) => void }) {
  const { t, name } = useT();
  return (
    <StoryPlayer
      shots={albumShots(entry)}
      pill={entry.kind === 'ceremony' ? t('album.title') : t('hud.ageShort', { age: albumAge(entry) })}
      heading={
        entry.kind === 'ceremony'
          ? name('wealthClass', WEALTH_CLASSES[entry.classIndex])
          : t(`moments.${entry.id}.title` as MessageKey)
      }
      onDone={onDone}
    />
  );
}

interface StoryPlayerProps {
  shots: CeremonyShot[];
  /** The small label above the title, and the title itself. */
  pill: string;
  heading: string;
  /** The closing card; without one the last line (or Skip) ends the moment. */
  summary?: (close: () => void) => ReactNode;
  onDone: (skipped: boolean) => void;
}

function StoryPlayer({ shots, pill, heading, summary, onDone }: StoryPlayerProps) {
  const { t } = useT();
  const [phase, setPhase] = useState<Phase>('title');
  const [shotIndex, setShotIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const lastStep = useRef(Date.now());

  useEffect(() => {
    for (const shot of shots) if (shot.image) new Image().src = shot.image.src;
  }, [shots]);

  useEffect(() => {
    playSfx('levelUp');
    haptic('medium');
  }, []);

  const toSummary = (bySkip: boolean) => {
    if (!summary) {
      onDone(bySkip);
      return;
    }
    if (bySkip) setSkipped(true);
    setPhase('summary');
    playSfx('purchase');
  };

  const advance = () => {
    const now = Date.now();
    if (phase === 'summary' || now - lastStep.current < TAP_GUARD_MS) return;
    lastStep.current = now;
    if (phase === 'title') {
      if (shots.length > 0) setPhase('story');
      else toSummary(false);
      return;
    }
    const shot = shots[shotIndex];
    if (lineIndex + 1 < shot.lines.length) {
      setLineIndex(lineIndex + 1);
    } else if (shotIndex + 1 < shots.length) {
      setShotIndex(shotIndex + 1);
      setLineIndex(0);
    } else {
      toSummary(false);
    }
  };

  useBackButton(true, 200, () => (phase === 'summary' ? onDone(skipped) : toSummary(true)));

  const shot = shots[shotIndex];
  const line: CeremonyLine | undefined = phase === 'story' ? shot?.lines[lineIndex] : undefined;
  const lineDelay = lineIndex === 0 && shotIndex > 0 ? `${FADE_MS * 0.7}ms` : '0ms';

  return (
    <div className="fixed inset-0 z-[200] select-none" onClick={advance}>
      {/* Beats without a picture play over the player's own scene, dimmed. */}
      <div className="absolute inset-0 bg-[#140d2b]/55 backdrop-blur-[2px]" />
      <div className="relative h-full w-full max-w-[56.25dvh] mx-auto overflow-hidden">
        {/* Warm sunburst for the title and the closing card. */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-amber-300 via-orange-400 to-rose-500 transition-opacity ease-in-out"
          style={{ opacity: phase === 'story' ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
        >
          <div className="v2-rays absolute left-1/2 top-[38%] w-[220%] aspect-square opacity-60" />
        </div>

        {shots.map((item, index) =>
          item.image ? (
            <div
              key={index}
              className="absolute inset-0 transition-opacity ease-in-out bg-[#2a1a0e]"
              style={{
                opacity: phase === 'story' && index === shotIndex ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
              }}
            >
              <img src={item.image.src} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" />
              {item.image.fit === 'panel' ? (
                <>
                  {/* Full width from the top: nothing is cropped on a tall phone. The frame's lower
                      edge fades into the blurred copy, under the speech bubble. */}
                  <img
                    src={item.image.src}
                    alt=""
                    draggable={false}
                    className={`absolute inset-x-0 top-0 w-full h-auto ${
                      item.image.zoom && phase === 'story' && index <= shotIndex ? 'v2-panel-zoom' : ''
                    }`}
                    style={{
                      maskImage: 'linear-gradient(to bottom, black 86%, transparent)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 86%, transparent)',
                      transformOrigin: item.image.zoom ? `${item.image.zoom.x}% ${item.image.zoom.y}%` : undefined,
                      ['--panel-zoom' as string]: item.image.zoom?.to,
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                </>
              ) : (
                <img
                  src={item.image.src}
                  alt=""
                  draggable={false}
                  className={`absolute inset-0 w-full h-full object-contain -translate-y-[12%] ${
                    phase === 'story' && index <= shotIndex ? 'v2-panel-zoom' : ''
                  }`}
                />
              )}
            </div>
          ) : null,
        )}

        {phase === 'title' && (
          <>
            <Confetti />
            <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center">
              <span className="v2-pop-in rounded-full bg-white/90 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-orange-600 shadow">
                {pill}
              </span>
              <h1
                className="v2-pop-in v2-display v2-outline text-[44px] leading-[1.05] text-white mt-3"
                style={{ animationDelay: '150ms' }}
              >
                {heading}
              </h1>
            </div>
            <p className="absolute inset-x-0 bottom-[calc(var(--safe-bottom)+40px)] text-center text-sm font-black text-white/90 v2-shadow v2-bob">
              {t('ceremony.tap')}
            </p>
          </>
        )}

        {line && (line.speaker ? <Dialogue key={`${shotIndex}-${lineIndex}`} line={line} delay={lineDelay} /> : (
          <p
            key={`${shotIndex}-${lineIndex}`}
            className="v2-line-in absolute inset-x-0 bottom-[calc(var(--safe-bottom)+72px)] px-8 text-center text-xl font-black italic leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
            style={{ animationDelay: lineDelay }}
          >
            {t(line.text)}
          </p>
        ))}

        {phase !== 'summary' && (
          <div className="absolute inset-x-0 top-0 flex justify-end px-4 pt-[calc(var(--safe-top)+12px)]">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toSummary(true);
              }}
              className="relative v2-hit rounded-full bg-black/35 px-4 py-1.5 text-[11px] font-black text-white transition-all active:scale-90"
            >
              {t('ceremony.skip')}
            </button>
          </div>
        )}

        {phase === 'summary' && summary && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-6">
            <Confetti />
            {summary(() => onDone(skipped))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * What reaching the class really changed, read from the game before and after it. A home or an
 * outfit the player bought ahead is not a change, so it is never shown as the class's gift.
 */
function classChanges(classIndex: number, before: GameStateV2 | null, now: GameStateV2) {
  const hotel = BUSINESSES.find((def) => def.id === CLASS_MANAGER_GIFT.businessId);
  // Not known what it was like before: no comparison, only what the class itself brings.
  if (!before) return { home: null, outfit: null, gift: classIndex === CLASS_MANAGER_GIFT.classIndex ? hotel : undefined };
  const homes = { from: currentHome(before), to: currentHome(now) };
  const outfits = { from: bestOwnedLifestyle(before, 'outfit'), to: bestOwnedLifestyle(now, 'outfit') };
  const hired = !before.businesses[CLASS_MANAGER_GIFT.businessId]?.managed && now.businesses[CLASS_MANAGER_GIFT.businessId]?.managed;
  return {
    home: homes.from.id !== homes.to.id ? { ...homes, owned: ownsHouse(now, homes.to.id) } : null,
    outfit:
      outfits.from && outfits.to && outfits.from.id !== outfits.to.id ? { from: outfits.from, to: outfits.to } : null,
    gift: hired ? hotel : undefined,
  };
}

/** A home is a tall scene picture: the strip with the house itself. */
function HomeShot({ house, dim }: { house: HouseDef; dim?: boolean }) {
  return (
    <img
      src={house.image}
      alt=""
      draggable={false}
      className={`w-full h-[78px] rounded-xl object-cover object-[center_34%] ${dim ? 'grayscale-[45%] opacity-80' : 'shadow'}`}
    />
  );
}

/** An outfit is the hero standing: the picture is cut at the waist so the clothes read. */
function OutfitShot({ outfit, dim }: { outfit: LifestyleDef; dim?: boolean }) {
  return (
    <div className="h-[84px] overflow-hidden flex justify-center">
      <img
        src={outfit.image}
        alt=""
        draggable={false}
        className={`h-[176px] max-w-none ${dim ? 'grayscale-[45%] opacity-80' : 'drop-shadow'}`}
      />
    </div>
  );
}

/** The card's one main change: what it was on the left, what it is now on the right. */
function Swap({ from, to }: { from: { picture: ReactNode; name: string }; to: { picture: ReactNode; name: string; badge?: string } }) {
  const { t } = useT();
  return (
    <div className="flex items-stretch gap-1.5">
      <div className="flex-1 min-w-0 rounded-2xl bg-slate-100 px-1.5 pt-1.5 pb-2">
        {from.picture}
        <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('ceremony.before')}</p>
        <p className="text-[12px] font-black leading-tight text-slate-500 break-words">{from.name}</p>
      </div>
      <ArrowRight className="w-5 h-5 self-center text-slate-300 shrink-0" />
      <div className="relative flex-1 min-w-0 rounded-2xl bg-amber-100 px-1.5 pt-1.5 pb-2">
        {to.picture}
        {to.badge && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white shadow">
            {to.badge}
          </span>
        )}
        <p className="mt-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600">{t('ceremony.now')}</p>
        <p className="text-[12px] font-black leading-tight text-slate-900 break-words">{to.name}</p>
      </div>
    </div>
  );
}

/** The Hotel Chain and its manager, given by the class (businesses.ts CLASS_MANAGER_GIFT). */
function ManagerGift({ business, main }: { business: BusinessDef; main?: boolean }) {
  const { t, name } = useT();
  const size = main ? 'w-16 h-16' : 'w-10 h-10';
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl bg-amber-50 text-left ${main ? 'px-3 py-3' : 'mt-2 px-3 py-2'}`}>
      <div className="shrink-0 flex items-center -space-x-3">
        <img src={business.image} alt="" draggable={false} className={`${size} object-contain`} />
        <img src={managerPortrait(business.id)} alt="" draggable={false} className={`${size} rounded-full object-cover border-2 border-white shadow`} />
      </div>
      <span className={`min-w-0 font-black text-slate-600 ${main ? 'text-[13px] leading-snug' : 'text-[11px]'}`}>
        {t('ceremony.managerGift', { business: name('business', business), manager: t(managerKey(business.id, 'name')) })}
      </span>
    </div>
  );
}

/**
 * The card that closes a class ceremony: one main change (the home, else the outfit, else the gift),
 * then what else the class brought, the next goal and Continue. Without a known "before", or when
 * the player already had it all, it shows the class reached instead of a made-up comparison.
 */
function ClassSummary({ classIndex, before, now, onClose }: { classIndex: number; before: GameStateV2 | null; now: GameStateV2; onClose: () => void }) {
  const { t, name, money, duration } = useT();
  const reached = WEALTH_CLASSES[classIndex];
  const previous = WEALTH_CLASSES[classIndex - 1];
  const next = WEALTH_CLASSES[classIndex + 1];
  const capBefore = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex - 1, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
  const capNow = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
  const { home, outfit, gift } = classChanges(classIndex, before, now);
  const giftIsMain = gift !== undefined && !home && !outfit;

  return (
    <div className="v2-pop-in relative w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3">
        <h2 className="v2-display v2-outline-thin text-2xl text-white">{name('wealthClass', reached)}</h2>
      </div>
      <div className="px-5 pt-4 pb-5">
        {home ? (
          <Swap
            from={{ picture: <HomeShot house={home.from} dim />, name: name('lifestyle', home.from) }}
            to={{
              picture: <HomeShot house={home.to} />,
              name: name('lifestyle', home.to),
              badge: home.owned ? t('home.owned') : undefined,
            }}
          />
        ) : outfit ? (
          <Swap
            from={{ picture: <OutfitShot outfit={outfit.from} dim />, name: name('lifestyle', outfit.from) }}
            to={{ picture: <OutfitShot outfit={outfit.to} />, name: name('lifestyle', outfit.to) }}
          />
        ) : giftIsMain ? (
          <ManagerGift business={gift} main />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-amber-100 px-3 py-2.5 text-left">
            <img src={portraitOf('hero', 'happy') ?? ''} alt="" draggable={false} className="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-white shadow" />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t('ceremony.now')}</p>
              <p className="text-sm font-black leading-tight text-slate-900 break-words">{name('wealthClass', reached)}</p>
              {previous && (
                <p className="text-[11px] font-semibold text-slate-500 break-words">
                  {t('ceremony.before')}: {name('wealthClass', previous)}
                </p>
              )}
            </div>
          </div>
        )}

        {home && outfit && (
          <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-slate-50 pl-2 pr-3 py-1.5 text-left">
            <div className="w-9 h-9 shrink-0 overflow-hidden rounded-full bg-amber-100 flex justify-center">
              <img src={outfit.to.image} alt="" draggable={false} className="h-[86px] max-w-none" />
            </div>
            <span className="min-w-0 text-[11px] font-black text-slate-600">
              {t('scene.newOutfit', { outfit: name('lifestyle', outfit.to) })}
            </span>
          </div>
        )}

        {capNow !== capBefore && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
            <span className="min-w-0 text-left text-[11px] font-black text-slate-500">{t('ceremony.offlineCap')}</span>
            <span className="shrink-0 text-sm font-black text-slate-900">
              {duration(capBefore * 3600)} → <span className="text-emerald-500">{duration(capNow * 3600)}</span>
            </span>
          </div>
        )}

        {gift && !giftIsMain && <ManagerGift business={gift} />}

        <p className="text-[11px] font-semibold text-slate-500 mt-3">
          {next
            ? t('ceremony.nextGoal', { name: name('wealthClass', next), amount: money(next.threshold) })
            : t('ceremony.top')}
        </p>

        <GameButton
          tone="buy"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="w-full mt-4 py-3 v2-display text-lg v2-shadow"
        >
          {t('ceremony.done')}
        </GameButton>
      </div>
    </div>
  );
}

/** One spoken line: the speaker's portrait sits on the bubble's top edge, hero right, others left. */
function Dialogue({ line, delay }: { line: Extract<CeremonyLine, { speaker: CastId }>; delay: string }) {
  const { t } = useT();
  const portrait = portraitOf(line.speaker, line.face);
  const right = line.speaker === 'hero';
  const label = line.speaker === 'hero' || line.speaker === 'mom'
    ? t(`prologue.speaker.${line.speaker}`)
    : t(`ceremony.cast.${line.speaker}`);

  return (
    <div
      className="v2-line-in absolute inset-x-4 bottom-[calc(var(--safe-bottom)+24px)]"
      style={{ animationDelay: delay }}
    >
      {portrait && (
        <img
          src={portrait}
          alt=""
          draggable={false}
          className={`absolute -top-[104px] ${right ? 'right-3' : 'left-3'} w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl bg-slate-200`}
        />
      )}
      <div className="relative bg-white rounded-[22px] shadow-2xl px-4 pt-6 pb-2.5 min-h-[96px]">
        <span
          className={`absolute -top-3 ${right ? 'right-[136px]' : portrait ? 'left-[136px]' : 'left-4'} flex items-center gap-1 rounded-full bg-gradient-to-r ${TAG_STYLE[line.speaker]} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow`}
        >
          {line.phone && <Phone className="w-3 h-3" />}
          {label}
        </span>
        <p className="text-[16px] font-bold leading-snug text-slate-800">{t(line.text)}</p>
        <p className="mt-1 flex items-center justify-end text-[10px] font-black text-slate-400">
          {t('ceremony.next')}
          <ChevronRight className="w-3.5 h-3.5" />
        </p>
      </div>
    </div>
  );
}
