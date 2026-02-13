interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  onClickCharacter: () => number | undefined;
}

export function CharacterDisplay({
  characterImage,
  characterName,
}: CharacterDisplayProps) {
  return (
    <div className="relative w-full h-full flex items-end justify-start overflow-hidden pb-20 pl-8">
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative select-none">
          <div className="relative w-56 h-96 sm:w-64 sm:h-[450px] overflow-hidden">
            <img
              src={characterImage}
              alt={characterName}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>

          <div
            className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white px-8 py-3 rounded-full font-black text-lg border-4 border-white backdrop-blur-sm"
            style={{
              boxShadow: '0 10px 30px rgba(20, 184, 166, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.2)'
            }}
          >
            {characterName}
          </div>
        </div>
      </div>
    </div>
  );
}
