import { ArrowBigUpDash, Clapperboard, Play, Store } from 'lucide-react';
import { useState } from 'react';
import { CAMPAIGN_FACTOR } from '../../core/config/ads';
import {
  branchCapAt,
  branchCost,
  businessImage,
  businessStage,
  businessState,
  cycleRevenue,
  globalMultiplier,
  isMaxLevel,
  levelRevenue,
  locations,
  managerCost,
  nextLevel,
} from '../../core/formulas';
import type { BusinessDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { adGift, campaignLeft, canCampaign, canHelp, canTempManage, tempManagerLeft } from '../../runtime/adRewards';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { Focusable } from '../home/Focusable';
import { levelNameKey } from '../home/questText';
import { GameButton, ImageTile, Panel } from '../kit';
import { BusinessDetails } from './BusinessDetails';
import { GrowShow, HireShow } from './BusinessShow';
import { payout } from '../home/coins';
import { useAdText } from '../ads/useAdText';
import { managerKey, managerPortrait } from './managers';
import { RunBubbles } from './RunBubbles';
import { StageBar } from './StageBar';

// One business line (docs/game-design-v2.md §4.3) as a short row (2026-10-21, user approved the
// draft): the picture runs it by hand, one line says what it earns a month, a three-part bar shows the
// way from stand to store, one button takes the next step. A line without a manager says who could
// run it right on the row. Everything else (the run's pay, branches, every ad offer) is in the sheet a
// tap on the row opens (BusinessDetails.tsx).

/** A plain level-up plays `levelUp` this much higher per level, up to the cap (2026-10-21). */
const LEVEL_PITCH_STEP = 0.05;
const LEVEL_PITCH_MAX = 1.5;

export function BusinessCard({ def }: { def: BusinessDef }) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, perMonth, duration } = useT();
  const adText = useAdText();
  const business = businessState(game, def.id);
  const { level, branches, managed } = business;
  const opened = level > 0;
  const cycle = state.cycles[def.id];
  const multiplier = globalMultiplier(game);
  const now = Date.now();

  const canStart = opened && !managed && !cycle.running;
  const perRun = cycleRevenue(game, def);
  const campaignOn = campaignLeft(state.ads, def.id, now);
  const campaignFactor = campaignOn > 0 ? CAMPAIGN_FACTOR : 1;

  // The next step: the next level (or opening the line), or at the top a branch.
  const next = nextLevel(def, business);
  const places = Math.max(1, locations(business));
  const runNow = levelRevenue(def, level) * places * multiplier;
  const runNext = next ? next.revenue * places * multiplier : runNow;
  const newBuilding = opened && next !== null && next.stage > businessStage(def, level);
  const buildingFactor = runNow > 0 ? Math.round(runNext / runNow) : 0;
  const atTop = isMaxLevel(def, business);
  const atCap = branches >= branchCapAt(def, game.classIndex);
  const price = next ? next.cost : branchCost(def, branches);
  const canStep = next !== null || (atTop && !atCap);

  const hirePrice = managerCost(game, def);
  const managerReady = opened && !managed && game.cash >= hirePrice;
  const tempLeft = tempManagerLeft(state.ads, def.id, now);
  const managerName = t(managerKey(def.id, 'name'));
  const portrait = managerPortrait(def.id);
  // An ad offer waits in the sheet: the row shows a small mark.
  const adOffer = opened && (canCampaign(state, def.id, now) || (!managed && canTempManage(state, def.id, now)));

  const [open, setOpen] = useState(false);
  const [hired, setHired] = useState(false);
  const [grown, setGrown] = useState<{ level: number; fromImage: string; from: number; to: number } | null>(null);
  const [bump, setBump] = useState<{ key: number; gain: number } | null>(null);

  const levelUp = () => {
    if (!actions.levelUpBusiness(def.id)) return false;
    haptic('medium');
    if (opened && businessStage(def, level + 1) > businessStage(def, level)) {
      // The show plays its own sound with the flash.
      setGrown({ level: level + 1, fromImage: businessImage(def, level), from: runNow, to: runNext });
      return true;
    }
    if (opened) playSfx('levelUp', { rate: Math.min(LEVEL_PITCH_MAX, 1 + level * LEVEL_PITCH_STEP) });
    else playSfx('purchase');
    setBump({ key: Date.now(), gain: runNext - runNow });
    return true;
  };
  const openBranch = () => {
    if (!actions.openBranch(def.id)) return false;
    playSfx('purchase');
    haptic('medium');
    return true;
  };
  const step = () => (next ? levelUp() : openBranch());
  const hire = () => {
    if (!actions.hireManager(def.id)) return;
    // The show plays its own sound as the manager steps in.
    haptic('medium');
    setHired(true);
  };
  const showDetails = () => {
    playSfx('click');
    haptic('light');
    setOpen(true);
  };

  const stepLabel = next
    ? opened
      ? newBuilding
        ? t('business.newBuildingShort')
        : t('business.levelUp')
      : t('business.open')
    : t('business.branchShort');

  return (
    <Panel accent={managerReady} className="p-2.5 flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <Focusable focusKey={`business:${def.id}:run`} className="shrink-0">
          <button
            type="button"
            onClick={canStart ? () => actions.startCycle(def.id) : showDetails}
            aria-label={canStart ? t('business.run') : name('business', def)}
            className="relative shrink-0 transition-all active:scale-95"
          >
            <ImageTile className="relative overflow-hidden w-[68px] h-[68px]">
              <img
                key={bump?.key}
                src={businessImage(def, Math.max(level, 1))}
                alt=""
                draggable={false}
                className={`${bump ? 'v2-bump' : ''} w-[60px] h-[60px] object-contain ${opened ? '' : 'grayscale opacity-60'}`}
              />
              {bump && (
                <span
                  key={`shine-${bump.key}`}
                  className="v2-tile-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  aria-hidden
                />
              )}
              {/* A run by hand fills a thin bar; a managed line runs every second, so it shows none. */}
              {opened && !managed && (
                <span className="absolute inset-x-1 bottom-1 h-1.5 rounded-full bg-white/80 overflow-hidden" aria-hidden>
                  <span
                    className="block h-full bg-gradient-to-r from-emerald-400 to-green-500"
                    style={{ width: `${Math.round((cycle.running ? cycle.progress : 0) * 100)}%` }}
                  />
                </span>
              )}
            </ImageTile>
            {opened && <RunBubbles businessId={def.id} />}
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
            {managed && (
              <span className="absolute z-10 -left-2 -bottom-2 flex items-center rounded-full border-2 border-white bg-gradient-to-b from-violet-400 to-indigo-600 pr-1.5 v2-display text-[10px] text-white shadow">
                <img
                  src={portrait}
                  alt=""
                  draggable={false}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-0.5 mr-0.5"
                />
                {t('business.autoShort')}
              </span>
            )}
            {canStart && (
              <span className="v2-nudge absolute z-10 left-1/2 -bottom-2 flex items-center gap-0.5 whitespace-nowrap rounded-full border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy pl-1 pr-2 v2-display text-[11px] text-white v2-shadow">
                <Play className="w-3 h-3 fill-white" />
                {t('business.run')}
              </span>
            )}
          </button>
        </Focusable>

        <button type="button" onClick={showDetails} className="flex-1 min-w-0 flex flex-col gap-1 text-left">
          <span className="flex items-center gap-1 min-w-0">
            <span className="v2-display text-[16px] leading-tight text-indigo-950 truncate">{name('business', def)}</span>
            {adOffer && <Clapperboard className="shrink-0 w-3.5 h-3.5 text-orange-400" aria-label={t('business.adOffer')} />}
          </span>
          {opened ? (
            <>
              <span className="text-[11px] font-bold text-indigo-700 truncate">
                {t(levelNameKey(def.id, level))} · {level}/{def.levels.length}
                {branches > 0 ? ` · ${t('business.branches', { count: branches })}` : ''}
              </span>
              <span className={`whitespace-nowrap text-[12px] font-black ${managed ? 'text-emerald-600' : 'text-violet-600'}`}>
                {perMonth((perRun * campaignFactor) / def.cycleSeconds)}
                {!managed && <span className="text-[10px] font-bold text-violet-500"> · {t('business.withManagerShort')}</span>}
              </span>
              <StageBar def={def} level={level} />
            </>
          ) : (
            <span className="text-[12px] font-bold text-emerald-600">
              {t('business.openIncome', { amount: perMonth(runNext / def.cycleSeconds) })}
            </span>
          )}
        </button>

        <div className="shrink-0 flex flex-col items-end gap-1">
          {canStep && (
            <Focusable focusKey={`business:${def.id}:${next ? 'level' : 'branch'}`}>
              <GameButton
                tone={newBuilding ? 'gold' : 'buy'}
                disabled={game.cash < price}
                onClick={step}
                className="relative w-[96px] py-1.5 px-2 flex flex-col items-center leading-tight"
              >
                {newBuilding && (
                  <span className="absolute -top-2 -right-1.5 rounded-full border-2 border-white bg-gradient-to-b from-rose-400 to-rose-600 px-1 v2-display text-[10px] text-white">
                    ×{buildingFactor}
                  </span>
                )}
                <span className="flex items-center gap-1 v2-display text-[12px] v2-shadow">
                  {next ? opened && <ArrowBigUpDash className="w-4 h-4" /> : <Store className="w-3.5 h-3.5" />}
                  {stepLabel}
                </span>
                <span className="v2-display text-[13px] v2-shadow tabular-nums">{money(price)}</span>
              </GameButton>
            </Focusable>
          )}
          {atTop && atCap && <span className="text-[10px] font-black text-indigo-900/50">{t('business.branchCapFull')}</span>}
          {canStep && game.cash < price && !canHelp(state, now, price) && (
            <span className="text-[10px] font-bold text-indigo-900/50 tabular-nums">
              {t('business.missing', { amount: money(price - game.cash) })}
            </span>
          )}
          {canStep && <HelpAd cost={price} />}
        </div>
      </div>

      {/* A line without a manager says who could run it, right on the row (user, 2026-10-21). */}
      {opened && !managed && (
        <div
          className={`flex items-center gap-2 rounded-2xl px-2 py-1.5 ${managerReady ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-violet-50'}`}
        >
          <img src={portrait} alt="" draggable={false} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
          <div className="flex-1 min-w-0 leading-tight">
            <p className="v2-display text-[13px] text-violet-700 truncate">{managerName}</p>
            <p className="text-[10px] font-bold text-violet-600/80">
              {tempLeft > 0 ? t('ads.tempManagerActive', { duration: duration(Math.ceil(tempLeft)) }) : t('business.managerShort')}
            </p>
          </div>
          <Focusable focusKey={`business:${def.id}:manager`} className="shrink-0">
            <GameButton
              tone={managerReady ? 'gold' : 'manager'}
              disabled={!managerReady}
              onClick={hire}
              className="py-1 px-2.5 flex flex-col items-center leading-tight"
            >
              <span className="v2-display text-[11px] v2-shadow">{t('business.hire')}</span>
              <span className="v2-display text-[12px] v2-shadow tabular-nums">{money(hirePrice)}</span>
            </GameButton>
          </Focusable>
        </div>
      )}

      {open && (
        <BusinessDetails
          def={def}
          onClose={() => setOpen(false)}
          onLevelUp={levelUp}
          onBranch={openBranch}
          onHire={() => {
            setOpen(false);
            hire();
          }}
        />
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
