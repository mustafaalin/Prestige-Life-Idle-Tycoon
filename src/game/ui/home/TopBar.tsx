import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { autoIncomePerSecond, classProgress, heroAge } from '../../core/formulas';
import { useT } from '../../i18n/useT';
import { useGameV2 } from '../../runtime/useGameV2';
import { onWalletHit } from './coins';

// Top bar over the scene: money (the target collected bottles fly to), auto income, wealth class,
// age and progress to the next class.

export function TopBar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { game } = useGameV2();
  const { t, name, money, perMonth } = useT();
  // Each arriving coin bumps the wallet (the key restarts the animation).
  const [bump, setBump] = useState(0);
  useEffect(() => onWalletHit(() => setBump((count) => count + 1)), []);

  const current = WEALTH_CLASSES[game.classIndex];
  const next = WEALTH_CLASSES[game.classIndex + 1];
  const progress = classProgress(game);

  return (
    <header className="px-3 pt-[calc(var(--safe-top)+8px)]">
      <div className="rounded-[22px] bg-gradient-to-b from-[#2b3f87]/95 to-[#1b2758]/95 border-2 border-white/20 shadow-xl px-2.5 pt-2 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 flex items-center gap-2 rounded-2xl bg-black/25 pl-1.5 pr-3 py-1">
            <img
              key={bump}
              data-wallet-icon
              src="/assets/icons/money.png"
              alt=""
              draggable={false}
              className={`shrink-0 w-11 drop-shadow-md ${bump ? 'v2-bump' : ''}`}
            />
            <div className="min-w-0">
              <p className="v2-display v2-outline text-[26px] leading-none text-white tabular-nums truncate">
                {money(game.cash)}
              </p>
              <p className="v2-display text-[12px] leading-tight text-emerald-300 v2-shadow tabular-nums truncate">
                +{perMonth(autoIncomePerSecond(game))}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border border-white/60 v2-glossy pl-1 pr-2.5 py-0.5">
              <img
                src="/assets/icons/prestige-points.png"
                alt=""
                draggable={false}
                className="w-5 h-5 object-contain"
              />
              <span className="v2-display text-[12px] text-white v2-shadow">{name('wealthClass', current)}</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="rounded-full bg-black/25 px-2.5 py-0.5 v2-display text-[12px] text-sky-100 tabular-nums">
                {t('hud.ageShort', { age: heroAge(game).years })}
              </span>
              <button
                type="button"
                onClick={onOpenSettings}
                aria-label={t('settings.open')}
                className="w-7 h-7 rounded-full bg-black/25 flex items-center justify-center transition-all active:scale-90"
              >
                <Settings className="w-4 h-4 text-sky-100" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-2 h-[18px] rounded-full bg-black/35 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
          <div className="absolute inset-x-1 top-0.5 h-1.5 rounded-full bg-white/25" />
          <p className="absolute inset-0 flex items-center justify-center v2-display text-[11px] text-white v2-shadow">
            {next
              ? t('hud.toNextClass', { percent: Math.floor(progress * 100), name: name('wealthClass', next) })
              : t('hud.topClass')}
          </p>
        </div>
      </div>
    </header>
  );
}
