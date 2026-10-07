import { bestOwnedLifestyle } from '../../core/state';
import type { GameStateV2 } from '../../core/types';

// Temporary mini scene so a purchase visibly changes your life right away.
// Replaced by the real scene system in 1.6 (shared ground line, real vehicle scale, shadows).

export function ScenePreview({ game }: { game: GameStateV2 }) {
  const house = bestOwnedLifestyle(game, 'house');
  const vehicle = bestOwnedLifestyle(game, 'vehicle');
  const outfit = bestOwnedLifestyle(game, 'outfit');

  return (
    <div className="relative h-48 rounded-[22px] overflow-hidden shadow-lg bg-slate-200">
      {house && (
        <img
          src={house.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          draggable={false}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      {vehicle && (
        <img
          src={vehicle.image}
          alt=""
          className="absolute bottom-2 right-3 w-28 h-20 object-contain object-bottom drop-shadow-lg"
          draggable={false}
        />
      )}
      {outfit && (
        <img
          src={outfit.image}
          alt=""
          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-40 object-contain drop-shadow-lg"
          draggable={false}
        />
      )}
    </div>
  );
}
