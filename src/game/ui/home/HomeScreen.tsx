import { useEffect, useRef, useState } from 'react';
import { AD_OFFLINE_MIN_SECONDS, AD_OFFLINE_MULTIPLIER } from '../../core/config/ads';
import { awaitsHandover, canTakeBetterCareer, offlineCapHours } from '../../core/formulas';
import { bestOwnedLifestyle, canBuyAnythingInShop, canHandOverEarly, parkedVehicle } from '../../core/state';
import { useT } from '../../i18n/useT';
import { initAds } from '../../runtime/ads';
import { trackScreen } from '../../runtime/analytics';
import { haptic, playSfx, preloadSfx } from '../../runtime/feedback';
import { retirementWaits, sceneClass, sequelDue, storyRuns } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { BoostButton } from '../ads/Boost';
import { OpportunityBalloon, SceneAdButtons } from '../ads/SceneAds';
import { useAdText } from '../ads/useAdText';
import { EventCards } from '../events/EventCards';
import { Scene } from '../scene/Scene';
import { classLook, homeArt } from '../scene/stages';
import { Guide } from '../guide/Guide';
import { ICONS } from '../icons';
import { ALBUM, albumSeen } from '../story/album';
import { AlbumSheet } from '../story/AlbumSheet';
import { RICH_BUTTON_CLASS, RichListButton, RichListSheet } from '../richList/RichList';
import { StoreButton, StoreSheet } from '../shop/StoreSheet';
import { hasScarf, offersOpen } from '../../runtime/purchases';
import { investmentDue, investTabOpen } from '../../runtime/investment';
import { INVEST_FROM_CLASS } from '../../core/config/investments';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { StoryDirector } from '../story/StoryDirector';
import { BottomNav } from './BottomNav';
import { CoinLayer } from './CoinLayer';
import { payout } from './coins';
import { clearFocus, showFocus } from './focus';
import { QuestPanel, type GoToQuest } from './QuestPanel';
import { questTarget } from './questText';
import { familyAttention, familyTabOpen } from '../family/family';
import { RetirementPanel } from './RetirementPanel';
import { IncomeSheet } from './IncomeSheet';
import { RewardCard } from './RewardCard';
import { DreamsRow } from './DreamsRow';
import { useMeasureMenuTop } from './menuEdge';
import type { FocusTarget } from './focus';
import { SettingsSheet } from './SettingsSheet';
import type { TabId } from './tabs';
import { TabSheet } from './TabSheet';
import { TopBar } from './TopBar';

// Home: the scene fills the screen; the top bar and menu float over it, tabs open as sheets.
// The family album, the Rich List and the Store open the same way. The offline claim and the end-of-life panel stay on top of everything; story moments (ceremonies,
// Mom's messages) come above them.

