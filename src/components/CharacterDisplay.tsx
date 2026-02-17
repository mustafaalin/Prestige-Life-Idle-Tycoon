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
    <div className="relative w-full h-full flex items-end justify-start overflow-hidden pb-4 pl-8">
      {carImage && (
        <div className="absolute bottom-0 left-4 z-5 select-none pointer-events-none" style={{ transform: 'translateX(-10px)' }}>
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
      <div className="relative z-10 flex flex-col items-center">
  <div className="relative select-none transform origin-bottom scale-75 translate-x-10 translate-y-4">
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
