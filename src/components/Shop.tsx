import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import type { Character, House, Car } from '../types/game';

const formatMoney = (amount: number) => `$${amount.toLocaleString()}`;

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  characters: Character[];
  houses: House[];
  cars: Car[];
  ownedCharacters: string[];
  ownedHouses: string[];
  ownedCars: string[];
  totalMoney: number;
  onPurchase: (type: 'character' | 'house' | 'car', itemId: string, price: number) => Promise<void>;
}

export function Shop({
  isOpen,
  onClose,
  characters,
  houses,
  cars,
  ownedCharacters,
  ownedHouses,
  ownedCars,
  totalMoney,
  onPurchase,
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'houses' | 'cars'>('characters');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (type: 'character' | 'house' | 'car', item: any) => {
    const itemCost = item.price !== undefined ? item.price : (item.hourly_rent_cost || 0);
    
    if (totalMoney < itemCost) return;
    
    setPurchasingId(item.id);
    try {
      await onPurchase(type, item.id, itemCost);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasingId(null);
    }
  };

  const renderItems = (items: any[], ownedIds: string[], type: 'character' | 'house' | 'car') => (
    <div className="grid grid-cols-2 gap-4">
      {items.map((item) => {
        const isOwned = ownedIds.includes(item.id);
        const itemCost = item.price !== undefined ? item.price : (item.hourly_rent_cost || 0);
        const canAfford = totalMoney >= itemCost;
        const isPurchasing = purchasingId === item.id;

        return (
          <div
            key={item.id}
            className={`relative rounded-2xl overflow-hidden border-2 ${
              isOwned ? 'border-emerald-500' : 'border-slate-700'
            } bg-slate-800 flex flex-col`}
          >
            <div className="aspect-square relative group">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <span className="text-4xl">
                    {type === 'character' ? '👤' : type === 'house' ? '🏠' : '🚗'}
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-lg mb-1">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${isOwned ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isOwned ? 'Owned' : formatMoney(itemCost)}
                  </span>
                  {type === 'house' && 'income_bonus' in item && (
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/20 px-2 py-1 rounded-lg">
                      +{item.income_bonus}/hr
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!isOwned && (
              <button
                onClick={() => handlePurchase(type, item)}
                disabled={!canAfford || isPurchasing}
                className={`p-4 font-bold flex items-center justify-center gap-2 transition-colors ${
                  canAfford && !isPurchasing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isPurchasing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : !canAfford ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Locked
                  </>
                ) : (
                  type === 'house' ? 'Rent Now' : 'Buy Now'
                )}
              </button>
            )}
            
            {isOwned && (
              <div className="p-4 bg-emerald-900/50 flex items-center justify-center gap-2 text-emerald-400 font-bold">
                <Check className="w-5 h-5" />
                Purchased
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col p-4 backdrop-blur-sm">
      <div className="flex-1 bg-slate-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        <div className="p-4 flex items-center justify-between bg-slate-800/50 border-b border-white/5">
          <h2 className="text-2xl font-black text-white">Shop</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 p-4 bg-slate-800/30 overflow-x-auto">
          {(['characters', 'houses', 'cars'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold capitalize whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'characters' && renderItems(characters, ownedCharacters, 'character')}
          {activeTab === 'houses' && renderItems(houses, ownedHouses, 'house')}
          {activeTab === 'cars' && renderItems(cars, ownedCars, 'car')}
        </div>
      </div>
    </div>
  );
}
