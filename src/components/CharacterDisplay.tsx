import { useEffect, useRef, useState } from 'react';
import { resolveLocalAsset } from '../lib/localAssets';

interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  carImage?: string;
  outfitImage?: string;
  celebrationTrigger?: number;
  onClickCharacter: () => number | undefined;
  charIntroVisible?: boolean;
}

function getCelebrateImageUrl(idleUrl: string): string {
  return idleUrl.replace(/-1\.(png|webp)$/i, '-2.$1');
}

function getAnimatedIdleUrl(staticUrl: string): string {
  return staticUrl.replace(/\.png$/i, '.webp');
}

export function CharacterDisplay({
  characterImage,
  characterName,
  carImage,
  outfitImage,
  celebrationTrigger,
  onClickCharacter,
  charIntroVisible = true,
}: CharacterDisplayProps) {
  const [isCelebrating, setIsCelebrating] = useState(false);
  const celebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [celebrateImgFailed, setCelebrateImgFailed] = useState(false);
  const [animatedIdleFailed, setAnimatedIdleFailed] = useState(false);
  const prevOutfitRef = useRef(outfitImage);

  // Character intro animation
  const [charIntroState, setCharIntroState] = useState<'hidden' | 'entering' | 'visible'>(
    charIntroVisible ? 'visible' : 'hidden'
  );
  const charIntroPlayed = useRef(charIntroVisible);
  useEffect(() => {
    if (!charIntroVisible || charIntroPlayed.current) return;
    charIntroPlayed.current = true;
    setCharIntroState('entering');
    const t = setTimeout(() => setCharIntroState('visible'), 500);
    return () => clearTimeout(t);
  }, [charIntroVisible]);

  // Reset error states when outfit changes
  useEffect(() => {
    if (outfitImage !== prevOutfitRef.current) {
      prevOutfitRef.current = outfitImage;
      setCelebrateImgFailed(false);
      setAnimatedIdleFailed(false);
    }
  }, [outfitImage]);

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
      celebrationTimeout.current = setTimeout(() => setIsCelebrating(false), 1400);
    });
  }, [celebrationTrigger]);

  // Car slide transition effect
  useEffect(() => {
    if (carImage === prevCarImageRef.current) return;
    prevCarImageRef.current = carImage;

    const newSrc = carImage ? resolveLocalAsset(carImage, 'car') : null;

    if (carTransitionTimeout.current) clearTimeout(carTransitionTimeout.current);

    setOutgoingCar(visibleCarRef.current);
    setVisibleCar(newSrc);
    setCarAnimState('transitioning');

    carTransitionTimeout.current = setTimeout(() => {
      setOutgoingCar(null);
      setCarAnimState('idle');
    }, 450);
  }, [carImage]);

  const idleImageStatic = resolveLocalAsset(outfitImage || characterImage, 'character');
  const idleImageAnimated = outfitImage && !animatedIdleFailed
    ? getAnimatedIdleUrl(idleImageStatic)
    : null;
  const celebrateImage = outfitImage ? getCelebrateImageUrl(idleImageStatic) : null;
  const showCelebrateImage = isCelebrating && celebrateImage && !celebrateImgFailed;

  return (
    <div className="fixed inset-x-0 top-[88px] bottom-[88px] overflow-hidden">
      {/* OUTGOING CAR (slides out left) */}
      {outgoingCar && carAnimState === 'transitioning' && (
        <div className="absolute bottom-40 left-4 z-10 select-none pointer-events-none animate-car-slide-out">
          <div className="w-[300px] h-[200px] [@media(min-width:420px)]:w-[370px] [@media(min-width:420px)]:h-[247px] [@media(min-width:420px)_and_(min-height:700px)]:w-[420px] [@media(min-width:420px)_and_(min-height:700px)]:h-[280px] [@media(min-width:640px)_and_(min-height:700px)]:w-[480px] [@media(min-width:640px)_and_(min-height:700px)]:h-[320px]">
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
          <div className="w-[300px] h-[200px] [@media(min-width:420px)]:w-[370px] [@media(min-width:420px)]:h-[247px] [@media(min-width:420px)_and_(min-height:700px)]:w-[420px] [@media(min-width:420px)_and_(min-height:700px)]:h-[280px] [@media(min-width:640px)_and_(min-height:700px)]:w-[480px] [@media(min-width:640px)_and_(min-height:700px)]:h-[320px]">
            <img src={visibleCar} alt="Car" className="w-full h-full object-contain" draggable={false} />
          </div>
        </div>
      )}

      {/* CHARACTER */}
      <div className={`absolute bottom-12 right-0 z-20 w-1/3 flex justify-end pr-2 ${
        charIntroState === 'hidden' ? 'opacity-0 pointer-events-none' :
        charIntroState === 'entering' ? 'animate-character-intro' : ''
      }`}>
        <div className="select-none translate-x-6 min-[420px]:scale-90 min-[420px]:origin-bottom">
          <div className="relative w-[190px] h-[330px] [@media(min-width:420px)]:w-[230px] [@media(min-width:420px)]:h-[400px] [@media(min-width:420px)_and_(min-height:700px)]:w-72 [@media(min-width:420px)_and_(min-height:700px)]:h-[500px] [@media(min-width:640px)_and_(min-height:700px)]:w-80 [@media(min-width:640px)_and_(min-height:700px)]:h-[550px]">

            {/* IDLE pose — animated WebP if available, static PNG fallback */}
            <img
              src={idleImageAnimated ?? idleImageStatic}
              alt={characterName}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                showCelebrateImage ? 'opacity-0' : 'opacity-100'
              }`}
              draggable={false}
              onError={idleImageAnimated ? () => setAnimatedIdleFailed(true) : undefined}
              onClick={() => onClickCharacter?.()}
            />

            {/* CELEBRATE pose — opacity-only controlled by class, Y-jump by animation */}
            {celebrateImage && (
              <img
                src={celebrateImage}
                alt=""
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                  showCelebrateImage
                    ? 'opacity-100 animate-celebrate-jump'
                    : 'opacity-0 pointer-events-none'
                }`}
                draggable={false}
                onError={() => setCelebrateImgFailed(true)}
                onClick={() => onClickCharacter?.()}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

