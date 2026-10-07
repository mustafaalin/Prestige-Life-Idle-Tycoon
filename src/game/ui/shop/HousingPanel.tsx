import { Home, KeyRound, Lock } from 'lucide-react';
import { HOUSES } from '../../core/config/housing';
import { autoIncomePerSecond, globalMultiplier } from '../../core/formulas';
import { currentHome, houseIndex, housePrice, isRenting, nextHome, ownsHouse } from '../../core/state';
import type { HouseDef } from '../../core/types';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { Thumb } from './Thumb';

// Homes tab: rent → buy → rent out (docs/game-design-v2.md §4.8). You live in one house; the next
// one up is the dream; houses you own and left pay rent.

const UPCOMING_COUNT = 3;

const percent = (fraction: number) => Math.round(fraction * 100);

export function HousingPanel() {
  const { game, actions } = useGameV2();
  const { t, name, money, duration } = useT();

  const home = currentHome(game);
  const next = nextHome(game);
  const renting = isRenting(game);
  const homePrice = renting ? housePrice(game, home) : null;
  const multiplier = globalMultiplier(game);
  const income = autoIncomePerSecond(game);

  const perSecond = (house: HouseDef) => t('hud.perSecond', { amount: money(house.rentPerSecond * multiplier) });
  const affordIn = (cost: number) =>
    game.cash < cost && income > 0 ? t('common.affordIn', { duration: duration(Math.ceil((cost - game.cash) / income)) }) : null;

  const nextIndex = next ? houseIndex(next.id) : HOUSES.length;
  const upcoming = HOUSES.slice(nextIndex + 1, nextIndex + 1 + UPCOMING_COUNT);
  const owned = HOUSES.filter((house) => ownsHouse(game, house.id));
  const forSale = HOUSES.filter((house) => houseIndex(house.id) < houseIndex(game.home) && housePrice(game, house) !== null);

  const nextOwned = next !== null && ownsHouse(game, next.id);
  const nextPrice = next ? housePrice(game, next) : null;
  const rentHint = next && !nextOwned ? affordIn(next.moveInCost) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white rounded-[22px] shadow-sm p-3 flex flex-col gap-2.5">
        <div className="flex items-center gap-3">
          <Thumb image={home.image} cover />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('home.current')}</p>
            <p className="text-base font-black text-slate-900 leading-tight">{name('lifestyle', home)}</p>
            <p className="text-[11px] font-black text-violet-600">{t('home.livingBonus', { percent: percent(home.homeBonus) })}</p>
          </div>
          {renting && (
            <span className="shrink-0 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-black flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              {t('home.renting')}
            </span>
          )}
          {ownsHouse(game, home.id) && (
            <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-black flex items-center gap-1">
              <Home className="w-3 h-3" />
              {t('home.owned')}
            </span>
          )}
        </div>
        {homePrice !== null && (
          <>
            <button
              type="button"
              onClick={() => actions.buyHome(home.id)}
              disabled={game.cash < homePrice}
              className="min-h-11 rounded-xl py-2.5 px-4 flex items-center justify-between font-black text-sm text-violet-700 bg-violet-50 border-2 border-violet-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{t('home.buyThis')}</span>
              <span className="tabular-nums">{money(homePrice)}</span>
            </button>
            <p className="text-[11px] font-semibold text-slate-500 text-center -mt-1">
              {t('home.depositCounted', { amount: money(home.moveInCost) })}
            </p>
          </>
        )}
      </div>

      {next ? (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-violet-100 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Thumb image={next.image} cover />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">{t('home.next')}</p>
              <p className="text-lg font-black text-slate-900 leading-tight">{name('lifestyle', next)}</p>
              <p className="text-[11px] font-black text-violet-600">
                {t('home.bonusChange', { percent: percent(home.homeBonus), next: percent(next.homeBonus) })}
              </p>
            </div>
            {next.buyCost === null && (
              <span className="shrink-0 rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-black">
                {t('home.rentOnly')}
              </span>
            )}
          </div>
          {nextOwned ? (
            <button
              type="button"
              onClick={() => actions.moveHome(next.id)}
              className="min-h-11 rounded-2xl py-3.5 px-4 font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98]"
            >
              {t('home.moveFree')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => actions.rentHome(next.id)}
              disabled={game.cash < next.moveInCost}
              className="min-h-11 rounded-2xl py-3.5 px-4 flex items-center justify-between font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{t('home.rentMove')}</span>
              <span className="tabular-nums">{money(next.moveInCost)}</span>
            </button>
          )}
          {nextPrice !== null && (
            <button
              type="button"
              onClick={() => actions.buyHome(next.id)}
              disabled={game.cash < nextPrice}
              className="min-h-11 -mt-1 rounded-xl py-2.5 px-4 flex items-center justify-between font-black text-sm text-violet-700 bg-violet-50 border-2 border-violet-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{t('home.buyMove')}</span>
              <span className="tabular-nums">{money(nextPrice)}</span>
            </button>
          )}
          <p className="text-[11px] font-semibold text-slate-500 text-center -mt-1">{rentHint ?? t('home.noRent')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-[22px] shadow-lg p-4 border-2 border-amber-200 text-center">
          <p className="text-lg font-black text-slate-900">{t('home.top')}</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('shop.upcoming')}</h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((house) => (
              <li key={house.id} className="rounded-2xl border-2 border-dashed border-slate-200 p-2.5 flex items-center gap-3">
                <Thumb image={house.image} cover dim />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-500 truncate">{name('lifestyle', house)}</p>
                  <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
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
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('home.properties')}</h2>
          <ul className="flex flex-col gap-2">
            {[...owned].reverse().map((house) => {
              const livingHere = house.id === game.home;
              return (
                <li key={house.id} className="bg-white rounded-2xl shadow-sm p-2.5 flex items-center gap-3">
                  <Thumb image={house.image} cover />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{name('lifestyle', house)}</p>
                    <p className={`text-[11px] font-black ${livingHere ? 'text-violet-600' : 'text-emerald-600'}`}>
                      {livingHere ? t('home.livingHere') : t('home.rentedOut', { amount: perSecond(house) })}
                    </p>
                  </div>
                  {!livingHere && (
                    <button
                      type="button"
                      onClick={() => actions.moveHome(house.id)}
                      className="shrink-0 min-h-11 rounded-xl px-3 text-[11px] font-black bg-slate-100 text-slate-600 transition-all active:scale-95"
                    >
                      {renting ? t('home.moveEndsLease') : t('home.moveHere')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {forSale.length > 0 && (
        <>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{t('home.forSale')}</h2>
          <ul className="flex flex-col gap-2">
            {[...forSale].reverse().map((house) => {
              const price = housePrice(game, house) ?? 0;
              return (
                <li key={house.id} className="bg-white rounded-2xl shadow-sm p-2.5 flex items-center gap-3">
                  <Thumb image={house.image} cover />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{name('lifestyle', house)}</p>
                    <p className="text-[11px] font-black text-emerald-600">{t('home.rentsFor', { amount: perSecond(house) })}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => actions.buyHome(house.id)}
                    disabled={game.cash < price}
                    className="shrink-0 min-h-11 rounded-xl px-3 flex flex-col items-center justify-center text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-[10px] font-black leading-tight">{t('home.buy')}</span>
                    <span className="text-[11px] font-black tabular-nums leading-tight">{money(price)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
