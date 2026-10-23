import type { FocusTarget } from '../home/focus';
import { CareerAsk } from './CareerAsk';
import { HOUSES } from '../../core/config/housing';
import { autoIncomePerSecond, globalMultiplier, rentPerSecond } from '../../core/formulas';
import {
  currentHome,
  houseIndex,
  housePrice,
  isRenting,
  moveUpNeedsVehicle,
  homeNeedsCareer,
  nextHome,
  ownsHouse,
} from '../../core/state';
import type { HouseDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { HelpAd } from '../ads/AdButton';
import { Focusable } from '../home/Focusable';
import { Chip, GameButton, Panel, SectionLabel } from '../kit';
import { OpensJobs } from './OpensJobs';
import { Thumb } from './Thumb';
import { Cash } from '../CashAmount';
import { UiIcon } from '../UiIcon';

// Homes tab: rent → buy → rent out (docs/game-design-v2.md §4.6). You live in one house; the next
// one up is the dream; houses you own and left pay rent, and there is no moving back into them.
// Moving up needs the last vehicle of the home you live in (core/state.ts moveUpNeedsVehicle).

const UPCOMING_COUNT = 3;


export function HousingPanel({ onGoVehicles, onGoTo }: { onGoVehicles: () => void; onGoTo: (target: FocusTarget) => void }) {
  const { game, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();

  const home = currentHome(game);
  const next = nextHome(game);
  const renting = isRenting(game);
  const homePrice = renting ? housePrice(game, home) : null;
  const multiplier = globalMultiplier(game);
  const income = autoIncomePerSecond(game);

  const rent = (house: HouseDef) => perMonth(house.rentPerSecond * multiplier);
  const ownsHome = ownsHouse(game, home.id);
  const totalRent = rentPerSecond(game) * multiplier;
  const affordIn = (cost: number) =>
    game.cash < cost && income > 0
      ? t('common.affordIn', { duration: duration(Math.ceil((cost - game.cash) / income)) })
      : null;

  const nextIndex = next ? houseIndex(next.id) : HOUSES.length;
  const upcoming = HOUSES.slice(nextIndex + 1, nextIndex + 1 + UPCOMING_COUNT);
  const owned = HOUSES.filter((house) => ownsHouse(game, house.id));
  const forSale = HOUSES.filter(
    (house) => houseIndex(house.id) < houseIndex(game.home) && housePrice(game, house) !== null,
  );

  const nextOwned = next !== null && ownsHouse(game, next.id);
  const nextPrice = next ? housePrice(game, next) : null;
  const neededVehicle = next && !nextOwned ? moveUpNeedsVehicle(game) : null;
  // The career the next home asks for (config/housing.ts careerAsk), once its vehicle is there.
  const neededCareer = next && !nextOwned && !neededVehicle ? homeNeedsCareer(game, next) : [];
  const blocked = neededVehicle !== null || neededCareer.length > 0;
  const rentHint = next && !nextOwned && !neededVehicle && neededCareer.length === 0 ? affordIn(next.moveInCost) : null;

  return (
    <div className="flex flex-col gap-3">
      <Panel className="p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Thumb image={home.image} cover />
          <div className="flex-1 min-w-0">
            <SectionLabel>{t('home.current')}</SectionLabel>
            <p className="v2-display text-[17px] leading-tight text-indigo-950 px-1">{name('lifestyle', home)}</p>
          </div>
          {renting && (
            <Chip tone="gold">
              <UiIcon name="key" />
              {t('home.renting')}
            </Chip>
          )}
          {ownsHome && (
            <Chip tone="buy">
              <UiIcon name="home" />
              {t('home.owned')}
            </Chip>
          )}
        </div>
        {homePrice !== null && (
          <>
            <GameButton
              tone="soft"
              onClick={() => actions.buyHome(home.id)}
              disabled={game.cash < homePrice}
              className="min-h-11 py-2 px-4 flex items-center justify-between"
            >
              <span className="v2-display text-[14px]">{t('home.buyThis')}</span>
              <Cash size={18} className="v2-display text-[14px] tabular-nums">{money(homePrice)}</Cash>
            </GameButton>
            <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">
              {t('home.depositCounted', { amount: money(home.moveInCost) })}
            </p>
          </>
        )}
      </Panel>

      {next ? (
        <Panel accent className="overflow-hidden">
          <div className="px-4 py-1.5 bg-gradient-to-r from-amber-300 to-orange-500 flex items-center justify-between">
            <p className="v2-display text-[13px] uppercase tracking-wide text-white v2-shadow">{t('home.next')}</p>
            {next.buyCost === null && <Chip tone="soft">{t('home.rentOnly')}</Chip>}
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Thumb image={next.image} cover large />
              <div className="flex-1 min-w-0">
                <p className="v2-display text-xl leading-tight text-indigo-950">{name('lifestyle', next)}</p>
                <OpensJobs homeIndex={houseIndex(next.id)} />
              </div>
            </div>
            {/* A goal's hand points at what is missing while the move is blocked, not at a dead button. */}
            <Focusable focusKey={blocked ? '' : 'shop:house:next'}>
              {nextOwned ? (
                <GameButton onClick={() => actions.moveHome(next.id)} className="w-full min-h-11 py-3 px-4">
                  <span className="v2-display text-[16px] v2-shadow">{t('home.moveFree')}</span>
                </GameButton>
              ) : (
                <GameButton
                  onClick={() => actions.rentHome(next.id)}
                  disabled={game.cash < next.moveInCost || blocked}
                  className="w-full min-h-11 py-3 px-4 flex items-center justify-between"
                >
                  <span className="v2-display text-[16px] v2-shadow">{t('home.rentMove')}</span>
                  <Cash size={20} className="v2-display text-[16px] v2-shadow tabular-nums">{money(next.moveInCost)}</Cash>
                </GameButton>
              )}
            </Focusable>
            {!nextOwned && !blocked && <HelpAd cost={next.moveInCost} className="-mt-1" />}
            {nextPrice !== null && (
              <GameButton
                tone="soft"
                onClick={() => actions.buyHome(next.id)}
                disabled={game.cash < nextPrice}
                className="min-h-11 -mt-1 py-2 px-4 flex items-center justify-between"
              >
                <span className="v2-display text-[14px]">
                  {t('home.buyMove')}
                </span>
                <Cash size={18} className="v2-display text-[14px] tabular-nums">{money(nextPrice)}</Cash>
              </GameButton>
            )}
            {neededVehicle ? (
              <Focusable focusKey="shop:house:next" className="-mt-1">
                <GameButton
                  tone="soft"
                  onClick={onGoVehicles}
                  className="w-full min-h-11 py-2 px-4 flex items-center justify-center gap-1.5"
                >
                  <UiIcon name="lock" />
                  <span className="v2-display text-[13px]">
                    {t('home.needsVehicle', { vehicle: name('lifestyle', neededVehicle) })}
                  </span>
                </GameButton>
              </Focusable>
            ) : neededCareer.length > 0 ? (
              <Focusable focusKey="shop:house:next">
                <CareerAsk asks={neededCareer} onGo={onGoTo} />
              </Focusable>
            ) : (
              <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">
                {rentHint ?? (ownsHome ? t('home.willRentOut', { amount: rent(home) }) : t('home.noRent'))}
              </p>
            )}
          </div>
        </Panel>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('home.top')}</p>
        </Panel>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>{t('shop.upcoming')}</SectionLabel>
          <ul className="flex flex-col gap-2">
            {upcoming.map((house) => (
              <li
                key={house.id}
                className="rounded-[22px] border-2 border-dashed border-indigo-200 bg-white/50 p-2.5 flex items-center gap-3"
              >
                <Thumb image={house.image} cover dim />
                <div className="flex-1 min-w-0">
                  <p className="v2-display text-[15px] leading-tight text-indigo-900/50">{name('lifestyle', house)}</p>
                  <p className="text-[11px] font-bold text-indigo-900/40 flex items-center gap-1">
                    <UiIcon name="lock" />
                    <Cash size={14}>{money(house.moveInCost)}</Cash>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {owned.length > 0 && (
        <>
          <div className="flex items-end justify-between">
            <SectionLabel>{t('home.properties')}</SectionLabel>
            {totalRent > 0 && (
              <p className="text-[11px] font-black text-emerald-600 px-1">
                <Cash size={15}>{t('home.totalRent', { amount: perMonth(totalRent) })}</Cash>
              </p>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {[...owned].reverse().map((house) => {
              const livingHere = house.id === game.home;
              return (
                <li key={house.id}>
                  <Panel className="p-2.5 flex items-center gap-3">
                    <Thumb image={house.image} cover />
                    <div className="flex-1 min-w-0">
                      <p className="v2-display text-[15px] leading-tight text-indigo-950">{name('lifestyle', house)}</p>
                      <p className={`text-[11px] font-bold ${livingHere ? 'text-violet-600' : 'text-emerald-600'}`}>
                        {livingHere ? t('home.livingHere') : t('home.rentedOut', { amount: rent(house) })}
                      </p>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {forSale.length > 0 && (
        <>
          <SectionLabel>{t('home.forSale')}</SectionLabel>
          <ul className="flex flex-col gap-2">
            {[...forSale].reverse().map((house) => {
              const price = housePrice(game, house) ?? 0;
              return (
                <li key={house.id}>
                  <Panel className="p-2.5 flex items-center gap-3">
                    <Thumb image={house.image} cover />
                    <div className="flex-1 min-w-0">
                      <p className="v2-display text-[15px] leading-tight text-indigo-950">{name('lifestyle', house)}</p>
                      <p className="text-[11px] font-bold text-emerald-600">
                        {t('home.rentsFor', { amount: rent(house) })}
                      </p>
                    </div>
                    <GameButton
                      onClick={() => actions.buyHome(house.id)}
                      disabled={game.cash < price}
                      className="shrink-0 min-h-11 px-3 flex flex-col items-center justify-center"
                    >
                      <span className="v2-display text-[11px] leading-tight v2-shadow">{t('home.buy')}</span>
                      <Cash size={15} className="v2-display text-[12px] leading-tight v2-shadow tabular-nums">
                        {money(price)}
                      </Cash>
                    </GameButton>
                  </Panel>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
