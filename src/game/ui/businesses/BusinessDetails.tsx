import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CAMPAIGN_FACTOR, CAMPAIGN_SECONDS, TEMP_MANAGER_SECONDS } from '../../core/config/ads';
import { WEALTH_CLASSES } from '../../core/config/classes';
import {
  branchCapAt,
  branchCost,
  businessImage,
  businessStage,
  businessState,
  globalMultiplier,
  isMaxLevel,
  levelRevenue,
  locations,
  managerCost,
  nextLevel,
  nextStageLevel,
} from '../../core/formulas';
import type { BusinessDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { campaignLeft, canCampaign, canTempManage, tempManagerLeft } from '../../runtime/adRewards';
import { useBackButton } from '../../runtime/backButton';
import { runPay } from '../../runtime/engine';
import { haptic } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { ActionAd } from '../ads/AdOffers';
import { levelNameKey } from '../home/questText';
import { GameButton, ImageTile, Panel } from '../kit';
import { portalRoot } from '../stage';
import { managerKey, managerPortrait, type ManagerLine } from './managers';
import { StageBar } from './StageBar';
import { Cash } from '../CashAmount';
import { UiIcon } from '../UiIcon';

// A business line's details (2026-10-21, opened by a tap on its row, BusinessCard.tsx): what a run pays
// and what the next level adds, the manager, the branches and every ad offer of the line.

interface BusinessDetailsProps {
  def: BusinessDef;
  onClose: () => void;
  /** The row's own actions, so the shows (grown, hired) play the same from here. */
  onLevelUp: () => boolean;
  onBranch: () => boolean;
  onHire: () => void;
}

export function BusinessDetails({ def, onClose, onLevelUp, onBranch, onHire }: BusinessDetailsProps) {
  const { game, state, actions } = useGameV2();
  const { t, name, money, runMoney, perMonth, duration } = useT();
  useBackButton(true, 60, onClose);

  const business = businessState(game, def.id);
  const { level, branches, managed } = business;
  const opened = level > 0;
  const now = Date.now();
  const multiplier = globalMultiplier(game);
  const next = nextLevel(def, business);
  const places = Math.max(1, locations(business));
  const runNow = levelRevenue(def, level) * places * multiplier;
  const runNext = next ? next.revenue * places * multiplier : runNow;
  const newBuilding = opened && next !== null && next.stage > businessStage(def, level);
  const stageAt = opened ? nextStageLevel(def, level) : null;
  const pay = runPay(state, def, now);

  const atTop = isMaxLevel(def, business);
  const cap = branchCapAt(def, game.classIndex);
  const atCap = branches >= cap;
  const nextClass = WEALTH_CLASSES[game.classIndex + 1];
  const nextCap = nextClass ? branchCapAt(def, game.classIndex + 1) : null;
  const branchPrice = branchCost(def, branches);
  const hirePrice = managerCost(game, def);
  const tempLeft = tempManagerLeft(state.ads, def.id, now);
  const campaignOn = campaignLeft(state.ads, def.id, now);
  const managerName = t(managerKey(def.id, 'name'));
  const portrait = managerPortrait(def.id);

  // Tapping the manager shows one of their lines for a moment.
  const [quote, setQuote] = useState<ManagerLine | null>(null);
  useEffect(() => {
    if (!quote) return;
    const timer = window.setTimeout(() => setQuote(null), 3500);
    return () => window.clearTimeout(timer);
  }, [quote]);

  const offers = [
    opened && !managed && tempLeft <= 0 && canTempManage(state, def.id, now) && (
      <ActionAd
        key="temp"
        placement="temp_manager"
        label={t('ads.tempManager', { duration: duration(TEMP_MANAGER_SECONDS) })}
        run={() => actions.ads.tempManager(def.id)}
      />
    ),
    opened && campaignOn <= 0 && canCampaign(state, def.id, now) && (
      <ActionAd
        key="campaign"
        placement="business_campaign"
        label={t('ads.campaign', { duration: duration(CAMPAIGN_SECONDS), factor: CAMPAIGN_FACTOR })}
        run={() => actions.ads.campaign(def.id)}
      />
    ),
  ].filter(Boolean);

  return createPortal(
    <div className="absolute inset-0 z-[60] flex items-end bg-black/35" onClick={onClose}>
      <div
        className="v2-sheet-in w-full max-h-[86%] overflow-y-auto rounded-t-[28px] bg-gradient-to-b from-sky-100 to-indigo-100 p-4 pb-[calc(1rem+var(--safe-bottom))] flex flex-col gap-3"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <ImageTile className="w-24 h-24">
            <img src={businessImage(def, Math.max(level, 1))} alt="" draggable={false} className="w-[88px] h-[88px] object-contain" />
          </ImageTile>
          <div className="flex-1 min-w-0">
            <p className="v2-display text-xl leading-tight text-indigo-950 break-words">{name('business', def)}</p>
            {opened && (
              <>
                <p className="text-[12px] font-bold text-indigo-700">
                  {t(levelNameKey(def.id, level))} · {t('business.level', { level, max: def.levels.length })}
                </p>
                {/* What a run pays now, boost and campaign included (the "+$" bubble's number); ×N says why it
                    is more than the plain run below. */}
                <p className="text-[12px] font-black text-emerald-600">
                  {t('business.perRun', { amount: runMoney(pay) })}
                  {runNow > 0 && pay / runNow > 1.05 && <span className="ml-1 text-orange-500">×{Math.round(pay / runNow)}</span>}
                </p>
                <div className="mt-1.5">
                  <StageBar def={def} level={level} />
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="self-start p-1.5 rounded-full bg-white/70 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-indigo-700" />
          </button>
        </div>

        {next && (
          <Panel className="p-3 flex flex-col gap-2">
            {opened && (
              <>
                <p className="text-[12px] font-bold text-indigo-900/70">
                  {t('business.nextLevel')}: <span className="text-indigo-950">{t(levelNameKey(def.id, level + 1))}</span>
                </p>
                <p className="text-[12px] font-bold text-indigo-900/70"><Cash size={15}>{t('business.nextMonth', { from: perMonth(runNow / def.cycleSeconds), to: perMonth(runNext / def.cycleSeconds) })}</Cash></p>
              </>
            )}
            {newBuilding ? (
              <p className="text-[11px] font-black text-amber-600">
                {t('business.newBuilding', { name: t(levelNameKey(def.id, level + 1)), factor: runNow > 0 ? Math.round(runNext / runNow) : 0 })}
              </p>
            ) : (
              stageAt !== null && (
                <p className="text-[11px] font-bold text-amber-600">
                  {t('business.nextStage', { level: stageAt, name: t(levelNameKey(def.id, stageAt)) })}
                </p>
              )
            )}
            <GameButton
              tone={newBuilding ? 'gold' : 'buy'}
              disabled={game.cash < next.cost}
              onClick={() => {
                if (onLevelUp() && newBuilding) onClose();
              }}
              className="py-2.5 px-3 flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                {opened && <UiIcon name="upgrade" className="w-5 h-5" />}
                {opened ? t('business.levelUp') : t('business.open')}
              </span>
              <Cash size={17} className="v2-display text-[14px] v2-shadow tabular-nums">{money(next.cost)}</Cash>
            </GameButton>
            <HelpAd cost={next.cost} className="self-end" />
          </Panel>
        )}

        {opened && (
          <Panel className="p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  haptic('light');
                  setQuote((current) => (current === 'line1' ? 'line2' : 'line1'));
                }}
                aria-label={managerName}
                className="shrink-0 transition-all active:scale-95"
              >
                <img src={portrait} alt="" draggable={false} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="v2-display text-[14px] text-violet-700">
                  {managerName}
                  {managed && <span className="ml-1.5 text-[11px] text-emerald-600">{t('business.auto')}</span>}
                </p>
                <p className="text-[11px] font-bold leading-snug text-violet-700/80">
                  {quote
                    ? `“${t(managerKey(def.id, quote))}”`
                    : managed
                      ? t('business.managerJoined', { name: managerName, business: name('business', def) })
                      : t('business.managerHint', { name: managerName })}
                </p>
              </div>
              {!managed && (
                <GameButton
                  tone="manager"
                  disabled={game.cash < hirePrice}
                  onClick={onHire}
                  className="shrink-0 py-1.5 px-2.5 flex flex-col items-center leading-tight"
                >
                  <span className="v2-display text-[12px] v2-shadow">{t('business.hire')}</span>
                  <Cash size={15} className="v2-display text-[12px] v2-shadow tabular-nums">{money(hirePrice)}</Cash>
                </GameButton>
              )}
            </div>
            {!managed && <HelpAd cost={hirePrice} className="self-end" />}
          </Panel>
        )}

        {atTop && (
          <Panel className="p-3 flex flex-col gap-2">
            <p className="text-[12px] font-bold text-indigo-900/70 tabular-nums">
              {Number.isFinite(cap) ? t('business.branchesCap', { count: branches, cap }) : t('business.branches', { count: branches })}
              {!atCap && <span className="ml-1.5 text-emerald-600">{t('business.branchMonth', { amount: perMonth((levelRevenue(def, level) * multiplier) / def.cycleSeconds) })}</span>}
            </p>
            {!atCap && (
              <GameButton
                disabled={game.cash < branchPrice}
                onClick={onBranch}
                className="py-2.5 px-3 flex items-center justify-between gap-2"
              >
                <span className="flex items-center gap-1.5 v2-display text-[14px] v2-shadow">
                  <UiIcon name="branch" className="w-5 h-5" />
                  {t('business.openBranch')}
                </span>
                <Cash size={17} className="v2-display text-[14px] v2-shadow tabular-nums">{money(branchPrice)}</Cash>
              </GameButton>
            )}
            {!atCap && <HelpAd cost={branchPrice} className="self-end" />}
            {atCap && nextClass && nextCap !== null && (
              <p className="flex items-center gap-1 text-[11px] font-bold text-indigo-900/50">
                <UiIcon name="lock" />
                {Number.isFinite(nextCap)
                  ? t('business.branchCapReached', { class: name('wealthClass', nextClass), cap: nextCap })
                  : t('business.branchCapUnlimited', { class: name('wealthClass', nextClass) })}
              </p>
            )}
          </Panel>
        )}

        {(tempLeft > 0 || campaignOn > 0) && (
          <div className="flex flex-col gap-0.5 px-1">
            {!managed && tempLeft > 0 && (
              <p className="text-[11px] font-bold text-orange-600">{t('ads.tempManagerActive', { duration: duration(Math.ceil(tempLeft)) })}</p>
            )}
            {campaignOn > 0 && (
              <p className="text-[11px] font-bold text-orange-600">
                {t('ads.campaignActive', { factor: CAMPAIGN_FACTOR, duration: duration(Math.ceil(campaignOn)) })}
              </p>
            )}
          </div>
        )}

        {offers.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="v2-display text-[12px] uppercase tracking-wide text-indigo-900/50 px-1">{t('business.adOffers')}</p>
            <div className="flex flex-wrap gap-2">{offers}</div>
          </div>
        )}
      </div>
    </div>,
    portalRoot(),
  );
}
