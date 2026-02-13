import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import { deviceIdentity } from './lib/deviceIdentity';
import CharacterSelector from './components/CharacterSelector';
import ProfileModal from './components/ProfileModal';
import OfflineEarningsModal from './components/OfflineEarningsModal';
import { Header } from './components/Header';
import { CharacterDisplay } from './components/CharacterDisplay';
import { Shop } from './components/Shop';
import { ShopModal } from './components/ShopModal';
import { JobsModal } from './components/JobsModal';
import { BottomNav } from './components/BottomNav';

function App() {
  const { deviceId, isAuthenticated } = useAuth();
  const gameState = useGameState(deviceId);
  const [showShop, setShowShop] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'shop' | 'job' | 'business' | 'investments' | 'stuff'>('shop');
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const [health, setHealth] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [showShopModal, setShowShopModal] = useState(false);

  const handleTabChange = (tab: 'shop' | 'job' | 'business' | 'investments' | 'stuff') => {
    setActiveTab(tab);
    if (tab === 'shop') {
      setShowShopModal(true);
    } else if (tab === 'job') {
      setShowJobs(true);
    }
  };

  useEffect(() => {
    if (!deviceIdentity.isCharacterSelected()) {
      setShowCharacterSelector(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTimeSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function handleCharacterSelected(characterId: string) {
    await gameState.createProfile(characterId);
    setShowCharacterSelector(false);
  }

  async function handlePlayerNameChange(newName: string) {
    await gameState.updatePlayerName(newName);
  }

  function handleResetProgress() {
    gameState.resetProgress();
  }

  if (!isAuthenticated || gameState.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="mt-4 text-white font-bold">Loading your game...</p>
        </div>
      </div>
    );
  }

  if (showCharacterSelector) {
    return <CharacterSelector onCharacterSelected={handleCharacterSelected} />;
  }

  if (!gameState.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-teal-500 to-emerald-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-white/30">
          <p className="text-red-100 font-bold">Error loading profile. Please try again.</p>
          <button
            onClick={() => gameState.reload()}
            className="mt-4 px-6 py-2 bg-white/30 hover:bg-white/40 text-white rounded-lg backdrop-blur-md border border-white/40 font-bold"
          >
            Retry
          </button>
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
      {currentHouse?.image_url && (
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${currentHouse.image_url})` }}
        />
      )}

      <Header
        totalMoney={gameState.profile.total_money}
        hourlyIncome={gameState.profile.hourly_income || 1000}
        username={gameState.profile.display_name || gameState.profile.username}
        health={health}
        happiness={happiness}
        gems={gameState.profile.gems || 0}
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
        onPurchase={gameState.purchaseItem}
      />

      <ShopModal
        isOpen={showShopModal}
        onClose={() => {
          setShowShopModal(false);
          setActiveTab('shop');
        }}
        hourlyIncome={gameState.profile.hourly_income || 0}
        lastClaimTime={gameState.profile.last_claim_time || null}
        gems={gameState.profile.gems || 0}
        claimLockedUntil={gameState.claimLockedUntil}
        dailyClaimedTotal={gameState.dailyClaimedTotal}
        onClaimDaily={gameState.claimDailyReward}
        onClaimMoney={gameState.claimAccumulatedMoney}
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
      />

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
