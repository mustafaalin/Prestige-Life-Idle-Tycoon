import { WEALTH_CLASSES } from '../core/config/classes';
import { incomePerSecond, tapValue } from '../core/formulas';
import { useT } from '../i18n/useT';
import { useGameV2 } from '../runtime/useGameV2';

// Temporary home screen so v2 is playable from day one: money, income, class progress, tapping and
// the offline claim. Replaced piece by piece by the HUD (1.7), screens (1.3–1.5) and offline modal (1.13).

export function HomeShell() {
  const { game, state, actions } = useGameV2();
  const { t, name, money, duration } = useT();

  const current = WEALTH_CLASSES[game.classIndex];
  const next = WEALTH_CLASSES[game.classIndex + 1];
  const classProgress = next
    ? Math.min(1, (game.generationEarnings - current.threshold) / (next.threshold - current.threshold))
    : 1;

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <section className="bg-white rounded-[22px] shadow-lg p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{name('wealthClass', current)}</p>
        <p className="text-4xl font-black text-slate-900 tabular-nums mt-1">{money(game.cash)}</p>
        <p className="text-sm font-bold text-emerald-500 tabular-nums">
          {t('hud.perSecond', { amount: money(incomePerSecond(game, 'active')) })}
        </p>
        <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${classProgress * 100}%` }}
          />
        </div>
        <p className="text-[11px] font-semibold text-slate-500 mt-1.5">
          {next
            ? t('hud.toNextClass', { percent: Math.floor(classProgress * 100), name: name('wealthClass', next) })
            : t('hud.topClass')}
        </p>
      </section>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <button
          type="button"
          onClick={actions.tap}
          className="w-44 h-44 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-2xl flex flex-col items-center justify-center transition-all active:scale-95"
        >
          <span className="text-lg font-black">{t('tap.button')}</span>
          <span className="text-sm font-bold opacity-90 tabular-nums">+{money(tapValue(game))}</span>
        </button>
        <p className="text-[11px] font-semibold text-slate-500 text-center max-w-[240px]">{t('placeholder.body')}</p>
      </div>

      {state.offline && (
        <div className="fixed inset-0 z-[60] bg-black/35 flex items-end">
          <div className="w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+20px)] text-center">
            <h2 className="text-xl font-black text-slate-900">{t('offline.title')}</h2>
            <p className="text-sm font-bold text-slate-600 mt-1">
              {t('offline.body', { duration: duration(state.offline.awaySeconds) })}
            </p>
            <p className="text-3xl font-black text-emerald-500 tabular-nums my-4">{money(state.offline.amount)}</p>
            <button
              type="button"
              onClick={() => actions.claimOffline()}
              className="w-full rounded-2xl py-3.5 font-black text-sm text-white bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg transition-all active:scale-[0.98]"
            >
              {t('common.collect')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
