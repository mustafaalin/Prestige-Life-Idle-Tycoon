import { ArrowRight, ChevronRight, Gift, Phone } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BUSINESSES, CLASS_MANAGER_GIFT } from '../../core/config/businesses';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { AD_STORY_GIFT_MULTIPLIER } from '../../core/config/ads';
import { OFFLINE_CAP_HOURS_BY_CLASS } from '../../core/config/economy';
import { COLLARS, type CollarDef } from '../../core/config/lifestyle';
import { branchCapAt, businessOpenClass, collarAt, storyGift } from '../../core/formulas';
import { bestOwnedLifestyle, currentHome, ownsHouse } from '../../core/state';
import type { BusinessDef, GameStateV2, HouseDef, LifestyleDef } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx, useMusic, type Sfx } from '../../runtime/feedback';
import type { LifeMomentId } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { AdCollect } from '../ads/AdButton';
import { useAdText } from '../ads/useAdText';
import { payout } from '../home/coins';
import { managerKey, managerPortrait } from '../businesses/managers';
import { Confetti } from '../Confetti';
import { GameButton } from '../kit';
import { classLook } from '../scene/stages';
import { albumOutfit, albumShots, lifeMomentLabel, type AlbumEntry } from './album';
import {
  CEREMONIES,
  ceremonyOutfit,
  portraitOf,
  shotsFor,
  type CastId,
  type CeremonyLine,
  type CeremonyShot,
} from './ceremonyScript';
import { lateKeyOfCeremony, lateKeyOfEntry, lateKeyOfLife, lateVersion, seenLate } from './lateLook';
import { LIFE_OUTFIT, LIFE_SCRIPT } from './lifeScript';

// Class-up ceremony (plan 1.10): "new class" title with confetti → story beats (portrait + bubble,
// visual-novel style; hero on the right, everyone else on the left) → closing card (what the class
// really changed). Tap to go on; Skip jumps to the closing card. The store stops the clock while it plays.
// A life moment (story §4c) plays the same way under its own title ("25 · First date"); the ones told
// by age close with a small gift card, the luxury moments end on their last line (or Skip).
// The gift (formulas.ts storyGift, decided 2026-10-14) closes both kinds of card: "Collect", or a
// rewarded ad for twice as much. It comes only when the story happens, never on a replay.
// A class that gives Şans a new collar (config/lifestyle.ts COLLARS, decided 2026-10-15) shows it on a
// card of its own before the closing card, with its income bonus: Skip still stops there.

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
  defneOld: 'from-pink-500 to-rose-400',
  elif: 'from-lime-500 to-green-600',
  ada: 'from-orange-500 to-red-500',
  adaChild: 'from-orange-500 to-red-500',
  burak: 'from-slate-700 to-zinc-800',
};

type Phase = 'title' | 'story' | 'interlude' | 'summary';

/** How a story beat ended: skipped or not, and the gift's multiplier (none on a replay). */
type StoryDone = (skipped: boolean, giftMultiplier?: number) => void;

interface CeremonyProps {
  classIndex: number;
  /** The game just before the class was reached; null when it is not known. */
  before: GameStateV2 | null;
  now: GameStateV2;
  /** The closing gift is offered (not on a replay). */
  gift: boolean;
  /** Told in its grandfather version (lateLook.ts). */
  late: boolean;
  onDone: StoryDone;
}

export function Ceremony({ classIndex, before, now, gift, late, onDone }: CeremonyProps) {
  const { t, name } = useT();
  const collar = COLLARS.find((item) => item.fromClass === classIndex);
  const version = lateVersion(lateKeyOfCeremony(classIndex), late, CEREMONIES[classIndex] ?? [], ceremonyOutfit(classIndex));
  return (
    <StoryPlayer
      shots={version.shots}
      heroOutfit={version.heroOutfit}
      pill={t('ceremony.newClass')}
      heading={name('wealthClass', WEALTH_CLASSES[classIndex])}
      gift={gift}
      interlude={collar ? (next) => <CollarCard collar={collar} onNext={next} /> : undefined}
      summary={(close) => <ClassSummary classIndex={classIndex} before={before} now={now} gift={gift} onClose={close} />}
      onDone={onDone}
    />
  );
}

/** `gift`: the moment closes with a gift card (the moments told by age, not on a replay). */
export function LifeMoment({ id, gift, late, onDone }: { id: LifeMomentId; gift: boolean; late: boolean; onDone: StoryDone }) {
  const i18n = useT();
  const { t } = i18n;
  const { state } = useGameV2();
  const heading = t(`moments.${id}.title` as MessageKey);
  const version = lateVersion(lateKeyOfLife(id), late, LIFE_SCRIPT[id], LIFE_OUTFIT[id]);
  return (
    <StoryPlayer
      shots={shotsFor(version.shots, state.story.lifeSeen)}
      heroOutfit={version.heroOutfit}
      opening="page"
      pill={lifeMomentLabel(id, i18n)}
      heading={heading}
      gift={gift}
      summary={gift ? (close) => <LifeGift heading={heading} heroOutfit={LIFE_OUTFIT[id]} onClose={close} /> : undefined}
      onDone={onDone}
    />
  );
}

