import { useEffect, useRef, useState } from 'react';
import { resolveLocalAsset } from '../lib/localAssets';

interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  carImage?: string;
  outfitImage?: string;
  celebrationTrigger?: number;
  onClickCharacter: () => number | undefined;
}

export function CharacterDisplay({
  characterImage,
  characterName,
  carImage,
  outfitImage,
  celebrationTrigger,
  onClickCharacter,
}: CharacterDisplayProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const celebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Car slide transition state
  const [visibleCar, setVisibleCar] = useState<string | null>(carImage ? resolveLocalAsset(carImage, 'car') : null);
  const [outgoingCar, setOutgoingCar] = useState<string | null>(null);
  const [carAnimState, setCarAnimState] = useState<'idle' | 'transitioning'>('idle');
  const carTransitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCarImageRef = useRef<string | undefined>(carImage);
  const visibleCarRef = useRef<string | null>(visibleCar);
  visibleCarRef.current = visibleCar;

  // Celebration effect
  useEffect(() => {
    if (!celebrationTrigger) return;
    if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    setIsCelebrating(false);
    requestAnimationFrame(() => {
      setIsCelebrating(true);
      celebrationTimeout.current = setTimeout(() => setIsCelebrating(false), 850);
    });
  }, [celebrationTrigger]);

  // Car slide transition effect
  useEffect(() => {
    if (carImage === prevCarImageRef.current) return;
    prevCarImageRef.current = carImage;

    const newSrc = carImage ? resolveLocalAsset(carImage, 'car') : null;

    if (carTransitionTimeout.current) clearTimeout(carTransitionTimeout.current);

    // Slide out the current car, slide in the new one
    setOutgoingCar(visibleCarRef.current);
    setVisibleCar(newSrc);
    setCarAnimState('transitioning');

    carTransitionTimeout.current = setTimeout(() => {
      setOutgoingCar(null);
      setCarAnimState('idle');
    }, 450);
  }, [carImage]);

  const displayImage = resolveLocalAsset(outfitImage || characterImage, 'character');

  return (
    <div className="fixed inset-x-0 top-[88px] bottom-[88px] overflow-hidden">
      {/* OUTGOING CAR (slides out left) */}
      {outgoingCar && carAnimState === 'transitioning' && (
        <div className="absolute bottom-40 left-4 z-10 select-none pointer-events-none animate-car-slide-out">
          <div className="w-[280px] h-[187px] min-[420px]:w-[420px] min-[420px]:h-[280px] sm:w-[480px] sm:h-[320px]">
            <img src={outgoingCar} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        </div>
      )}

      {/* CURRENT CAR (slides in or static) */}
      {visibleCar && (
        <div
          className={`absolute bottom-40 left-4 z-10 select-none pointer-events-none ${
            carAnimState === 'transitioning' ? 'animate-car-slide-in' : ''
          }`}
          style={carAnimState === 'idle' ? { transform: 'translateX(-10px)', opacity: 0.95 } : undefined}
        >
          <div className="w-[280px] h-[187px] min-[420px]:w-[420px] min-[420px]:h-[280px] sm:w-[480px] sm:h-[320px]">
            <img src={visibleCar} alt="Car" className="w-full h-full object-contain" draggable={false} />
          </div>
        </div>
      )}

      {/* CHARACTER */}
      <div className="absolute bottom-12 right-0 z-20 w-1/3 flex justify-end pr-2">
        <div className="select-none transform origin-bottom scale-90 translate-x-6">
          <div
            className={`relative w-48 h-[333px] min-[420px]:w-72 min-[420px]:h-[500px] sm:w-80 sm:h-[550px] ${
              isCelebrating ? 'animate-character-celebrate' : ''
            }`}
          >
            <img
              src={displayImage}
              alt={characterName}
              className="w-full h-full object-contain"
              draggable={false}
              onClick={() => onClickCharacter?.()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
