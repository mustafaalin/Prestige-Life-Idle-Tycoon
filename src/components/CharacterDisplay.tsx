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

const SUPABASE_OUTFITS_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/outfits`;

// /assets/outfits/ch-1-1.png → Supabase: ch-1-idle.webp
function toIdleAnimated(url: string): string {
  const filename = url.split('/').pop()?.replace(/-1\.png$/i, '-idle.webp');
  return filename ? `${SUPABASE_OUTFITS_URL}/${filename}` : url;
}

// /assets/outfits/ch-1-1.png → /assets/outfits/ch-1-2.png
function toCelebrateStatic(url: string): string {
  return url.replace(/-1\.png$/i, '-2.png');
}

// /assets/outfits/ch-1-1.png → Supabase: ch-1-celebrate.webp
function toCelebrateAnimated(url: string): string {
  const filename = url.split('/').pop()?.replace(/-1\.png$/i, '-celebrate.webp');
  return filename ? `${SUPABASE_OUTFITS_URL}/${filename}` : url;
}

// Preload both animations for an outfit in the background
function prefetchOutfitAnimations(staticUrl: string) {
  const idle = toIdleAnimated(staticUrl);
  const celebrate = toCelebrateAnimated(staticUrl);
  const img1 = new Image(); img1.src = idle;
  const img2 = new Image(); img2.src = celebrate;
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

  // Track which image variants failed to load so we can fall back
  const [idleAnimFailed, setIdleAnimFailed]         = useState(false);
  const [celebAnimFailed, setCelebrateAnimFailed]   = useState(false);
  const [celebStaticFailed, setCelebrateStaticFailed] = useState(false);
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

  // Reset all error flags when outfit changes
  useEffect(() => {
    if (outfitImage !== prevOutfitRef.current) {
      prevOutfitRef.current = outfitImage;
      setIdleAnimFailed(false);
      setCelebrateAnimFailed(false);
      setCelebrateStaticFailed(false);
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

  // Celebration effect — 2200ms to let the full 2s animation play + 200ms crossfade
  useEffect(() => {
    if (!celebrationTrigger) return;
    if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    setIsCelebrating(false);
    requestAnimationFrame(() => {
      setIsCelebrating(true);
      celebrationTimeout.current = setTimeout(() => setIsCelebrating(false), 2200);
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

  // ── Prefetch Supabase animations when outfit changes ──────────────────────
  useEffect(() => {
    if (!outfitImage) return;
    const staticUrl = resolveLocalAsset(outfitImage, 'character');
    prefetchOutfitAnimations(staticUrl);
  }, [outfitImage]);

  // ── Derive image URLs ──────────────────────────────────────────────────────
  const idleStatic   = resolveLocalAsset(outfitImage || characterImage, 'character');
  // Idle: prefer animated WebP, fall back to static PNG
  const idleSrc = outfitImage && !idleAnimFailed ? toIdleAnimated(idleStatic) : idleStatic;

  // Celebrate: prefer animated WebP → static PNG → nothing
  const celebAnimUrl   = outfitImage && !celebAnimFailed   ? toCelebrateAnimated(idleStatic) : null;
  const celebStaticUrl = outfitImage && !celebStaticFailed ? toCelebrateStatic(idleStatic)   : null;
  const celebSrc       = celebAnimUrl ?? celebStaticUrl;
  const celebIsAnimated = !!celebAnimUrl; // if animated WebP loaded, skip CSS jump

  const showCelebrate = isCelebrating && !!celebSrc;

  return (
    <div className="fixed inset-x-0 top-[88px] bottom-[88px] overflow-hidden">
      {/* OUTGOING CAR */}
      {outgoingCar && carAnimState === 'transitioning' && (
        <div className="absolute bottom-40 left-4 z-10 select-none pointer-events-none animate-car-slide-out">
          <div className="w-[300px] h-[200px] [@media(min-width:420px)]:w-[370px] [@media(min-width:420px)]:h-[247px] [@media(min-width:420px)_and_(min-height:700px)]:w-[420px] [@media(min-width:420px)_and_(min-height:700px)]:h-[280px] [@media(min-width:640px)_and_(min-height:700px)]:w-[480px] [@media(min-width:640px)_and_(min-height:700px)]:h-[320px]">
            <img src={outgoingCar} alt="" className="w-full h-full object-contain" draggable={false} />
          </div>
        </div>
      )}

      {/* CURRENT CAR */}
      {visibleCar && (
        <div
          className={`absolute bottom-40 left-4 z-10 select-none pointer-events-none ${
            carAnimState === 'transitioning' ? 'animate-car-slide-in' : ''
          }`}
          style={carAnimState === 'idle' ? { transform: 'translateX(-10px)' } : undefined}
        >
          <div className="w-[300px] h-[200px] [@media(min-width:420px)]:w-[370px] [@media(min-width:420px)]:h-[247px] [@media(min-width:420px)_and_(min-height:700px)]:w-[420px] [@media(min-width:420px)_and_(min-height:700px)]:h-[280px] [@media(min-width:640px)_and_(min-height:700px)]:w-[480px] [@media(min-width:640px)_and_(min-height:700px)]:h-[320px]">
            <img src={visibleCar} alt="Car" className="w-full h-full object-contain" draggable={false} />
          </div>
        </div>
      )}

      {/* CHARACTER */}
      <div className={`absolute bottom-12 right-0 z-20 w-1/3 flex justify-end pr-2 ${
        charIntroState === 'hidden'   ? 'opacity-0 pointer-events-none' :
        charIntroState === 'entering' ? 'animate-character-intro' : ''
      }`}>
        <div className="select-none translate-x-6 min-[420px]:scale-90 min-[420px]:origin-bottom">
          <div className="relative w-[190px] h-[330px] [@media(min-width:420px)]:w-[230px] [@media(min-width:420px)]:h-[400px] [@media(min-width:420px)_and_(min-height:700px)]:w-72 [@media(min-width:420px)_and_(min-height:700px)]:h-[500px] [@media(min-width:640px)_and_(min-height:700px)]:w-80 [@media(min-width:640px)_and_(min-height:700px)]:h-[550px]">

            {/* IDLE — animated WebP or static PNG */}
            <img
              src={idleSrc}
              alt={characterName}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                showCelebrate ? 'opacity-0' : 'opacity-100'
              }`}
              draggable={false}
              onError={outfitImage && !idleAnimFailed ? () => setIdleAnimFailed(true) : undefined}
              onClick={() => onClickCharacter?.()}
            />

            {/* CELEBRATE — animated WebP (no CSS jump) or static PNG (with CSS jump) */}
            {celebSrc && (
              <img
                key={celebrationTrigger} // restart animation on each new celebration
                src={celebSrc}
                alt=""
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
                  showCelebrate ? 'opacity-100' : 'opacity-0 pointer-events-none'
                } ${showCelebrate && !celebIsAnimated ? 'animate-celebrate-jump' : ''}`}
                draggable={false}
                onError={celebAnimUrl
                  ? () => setCelebrateAnimFailed(true)
                  : celebStaticUrl
                    ? () => setCelebrateStaticFailed(true)
                    : undefined}
                onClick={() => onClickCharacter?.()}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