export function HomeScreen() {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration } = useT();
  const adText = useAdText();
  const [tab, setTab] = useState<TabId | null>(null);
  // The family tab asks for a look once a session while the hand-over choice is open.
  const [familySeen, setFamilySeen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  // The goal the player last tapped "Go" on; the strip in the open tab keeps showing it.
  const [pinnedQuest, setPinnedQuest] = useState<string | null>(null);
  // An event card is on screen: story moments wait for the home scene, as they do for a tab.
  const [eventOpen, setEventOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [richOpen, setRichOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  // The album is playing a moment again: new story moments wait for it.
  const [albumPlaying, setAlbumPlaying] = useState(false);

  const goToQuest: GoToQuest = (quest) => {
    const target = questTarget(quest);
    if (!target) return;
    setPinnedQuest(quest.id);
    setAlbumOpen(false);
    setRichOpen(false);
    setStoreOpen(false);
    setTab(target.tab);
    showFocus(target);
  };

  // A dream on the board: the shop opens on it, its buy button glowing.
  const goToDream = (target: FocusTarget) => {
    setAlbumOpen(false);
    setRichOpen(false);
    setStoreOpen(false);
    setTab(target.tab);
    showFocus(target);
  };

  const selectTab = (next: TabId | null) => {
    clearFocus();
    setAlbumOpen(false);
    setRichOpen(false);
    setStoreOpen(false);
    setTab(next);
    if (next === 'family') setFamilySeen(true);
  };

  const openAlbum = () => {
    playSfx('click');
    haptic('light');
    clearFocus();
    setTab(null);
    setRichOpen(false);
    setStoreOpen(false);
    setAlbumOpen(true);
  };

  const openRichList = () => {
    clearFocus();
    setTab(null);
    setAlbumOpen(false);
    setStoreOpen(false);
    setRichOpen(true);
  };

  const openStore = () => {
    clearFocus();
    setTab(null);
    setAlbumOpen(false);
    setRichOpen(false);
    setStoreOpen(true);
  };

  // A purchase that changes the scene (a move, a new vehicle out front, a new outfit) closes the shop,
  // so the player sees the hero cheer and the vehicle drive in (phone test, 2026-10-15).
  const sceneKey = [game.home, parkedVehicle(game)?.id, bestOwnedLifestyle(game, 'outfit')?.id].join('|');
  const lastSceneKey = useRef(sceneKey);
  useEffect(() => {
    if (sceneKey === lastSceneKey.current) return;
    lastSceneKey.current = sceneKey;
    if (tab !== 'shop') return;
    clearFocus();
    setTab(null);
  }, [sceneKey, tab]);

  const openIncome = () => {
    playSfx('click');
    haptic('light');
    setIncomeOpen(true);
  };

  useEffect(() => preloadSfx(), []);
  // Beside the game's column on wide screens: the home you live in, blurred (mobile.css .v2-backdrop).
  const backdrop = homeArt(game.home).background;
  useEffect(() => {
    document.documentElement.style.setProperty('--v2-backdrop', `url("${backdrop}")`);
  }, [backdrop]);
  useEffect(
    () => trackScreen(albumOpen ? 'album' : richOpen ? 'rich_list' : storeOpen ? 'store' : (tab ?? 'home')),
    [tab, albumOpen, richOpen, storeOpen],
  );
  // Ads start once the player is in the game, so the consent form never covers the prologue.
  useEffect(() => void initAds(), []);

  const lifeOver = awaitsHandover(game);
  const sheetOpen = tab !== null || albumOpen || richOpen || storeOpen;
  // The album appears with its first picture; an empty book is not worth a button.
  const albumStarted = ALBUM.some((entry) => albumSeen(entry, state.story));
  // The Rich List shows itself with the Millionaire ceremony, a class before the list opens.
  const richShown = (storyRuns(game) ? state.story.ceremonySeen : game.classIndex) >= RICH_BUTTON_CLASS;
  // The scene keeps bottles above the menu (menuEdge.ts).
  const menuRef = useRef<HTMLDivElement>(null);
  useMeasureMenuTop(menuRef);

  // The Store opens with the first ceremony (runtime/purchases.ts).
  const storeShown = offersOpen(state.story);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#0d1530] select-none">
      <Scene />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar onOpenSettings={() => setSettingsOpen(true)} onOpenIncome={openIncome} />
        </div>
        <main className="relative flex-1">
          {albumOpen ? (
            <AlbumSheet onClose={() => setAlbumOpen(false)} onReplay={setAlbumPlaying} />
          ) : richOpen ? (
            <RichListSheet onClose={() => setRichOpen(false)} />
          ) : storeOpen ? (
            <StoreSheet onClose={() => setStoreOpen(false)} />
          ) : tab ? (
            <TabSheet tab={tab} onClose={() => selectTab(null)} pinnedQuest={pinnedQuest} onGo={goToQuest} onGoTo={goToDream} onOpenStore={openStore} />
          ) : (
            <QuestPanel onGo={goToQuest} />
          )}
          {/* The opportunity balloon floats across the scene now and then (an ad behind a tap). */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <OpportunityBalloon hidden={sheetOpen || state.offline !== null} />
          </div>
          {/* The income boost floats on the right of the scene, clear of the goals card and the top bar. */}
          {!sheetOpen && (
            <div className="pointer-events-auto absolute right-3 top-[42%] flex flex-col items-center gap-3">
              <BoostButton />
              <SceneAdButtons />
            </div>
          )}
          {/* Round buttons on the left of the scene, stacked: album, Rich List, Store. */}
          {!sheetOpen && (albumStarted || richShown || storeShown) && (
            <div className="absolute left-3 top-[42%] flex flex-col gap-3">
              {albumStarted && (
                <button
                  type="button"
                  onClick={openAlbum}
                  aria-label={t('album.open')}
                  className="pointer-events-auto w-14 h-14 rounded-full border-2 border-white bg-gradient-to-b from-white to-indigo-100 shadow-xl v2-glossy flex items-center justify-center transition-all active:scale-90"
                >
                  <img src={ICONS.album} alt="" draggable={false} className="w-11 h-11 object-contain drop-shadow" />
                </button>
              )}
              {richShown && <RichListButton onOpen={openRichList} />}
              {storeShown && <StoreButton onOpen={openStore} />}
            </div>
          )}
          <Guide tabOpen={sheetOpen} />
          <EventCards tabOpen={sheetOpen} onOpenChange={setEventOpen} />
        </main>
        <div ref={menuRef} className="pointer-events-auto">
          <BottomNav
            open={tab}
            onSelect={selectTab}
            attention={{
              career: canTakeBetterCareer(game),
              shop: canBuyAnythingInShop(game),
              // A deal is due, or the account just opened and was never used.
              invest: investTabOpen(state) && (investmentDue(state.invest, Date.now()) || state.invest.made === 0),
              family: familyTabOpen(game) && (familyAttention(game) || (canHandOverEarly(game) && !familySeen)),
            }}
            top={sheetOpen ? undefined : <DreamsRow onGo={goToDream} />}
            locked={{
              ...(investTabOpen(state)
                ? {}
                : { invest: t('invest.locked', { class: name('wealthClass', WEALTH_CLASSES[INVEST_FROM_CLASS]) }) }),
              ...(familyTabOpen(game)
                ? {}
                : { family: t('family.locked', { class: name('wealthClass', WEALTH_CLASSES[WEALTH_CLASSES.length - 1]) }) }),
            }}
          />
        </div>
      </div>

      {lifeOver && !state.offline && !retirementWaits(game, state.story) && <RetirementPanel />}

      {/* At launch the hero stays at 80: the grandchild's story comes with generation 2 (config/content.ts). */}
      {sequelDue(game, state.story) && !state.offline && !sheetOpen && (
        <RewardCard
          image="/assets/story/portraits/grandpa-soft.webp"
          portrait
          title={t('life.sequelTitle', { name: state.story.grandchildName || t('moments.grandchildDefault') })}
          body={t('life.sequelBody', { name: state.story.grandchildName || t('moments.grandchildDefault') })}
          actionLabel={t('life.sequelOk')}
          onCollect={() => actions.story.sequelSeen()}
        />
      )}

      {state.offline && (
        <RewardCard
          image={classLook(sceneClass(game, state.story), hasScarf(state.purchases)).sleep}
          title={t('offline.title')}
          body={t('offline.body', { duration: duration(state.offline.awaySeconds) })}
          amount={`+${money(state.offline.amount)}`}
          note={t('offline.cap', { duration: duration(offlineCapHours(game) * 3600) })}
          onCollect={() => {
            const amount = state.offline?.amount ?? 0;
            if (!actions.claimOffline()) return;
            playSfx('payout');
            haptic('medium');
            payout({ amount, label: `+${money(amount)}`, count: 12 });
          }}
          ad={
            state.offline.awaySeconds >= AD_OFFLINE_MIN_SECONDS
              ? {
                  placement: 'offline_x2',
                  label: adText('ads.more', {
                    amount: money(state.offline.amount * AD_OFFLINE_MULTIPLIER),
                    percent: Math.round((AD_OFFLINE_MULTIPLIER - 1) * 100),
                  }),
                  onReward: () => {
                    const amount = (state.offline?.amount ?? 0) * AD_OFFLINE_MULTIPLIER;
                    if (!actions.claimOffline(AD_OFFLINE_MULTIPLIER)) return;
                    playSfx('reward');
                    haptic('medium');
                    payout({ amount, label: `+${money(amount)}`, count: 18 });
                  },
                }
              : undefined
          }
        />
      )}

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
      {incomeOpen && <IncomeSheet onClose={() => setIncomeOpen(false)} />}

      <StoryDirector tabOpen={sheetOpen || eventOpen} hold={albumPlaying} onOpenRichList={openRichList} onOpenStore={openStore} />

      <CoinLayer />
    </div>
  );
}
