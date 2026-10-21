import { ArrowBigUpDash, Lock, Play, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WEALTH_CLASSES } from '../../core/config/classes';
import {
  branchCapAt,
  branchCost,
  businessImage,
  businessState,
  cycleRevenue,
  globalMultiplier,
  isMaxLevel,
  levelRevenue,
  locations,
  managerCost,
  businessStage,
  nextLevel,
  nextStageLevel,
} from '../../core/formulas';
import type { BusinessDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { ActionAd } from '../ads/AdOffers';
import { useAdText } from '../ads/useAdText';
import { CAMPAIGN_FACTOR, CAMPAIGN_SECONDS, TEMP_MANAGER_SECONDS } from '../../core/config/ads';
import { adGift, campaignLeft, canCampaign, canTempManage, tempManagerLeft } from '../../runtime/adRewards';
import { payout } from '../home/coins';
import { Focusable } from '../home/Focusable';
import { levelNameKey } from '../home/questText';
import { Chip, GameButton, ImageTile, Panel } from '../kit';
import { GrowShow, HireShow } from './BusinessShow';
import { CycleBar } from './CycleBar';
import { managerKey, managerPortrait, type ManagerLine } from './managers';

// One business line (docs/game-design-v2.md §4.3): opened once, then grown level by level (stand →
// shop → store) and, at the top level, by branches on this same card. Without a manager each run
// needs a tap on "Run" and counts nowhere in the monthly income; a manager runs every location,
// also while the app is closed.

/** Most branch icons drawn in the row; more shows as the count alone. */
const BRANCH_ICONS = 8;
/** A plain level-up plays `levelUp` this much higher per level, up to the cap (2026-10-21). */
const LEVEL_PITCH_STEP = 0.05;
const LEVEL_PITCH_MAX = 1.5;

/** One dot per level; the first level of each new look (shop, store) is a larger dot. */
function LevelPips({ def, level }: { def: BusinessDef; level: number }) {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      {def.levels.map((step, index) => {
        const newLook = index > 0 && step.stage > def.levels[index - 1].stage;
        const reached = index < level;
        return (
          <span
            key={index}
            className={`rounded-full ${newLook ? 'w-2.5 h-2.5' : 'w-1.5 h-1.5'} ${
              reached ? 'bg-gradient-to-b from-amber-300 to-orange-500' : newLook ? 'bg-amber-100 ring-1 ring-amber-300' : 'bg-indigo-100'
            }`}
          />
        );
      })}
    </span>
  );
}

