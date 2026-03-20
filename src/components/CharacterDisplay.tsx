import { resolveLocalAsset } from '../lib/localAssets';

interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  carImage?: string;
  outfitImage?: string;
  onClickCharacter: () => number | undefined;
}

export function CharacterDisplay({
  characterImage,
  characterName,
  carImage,
  outfitImage,
  onClickCharacter,
}: CharacterDisplayProps) {
  // Use outfit image if available, otherwise use character image
  const displayImage = resolveLocalAsset(outfitImage || characterImage, 'character');
  const displayCarImage = carImage ? resolveLocalAsset(carImage, 'car') : null;
  return (
    // Eğer header yoksa: top-0 yap
    <div className="fixed inset-x-0 top-[88px] bottom-[88px] overflow-hidden">
      {/* CAR (left side) */}
      {displayCarImage && (
        <div
          className="absolute bottom-40 left-4 z-10 select-none pointer-events-none"
          style={{ transform: 'translateX(-10px)' }}
        >
          <div className="w-[420px] h-[280px] sm:w-[480px] sm:h-[320px] opacity-95">
            <img
              src={displayCarImage}
              alt="Car"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* CHARACTER (right 1/3 column) */}
      <div className="absolute bottom-12 right-0 z-20 w-1/3 flex justify-end pr-2">
        <div className="select-none transform origin-bottom scale-90 translate-x-6">
          <div className="relative w-72 h-[500px] sm:w-80 sm:h-[550px]">
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
