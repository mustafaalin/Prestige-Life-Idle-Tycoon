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
    <div className="relative w-full h-full flex items-end justify-start overflow-hidden pb-4 pl-8">
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative select-none">
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