export function BusinessCard({ def }: { def: BusinessDef }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();
  const business = businessState(game, def.id);
  const { level, branches, managed } = business;
  const opened = level > 0;
  const cycle = state.cycles[def.id];
  const speed = actions.dev.getSpeed();
  const multiplier = globalMultiplier(game);

  const canStart = opened && !managed && !cycle.running;
  const secondsLeft = (def.cycleSeconds * (1 - cycle.progress)) / Math.max(speed, 1e-9);
  const perRun = cycleRevenue(game, def);
  const monthly = perMonth(perRun / def.cycleSeconds);

  // The next level (or opening the line): what it costs and what a run pays after.
  const next = nextLevel(def, business);
  const places = Math.max(1, locations(business));
  const runNow = levelRevenue(def, level) * places * multiplier;
  const runNext = next ? next.revenue * places * multiplier : runNow;

  // Branches: at the top level, as many as the class allows; a ceremony raises the limit.
  const atTop = isMaxLevel(def, business);
  const cap = branchCapAt(def, game.classIndex);
  const atCap = branches >= cap;
  const nextClass = WEALTH_CLASSES[game.classIndex + 1];
  const nextCap = nextClass ? branchCapAt(def, game.classIndex + 1) : null;
  const branchPrice = branchCost(def, branches);
  const branchRun = levelRevenue(def, level) * multiplier;
  const hirePrice = managerCost(game, def);
  const now = Date.now();
  const tempLeft = tempManagerLeft(state.ads, def.id, now);
  const campaignOn = campaignLeft(state.ads, def.id, now);
  // A campaign (an ad) multiplies what the runs pay; the card shows the multiplied run while it lasts.
  const campaignFactor = campaignOn > 0 ? CAMPAIGN_FACTOR : 1;
  const adText = useAdText();

  const managerName = t(managerKey(def.id, 'name'));
  const portrait = managerPortrait(def.id);
  const [hired, setHired] = useState(false);
  // The business took on a new look (stand → shop → store): played once as a show (BusinessShow.tsx).
  const [grown, setGrown] = useState<{ level: number; fromImage: string; from: number; to: number } | null>(null);
  // A plain level-up: light sweeps the picture and the run's gain floats up (the key replays both).
  const [bump, setBump] = useState<{ key: number; gain: number } | null>(null);
  // The branch just opened pops into the row.
  const [newBranch, setNewBranch] = useState<number | null>(null);
  const stageAt = opened ? nextStageLevel(def, level) : null;
  // Tapping a manager's portrait shows one of their lines for a moment.
  const [quote, setQuote] = useState<ManagerLine | null>(null);
  useEffect(() => {
    if (!quote) return;
    const timer = window.setTimeout(() => setQuote(null), 3500);
    return () => window.clearTimeout(timer);
  }, [quote]);

  const hire = () => {
    if (!actions.hireManager(def.id)) return;
    // The show plays its own sound as the manager steps in.
    haptic('medium');
    setHired(true);
  };

  const talk = () => {
    haptic('light');
    setQuote((current) => (current === 'line1' ? 'line2' : 'line1'));
  };

  return (
    <Panel className="p-3 flex flex-col gap-2.5">
      <div className={`flex gap-3 ${opened ? 'pb-1.5' : ''}`}>
        <Focusable focusKey={`business:${def.id}:run`} className="shrink-0">
          <button
            type="button"
            onClick={() => actions.startCycle(def.id)}
            disabled={!canStart}
            aria-label={canStart ? t('business.run') : name('business', def)}
            className="relative shrink-0 transition-all active:scale-95 disabled:active:scale-100"
          >
            <ImageTile className={`relative overflow-hidden ${opened ? 'w-20 h-20' : 'w-[88px] h-[88px]'}`}>
              <img
                key={bump?.key}
                src={businessImage(def, Math.max(level, 1))}
                alt=""
                draggable={false}
                className={`${bump ? 'v2-bump' : ''} ${
                  opened ? 'w-[70px] h-[70px] object-contain' : 'w-[78px] h-[78px] object-contain grayscale opacity-60'
                }`}
              />
              {bump && (
                <span
                  key={`shine-${bump.key}`}
                  className="v2-tile-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  aria-hidden
                />
              )}
            </ImageTile>
            {campaignOn > 0 && (
              <span className="absolute -top-1.5 -right-1.5 rounded-full border-2 border-white bg-gradient-to-b from-amber-400 to-orange-500 v2-glossy px-1.5 v2-display text-[12px] text-white v2-shadow">
                ×{CAMPAIGN_FACTOR}
              </span>
            )}
            {bump && bump.gain > 0 && (
              <span
                key={`gain-${bump.key}`}
                className="v2-float-up pointer-events-none absolute left-1/2 top-1 whitespace-nowrap v2-display v2-outline-thin text-[15px] text-emerald-400 tabular-nums"
                aria-hidden
              >
                +{money(bump.gain)}
              </span>
            )}
            {canStart && (
              <span className="v2-nudge absolute left-1/2 -bottom-2.5 flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-amber-300 to-orange-500 v2-glossy pl-1.5 pr-2.5 py-0.5 v2-display text-[12px] text-white v2-shadow">
                <Play className="w-3 h-3 fill-white" />
                {t('business.run')}
              </span>
            )}
          </button>
          {/* Under the picture, where "Run" sits on a line without a manager: the name keeps the whole row. */}
          {managed && (
            <button
              type="button"
              onClick={talk}
              aria-label={managerName}
              className="v2-hit absolute -left-2.5 -bottom-2.5 flex transition-all active:scale-95"
            >
              <Chip>
                <img
                  src={portrait}
                  alt=""
                  draggable={false}
                  className="-ml-1.5 w-6 h-6 rounded-full object-cover border-2 border-white"
                />
                {t('business.auto')}
              </Chip>
            </button>
          )}
        </Focusable>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <p className="v2-display text-[17px] leading-tight text-indigo-950 line-clamp-2 break-words">
            {name('business', def)}
          </p>

          {opened ? (
            <>
              {/* The income drops to its own line when both do not fit, instead of being cut. */}
              <p className="flex flex-wrap gap-x-1.5 text-[12px] font-bold leading-tight">
                <span className="text-indigo-700 whitespace-nowrap">
                  {t(levelNameKey(def.id, level))} · {t('business.level', { level, max: def.levels.length })}
                </span>
                <span className={managed ? 'text-emerald-600' : 'text-violet-600'}>
                  {t(managed ? 'business.income' : 'business.withManager', {
                    amount: campaignOn > 0 ? perMonth((perRun * campaignFactor) / def.cycleSeconds) : monthly,
                  })}
                </span>
              </p>
              <CycleBar
                progress={cycle.progress}
                running={managed || cycle.running}
                managed={managed}
                cycleSeconds={def.cycleSeconds}
                lastActiveAt={state.lastActiveAt}
                speed={speed}
                label={`${t('business.perRun', { amount: money(perRun * campaignFactor) })}${campaignOn > 0 ? ` ×${CAMPAIGN_FACTOR}` : ''}`}
                detail={!canStart && def.cycleSeconds / speed >= 2 ? duration(Math.ceil(secondsLeft)) : undefined}
              />
            </>
          ) : (
            <p className="text-[12px] font-bold text-emerald-600">
              {t('business.openIncome', { amount: perMonth(runNext / def.cycleSeconds) })}
            </p>
          )}
        </div>
      </div>

      {quote && (
        <div className="v2-pop-in flex items-center gap-2 rounded-2xl bg-violet-50 border-2 border-violet-100 px-2 py-1.5">
          <img
            src={portrait}
            alt=""
            draggable={false}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
          />
          <p className="text-[12px] font-bold leading-snug text-violet-800">
            <span className="v2-display text-violet-600">{managerName}: </span>“{t(managerKey(def.id, quote))}”
          </p>
        </div>
      )}

      {opened && (
        <div className="flex items-center gap-2 px-1 -mt-1">
          <LevelPips def={def} level={level} />
          {stageAt !== null && (
            <span className="min-w-0 truncate text-[11px] font-bold text-amber-600">
              {t('business.nextStage', { level: stageAt, name: t(levelNameKey(def.id, stageAt)) })}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {next && (
          <Focusable focusKey={`business:${def.id}:level`} className="flex-1 min-w-0">
            <GameButton
              onClick={() => {
                if (!actions.levelUpBusiness(def.id)) return;
                haptic('medium');
                if (opened && businessStage(def, level + 1) > businessStage(def, level)) {
                  // The show plays its own sound with the flash.
                  setGrown({ level: level + 1, fromImage: businessImage(def, level), from: runNow, to: runNext });
                  return;
                }
                if (opened) playSfx('levelUp', { rate: Math.min(LEVEL_PITCH_MAX, 1 + level * LEVEL_PITCH_STEP) });
                else playSfx('purchase');
                setBump({ key: Date.now(), gain: runNext - runNow });
              }}
              disabled={game.cash < next.cost}
              className="w-full h-full min-h-11 py-2 px-3 flex items-center justify-between gap-2"
            >
              <span className="min-w-0 flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                {opened && <ArrowBigUpDash className="w-5 h-5 shrink-0" />}
                {/* A long level name ("Umbrellas and stools") takes two lines instead of pushing the row wider. */}
                <span className="line-clamp-2 break-words text-left leading-tight">
                  {opened ? t(levelNameKey(def.id, level + 1)) : t('business.open')}
                </span>
              </span>
              <span className="shrink-0 v2-display text-[14px] v2-shadow tabular-nums">{money(next.cost)}</span>
            </GameButton>
          </Focusable>
        )}
        {atTop && (
          <Focusable focusKey={`business:${def.id}:branch`} className="flex-1 min-w-0">
            <GameButton
              onClick={() => {
                if (actions.openBranch(def.id)) {
                  playSfx('purchase');
                  haptic('medium');
                  setNewBranch(branches + 1);
                }
              }}
              disabled={atCap || game.cash < branchPrice}
              className="w-full h-full min-h-11 py-2 px-3 flex items-center justify-between gap-2"
            >
              {atCap ? (
                <span className="flex-1 v2-display text-[14px] v2-shadow">{t('business.branchCapFull')}</span>
              ) : (
                <>
                  <span className="min-w-0 flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                    <Store className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t('business.openBranch')}</span>
                  </span>
                  <span className="shrink-0 v2-display text-[14px] v2-shadow tabular-nums">{money(branchPrice)}</span>
                </>
              )}
            </GameButton>
          </Focusable>
        )}
        {opened && !managed && (
          <Focusable focusKey={`business:${def.id}:manager`} className="shrink-0">
            <GameButton
              tone="manager"
              onClick={hire}
              disabled={game.cash < hirePrice}
              className="h-full py-1 px-2.5 flex items-center gap-1.5"
            >
              <img
                src={portrait}
                alt=""
                draggable={false}
                className="w-7 h-7 rounded-full object-cover border-2 border-white"
              />
              <span className="flex flex-col items-start leading-tight">
                <span className="v2-display text-[12px] v2-shadow">{t('business.manager')}</span>
                <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(hirePrice)}</span>
              </span>
            </GameButton>
          </Focusable>
        )}
      </div>

      {/* What the next level changes: the run before and after, and how soon it pays for itself. */}
      {opened && next && (
        <p className="px-1 text-[11px] font-bold text-indigo-900/60">
          {t('business.nextRun', { from: money(runNow), to: money(runNext) })}
        </p>
      )}

      {atTop && (
        <div className="flex items-center gap-2 px-1">
          <span className="shrink-0 text-[11px] font-bold text-indigo-900/60 tabular-nums">
            {Number.isFinite(cap)
              ? t('business.branchesCap', { count: branches, cap })
              : t('business.branches', { count: branches })}
          </span>
          <span className="flex-1 min-w-0 flex items-center gap-0.5 overflow-hidden" aria-hidden>
            {Array.from({ length: Math.min(branches, BRANCH_ICONS) }, (_, index) => (
              <Store
                key={index}
                className={`w-3.5 h-3.5 shrink-0 text-emerald-600 ${
                  newBranch === branches && index === Math.min(branches, BRANCH_ICONS) - 1 ? 'v2-pop-in' : ''
                }`}
              />
            ))}
          </span>
          {!atCap && (
            <span className="shrink-0 text-[11px] font-bold text-emerald-600">
              {t('business.branchRun', { amount: money(branchRun) })}
            </span>
          )}
        </div>
      )}
      {atTop && atCap && nextClass && nextCap !== null && (
        <p className="flex items-center gap-1 px-1 text-[11px] font-bold text-indigo-900/50">
          <Lock className="w-3 h-3 shrink-0" />
          {Number.isFinite(nextCap)
            ? t('business.branchCapReached', { class: name('wealthClass', nextClass), cap: nextCap })
            : t('business.branchCapUnlimited', { class: name('wealthClass', nextClass) })}
        </p>
      )}

      {opened && !managed && <HelpAd cost={hirePrice} />}
      {next && <HelpAd cost={next.cost} />}
      {atTop && !atCap && <HelpAd cost={branchPrice} />}

      {/* Ads on the line itself: a stand-in manager until one is hired, a campaign for any opened line. */}
      {opened && (
        <div className="flex flex-col gap-1.5">
          {!managed &&
            (tempLeft > 0 ? (
              <p className="px-1 text-[11px] font-bold text-orange-600">
                {t('ads.tempManagerActive', { duration: duration(Math.ceil(tempLeft)) })}
              </p>
            ) : (
              canTempManage(state, def.id, now) && (
                <ActionAd
                  placement="temp_manager"
                  label={adText('ads.tempManager', { duration: duration(TEMP_MANAGER_SECONDS) })}
                  run={() => actions.ads.tempManager(def.id)}
                />
              )
            ))}
          {campaignOn > 0 ? (
            <p className="px-1 text-[11px] font-bold text-orange-600">
              {t('ads.campaignActive', { factor: CAMPAIGN_FACTOR, duration: duration(Math.ceil(campaignOn)) })}
            </p>
          ) : (
            canCampaign(state, def.id, now) && (
              <ActionAd
                placement="business_campaign"
                label={adText('ads.campaign', { duration: duration(CAMPAIGN_SECONDS), factor: CAMPAIGN_FACTOR })}
                run={() => actions.ads.campaign(def.id)}
              />
            )
          )}
        </div>
      )}

      {opened && !managed && (
        <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-2 py-1.5">
          <img
            src={portrait}
            alt=""
            draggable={false}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
          />
          <p className="text-[11px] font-bold leading-snug text-violet-700">
            {t('business.managerHint', { name: managerName })}
          </p>
        </div>
      )}

      {grown && (
        <GrowShow
          fromImage={grown.fromImage}
          toImage={businessImage(def, grown.level)}
          levelName={t(levelNameKey(def.id, grown.level))}
          growing={t('business.growing', { business: name('business', def) })}
          title={t('business.grown', { business: name('business', def) })}
          fromRun={grown.from}
          toRun={grown.to}
          actionLabel={t('business.grownOk')}
          onClose={() => setGrown(null)}
          ad={{
            placement: 'grown_bonus',
            label: adText('ads.grown', { amount: money(adGift(game)) }),
            onReward: () => {
              const paid = actions.ads.grownBonus(def.id, grown.level);
              if (paid > 0) payout({ amount: paid, label: `+${money(paid)}`, count: 10 });
              setGrown(null);
            },
          }}
        />
      )}

      {hired && (
        <HireShow
          portrait={portrait}
          name={managerName}
          line={t(managerKey(def.id, 'hire'))}
          note={t('business.managerJoined', { name: managerName, business: name('business', def) })}
          stamp={t('business.auto')}
          actionLabel={t('business.welcome')}
          onClose={() => setHired(false)}
        />
      )}
    </Panel>
  );
}
