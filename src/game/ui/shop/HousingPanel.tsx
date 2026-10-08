import { Home, KeyRound, Lock } from 'lucide-react';
import { HOUSES } from '../../core/config/housing';
import { autoIncomePerSecond, globalMultiplier } from '../../core/formulas';
import { currentHome, houseIndex, housePrice, isRenting, nextHome, ownsHouse } from '../../core/state';
import type { HouseDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { Focusable } from '../home/Focusable';
import { Chip, GameButton, Panel, SectionLabel } from '../kit';
import { Thumb } from './Thumb';

// Homes tab: rent → buy → rent out (docs/game-design-v2.md §4.8). You live in one house; the next
// one up is the dream; houses you own and left pay rent.

const UPCOMING_COUNT = 3;

const percent = (fraction: number) => Math.round(fraction * 100);

export function HousingPanel() {
  const { game, actions } = useGameV2();
  const { t, name, money, duration, perMonth } = useT();

  const home = currentHome(game);
  const next = nextHome(game);
  const renting = isRenting(game);
  const homePrice = renting ? housePrice(game, home) : null;
  const multiplier = globalMultiplier(game);
  const income = autoIncomePerSecond(game);

  const rent = (house: HouseDef) => perMonth(house.rentPerSecond * multiplier);
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
  const rentHint = next && !nextOwned ? affordIn(next.moveInCost) : null;

  return (
    <div className="flex flex-col gap-3">
      <Panel className="p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Thumb image={home.image} cover />
          <div className="flex-1 min-w-0">
            <SectionLabel>{t('home.current')}</SectionLabel>
            <p className="v2-display text-[17px] leading-tight text-indigo-950 px-1">{name('lifestyle', home)}</p>
            <p className="text-[11px] font-bold text-violet-600 px-1">
              {t('home.livingBonus', { percent: percent(home.homeBonus) })}
            </p>
          </div>
          {renting && (
            <Chip tone="gold">
              <KeyRound className="w-3 h-3" />
              {t('home.renting')}
            </Chip>
          )}
          {ownsHouse(game, home.id) && (
            <Chip tone="buy">
              <Home className="w-3 h-3" />
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
              <span className="v2-display text-[14px] tabular-nums">{money(homePrice)}</span>
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
                <p className="text-[12px] font-bold text-violet-600">
                  {t('home.bonusChange', { percent: percent(home.homeBonus), next: percent(next.homeBonus) })}
                </p>
              </div>
            </div>
            <Focusable focusKey="shop:house:next">
              {nextOwned ? (
                <GameButton onClick={() => actions.moveHome(next.id)} className="w-full min-h-11 py-3 px-4">
                  <span className="v2-display text-[16px] v2-shadow">{t('home.moveFree')}</span>
                </GameButton>
              ) : (
                <GameButton
                  onClick={() => actions.rentHome(next.id)}
                  disabled={game.cash < next.moveInCost}
                  className="w-full min-h-11 py-3 px-4 flex items-center justify-between"
                >
                  <span className="v2-display text-[16px] v2-shadow">{t('home.rentMove')}</span>
                  <span className="v2-display text-[16px] v2-shadow tabular-nums">{money(next.moveInCost)}</span>
                </GameButton>
              )}
            </Focusable>
            {nextPrice !== null && (
              <GameButton
                tone="soft"
                onClick={() => actions.buyHome(next.id)}
                disabled={game.cash < nextPrice}
                className="min-h-11 -mt-1 py-2 px-4 flex items-center justify-between"
              >
                <span className="v2-display text-[14px]">{t('home.buyMove')}</span>
                <span className="v2-display text-[14px] tabular-nums">{money(nextPrice)}</span>
              </GameButton>
            )}
            <p className="text-[11px] font-bold text-slate-500 text-center -mt-1">{rentHint ?? t('home.noRent')}</p>
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
                  <p className="v2-display text-[15px] text-indigo-900/50 truncate">{name('lifestyle', house)}</p>
                  <p className="text-[11px] font-bold text-indigo-900/40 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {money(house.moveInCost)} · {t('career.bonusShort', { percent: percent(house.homeBonus) })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {owned.length > 0 && (
        <>
          <SectionLabel>{t('home.properties')}</SectionLabel>
          <ul className="flex flex-col gap-2">
            {[...owned].reverse().map((house) => {
              const livingHere = house.id === game.home;
              return (
                <li key={house.id}>
                  <Panel className="p-2.5 flex items-center gap-3">
                    <Thumb image={house.image} cover />
                    <div className="flex-1 min-w-0">
                      <p className="v2-display text-[15px] text-indigo-950 truncate">{name('lifestyle', house)}</p>
                      <p className={`text-[11px] font-bold ${livingHere ? 'text-violet-600' : 'text-emerald-600'}`}>
                        {livingHere ? t('home.livingHere') : t('home.rentedOut', { amount: rent(house) })}
                      </p>
                    </div>
                    {!livingHere && (
                      <GameButton
                        tone="soft"
                        onClick={() => actions.moveHome(house.id)}
                        className="shrink-0 min-h-11 px-3 v2-display text-[12px]"
                      >
                        {renting ? t('home.moveEndsLease') : t('home.moveHere')}
                      </GameButton>
                    )}
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
                      <p className="v2-display text-[15px] text-indigo-950 truncate">{name('lifestyle', house)}</p>
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
                      <span className="v2-display text-[12px] leading-tight v2-shadow tabular-nums">
                        {money(price)}
                      </span>
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
