import { Check, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GADGETS, LIFESTYLE_ITEMS } from '../../core/config/lifestyle';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { autoIncomePerSecond } from '../../core/formulas';
import { haptic, playSfx } from '../../runtime/feedback';
import { canBuyNextLifestyle, canMoveUp, lifestyleNeedsCareer, lifestyleNeedsClass, lifestyleNeedsHome, nextLifestyle } from '../../core/state';
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
import { Chip, GameButton, Panel, Segmented, SectionLabel, TILE_FACE } from '../kit';
import { CashAmount } from '../CashAmount';
import { HousingPanel } from './HousingPanel';
import { StoreStrip } from './StoreSheet';
import { OpensJobs } from './OpensJobs';
import { Thumb } from './Thumb';

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
        <Panel accent className="overflow-hidden">
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-300 to-orange-500">
            <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">{t('shop.next')}</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Thumb image={next.image} large />
              <div className="flex-1 min-w-0">
                <p className="v2-display text-xl leading-tight text-indigo-950">{name('lifestyle', next)}</p>
                <p className="mt-0.5 v2-display v2-outline-thin text-[24px] leading-none text-amber-300 tabular-nums">
                  <CashAmount amount={next.cost} size={30}>{money(next.cost)}</CashAmount>
                </p>
                <OpensJobs itemId={next.id} />
              </div>
            </div>
            {/* A goal's hand points at what is missing while the item is locked, not at a dead button. */}
            <Focusable focusKey={locked ? '' : `shop:${kind}:next`}>
              <GameButton
                onClick={() => buy(next.id)}
                disabled={!canBuy}
                className="w-full py-3 px-4 v2-display text-[18px] v2-shadow"
              >
                {t('shop.buy')}
              </GameButton>
            </Focusable>
            {secondsToAfford !== null && (
              <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">
                {t('common.affordIn', { duration: duration(Math.ceil(secondsToAfford)) })}
              </p>
            )}
            {!locked && <HelpAd cost={next.cost} />}
            <Focusable focusKey={locked ? `shop:${kind}:next` : ''} className="flex flex-col gap-3 empty:hidden">
              {neededClass !== null && (
                <p className="-mt-1 min-h-11 py-2 px-4 rounded-2xl bg-slate-100 flex items-center justify-center gap-1.5 text-slate-600">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span className="v2-display text-[13px]">
                    {t('shop.needsClass', { class: name('wealthClass', WEALTH_CLASSES[neededClass]) })}
                  </span>
                </p>
              )}
              {neededHome === null && <CareerAsk asks={neededCareer} onGo={onGoTo} />}
              {neededHome && (
                <GameButton
                  tone="soft"
                  onClick={onGoHomes}
                  className="min-h-11 -mt-1 py-2 px-4 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  <span className="v2-display text-[13px]">
                    {t('shop.needsHome', { home: name('lifestyle', neededHome) })}
                  </span>
                </GameButton>
              )}
            </Focusable>
          </div>
        </Panel>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('shop.allOwned')}</p>
        </Panel>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>{t('shop.upcoming')}</SectionLabel>
          <ul className="flex flex-col gap-2">
            {upcoming.map((item) => (
              <li
                key={item.id}
                className="rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-2.5 flex items-center gap-3"
              >
                <Thumb image={item.image} dim />
                <div className="flex-1 min-w-0">
                  <p className="v2-display text-[15px] leading-tight text-indigo-900/50">{name('lifestyle', item)}</p>
                  <p className="text-[11px] font-bold text-indigo-900/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {money(item.cost)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <p className="text-[11px] font-bold text-indigo-900/40 text-center">
              {t('shop.more', { count: hiddenCount })}
            </p>
          )}
        </>
      )}

      {owned.length > 0 && (
        <>
          <SectionLabel>{t('shop.collection')}</SectionLabel>
          <ul className="grid grid-cols-3 gap-2">
            {[...owned].reverse().map((item) => (
              <li
                key={item.id}
                className={`relative overflow-hidden ${TILE_FACE} p-1.5 flex flex-col items-center gap-1 ${item.id === justBought ? 'v2-pop-in' : ''}`}
              >
                <Thumb image={item.image} />
                {item.id === justBought && (
                  <span
                    className="v2-tile-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    aria-hidden
                  />
                )}
                <span className="w-full text-center text-[11px] font-bold text-slate-500 leading-tight line-clamp-2">
                  {name('lifestyle', item)}
                </span>
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full border-2 border-white bg-gradient-to-b from-emerald-400 to-green-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Gear: all of it on one list, each with the jobs it opens; bought once, in any order. */
function GadgetPanel() {
  const { game, actions } = useGameV2();
  const { t, name, money } = useT();
  const cheapest = GADGETS.filter((gadget) => !game.lifestyleOwned.includes(gadget.id)).sort((a, b) => a.cost - b.cost)[0];
  return (
    <Panel className="overflow-hidden">
      <ul className="divide-y divide-indigo-50">
        {GADGETS.map((gadget) => {
          const owned = game.lifestyleOwned.includes(gadget.id);
          return (
            <li key={gadget.id} className="p-3 flex items-center gap-3">
              <Thumb image={gadget.image} />
              <div className="flex-1 min-w-0">
                <p className="v2-display text-[15px] leading-tight text-indigo-950">{name('lifestyle', gadget)}</p>
                <OpensJobs itemId={gadget.id} />
              </div>
              {owned ? (
                <Chip tone="gold">{t('shop.have')}</Chip>
              ) : (
                <Focusable focusKey={`shop:gadget:${gadget.id}`} className="shrink-0">
                  <GameButton
                    onClick={() => {
                      if (!actions.buyLifestyle(gadget.id)) return;
                      playSfx('purchase');
                      haptic('medium');
                    }}
                    disabled={game.cash < gadget.cost}
                    className="py-2 px-3 flex flex-col items-center leading-tight"
                  >
                    <span className="v2-display text-[13px] v2-shadow">{t('shop.buy')}</span>
                    <span className="v2-display text-[13px] v2-shadow tabular-nums">{money(gadget.cost)}</span>
                  </GameButton>
                </Focusable>
              )}
            </li>
          );
        })}
      </ul>
      {/* A little help toward the cheapest gear not owned yet. */}
      {cheapest && <HelpAd cost={cheapest.cost} className="p-3 pt-0" />}
    </Panel>
  );
}
