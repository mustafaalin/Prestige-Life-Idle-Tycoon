import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import ProfileModal from './components/ProfileModal';
import OfflineEarningsModal from './components/OfflineEarningsModal';
import { Header } from './components/Header';
import { CharacterDisplay } from './components/CharacterDisplay';
import { Shop } from './components/Shop';
import { ShopModal } from './components/ShopModal';
import { JobsModal } from './components/JobsModal';
import { BusinessModal } from './components/BusinessModal';
import { StuffModal } from './components/StuffModal';
import { BottomNav } from './components/BottomNav';

function App() {
  const { deviceId, isAuthenticated, user, loading: authLoading } = useAuth();
  const gameState = useGameState(deviceId, user?.id || null);
  const [showShop, setShowShop] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'job' | 'business' | 'investments' | 'stuff'>('shop');
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const [health, setHealth] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showStuffModal, setShowStuffModal] = useState(false);

  const handleTabChange = (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => {
    setActiveTab(tab);
    if (tab === 'shop') {
      setShowShopModal(true);
    } else if (tab === 'job') {
      setShowJobs(true);
    } else if (tab === 'business') {
      setShowBusinessModal(true);
    } else if (tab === 'stuff') {
      setShowStuffModal(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authLoading && !gameState.profile && !gameState.loading && isAuthenticated && user?.id) {
      gameState.createProfile();
    }
  }, [authLoading, gameState.profile, gameState.loading, isAuthenticated, user?.id]);

  async function handlePlayerNameChange(newName: string) {
    await gameState.updatePlayerName(newName);
  }

  function handleResetProgress() {
    gameState.resetProgress();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Loading your game...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="text-center">
            <p className="text-white font-bold text-xl mb-4">Authentication Failed</p>
            <p className="text-white/80 mb-6">Unable to authenticate. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white/30 hover:bg-white/40 text-white font-bold rounded-xl transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Loading your game...</p>
        </div>
      </div>
    );
  }

  if (!gameState.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Creating your profile...</p>
        </div>
      </div>
    );
  }

  const currentCharacter = gameState.characters.find(
    (c) => c.id === gameState.profile?.selected_character_id
  );
  const currentHouse = gameState.houses.find(
    (h) => h.id === gameState.profile?.selected_house_id
  );
  const currentCar = gameState.cars.find((c) => c.id === gameState.profile?.selected_car_id);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {currentHouse?.image_url ? (
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${currentHouse.image_url})` }}
        />
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 z-0" />
      )}

      <Header
        totalMoney={gameState.profile.total_money}
        hourlyIncome={Number(gameState.profile.hourly_income ?? 1000)}
        username={gameState.profile.display_name || gameState.profile.username}
        health={health}
        happiness={happiness}
        gems={gameState.profile.gems || 0}
        prestigePoints={gameState.profile?.prestige_points ?? 0}
        onOpenProfile={() => {
          setShowProfile(true);
        }}
        onOpenSettings={() => {
          setShowSettings(true);
        }}
      />

      <main className="flex-1 px-3 py-4 overflow-y-auto relative z-10">
        <CharacterDisplay
          characterImage={currentCharacter?.image_url || ''}
          characterName={currentCharacter?.name || 'Character'}
          carImage={currentCar?.image_url}
          outfitImage={gameState.selectedOutfit?.image_url}
          onClickCharacter={gameState.handleClick}
        />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      <Shop
        isOpen={showShop}
        onClose={() => {
          setShowShop(false);
          setActiveTab('shop');
        }}
        characters={gameState.characters}
        houses={gameState.houses}
        cars={gameState.cars}
        ownedCharacters={gameState.ownedCharacters}
        ownedHouses={gameState.ownedHouses}
        ownedCars={gameState.ownedCars}
        totalMoney={gameState.profile.total_money}
        onPurchase={gameState.purchaseitem}
      />

      <ShopModal
        isOpen={showShopModal}
        onClose={() => {
          setShowShopModal(false);
          setActiveTab('shop');
        }}
        userId={user.id}
        hourlyIncome={gameState.profile.hourly_income || 0}
        lastClaimTime={gameState.profile.last_claim_time || null}
        gems={gameState.profile.gems || 0}
        claimLockedUntil={gameState.claimLockedUntil}
        dailyClaimedTotal={gameState.dailyClaimedTotal}
        onClaimDaily={gameState.claimDailyReward}
        onClaimMoney={gameState.claimAccumulatedMoney}
        onWatchAd={gameState.watchAd}
        onPurchaseComplete={(moneyAdded, gemsAdded) => {
          if (gameState.profile) {
            gameState.saveProfile({
              total_money: gameState.profile.total_money + moneyAdded,
              gems: gameState.profile.gems + gemsAdded,
            });
          }
          gameState.reload();
        }}
        totalMoney={gameState.profile.total_money}
        selectedOutfitId={gameState.profile.selected_outfit_id}
        onOutfitChange={() => {
          gameState.reload();
        }}
      />

      <JobsModal
        isOpen={showJobs}
        onClose={() => {
          setShowJobs(false);
          setActiveTab('job');
        }}
        jobs={gameState.jobs}
        playerJobs={gameState.playerJobs}
        totalMoney={gameState.profile.total_money}
        onUnlockJob={gameState.unlockJob}
        onSelectJob={gameState.selectJob}
        jobChangeLockedUntil={gameState.jobChangeLockedUntil}
        unsavedJobWorkSeconds={gameState.unsavedJobWorkSeconds}
      />

      {showBusinessModal && (
        <BusinessModal
          businesses={gameState.businesses}
          totalMoney={gameState.profile.total_money}
          onPurchase={gameState.purchaseBusiness}
          onUpgrade={gameState.upgradeBusiness}
          prestigePoints={gameState.profile?.prestige_points ?? 0}
          onClose={() => {
            setShowBusinessModal(false);
            setActiveTab('business');
          }}
          loading={gameState.businessesLoading}
        />
      )}

      {showStuffModal && (
        <StuffModal
          cars={gameState.cars}
          houses={gameState.houses}
          totalMoney={gameState.profile.total_money}
          selectedCarId={gameState.profile.selected_car_id}
          selectedHouseId={gameState.profile.selected_house_id}
          ownedCars={gameState.ownedCars}
          onPurchaseCar={(carId, price) => gameState.purchaseitem('car', carId, price)}
          onSelectCar={gameState.selectCar}
          onSelectHouse={gameState.selectHouse}
          onClose={() => {
            setShowStuffModal(false);
            setActiveTab('stuff');
          }}
          loading={gameState.loading}
        />
      )}

      <ProfileModal
        isOpen={showProfile}
        onClose={() => {
          setShowProfile(false);
        }}
        playerName={gameState.profile.display_name || gameState.profile.username}
        onPlayerNameChange={handlePlayerNameChange}
        totalMoney={gameState.profile.total_money}
        lifetimeEarnings={gameState.profile.lifetime_earnings}
        totalClicks={gameState.profile.total_clicks}
        playTimeSeconds={playTimeSeconds}
        onResetProgress={handleResetProgress}
        prestigePoints={gameState.profile?.prestige_points ?? 0}
      />

      {gameState.offlineEarnings && gameState.offlineEarnings.amount > 0 && (
        <OfflineEarningsModal
          isOpen={true}
          onClose={gameState.clearOfflineEarnings}
          earnedAmount={gameState.offlineEarnings.amount}
          offlineMinutes={gameState.offlineEarnings.minutes}
        />
      )}
    </div>
  );
}

export default App;
