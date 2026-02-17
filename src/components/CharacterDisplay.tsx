interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  carImage?: string;
  onClickCharacter: () => number | undefined;
}

export function CharacterDisplay({
  characterImage,
  characterName,
  carImage,
  onClickCharacter,
}: CharacterDisplayProps) {
  return (
    // Eğer header yoksa: top-0 yap
    <div className="fixed inset-x-0 top-[88px] bottom-[88px] overflow-hidden">
      {/* CAR (left side) */}
      {carImage && (
        <div
          className="absolute bottom-18 left-4 z-10 select-none pointer-events-none"
          style={{ transform: 'translateX(-10px)' }}
        >
          <div className="w-[420px] h-[280px] sm:w-[480px] sm:h-[320px] opacity-95">
            <img
              src={carImage}
              alt="Car"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* CHARACTER (right 1/3 column) */}
      <div className="absolute bottom-8 right-0 z-20 w-1/3 flex justify-end pr-2">
        <div className="select-none transform origin-bottom scale-75 translate-x-6">
          <div className="relative w-72 h-[500px] sm:w-80 sm:h-[550px]">
            <img
              src={characterImage}
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