import { useEffect, useState } from 'react';
import { heroAge, isLifeOver, offlineCapHours, pendingLegacyPoints } from '../../core/formulas';
import { canBuyAnythingInShop, nextCareer } from '../../core/state';
import { useT } from '../../i18n/useT';
import { initAds } from '../../runtime/ads';
import { haptic, playSfx, preloadSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import { Scene } from '../scene/Scene';
import { BottomNav } from './BottomNav';
import { CoinLayer } from './CoinLayer';
import { burstCoins } from './coins';
import { RewardCard } from './RewardCard';
import { SettingsSheet } from './SettingsSheet';
import type { TabId } from './tabs';
import { TabSheet } from './TabSheet';
import { TopBar } from './TopBar';

// Home: the scene fills the screen; the top bar and menu float over it, tabs open as sheets.
// The offline claim and the end-of-life sheet stay on top of everything.

export function HomeScreen() {
  const { game, state, actions } = useGameV2();
  const { t, money, duration } = useT();
  const [tab, setTab] = useState<TabId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const promotion = nextCareer(game);

  useEffect(() => preloadSfx(), []);
  // Ads start once the player is in the game, so the consent form never covers the prologue.
  useEffect(() => void initAds(), []);

  const lifeOver = isLifeOver(game);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#0d1530] select-none">
      <Scene />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar onOpenSettings={() => setSettingsOpen(true)} />
        </div>
        <main className="relative flex-1">{tab && <TabSheet tab={tab} onClose={() => setTab(null)} />}</main>
        <div className="pointer-events-auto">
          <BottomNav
            open={tab}
            onSelect={setTab}
            attention={{ career: promotion !== null && game.cash >= promotion.cost, shop: canBuyAnythingInShop(game) }}
          />
        </div>
      </div>

      {lifeOver && !state.offline && (
        <div className="fixed inset-0 z-[60] bg-black/35 flex items-end">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-5 pb-[calc(var(--safe-bottom)+20px)] text-center">
            <h2 className="text-xl font-black text-slate-900">{t('life.title')}</h2>
            <p className="text-sm font-bold text-slate-600 mt-2">
              {t('life.body', {
                age: heroAge(game).years,
                total: game.legacyPoints + pendingLegacyPoints(game),
                gained: pendingLegacyPoints(game),
              })}
            </p>
            <button
              type="button"
              onClick={() => actions.retire()}
              className="w-full mt-4 rounded-2xl py-3.5 font-black text-sm text-white bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg transition-all active:scale-[0.98]"
            >
              {t('life.retire')}
            </button>
          </div>
        </div>
      )}

      {state.offline && (
        <RewardCard
          image="/assets/icons/wallet.png"
          title={t('offline.title')}
          body={t('offline.body', { duration: duration(state.offline.awaySeconds) })}
          amount={`+${money(state.offline.amount)}`}
          note={t('offline.cap', { duration: duration(offlineCapHours(game) * 3600) })}
          onCollect={(from) => {
            actions.claimOffline();
            playSfx('coin');
            haptic('medium');
            burstCoins({ ...from, count: 12 });
          }}
        />
      )}

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}

      <CoinLayer />
    </div>
  );
}
