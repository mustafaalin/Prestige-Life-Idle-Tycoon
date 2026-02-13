import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';

interface CharacterDisplayProps {
  characterImage: string;
  characterName: string;
  houseImage?: string;
  onClickCharacter: () => number | undefined;
}

interface FloatingMoney {
  id: number;
  amount: number;
  x: number;
  y: number;
}

export function CharacterDisplay({
  characterImage,
  characterName,
  houseImage,
  onClickCharacter,
}: CharacterDisplayProps) {
  const [floatingMoneys, setFloatingMoneys] = useState<FloatingMoney[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const amount = onClickCharacter();
    if (amount === undefined) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFloatingMoney: FloatingMoney = {
      id: Date.now() + Math.random(),
      amount,
      x,
      y,
    };

    setFloatingMoneys((prev) => [...prev, newFloatingMoney]);
    setClickCount(prev => prev + 1);

    setTimeout(() => {
      setFloatingMoneys((prev) => prev.filter((m) => m.id !== newFloatingMoney.id));
    }, 1000);

    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
  };

  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  return (
    <div className="relative w-full h-full flex items-end justify-start overflow-hidden pb-20 pl-8">
      {houseImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${houseImage})` }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center">
        {clickCount > 5 && (
          <div
            className="absolute -top-32 bg-gradient-to-r from-lime-400 to-cyan-500 text-white px-6 py-3 rounded-full font-black text-lg animate-bounce border-4 border-white shadow-2xl"
            style={{
              boxShadow: '0 10px 40px rgba(163, 230, 53, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.3)'
            }}
          >
            Combo x{clickCount}!
          </div>
        )}

        <div
          onClick={handleClick}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          className={`
            relative cursor-pointer select-none transition-all duration-150
            ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
          `}
          style={{
            filter: isPressed ? 'brightness(1.2)' : 'brightness(1)',
          }}
        >
          <div
            className="relative w-56 h-96 sm:w-64 sm:h-[450px] overflow-hidden border-4 border-white/50 bg-gradient-to-br from-cyan-100/20 via-teal-100/20 to-emerald-100/20 backdrop-blur-sm rounded-3xl"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 4px 12px rgba(255, 255, 255, 0.2), 0 0 40px rgba(20, 184, 166, 0.3)'
            }}
          >
            <img
              src={characterImage}
              alt={characterName}
              className="w-full h-full object-cover"
              draggable={false}
            />

            {isPressed && (
              <div className="absolute inset-0 bg-gradient-to-r from-lime-400/50 to-cyan-400/50 animate-ping" />
            )}
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

      {floatingMoneys.map((money) => (
        <div
          key={money.id}
          className="absolute pointer-events-none z-20 animate-float-up"
          style={{
            left: money.x,
            top: money.y,
            animation: 'floatUp 1s ease-out forwards',
          }}
        >
          <div
            className="flex items-center gap-1 bg-gradient-to-r from-lime-400 to-emerald-500 text-white px-4 py-2 rounded-full font-black shadow-2xl border-2 border-white"
            style={{
              boxShadow: '0 8px 24px rgba(163, 230, 53, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
            }}
          >
            <DollarSign className="w-5 h-5" strokeWidth={3} />
            +{money.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
