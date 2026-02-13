import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  gender: string;
  description: string;
  image_url: string;
  price: number;
  unlock_order: number;
}

interface CharacterSelectorProps {
  onCharacterSelected: (characterId: string) => void;
}

export default function CharacterSelector({ onCharacterSelected }: CharacterSelectorProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('price', 0)
        .order('unlock_order');

      if (error) throw error;
      setCharacters(data || []);

      const sarahCharacter = data?.find(c => c.name.toLowerCase() === 'sarah');
      if (sarahCharacter) {
        setSelectedId(sarahCharacter.id);
      } else if (data && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(characterId: string) {
    setSelectedId(characterId);
  }

  function handleConfirm() {
    if (selectedId) {
      onCharacterSelected(selectedId);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-6xl w-full py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Choose Your Character</h1>
          <p className="text-xl text-blue-200">Select a character to begin your journey from rags to riches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => handleSelect(character.id)}
              className={`group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:bg-white/20 ${
                selectedId === character.id
                  ? 'ring-4 ring-blue-400 bg-white/20 scale-105'
                  : 'hover:ring-2 hover:ring-blue-300'
              }`}
            >
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {character.image_url ? (
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-24 h-24 text-white/50" />
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{character.name}</h3>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  character.gender === 'male'
                    ? 'bg-blue-500/30 text-blue-200'
                    : 'bg-pink-500/30 text-pink-200'
                }`}>
                  {character.gender === 'male' ? 'Male' : 'Female'}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/30 text-green-200">
                  Free
                </span>
              </div>

              <p className="text-blue-100 text-sm leading-relaxed">{character.description}</p>

              {selectedId === character.id && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedId}
            className={`px-12 py-4 rounded-xl text-xl font-bold transition-all duration-300 ${
              selectedId
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
