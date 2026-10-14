import { useEffect, useState } from 'react';
import { AD_OFFLINE_MIN_SECONDS, AD_OFFLINE_MULTIPLIER } from '../../core/config/ads';
import { isLifeOver, offlineCapHours } from '../../core/formulas';
import { canBuyAnythingInShop, nextCareer } from '../../core/state';
import { useT } from '../../i18n/useT';
import { initAds } from '../../runtime/ads';
import { trackScreen } from '../../runtime/analytics';
import { haptic, playSfx, preloadSfx } from '../../runtime/feedback';
import { sceneClass, storyRuns } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';
import { BoostButton } from '../ads/Boost';
import { useAdsUnlocked } from '../ads/useAdsUnlocked';
import { useAdText } from '../ads/useAdText';
import { EventCards } from '../events/EventCards';
import { Scene } from '../scene/Scene';
import { classLook } from '../scene/stages';
import { Guide } from '../guide/Guide';
import { ICONS } from '../icons';
import { ALBUM, albumSeen } from '../story/album';
import { AlbumSheet } from '../story/AlbumSheet';
import { RICH_BUTTON_CLASS, RichListButton, RichListSheet } from '../richList/RichList';
import { StoryDirector } from '../story/StoryDirector';
import { BottomNav } from './BottomNav';
import { CoinLayer } from './CoinLayer';
import { burstCoins } from './coins';
import { clearFocus, showFocus } from './focus';
import { QuestPanel, type GoToQuest } from './QuestPanel';
import { questTarget } from './questText';
import { RetirementPanel } from './RetirementPanel';
import { RewardCard } from './RewardCard';
import { SettingsSheet } from './SettingsSheet';
import type { TabId } from './tabs';
import { TabSheet } from './TabSheet';
import { TopBar } from './TopBar';

// Home: the scene fills the screen; the top bar and menu float over it, tabs open as sheets.
// The family album and the Rich List open the same way. The offline claim and the end-of-life panel stay on top of everything; story moments (ceremonies,
// Mom's messages) come above them.

export function HomeScreen() {
  const { game, state, actions } = useGameV2();
  const { t, money, duration } = useT();
  const adText = useAdText();
  const [tab, setTab] = useState<TabId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // The goal the player last tapped "Go" on; the strip in the open tab keeps showing it.
  const [pinnedQuest, setPinnedQuest] = useState<string | null>(null);
  // An event card is on screen: story moments wait for the home scene, as they do for a tab.
  const [eventOpen, setEventOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [richOpen, setRichOpen] = useState(false);
  // The album is playing a moment again: new story moments wait for it.
  const [albumPlaying, setAlbumPlaying] = useState(false);
  const promotion = nextCareer(game);
  const adsOpen = useAdsUnlocked();

  const goToQuest: GoToQuest = (quest) => {
    const target = questTarget(quest);
    if (!target) return;
    setPinnedQuest(quest.id);
    setAlbumOpen(false);
    setRichOpen(false);
    setTab(target.tab);
    showFocus(target);
  };

  const selectTab = (next: TabId | null) => {
    clearFocus();
    setAlbumOpen(false);
    setRichOpen(false);
    setTab(next);
  };

  const openAlbum = () => {
    playSfx('click');
    haptic('light');
    clearFocus();
    setTab(null);
    setRichOpen(false);
    setAlbumOpen(true);
  };

  const openRichList = () => {
    clearFocus();
    setTab(null);
    setAlbumOpen(false);
    setRichOpen(true);
  };

  useEffect(() => preloadSfx(), []);
  useEffect(() => trackScreen(albumOpen ? 'album' : richOpen ? 'rich_list' : (tab ?? 'home')), [tab, albumOpen, richOpen]);
  // Ads start once the player is in the game, so the consent form never covers the prologue.
  useEffect(() => void initAds(), []);

  const lifeOver = isLifeOver(game);
  const sheetOpen = tab !== null || albumOpen || richOpen;
  // The album appears with its first picture; an empty book is not worth a button.
  const albumStarted = ALBUM.some((entry) => albumSeen(entry, state.story));
  // The Rich List shows itself with the Millionaire ceremony, a class before the list opens.
  const richShown = (storyRuns(game) ? state.story.ceremonySeen : game.classIndex) >= RICH_BUTTON_CLASS;

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#0d1530] select-none">
      <Scene />

      <div className="absolute inset-0 flex flex-col pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar onOpenSettings={() => setSettingsOpen(true)} />
        </div>
        <main className="relative flex-1">
          {albumOpen ? (
            <AlbumSheet onClose={() => setAlbumOpen(false)} onReplay={setAlbumPlaying} />
          ) : richOpen ? (
            <RichListSheet onClose={() => setRichOpen(false)} />
          ) : tab ? (
            <TabSheet tab={tab} onClose={() => selectTab(null)} pinnedQuest={pinnedQuest} onGo={goToQuest} />
          ) : (
            <QuestPanel onGo={goToQuest} />
          )}
          {/* The income boost floats on the right of the scene, clear of the goals card and the top bar. */}
          {!sheetOpen && (
            <div className="pointer-events-auto absolute right-3 top-[42%]">
              <BoostButton />
            </div>
          )}
          {!sheetOpen && albumStarted && (
            <button
              type="button"
              onClick={openAlbum}
              aria-label={t('album.open')}
              className="pointer-events-auto absolute left-3 top-[42%] w-14 h-14 rounded-full border-2 border-white bg-gradient-to-b from-white to-indigo-100 shadow-xl v2-glossy flex items-center justify-center transition-all active:scale-90"
            >
              <img src={ICONS.album} alt="" draggable={false} className="w-11 h-11 object-contain drop-shadow" />
            </button>
          )}
          {!sheetOpen && richShown && (
            <div className="absolute left-3 top-[calc(42%+68px)]">
              <RichListButton onOpen={openRichList} />
            </div>
          )}
          <Guide tabOpen={sheetOpen} />
          <EventCards tabOpen={sheetOpen} onOpenChange={setEventOpen} />
        </main>
        <div className="pointer-events-auto">
          <BottomNav
            open={tab}
            onSelect={selectTab}
            attention={{ career: promotion !== null && game.cash >= promotion.cost, shop: canBuyAnythingInShop(game) }}
          />
        </div>
      </div>

      {lifeOver && !state.offline && <RetirementPanel />}

      {state.offline && (
        <RewardCard
          image={classLook(sceneClass(game, state.story)).sleep}
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
          ad={
            adsOpen && state.offline.awaySeconds >= AD_OFFLINE_MIN_SECONDS
              ? {
                  placement: 'offline_x2',
                  label: adText('ads.more', {
                    amount: money(state.offline.amount * AD_OFFLINE_MULTIPLIER),
                    percent: Math.round((AD_OFFLINE_MULTIPLIER - 1) * 100),
                  }),
                  onReward: (from) => {
                    actions.claimOffline(AD_OFFLINE_MULTIPLIER);
                    playSfx('levelUp');
                    haptic('medium');
                    burstCoins({ ...from, count: 18 });
                  },
                }
              : undefined
          }
        />
      )}

      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}

      <StoryDirector tabOpen={sheetOpen || eventOpen} hold={albumPlaying} onOpenRichList={openRichList} />

      <CoinLayer />
    </div>
  );
}