/**
 * A moment from the family album, played again: the same beats under the album's own label, without
 * the closing card. It records nothing and leaves the clock alone.
 */
export function StoryReplay({ entry, onDone }: { entry: AlbumEntry; onDone: (skipped: boolean) => void }) {
  const i18n = useT();
  const { t, name } = i18n;
  const { state } = useGameV2();
  const key = lateKeyOfEntry(entry);
  const version = lateVersion(key, seenLate(key, state.story), albumShots(entry), albumOutfit(entry));
  return (
    <StoryPlayer
      shots={shotsFor(version.shots, state.story.lifeSeen)}
      heroOutfit={version.heroOutfit}
      opening={entry.kind === 'ceremony' ? 'fanfare' : 'page'}
      pill={entry.kind === 'ceremony' ? t('album.title') : lifeMomentLabel(entry.id, i18n)}
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
  /** The outfit the hero wears in this moment's pictures (index = OUTFITS). */
  heroOutfit: number;
  /** The small label above the title, and the title itself. */
  pill: string;
  heading: string;
  /** The closing card has a gift: leaving it any way (Back too) collects at least the plain gift. */
  gift?: boolean;
  /** A card between the story and the closing card (Şans's new collar); Skip stops there too. */
  interlude?: (next: () => void) => ReactNode;
  /** The closing card; without one the last line (or Skip) ends the moment. */
  summary?: (close: (giftMultiplier?: number) => void) => ReactNode;
  /** The sound under the title: the class ceremony's fanfare, a gentler page for a life moment. */
  opening?: Sfx;
  onDone: StoryDone;
}

function StoryPlayer({ shots, heroOutfit, pill, heading, gift = false, interlude, summary, opening = 'fanfare', onDone }: StoryPlayerProps) {
  const { t } = useT();
  const [phase, setPhase] = useState<Phase>('title');
  const [shotIndex, setShotIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const lastStep = useRef(Date.now());

  useEffect(() => {
    for (const shot of shots) if (shot.image) new Image().src = shot.image.src;
  }, [shots]);

  useMusic('story');
  useEffect(() => {
    playSfx(opening);
    haptic('medium');
  }, [opening]);

  const toEnd = (bySkip: boolean) => {
    if (!summary) {
      onDone(bySkip);
      return;
    }
    setPhase('summary');
    playSfx('purchase');
  };

  const toSummary = (bySkip: boolean) => {
    if (bySkip) setSkipped(true);
    if (interlude) {
      setPhase('interlude');
      playSfx('levelUp');
      haptic('medium');
      return;
    }
    toEnd(bySkip);
  };

  const advance = () => {
    const now = Date.now();
    if (phase === 'summary' || phase === 'interlude' || now - lastStep.current < TAP_GUARD_MS) return;
    lastStep.current = now;
    if (phase === 'title') {
      if (shots.length > 0) setPhase('story');
      else toSummary(false);
      return;
    }
    const shot = shots[shotIndex];
    if (lineIndex + 1 < shot.lines.length) {
      playSfx('page');
      setLineIndex(lineIndex + 1);
    } else if (shotIndex + 1 < shots.length) {
      playSfx('page');
      setShotIndex(shotIndex + 1);
      setLineIndex(0);
    } else {
      toSummary(false);
    }
  };

  useBackButton(true, 200, () =>
    phase === 'summary' ? onDone(skipped, gift ? 1 : undefined) : phase === 'interlude' ? toEnd(skipped) : toSummary(true),
  );

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

        {line && (line.speaker ? <Dialogue key={`${shotIndex}-${lineIndex}`} line={line} heroOutfit={heroOutfit} delay={lineDelay} /> : (
          <p
            key={`${shotIndex}-${lineIndex}`}
            className="v2-line-in absolute inset-x-0 bottom-[calc(var(--safe-bottom)+72px)] px-8 text-center text-xl font-black italic leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
            style={{ animationDelay: lineDelay }}
          >
            {t(line.text)}
          </p>
        ))}

        {(phase === 'title' || phase === 'story') && (
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

        {phase === 'interlude' && interlude && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-6">
            <Confetti />
            {interlude(() => toEnd(skipped))}
          </div>
        )}

        {phase === 'summary' && summary && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-6">
            <Confetti />
            {summary((giftMultiplier) => onDone(skipped, giftMultiplier))}
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
function ClassSummary({
  classIndex,
  before,
  now,
  gift: withGift,
  onClose,
}: {
  classIndex: number;
  before: GameStateV2 | null;
  now: GameStateV2;
  gift: boolean;
  onClose: (giftMultiplier?: number) => void;
}) {
  const { t, name, money, duration } = useT();
  const reached = WEALTH_CLASSES[classIndex];
  const previous = WEALTH_CLASSES[classIndex - 1];
  const next = WEALTH_CLASSES[classIndex + 1];
  const capBefore = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex - 1, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
  const capNow = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
  const { home, outfit, gift } = classChanges(classIndex, before, now);
  const giftIsMain = gift !== undefined && !home && !outfit;
  const collar = COLLARS.find((item) => item.fromClass === classIndex);
  // Lines the class opens, and whether an opened line may now have more branches (docs/game-design-v2.md §4.3).
  const opened = BUSINESSES.filter((def) => businessOpenClass(def) === classIndex);
  const capsUp = BUSINESSES.some(
    (def) => (now.businesses[def.id]?.level ?? 0) > 0 && branchCapAt(def, classIndex) > branchCapAt(def, classIndex - 1),
  );

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
            <img src={portraitOf('hero', 'happy', ceremonyOutfit(classIndex)) ?? ''} alt="" draggable={false} className="w-14 h-14 shrink-0 rounded-full object-cover border-2 border-white shadow" />
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

        {collar && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2">
            <span className="min-w-0 text-left text-[11px] font-black text-slate-500">{t('ceremony.collar.row')}</span>
            <span className="shrink-0 text-sm font-black text-slate-900">
              {t('ceremony.collar.short', { percent: percent(collarAt(classIndex - 1)?.statusBonus ?? 0) })} →{' '}
              <span className="text-emerald-500">{t('ceremony.collar.short', { percent: percent(collar.statusBonus) })}</span>
            </span>
          </div>
        )}

        {opened.length > 0 && (
          <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-slate-50 pl-2 pr-3 py-1.5 text-left">
            <div className="flex shrink-0 -space-x-2">
              {opened.map((def) => (
                <img key={def.id} src={def.image} alt="" draggable={false} className="w-9 h-9 object-contain" />
              ))}
            </div>
            <span className="min-w-0 text-[11px] font-black text-slate-600">
              {t('ceremony.businessOpen')}: {opened.map((def) => name('business', def)).join(', ')}
            </span>
          </div>
        )}

        {capsUp && (
          <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-left text-[11px] font-black text-slate-500">
            {t('ceremony.businessCaps')}
          </div>
        )}

        {gift && !giftIsMain && <ManagerGift business={gift} />}

        <p className="text-[11px] font-semibold text-slate-500 mt-3">
          {next
            ? t('ceremony.nextGoal', { name: name('wealthClass', next), amount: money(next.threshold) })
            : t('ceremony.top')}
        </p>

        {withGift ? (
          <StoryGift onCollect={onClose} />
        ) : (
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
        )}
      </div>
    </div>
  );
}

const percent = (fraction: number) => Math.round(fraction * 100);

/** Şans close on his head and neck in a collar, so the collar reads; the legs are cut by the frame. */
function CollarShot({ classIndex, dim }: { classIndex: number; dim?: boolean }) {
  return (
    <div className="relative h-[124px] overflow-hidden rounded-xl bg-gradient-to-b from-white/70 to-transparent">
      <img
        src={classLook(classIndex).sans.src}
        alt=""
        draggable={false}
        className={`absolute left-1/2 top-1 h-[190px] w-auto max-w-none -translate-x-1/2 ${dim ? 'grayscale-[45%] opacity-80' : 'drop-shadow'}`}
      />
    </div>
  );
}

/**
 * Şans's new collar and what it adds to income: the collar before and the new one side by side, then
 * the bonus. Only the collar he wears counts, so a better one replaces the bonus of the one before, it
 * does not add to it (the rope gives nothing).
 */
function CollarCard({ collar, onNext }: { collar: CollarDef; onNext: () => void }) {
  const { t } = useT();
  const previous = collarAt(collar.fromClass - 1);
  const named = (id: string, bonus: number) =>
    t('ceremony.collar.named', { name: t(`ceremony.collar.${id}` as MessageKey), percent: percent(bonus) });
  return (
    <div className="v2-pop-in relative w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
        <h2 className="v2-display v2-outline-thin text-2xl text-white break-words">{t('ceremony.collar.title')}</h2>
      </div>
      <div className="px-5 pt-4 pb-5 flex flex-col items-center">
        <div className="w-full">
          <Swap
            from={{
              picture: <CollarShot classIndex={collar.fromClass - 1} dim />,
              name: named(previous?.id ?? 'rope', previous?.statusBonus ?? 0),
            }}
            to={{
              picture: <CollarShot classIndex={collar.fromClass} />,
              name: t(`ceremony.collar.${collar.id}`),
              badge: t('ceremony.collar.short', { percent: percent(collar.statusBonus) }),
            }}
          />
        </div>
        <p className="v2-pop-in mt-3 rounded-full bg-emerald-500 px-4 py-1.5 v2-display text-[20px] leading-tight text-white shadow" style={{ animationDelay: '250ms' }}>
          {t('ceremony.collar.bonus', { percent: percent(collar.statusBonus) })}
        </p>
        <p className="mt-2 text-[12px] font-bold leading-snug text-slate-500">{t('ceremony.collar.body')}</p>
        <GameButton
          tone="buy"
          onClick={(event) => {
            event.stopPropagation();
            playSfx('click');
            onNext();
          }}
          className="w-full mt-4 py-3 v2-display text-lg v2-shadow"
        >
          {t('ceremony.collar.ok')}
        </GameButton>
      </div>
    </div>
  );
}

/**
 * The gift that closes a ceremony or a life moment: its amount, the ad for twice as much (once ads are
 * open, as everywhere) and Collect. Either button ends the card.
 */
function StoryGift({ onCollect }: { onCollect: (giftMultiplier: number) => void }) {
  const { game } = useGameV2();
  const { t, money } = useT();
  const adText = useAdText();
  const amount = storyGift(game);

  const collect = (multiplier: number) => {
    playSfx('payout');
    haptic('medium');
    // Paid by onCollect in this same tap (story.ceremonySeen / lifeSeen).
    payout({ amount: amount * multiplier, label: `+${money(amount * multiplier)}`, count: multiplier > 1 ? 18 : 12 });
    onCollect(multiplier);
  };

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl bg-emerald-50 border-2 border-emerald-100 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[12px] font-black text-emerald-700">
          <Gift className="w-4 h-4" />
          {t('ceremony.gift')}
        </span>
        <span className="v2-display text-[20px] text-emerald-600 tabular-nums">+{money(amount)}</span>
      </div>
      {/* Inside a tappable card: a tap here must not reach the card. */}
      <div onClick={(event) => event.stopPropagation()}>
        <AdCollect
          placement="story_gift_x2"
          className="mt-3"
          adLabel={adText('ads.double', { amount: money(amount * AD_STORY_GIFT_MULTIPLIER), factor: AD_STORY_GIFT_MULTIPLIER })}
          onReward={() => collect(AD_STORY_GIFT_MULTIPLIER)}
          collectLabel={t('common.collect')}
          onCollect={() => collect(1)}
          packAmount={`+${money(amount * AD_STORY_GIFT_MULTIPLIER)}`}
          plainAmount={`+${money(amount)}`}
          packBadge={`×${AD_STORY_GIFT_MULTIPLIER}`}
        />
      </div>
    </>
  );
}

/** The card that closes a life moment told by age: the hero glad, and the gift. */
function LifeGift({ heading, heroOutfit, onClose }: { heading: string; heroOutfit: number; onClose: (giftMultiplier?: number) => void }) {
  return (
    <div className="v2-pop-in relative w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
      <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3">
        <h2 className="v2-display v2-outline-thin text-2xl text-white break-words">{heading}</h2>
      </div>
      <div className="px-5 pt-4 pb-5 flex flex-col items-center">
        <img
          src={portraitOf('hero', 'happy', heroOutfit) ?? ''}
          alt=""
          draggable={false}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg bg-amber-100"
        />
        <div className="w-full">
          <StoryGift onCollect={onClose} />
        </div>
      </div>
    </div>
  );
}

/** One spoken line: the speaker's portrait sits on the bubble's top edge, hero right, others left. */
function Dialogue({ line, heroOutfit, delay }: { line: Extract<CeremonyLine, { speaker: CastId }>; heroOutfit: number; delay: string }) {
  const { t } = useT();
  const { state } = useGameV2();
  const portrait = portraitOf(line.speaker, line.face, heroOutfit);
  const right = line.speaker === 'hero';
  // The daughter and the granddaughter carry the names the player gave them.
  const label =
    line.speaker === 'hero' || line.speaker === 'mom'
      ? t(`prologue.speaker.${line.speaker}`)
      : line.speaker === 'elif'
        ? state.story.daughterName || t('moments.defaultName')
        : line.speaker === 'ada' || line.speaker === 'adaChild'
          ? state.story.grandchildName || t('moments.grandchildDefault')
          : t(`ceremony.cast.${line.speaker === 'defneOld' ? 'defne' : line.speaker}`);

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
