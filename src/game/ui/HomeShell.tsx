import { useState } from 'react';
import { WEALTH_CLASSES } from '../core/config/classes';
import { autoIncomePerSecond, tapValue } from '../core/formulas';
import { canBuyAnythingInShop, nextCareer } from '../core/state';
import { useT } from '../i18n/useT';
import { useBackButton } from '../runtime/backButton';
import { useGameV2 } from '../runtime/useGameV2';
import { BusinessesScreen } from './businesses/BusinessesScreen';
import { CareerScreen } from './career/CareerScreen';
import { ShopScreen } from './shop/ShopScreen';
import { TabBar, type TabId } from './TabBar';

// Temporary home layout so v2 is playable while it is built: a HUD, the tab screens and the
// offline claim. Replaced piece by piece by the scene (1.6), HUD (1.7) and offline modal (1.13).

export function HomeShell() {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration } = useT();
  const [tab, setTab] = useState<TabId>('businesses');
  const promotion = nextCareer(game);

  // Android back: from another tab, go home first; on the offline sheet, collect (the sheet's only action).
  useBackButton(tab !== 'businesses', 0, () => setTab('businesses'));
  useBackButton(state.offline !== null, 60, () => actions.claimOffline());

  const current = WEALTH_CLASSES[game.classIndex];
  const next = WEALTH_CLASSES[game.classIndex + 1];
  const classProgress = next
    ? Math.min(1, (game.generationEarnings - current.threshold) / (next.threshold - current.threshold))
    : 1;

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col">
      <header className="shrink-0 px-4 pt-[calc(var(--safe-top)+12px)] pb-3">
        <section className="bg-white rounded-[22px] shadow-lg p-4 flex gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{name('wealthClass', current)}</p>
            <p className="text-3xl font-black text-slate-900 tabular-nums mt-0.5 truncate">{money(game.cash)}</p>
            <p className="text-sm font-bold text-emerald-500 tabular-nums">
              {t('hud.autoPerSecond', { amount: money(autoIncomePerSecond(game)) })}
            </p>
          </div>
          <button
            type="button"
            onClick={actions.tap}
            className="shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg flex flex-col items-center justify-center transition-all active:scale-90"
          >
            <span className="text-[10px] font-black leading-tight text-center px-1">{t('tap.button')}</span>
            <span className="text-[11px] font-black tabular-nums">+{money(tapValue(game))}</span>
          </button>
        </section>
        <div className="mt-2 px-1">
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${classProgress * 100}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 mt-1">
            {next
              ? t('hud.toNextClass', { percent: Math.floor(classProgress * 100), name: name('wealthClass', next) })
              : t('hud.topClass')}
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === 'businesses' && <BusinessesScreen />}
        {tab === 'career' && <CareerScreen />}
        {tab === 'shop' && <ShopScreen />}
      </main>

      <TabBar
        active={tab}
        onChange={setTab}
        attention={{ career: promotion !== null && game.cash >= promotion.cost, shop: canBuyAnythingInShop(game) }}
      />

      {state.offline && (
        <div className="fixed inset-0 z-[60] bg-black/35 flex items-end">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-5 pb-[calc(var(--safe-bottom)+20px)] text-center">
            <h2 className="text-xl font-black text-slate-900">{t('offline.title')}</h2>
            <p className="text-sm font-bold text-slate-600 mt-1">
              {t('offline.body', { duration: duration(state.offline.awaySeconds) })}
            </p>
            <p className="text-3xl font-black text-emerald-500 tabular-nums my-4">{money(state.offline.amount)}</p>
            <button
              type="button"
              onClick={() => actions.claimOffline()}
              className="w-full rounded-2xl py-3.5 font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98]"
            >
              {t('common.collect')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
