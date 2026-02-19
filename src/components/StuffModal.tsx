import { useState } from 'react';
import { X, Car, Home, Lock, Check, ShoppingCart, Sparkles } from 'lucide-react';

interface Car {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  level: number;
  prestige_points: number;
  hourly_maintenance_cost: number;
}

interface House {
  id: string;
  name: string;
  description: string;
  image_url: string;
  level: number;
  hourly_rent_cost: number;
  prestige_points: number;
}

interface StuffModalProps {
  cars: Car[];
  houses: House[];
  totalMoney: number;
  selectedCarId: string | null;
  selectedHouseId: string | null;
  ownedCars: string[];
  onPurchaseCar: (carId: string, price: number) => Promise<boolean>;
  onSelectCar: (carId: string) => Promise<boolean>;
  onSelectHouse: (houseId: string) => Promise<boolean>;
  onClose: () => void;
  loading?: boolean;
}

export function StuffModal({
  cars,
  houses,
  totalMoney,
  selectedCarId,
  selectedHouseId,
  ownedCars,
  onPurchaseCar,
  onSelectCar,
  onSelectHouse,
  onClose,
  loading = false,
}: StuffModalProps) {
  const [activeTab, setActiveTab] = useState<'cars' | 'houses'>('cars');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const handlePurchaseCar = async (carId: string, price: number) => {
    setProcessingId(carId);
    const success = await onPurchaseCar(carId, price);
    setProcessingId(null);
    if (!success) {
      alert('Failed to purchase car. Please try again.');
    }
  };

  const handleSelectCar = async (carId: string) => {
    setProcessingId(carId);
    const success = await onSelectCar(carId);
    setProcessingId(null);
    if (!success) {
      alert('Failed to select car. Please try again.');
    }
  };

  const handleSelectHouse = async (houseId: string) => {
    setProcessingId(houseId);
    const success = await onSelectHouse(houseId);
    setProcessingId(null);
    if (!success) {
      alert('Failed to select house. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-x-0 z-[50] flex flex-col pointer-events-none"
      style={{
        top: '88px',
        bottom: '0',
        height: 'calc(100dvh - 88px)'
      }}
    >
      <div className="bg-white w-full h-full shadow-2xl flex flex-col pointer-events-auto border-t border-b border-orange-100">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b-2 border-orange-100 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Car className="w-7 h-7 text-orange-600" />
              Stuff
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-600">
                Owned Cars: <span className="font-bold text-orange-600">{ownedCars.length}</span>
              </span>
              <span className="text-gray-600">
                Balance: <span className="font-bold text-green-600">{formatMoney(totalMoney)}</span>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex border-b-2 border-orange-100 bg-white">
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex-1 px-6 py-3 font-semibold transition-all ${
              activeTab === 'cars'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-b-4 border-orange-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Car className="w-5 h-5" />
              Cars
            </div>
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`flex-1 px-6 py-3 font-semibold transition-all ${
              activeTab === 'houses'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-b-4 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Houses
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cars.map((car) => {
                const isOwned = ownedCars.includes(car.id);
                const isSelected = selectedCarId === car.id;
                const canAfford = totalMoney >= car.price;
                const isProcessing = processingId === car.id;

                return (
                  <div
                    key={car.id}
                    className={`relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 transition-all ${
                      isSelected
                        ? 'border-green-400 shadow-lg shadow-green-200'
                        : 'border-orange-200 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-30 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" />
                        Currently Driving
                      </div>
                    )}

                    {car.prestige_points > 0 && (
                      <div className="absolute top-3 left-3 z-30 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {car.prestige_points}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="relative z-0 w-full h-32 bg-white rounded-lg overflow-hidden border-2 border-orange-100">
                        <img
                          src={car.image_url}
                          alt={car.name}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 text-lg">{car.name}</h3>
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                            Lv. {car.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{car.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                          <div className="bg-white/60 rounded px-2 py-1 border border-orange-200">
                            <span className="text-gray-600">Price:</span>{' '}
                            <span className="font-bold text-orange-600">{formatMoney(car.price)}</span>
                          </div>
                          <div className="bg-white/60 rounded px-2 py-1 border border-red-200">
                            <span className="text-gray-600">Maintenance:</span>{' '}
                            <span className="font-bold text-red-600">{formatMoney(car.hourly_maintenance_cost)}/h</span>
                          </div>
                        </div>

                        {!isOwned ? (
                          <button
                            onClick={() => handlePurchaseCar(car.id, car.price)}
                            disabled={!canAfford || isProcessing || loading}
                            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                              canAfford && !isProcessing
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isProcessing ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                {canAfford ? 'Buy' : 'Not Enough Money'}
                              </>
                            )}
                          </button>
                        ) : isSelected ? (
                          <div className="w-full py-2 bg-green-100 border-2 border-green-400 rounded-lg text-green-700 font-bold text-center flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            Driving This Car
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectCar(car.id)}
                            disabled={isProcessing || loading}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            {isProcessing ? 'Selecting...' : (
                              <>
                                <Car className="w-4 h-4" />
                                Select
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'houses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {houses.map((house) => {
                const isSelected = selectedHouseId === house.id;
                const isProcessing = processingId === house.id;

                return (
                  <div
                    key={house.id}
                    className={`relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 transition-all ${
                      isSelected
                        ? 'border-blue-400 shadow-lg shadow-blue-200'
                        : 'border-blue-200 hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-30 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" />
                        Current Home
                      </div>
                    )}

                    {house.prestige_points > 0 && (
                      <div className="absolute top-3 left-3 z-30 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {house.prestige_points}
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <div className="relative z-0 w-full h-32 bg-white rounded-lg overflow-hidden border-2 border-blue-100">
                        <img
                          src={house.image_url}
                          alt={house.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 text-lg">{house.name}</h3>
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            Lv. {house.level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{house.description}</p>

                        <div className="bg-white/60 rounded px-2 py-1 border border-red-200 text-xs mb-3">
                          <span className="text-gray-600">Rent:</span>{' '}
                          <span className="font-bold text-red-600">{formatMoney(house.hourly_rent_cost)}/h</span>
                        </div>

                        {isSelected ? (
                          <div className="w-full py-2 bg-blue-100 border-2 border-blue-400 rounded-lg text-blue-700 font-bold text-center flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            Living Here
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectHouse(house.id)}
                            disabled={isProcessing || loading}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            {isProcessing ? 'Moving...' : (
                              <>
                                <Home className="w-4 h-4" />
                                Move Here
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'cars' && cars.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Car className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No cars available yet</p>
              <p className="text-sm">Check back later for new vehicles!</p>
            </div>
          )}

          {activeTab === 'houses' && houses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">No houses available yet</p>
              <p className="text-sm">Check back later for new properties!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
