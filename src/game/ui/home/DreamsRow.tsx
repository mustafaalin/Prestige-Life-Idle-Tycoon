import { Lock } from 'lucide-react';
import {
  lifestyleLocked,
  moveUpNeedsVehicle,
  homeNeedsCareer,
  nextHome,
  nextLifestyle,
  ownsHouse,
} from '../../core/state';
import { canCollect } from '../../core/formulas';
import type { GameStateV2, LifestyleKind } from '../../core/types';
import { useT } from '../../i18n/useT';
import { haptic, playSfx } from '../../runtime/feedback';
import { useGameV2 } from '../../runtime/useGameV2';
import type { FocusTarget, ShopTabId } from './focus';

// The dreams board (plan 1.8): the next home, vehicle and outfit sit in a row on top of the bottom
// menu, each with how close the wallet is ("62%"). The scene owns the middle of the screen, so the
// row lives with the menu. Tapping a dream opens the shop on it. When a kind has nothing left, the
// next luxury takes its place.

interface Dream {
  kind: ShopTabId;
  image: string;
  price: number;
  /** Something other than money stands in the way (a vehicle to buy first, a class to reach). */
  locked: boolean;
}

function dreamsOf(game: GameStateV2): Dream[] {
  const dreams: Dream[] = [];
  const home = nextHome(game);
  if (home) {
    const owned = ownsHouse(game, home.id);
    dreams.push({
      kind: 'house',
      image: home.image,
      price: owned ? 0 : home.moveInCost,
      locked: !owned && (moveUpNeedsVehicle(game) !== null || homeNeedsCareer(game, home).length > 0),
    });
  }
  const kinds: LifestyleKind[] = ['vehicle', 'outfit', 'toy'];
  for (const kind of kinds) {
    if (dreams.length >= 3) break;
    const item = nextLifestyle(game, kind);
    if (item) dreams.push({ kind, image: item.image, price: item.cost, locked: lifestyleLocked(game, item) });
  }
  return dreams;
}

export function DreamsRow({ onGo }: { onGo: (target: FocusTarget) => void }) {
  const { game } = useGameV2();
  const dreams = dreamsOf(game);
  if (dreams.length === 0) return null;
  // On short screens the taller menu would cover the lowest bottles; the board waits there until the
  // ground is empty (Middle Class).
  return (
    <div className={`flex gap-2 mb-6 ${canCollect(game) ? '[@media(max-height:699px)]:hidden' : ''}`}>
      {dreams.map((dream) => (
        <DreamChip
          key={dream.kind}
          dream={dream}
          cash={game.cash}
          onGo={() => onGo({ tab: 'shop', shopTab: dream.kind, key: `shop:${dream.kind}:next` })}
        />
      ))}
    </div>
  );
}

function DreamChip({ dream, cash, onGo }: { dream: Dream; cash: number; onGo: () => void }) {
  const { t } = useT();
  const progress = dream.price <= 0 ? 1 : Math.min(1, cash / dream.price);
  const ready = progress >= 1 && !dream.locked;
  // Never "100%" before it can really be bought.
  const percent = ready ? 100 : Math.min(99, Math.floor(progress * 100));

  return (
    <button
      type="button"
      onClick={() => {
        playSfx('click');
        haptic('light');
        onGo();
      }}
      aria-label={t(`shop.${dream.kind}`)}
      className={`relative flex-1 min-w-0 h-11 rounded-2xl border-2 flex items-center gap-1 pl-1 pr-2 transition-all active:scale-95 ${
        ready
          ? 'border-white/80 bg-gradient-to-b from-emerald-400 to-green-600 v2-glossy'
          : 'border-white/20 bg-white/10'
      }`}
    >
      {dream.kind === 'house' ? (
        // Homes are wide scene pictures: a small framed photo instead of a cut-out.
        <img
          src={dream.image}
          alt=""
          draggable={false}
          className={`shrink-0 w-11 h-9 -mt-2 rounded-lg object-cover border-2 border-white shadow-md ${ready ? 'v2-bob' : ''} ${
            dream.locked ? 'grayscale opacity-60' : ''
          }`}
        />
      ) : (
        <img
          src={dream.image}
          alt=""
          draggable={false}
          className={`shrink-0 w-12 h-12 -mt-3 object-contain drop-shadow-lg ${ready ? 'v2-bob' : ''} ${
            dream.locked ? 'grayscale opacity-60' : ''
          }`}
        />
      )}
      <span className="flex-1 min-w-0 flex flex-col items-stretch gap-0.5">
        <span className="flex items-center justify-end gap-0.5 v2-display text-[14px] leading-none text-white v2-shadow tabular-nums">
          {dream.locked && <Lock className="w-3 h-3" strokeWidth={3} />}
          {ready ? t('dreams.buy') : t('dreams.percent', { percent })}
        </span>
        {!ready && (
          <span className="h-1.5 rounded-full bg-black/25 overflow-hidden">
            <span
              className={`block h-full rounded-full bg-gradient-to-r ${
                dream.locked ? 'from-slate-300 to-slate-400' : 'from-amber-300 to-orange-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </span>
        )}
      </span>
    </button>
  );
}
