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
import { Chip, GameButton, Panel, SectionLabel, TILE_FACE } from '../kit';
import { OpensJobs } from './OpensJobs';
import { CollectionGrid, Showcase, ShowcasePicture, UpcomingStrip } from './Showcase';
import { Cash, CashAmount } from '../CashAmount';
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

  // The next move can be made right now: the card turns gold.
  const nextReady = next !== null && !blocked && (nextOwned || game.cash >= next.moveInCost);

  return (
    <div className="flex flex-col gap-3">
      {/* The home you live in: its picture as a banner, its name on it. */}
      <div className="v2-job v2-shop-dream">
        <div className="relative z-[1] h-[124px] overflow-hidden">
          <img src={home.image} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-[center_40%]" />
          <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-indigo-950/80 to-transparent" />
          <span className="absolute top-2 left-2 rounded-full bg-indigo-950/60 px-2 py-0.5 v2-display text-[11px] uppercase tracking-wide text-white">
            {t('home.current')}
          </span>
          <span className="absolute top-2 right-2">
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
          </span>
          <p className="absolute left-3 right-3 bottom-2 v2-display text-[20px] leading-tight text-white v2-shadow">{name('lifestyle', home)}</p>
        </div>
        {homePrice !== null && (
          <div className="relative z-[1] p-3 flex flex-col gap-1.5">
            <GameButton
              tone="soft"
              onClick={() => actions.buyHome(home.id)}
              disabled={game.cash < homePrice}
              className="min-h-11 py-2 px-4 flex items-center justify-between"
            >
              <span className="v2-display text-[14px]">{t('home.buyThis')}</span>
              <Cash size={18} className="v2-display text-[14px] tabular-nums">{money(homePrice)}</Cash>
            </GameButton>
            <p className="text-[11px] font-bold text-slate-500 text-center">{t('home.depositCounted', { amount: money(home.moveInCost) })}</p>
          </div>
        )}
      </div>

      {next ? (
        <Showcase
          tone={nextReady ? 'ready' : 'dream'}
          band={t('shop.next')}
          chip={next.buyCost === null ? <Chip tone="soft">{t('home.rentOnly')}</Chip> : undefined}
          picture={<ShowcasePicture image={next.image} cover />}
          name={name('lifestyle', next)}
          price={
            nextOwned ? undefined : (
              <span className="v2-display v2-outline-thin text-[26px] leading-none text-amber-300 tabular-nums">
                <CashAmount amount={next.moveInCost} size={30}>{money(next.moveInCost)}</CashAmount>
              </span>
            )
          }
          promise={{ icon: 'home', text: t('shop.promise.house') }}
          opens={<OpensJobs homeIndex={houseIndex(next.id)} />}
        >
          {/* A goal's hand points at what is missing while the move is blocked, not at a dead button. */}
          {neededVehicle ? (
            <Focusable focusKey="shop:house:next">
              <GameButton tone="soft" onClick={onGoVehicles} className="w-full min-h-12 py-2 px-4 flex items-center justify-center gap-1.5">
                <UiIcon name="lock" />
                <span className="v2-display text-[14px]">{t('home.needsVehicle', { vehicle: name('lifestyle', neededVehicle) })}</span>
              </GameButton>
            </Focusable>
          ) : neededCareer.length > 0 ? (
            <Focusable focusKey="shop:house:next" className="flex flex-col">
              <CareerAsk asks={neededCareer} onGo={onGoTo} />
            </Focusable>
          ) : (
            <>
              <Focusable focusKey="shop:house:next">
                {nextOwned ? (
                  <GameButton onClick={() => actions.moveHome(next.id)} className="w-full min-h-12 py-3 px-4">
                    <span className="v2-display text-[18px] v2-shadow">{t('home.moveFree')}</span>
                  </GameButton>
                ) : (
                  <GameButton
                    onClick={() => actions.rentHome(next.id)}
                    disabled={game.cash < next.moveInCost}
                    className="w-full min-h-12 py-3 px-4 flex items-center justify-between"
                  >
                    <span className="v2-display text-[18px] v2-shadow">{t('home.rentMove')}</span>
                    <Cash size={22} className="v2-display text-[17px] v2-shadow tabular-nums">{money(next.moveInCost)}</Cash>
                  </GameButton>
                )}
              </Focusable>
              <p className="text-[12px] font-bold text-indigo-900/60 text-center -mt-1">
                {rentHint ?? (ownsHome ? t('home.willRentOut', { amount: rent(home) }) : t('home.noRent'))}
              </p>
              {!nextOwned && <HelpAd cost={next.moveInCost} />}
              {nextPrice !== null && (
                <GameButton
                  tone="soft"
                  onClick={() => actions.buyHome(next.id)}
                  disabled={game.cash < nextPrice}
                  className="min-h-11 py-2 px-4 flex items-center justify-between"
                >
                  <span className="v2-display text-[14px]">{t('home.buyMove')}</span>
                  <Cash size={18} className="v2-display text-[14px] tabular-nums">{money(nextPrice)}</Cash>
                </GameButton>
              )}
            </>
          )}
        </Showcase>
      ) : (
        <Panel accent className="p-4 text-center">
          <p className="v2-display text-lg text-indigo-950">{t('home.top')}</p>
        </Panel>
      )}

      {upcoming.length > 0 && (
        <>
          <SectionLabel>{t('shop.upcoming')}</SectionLabel>
          <UpcomingStrip
            items={upcoming.map((house) => ({ id: house.id, image: house.image, name: name('lifestyle', house), price: house.moveInCost, cover: true }))}
            more={Math.max(0, HOUSES.length - (nextIndex + 1 + UPCOMING_COUNT))}
          />
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
          <CollectionGrid
            items={[...owned].reverse().map((house) => ({
              id: house.id,
              image: house.image,
              name: name('lifestyle', house),
              cover: true,
              note: house.id === game.home ? undefined : `+${rent(house)}`,
            }))}
            ribbon={(id) => (id === game.home ? t('home.current') : null)}
          />
        </>
      )}

      {forSale.length > 0 && (
        <>
          <SectionLabel>{t('home.forSale')}</SectionLabel>
          <ul className="grid grid-cols-2 gap-2.5">
            {[...forSale].reverse().map((house) => {
              const price = housePrice(game, house) ?? 0;
              return (
                <li key={house.id} className={`${TILE_FACE} overflow-hidden flex flex-col`}>
                  <div className="relative h-[84px]">
                    <img src={house.image} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover object-[center_30%]" />
                  </div>
                  <div className="p-2 flex flex-1 flex-col gap-1.5 text-center">
                    <p className="v2-display text-[13px] leading-tight text-indigo-950 line-clamp-2">{name('lifestyle', house)}</p>
                    <p className="text-[10px] font-black text-emerald-600 leading-tight">{t('home.rentsFor', { amount: rent(house) })}</p>
                    <GameButton
                      onClick={() => actions.buyHome(house.id)}
                      disabled={game.cash < price}
                      className="mt-auto py-1.5 px-2 flex items-center justify-center gap-1"
                    >
                      <span className="v2-display text-[13px] v2-shadow">{t('home.buy')}</span>
                      <Cash size={15} className="v2-display text-[13px] v2-shadow tabular-nums">{money(price)}</Cash>
                    </GameButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
