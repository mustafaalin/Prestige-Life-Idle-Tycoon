import { useEffect, useState } from 'react';
import { GADGETS, LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { autoIncomePerSecond } from '../../core/formulas';
import { haptic, playSfx } from '../../runtime/feedback';
import {
  bestOwnedLifestyle,
  canBuyNextLifestyle,
  canMoveUp,
  lifestyleNeedsCareer,
  lifestyleNeedsClass,
  lifestyleNeedsHome,
  nextLifestyle,
  parkedVehicle,
} from '../../core/state';
import type { FocusTarget } from '../home/focus';
import { CareerAsk } from './CareerAsk';
import type { GameStateV2, LifestyleKind } from '../../core/types';
import type { MessageKey } from '../../i18n/translate';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { Focusable } from '../home/Focusable';
import { ICONS } from '../icons';
import { useFocus, type ShopTabId } from '../home/focus';
import { GameButton, Panel, Segmented, SectionLabel } from '../kit';
import { Cash, CashAmount } from '../CashAmount';
import { HousingPanel } from './HousingPanel';
import { StoreStrip } from './StoreSheet';
import { OpensJobs } from './OpensJobs';
import { CollectionGrid, MissingRow, Ribbon, Showcase, ShowcasePicture, UpcomingStrip } from './Showcase';
import { UiIcon, type UiIconName } from '../UiIcon';

type ShopTab = ShopTabId;

const TABS: { kind: ShopTab; label: MessageKey; icon: string }[] = [
  { kind: 'house', label: 'shop.house', icon: ICONS.home },
  { kind: 'vehicle', label: 'shop.vehicle', icon: ICONS.vehicle },
  { kind: 'outfit', label: 'shop.outfit', icon: ICONS.outfit },
  { kind: 'toy', label: 'shop.toy', icon: ICONS.luxury },
  { kind: 'gadget', label: 'shop.gadget', icon: ICONS.career },
];

/** How many not-yet-affordable dreams are previewed after the next one. */
const UPCOMING_COUNT = 3;


/** Whether a tab has something the player can do right now (red dot). */
function tabReady(game: GameStateV2, tab: ShopTab) {
  if (tab === 'house') return canMoveUp(game);
  // Gear is bought for a job, not as the next dream: no dot.
  if (tab === 'gadget') return false;
  return canBuyNextLifestyle(game, tab);
}

/** Homes, vehicles, outfits and luxury toys. Status items are bought in order: one clear next dream per category. */
export function ShopScreen({ onOpenStore, onGoTo }: { onOpenStore: () => void; onGoTo: (target: FocusTarget) => void }) {
  const { game } = useGameV2();
  const { t } = useT();
  const focus = useFocus();
  const [tab, setTab] = useState<ShopTab>(focus?.target.shopTab ?? 'house');

  // "Go" from a goal switches to the category it needs.
  const focusTab = focus?.target.shopTab;
  useEffect(() => {
    if (focusTab) setTab(focusTab);
  }, [focusTab, focus?.id]);

  return (
    <section className="flex flex-col gap-3">
      <Segmented
        options={TABS.map((entry) => ({
          value: entry.kind,
          label: (
            <span className="flex flex-col items-center gap-0.5">
              <img src={entry.icon} alt="" draggable={false} className="w-7 h-7 object-contain drop-shadow" />
              <span className="text-[12px] leading-none">{t(entry.label)}</span>
            </span>
          ),
        }))}
        value={tab}
        onChange={setTab}
        dot={(kind) => tabReady(game, kind)}
        // On the icon, so it never reads as the next tab's.
        dotClassName="top-0 left-[calc(50%+6px)]"
      />

      {tab === 'house' ? (
        <HousingPanel onGoVehicles={() => setTab('vehicle')} onGoTo={onGoTo} />
      ) : tab === 'gadget' ? (
        <GadgetPanel />
      ) : (
        <LifestylePanel kind={tab} onGoHomes={() => setTab('house')} onGoTo={onGoTo} />
      )}

      <StoreStrip onOpen={onOpenStore} />
    </section>
  );
}

/** What buying the next dream does, one line on its card. */
const PROMISE: Partial<Record<LifestyleKind, { icon: UiIconName; text: MessageKey }>> = {
  vehicle: { icon: 'car', text: 'shop.promise.vehicle' },
  outfit: { icon: 'outfit', text: 'shop.promise.outfit' },
  toy: { icon: 'gift', text: 'shop.promise.toy' },
};

function LifestylePanel({
  kind,
  onGoHomes,
  onGoTo,
}: {
  kind: LifestyleKind;
  onGoHomes: () => void;
  onGoTo: (target: FocusTarget) => void;
}) {
  const { game, actions } = useGameV2();
  const { t, name, money, duration } = useT();

  const items = LIFESTYLE_ITEMS.filter((item) => item.kind === kind);
  const owned = items.filter((item) => game.lifestyleOwned.includes(item.id));
  const next = nextLifestyle(game, kind);
  const nextIndex = next ? items.indexOf(next) : items.length;
  const upcoming = items.slice(nextIndex + 1, nextIndex + 1 + UPCOMING_COUNT);
  const hiddenCount = Math.max(0, items.length - (nextIndex + 1 + UPCOMING_COUNT));

  const income = autoIncomePerSecond(game);
  // A vehicle opens in its home, an outfit in its wealth class (core/state.ts).
  const neededHome = next ? lifestyleNeedsHome(game, next) : null;
  const neededClass = next ? lifestyleNeedsClass(game, next) : null;
  const neededCareer = next ? lifestyleNeedsCareer(game, next) : [];
  const locked = neededHome !== null || neededClass !== null || neededCareer.length > 0;
  const canBuy = next !== null && !locked && game.cash >= next.cost;
  const secondsToAfford = next && !locked && !canBuy && income > 0 ? (next.cost - game.cash) / income : null;
  const luxury = kind === 'toy';
  const promise = PROMISE[kind];
  // The one in use: the vehicle out front, the outfit worn (the best owned, as the scene shows it).
  const inUse = kind === 'vehicle' ? parkedVehicle(game)?.id : kind === 'outfit' ? bestOwnedLifestyle(game, 'outfit')?.id : undefined;
  const ribbonText = kind === 'vehicle' ? t('shop.parked') : t('shop.wearing');
  // The item just bought pops into the collection with a shine (the scene plays the purchase sound).
  const [justBought, setJustBought] = useState<string | null>(null);
  const buy = (itemId: string) => {
    if (!actions.buyLifestyle(itemId)) return;
    haptic('medium');
    setJustBought(itemId);
  };

  return (
    <div className="flex flex-col gap-3">
      {next ? (
        <Showcase
          tone={luxury ? (canBuy ? 'lux-ready' : 'lux') : canBuy ? 'ready' : 'dream'}
          band={t('shop.next')}
          picture={<ShowcasePicture image={next.image} tall={kind === 'outfit'} rays={canBuy} />}
          name={name('lifestyle', next)}
          price={
            <span className="v2-display v2-outline-thin text-[26px] leading-none text-amber-300 tabular-nums">
              <CashAmount amount={next.cost} size={30}>{money(next.cost)}</CashAmount>
            </span>
          }
          promise={promise && { icon: promise.icon, text: t(promise.text) }}
          opens={<OpensJobs itemId={next.id} />}
        >
          {/* A goal's hand points at what is missing while the item is locked, not at a dead button. */}
          {locked ? (
            <Focusable focusKey={`shop:${kind}:next`} className="flex flex-col gap-2">
              {neededClass !== null && (
                <MissingRow>{t('shop.needsClass', { class: name('wealthClass', WEALTH_CLASSES[neededClass]) })}</MissingRow>
              )}
              {neededHome === null && <CareerAsk asks={neededCareer} onGo={onGoTo} />}
              {neededHome && (
                <GameButton tone="soft" onClick={onGoHomes} className="min-h-12 py-2 px-4 flex items-center justify-center gap-1.5">
                  <UiIcon name="lock" />
                  <span className="v2-display text-[14px]">{t('shop.needsHome', { home: name('lifestyle', neededHome) })}</span>
                </GameButton>
              )}
            </Focusable>
          ) : (
            <>
              <Focusable focusKey={`shop:${kind}:next`}>
                <GameButton
                  onClick={() => buy(next.id)}
                  disabled={!canBuy}
                  className="w-full py-3 px-4 v2-display text-[20px] v2-shadow"
                >
                  {t('shop.buy')}
                </GameButton>
              </Focusable>
              {secondsToAfford !== null && (
                <p className="text-[12px] font-bold text-indigo-900/60 text-center -mt-1">
                  {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
                </p>
              )}
              <HelpAd cost={next.cost} />
            </>
          )}
        </Showcase>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('shop.allOwned')}</p>
        </Panel>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>{t('shop.upcoming')}</SectionLabel>
          <UpcomingStrip
            items={upcoming.map((item) => ({ id: item.id, image: item.image, name: name('lifestyle', item), price: item.cost }))}
            more={hiddenCount}
          />
        </>
      )}

      {owned.length > 0 && (
        <>
          <SectionLabel>{t('shop.collection')}</SectionLabel>
          <CollectionGrid
            items={[...owned].reverse().map((item) => ({ id: item.id, image: item.image, name: name('lifestyle', item) }))}
            ribbon={(id) => (id === inUse ? ribbonText : null)}
            justBought={justBought}
          />
        </>
      )}
    </div>
  );
}

/** Gear: tiles two to a row, each with the jobs it opens; bought once, in any order. */
function GadgetPanel() {
  const { game, actions } = useGameV2();
  const { t, name, money } = useT();
  const cheapest = GADGETS.filter((gadget) => !game.lifestyleOwned.includes(gadget.id)).sort((a, b) => a.cost - b.cost)[0];
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-2.5">
        {GADGETS.map((gadget) => {
          const owned = game.lifestyleOwned.includes(gadget.id);
          const affordable = game.cash >= gadget.cost;
          return (
            <li
              key={gadget.id}
              className={`v2-job ${owned ? 'v2-job-done' : affordable ? 'v2-shop-ready' : 'v2-shop-dream'} p-2 flex flex-col items-center text-center gap-1.5`}
            >
              {owned && <Ribbon>{t('shop.have')}</Ribbon>}
              <div className="v2-job-medal">
                <img src={gadget.image} alt="" draggable={false} className="relative w-[60px] h-[60px] object-contain drop-shadow-md" />
              </div>
              <p className="relative v2-display text-[15px] leading-tight text-indigo-950">{name('lifestyle', gadget)}</p>
              <div className="relative flex-1">
                <OpensJobs itemId={gadget.id} compact />
              </div>
              {!owned && (
                <Focusable focusKey={`shop:gadget:${gadget.id}`} className="relative w-full">
                  <GameButton
                    onClick={() => {
                      if (!actions.buyLifestyle(gadget.id)) return;
                      playSfx('purchase');
                      haptic('medium');
                    }}
                    disabled={!affordable}
                    className="w-full py-2 px-2 flex items-center justify-center gap-1.5"
                  >
                    <span className="v2-display text-[14px] v2-shadow">{t('shop.buy')}</span>
                    <Cash size={17} className="v2-display text-[14px] v2-shadow tabular-nums">{money(gadget.cost)}</Cash>
                  </GameButton>
                </Focusable>
              )}
            </li>
          );
        })}
      </ul>
      {/* A little help toward the cheapest gear not owned yet. */}
      {cheapest && <HelpAd cost={cheapest.cost} />}
    </div>
  );
}
