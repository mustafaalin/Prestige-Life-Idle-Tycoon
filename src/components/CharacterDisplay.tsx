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
}: CharacterDisplayProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* CAR (left side, fixed) */}
      {carImage && (
        <div
          className="absolute bottom-0 left-4 z-5 select-none pointer-events-none"
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

      {/* CHARACTER (right 1/3 column, scaled down, moved down) */}
      <div className="absolute bottom-0 right-0 z-10 w-1/3 flex justify-end pr-2 pointer-events-none">
        <div className="select-none transform origin-bottom scale-75 translate-y-10">
          <div className="relative w-72 h-[500px] sm:w-80 sm:h-[550px] overflow-hidden">
            <img
              src={characterImage}
              alt={characterName}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}