import { X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { LOCALES, type Locale } from '../i18n/locales';
import { useT } from '../i18n/useT';
import { useBackButton } from '../runtime/backButton';
import { useGameV2 } from '../runtime/useGameV2';
import { showRewardedAd } from '../runtime/ads';
import { requestFind } from './scene/sceneEvents';

// Playtest tools. Shown in `npm run dev` and in builds with VITE_DEV_MENU=true.

const SPEEDS = [1, 10, 100];
const CASH_AMOUNTS = [1e3, 1e6, 1e9, 1e12];
const AWAY_SECONDS = [5 * 60, 60 * 60, 3 * 60 * 60];
const AGE_YEARS = [10, 40];

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-[11px] font-black transition-all active:scale-95 ${
        active ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function DevMenu({ onReplayPrologue }: { onReplayPrologue: () => void }) {
  const { actions } = useGameV2();
  const { t, money, duration, locale, setLocale } = useT();
  const [open, setOpen] = useState(false);
  const [speed, setSpeed] = useState(actions.dev.getSpeed);
  const [confirmReset, setConfirmReset] = useState(false);
  const [adResult, setAdResult] = useState<string | null>(null);

  const changeSpeed = (value: number) => {
    actions.dev.setSpeed(value);
    setSpeed(value);
  };

  const close = () => {
    setOpen(false);
    setConfirmReset(false);
  };

  useBackButton(open, 200, close);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-1/2 -translate-x-1/2 top-[calc(var(--safe-top)+1px)] z-[200] rounded-full bg-slate-900/80 text-white px-3 py-1.5 text-[10px] font-black transition-all active:scale-90"
      >
        {t('dev.open')}
        {speed !== 1 && ` ×${speed}`}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/35 flex items-end" onClick={close}>
      <div
        className="w-full bg-white rounded-t-[28px] shadow-2xl px-5 pt-3 pb-[calc(var(--safe-bottom)+20px)] flex flex-col gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xl font-black text-slate-900">{t('dev.title')}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('common.close')}
            className="p-1.5 rounded-full hover:bg-slate-900/10 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <Row label={t('dev.speed')}>
          {SPEEDS.map((value) => (
            <Chip key={value} active={speed === value} onClick={() => changeSpeed(value)}>
              ×{value}
            </Chip>
          ))}
        </Row>

        <Row label={t('dev.addCash')}>
          {CASH_AMOUNTS.map((amount) => (
            <Chip key={amount} onClick={() => actions.dev.addCash(amount)}>
              +{money(amount)}
            </Chip>
          ))}
        </Row>

        <Row label={t('dev.away')}>
          {AWAY_SECONDS.map((seconds) => (
            <Chip
              key={seconds}
              onClick={() => {
                actions.dev.awayFor(seconds);
                close();
              }}
            >
              {duration(seconds)}
            </Chip>
          ))}
        </Row>

        <Row label={t('dev.age')}>
          {AGE_YEARS.map((years) => (
            <Chip key={years} onClick={() => actions.dev.age(years)}>
              {t('dev.years', { count: years })}
            </Chip>
          ))}
        </Row>

        <Row label={t('dev.language')}>
          {(Object.keys(LOCALES) as Locale[]).map((code) => (
            <Chip key={code} active={locale === code} onClick={() => setLocale(code)}>
              {LOCALES[code].nativeName}
            </Chip>
          ))}
        </Row>

        <button
          type="button"
          onClick={async () => {
            setAdResult(null);
            setAdResult(await showRewardedAd('dev_test'));
          }}
          className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
        >
          {adResult ? t('dev.adResult', { result: adResult }) : t('dev.testAd')}
        </button>

        <button
          type="button"
          onClick={() => {
            close();
            requestFind();
          }}
          className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
        >
          {t('dev.find')}
        </button>

        <button
          type="button"
          onClick={() => {
            close();
            onReplayPrologue();
          }}
          className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
        >
          {t('dev.prologue')}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              return;
            }
            actions.dev.reset();
            close();
          }}
          className="rounded-2xl py-3.5 font-black text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg transition-all active:scale-[0.98]"
        >
          {confirmReset ? t('dev.resetConfirm') : t('dev.reset')}
        </button>
      </div>
    </div>
  );
}
