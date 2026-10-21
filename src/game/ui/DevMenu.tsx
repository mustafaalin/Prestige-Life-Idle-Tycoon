import { X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { BUSINESSES } from '../core/config/businesses';
import { businessImage, levelRevenue } from '../core/formulas';
import { LOCALES, type Locale } from '../i18n/locales';
import { useT } from '../i18n/useT';
import { useBackButton } from '../runtime/backButton';
import { cityPreview, setCityPreview, type City } from '../runtime/city';
import { useGameV2 } from '../runtime/useGameV2';
import { showRewardedAd } from '../runtime/ads';
import { scheduleTestReminder } from '../runtime/notifications';
import { LIFE_MOMENTS, LUXURY_MOMENTS } from '../runtime/story';
import { GrowShow, HireShow } from './businesses/BusinessShow';
import { managerKey, managerPortrait } from './businesses/managers';
import { requestEventCard } from './events/eventScript';
import { levelNameKey } from './home/questText';
import { LOOKS, setLook, useLook } from './look';
import { SceneLab } from './scene/SceneLab';
import { requestFind } from './scene/sceneEvents';
import { requestCeremony, requestLifeMoment, requestMomMessage } from './story/storyEvents';

// Playtest tools. Shown in `npm run dev` and in builds with VITE_DEV_MENU=true.

const SPEEDS = [1, 10, 100];
const CASH_AMOUNTS = [1e3, 1e6, 1e9, 1e12];
const AWAY_SECONDS = [5 * 60, 60 * 60, 3 * 60 * 60];
const AGE_YEARS = [10, 40];
const CEREMONY_CLASSES = [1, 2, 3, 4, 5, 6, 7];
/** The business show plays for a random line; growing shows its second look (level 8). */
const SHOW_LEVEL = 6;

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
  const { t, name, money, duration, locale, setLocale } = useT();
  const [show, setShow] = useState<{ kind: 'grow' | 'hire'; index: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [speed, setSpeed] = useState(actions.dev.getSpeed);
  const [confirmReset, setConfirmReset] = useState(false);
  const [adResult, setAdResult] = useState<string | null>(null);
  const [lab, setLab] = useState(false);
  const look = useLook();

  const changeSpeed = (value: number) => {
    actions.dev.setSpeed(value);
    setSpeed(value);
  };

  const close = () => {
    setOpen(false);
    setConfirmReset(false);
  };

  useBackButton(open, 200, close);

  if (lab) return <SceneLab onClose={() => setLab(false)} />;

  const showDef = show ? BUSINESSES[show.index] : null;
  const showManager = showDef ? t(managerKey(showDef.id, 'name')) : '';
  const preview =
    show && showDef ? (
      show.kind === 'grow' ? (
        <GrowShow
          fromImage={businessImage(showDef, SHOW_LEVEL - 1)}
          toImage={businessImage(showDef, SHOW_LEVEL)}
          levelName={t(levelNameKey(showDef.id, SHOW_LEVEL))}
          growing={t('business.growing', { business: name('business', showDef) })}
          title={t('business.grown', { business: name('business', showDef) })}
          fromRun={levelRevenue(showDef, SHOW_LEVEL - 1)}
          toRun={levelRevenue(showDef, SHOW_LEVEL)}
          actionLabel={t('business.grownOk')}
          onClose={() => setShow(null)}
        />
      ) : (
        <HireShow
          portrait={managerPortrait(showDef.id)}
          name={showManager}
          line={t(managerKey(showDef.id, 'hire'))}
          note={t('business.managerJoined', { name: showManager, business: name('business', showDef) })}
          stamp={t('business.auto')}
          actionLabel={t('business.welcome')}
          onClose={() => setShow(null)}
        />
      )
    ) : null;
  const playShow = (kind: 'grow' | 'hire') => {
    close();
    setShow({ kind, index: Math.floor(Math.random() * BUSINESSES.length) });
  };

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 top-[calc(var(--safe-top)+1px)] z-[200] rounded-full bg-slate-900/80 text-white px-3 py-1.5 text-[10px] font-black transition-all active:scale-90"
        >
          {t('dev.open')}
          {speed !== 1 && ` ×${speed}`}
        </button>
        {preview}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/35 flex items-end" onClick={close}>
      <div
        className="w-full max-h-[calc(100dvh-var(--safe-top)-16px)] bg-white rounded-t-[28px] shadow-2xl pt-3 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 mx-5 flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xl font-black text-slate-900">{t('dev.title')}</h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('common.close')}
            className="relative v2-hit p-1.5 rounded-full hover:bg-slate-900/10 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* The list is longer than a phone screen: it scrolls, the title and Close stay put. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-[calc(var(--safe-bottom)+20px)] flex flex-col gap-4">
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

          <Row label={t('dev.city')}>
            {([null, 'old', 'lumen'] as (City | null)[]).map((value) => (
              <Chip
                key={value ?? 'real'}
                active={cityPreview() === value}
                // The next tick (runtime/store.ts commit) puts the city on screen.
                onClick={() => setCityPreview(value)}
              >
                {t(`dev.cities.${value ?? 'real'}`)}
              </Chip>
            ))}
          </Row>

          <Row label={t('dev.look')}>
            {LOOKS.map((value) => (
              <Chip key={value} active={look === value} onClick={() => setLook(value)}>
                {t(`dev.looks.${value}`)}
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
              requestEventCard();
            }}
            className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('dev.event')}
          </button>

          <Row label={t('dev.ceremony')}>
            {CEREMONY_CLASSES.map((classIndex) => (
              <Chip
                key={classIndex}
                onClick={() => {
                  close();
                  requestCeremony(classIndex);
                }}
              >
                {classIndex}
              </Chip>
            ))}
            <Chip
              onClick={() => {
                close();
                requestMomMessage();
              }}
            >
              {t('dev.mom')}
            </Chip>
            <Chip
              onClick={() =>
                void scheduleTestReminder({ title: t('mom.from'), body: t('mom.stair') }, t('notify.channel'))
              }
            >
              {t('dev.notifyTest')}
            </Chip>
          </Row>

          <Row label={t('dev.businessShow')}>
            <Chip onClick={() => playShow('grow')}>{t('dev.showGrow')}</Chip>
            <Chip onClick={() => playShow('hire')}>{t('dev.showHire')}</Chip>
          </Row>

          <Row label={t('dev.life')}>
            {LIFE_MOMENTS.map((moment) => (
              <Chip
                key={moment.id}
                onClick={() => {
                  close();
                  requestLifeMoment(moment.id);
                }}
              >
                {moment.age}
              </Chip>
            ))}
            {LUXURY_MOMENTS.map((moment) => (
              <Chip
                key={moment.id}
                onClick={() => {
                  close();
                  requestLifeMoment(moment.id);
                }}
              >
                {moment.id}
              </Chip>
            ))}
          </Row>

          <button
            type="button"
            onClick={() => {
              close();
              setLab(true);
            }}
            className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('dev.sceneLab')}
          </button>

          <button
            type="button"
            onClick={() => {
              actions.dev.dailyAgain();
              close();
            }}
            className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('dev.daily')}
          </button>

          <button
            type="button"
            onClick={() => {
              actions.dev.investNow();
              close();
            }}
            className="rounded-2xl py-3.5 font-black text-sm bg-slate-100 text-slate-600 transition-all active:scale-[0.98]"
          >
            {t('dev.investNow')}
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
    </div>
  );
}
