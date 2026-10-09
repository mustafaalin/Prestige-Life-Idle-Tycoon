import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WEALTH_CLASSES } from '../../core/config/classes';
import { OFFLINE_CAP_HOURS_BY_CLASS } from '../../core/config/economy';
import { useT } from '../../i18n/useT';
import { useBackButton } from '../../runtime/backButton';
import { haptic, playSfx } from '../../runtime/feedback';
import { GameButton } from '../kit';
import { CEREMONIES, CEREMONY_IMAGES, portraitOf, type CastId, type CeremonyLine } from './ceremonyScript';

// Class-up ceremony (plan 1.10): "new class" title with confetti → story beats (portrait + bubble,
// visual-novel style; hero on the right, everyone else on the left) → before/now card. Tap to go
// on; Skip jumps to the before/now card. The store stops the clock while it plays.

const TAP_GUARD_MS = 350;
const FADE_MS = 500;

const TAG_STYLE: Record<CastId, string> = {
  hero: 'from-violet-500 to-indigo-500',
  mom: 'from-amber-400 to-orange-400',
  riza: 'from-emerald-500 to-teal-500',
  bryce: 'from-rose-500 to-rose-600',
  staff: 'from-slate-500 to-slate-600',
  nevin: 'from-sky-500 to-cyan-500',
  defne: 'from-pink-500 to-rose-400',
};

const CONFETTI_COLORS = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#fb7185'];

type Phase = 'title' | 'story' | 'summary';

function Confetti() {
  // Fixed per mount, so pieces don't jump on re-render.
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        size: 6 + Math.random() * 6,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        drift: (Math.random() - 0.5) * 120,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece, index) => (
        <span
          key={index}
          className="v2-confetti absolute top-0 rounded-[2px]"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            background: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ['--drift' as string]: `${piece.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export function Ceremony({ classIndex, onDone }: { classIndex: number; onDone: (skipped: boolean) => void }) {
  const { t, name, money, duration } = useT();
  const shots = CEREMONIES[classIndex] ?? [];
  const [phase, setPhase] = useState<Phase>('title');
  const [shotIndex, setShotIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const lastStep = useRef(Date.now());

  const reached = WEALTH_CLASSES[classIndex];
  const before = WEALTH_CLASSES[classIndex - 1];
  const next = WEALTH_CLASSES[classIndex + 1];
  const capBefore = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex - 1, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];
  const capNow = OFFLINE_CAP_HOURS_BY_CLASS[Math.min(classIndex, OFFLINE_CAP_HOURS_BY_CLASS.length - 1)];

  useEffect(() => {
    for (const src of CEREMONY_IMAGES) new Image().src = src;
    playSfx('levelUp');
    haptic('medium');
  }, []);

  const toSummary = (bySkip: boolean) => {
    if (bySkip) setSkipped(true);
    setPhase('summary');
    playSfx('purchase');
  };

  const advance = () => {
    const now = Date.now();
    if (phase === 'summary' || now - lastStep.current < TAP_GUARD_MS) return;
    lastStep.current = now;
    if (phase === 'title') {
      if (shots.length > 0) setPhase('story');
      else toSummary(false);
      return;
    }
    const shot = shots[shotIndex];
    if (lineIndex + 1 < shot.lines.length) {
      setLineIndex(lineIndex + 1);
    } else if (shotIndex + 1 < shots.length) {
      setShotIndex(shotIndex + 1);
      setLineIndex(0);
    } else {
      toSummary(false);
    }
  };

  useBackButton(true, 200, () => (phase === 'summary' ? onDone(skipped) : toSummary(true)));

  const shot = shots[shotIndex];
  const line: CeremonyLine | undefined = phase === 'story' ? shot?.lines[lineIndex] : undefined;
  const lineDelay = lineIndex === 0 && shotIndex > 0 ? `${FADE_MS * 0.7}ms` : '0ms';

  return (
    <div className="fixed inset-0 z-[200] select-none" onClick={advance}>
      {/* Beats without a picture play over the player's own scene, dimmed. */}
      <div className="absolute inset-0 bg-[#140d2b]/55 backdrop-blur-[2px]" />
      <div className="relative h-full w-full max-w-[56.25dvh] mx-auto overflow-hidden">
        {/* Warm sunburst for the title and the before/now card. */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-amber-300 via-orange-400 to-rose-500 transition-opacity ease-in-out"
          style={{ opacity: phase === 'story' ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
        >
          <div className="v2-rays absolute left-1/2 top-[38%] w-[220%] aspect-square opacity-60" />
        </div>

        {shots.map((item, index) =>
          item.image ? (
            <div
              key={index}
              className="absolute inset-0 transition-opacity ease-in-out bg-[#2a1a0e]"
              style={{
                opacity: phase === 'story' && index === shotIndex ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
              }}
            >
              {item.image.fit === 'contain' && (
                <img src={item.image.src} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60" />
              )}
              <img
                src={item.image.src}
                alt=""
                draggable={false}
                className={`absolute inset-0 w-full h-full ${
                  item.image.fit === 'cover' ? 'object-cover' : 'object-contain -translate-y-[12%]'
                } ${phase === 'story' && index <= shotIndex ? 'v2-panel-zoom' : ''}`}
              />
            </div>
          ) : null,
        )}

        {phase === 'title' && (
          <>
            <Confetti />
            <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center">
              <span className="v2-pop-in rounded-full bg-white/90 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-orange-600 shadow">
                {t('ceremony.newClass')}
              </span>
              <h1
                className="v2-pop-in v2-display v2-outline text-[44px] leading-[1.05] text-white mt-3"
                style={{ animationDelay: '150ms' }}
              >
                {name('wealthClass', reached)}
              </h1>
            </div>
            <p className="absolute inset-x-0 bottom-[calc(var(--safe-bottom)+40px)] text-center text-sm font-black text-white/90 v2-shadow v2-bob">
              {t('ceremony.tap')}
            </p>
          </>
        )}

        {line && (line.speaker ? <Dialogue key={`${shotIndex}-${lineIndex}`} line={line} delay={lineDelay} /> : (
          <p
            key={`${shotIndex}-${lineIndex}`}
            className="v2-line-in absolute inset-x-0 bottom-[calc(var(--safe-bottom)+72px)] px-8 text-center text-xl font-black italic leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
            style={{ animationDelay: lineDelay }}
          >
            {t(line.text)}
          </p>
        ))}

        {phase !== 'summary' && (
          <div className="absolute inset-x-0 top-0 flex justify-end px-4 pt-[calc(var(--safe-top)+12px)]">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toSummary(true);
              }}
              className="rounded-full bg-black/35 px-4 py-1.5 text-[11px] font-black text-white transition-all active:scale-90"
            >
              {t('ceremony.skip')}
            </button>
          </div>
        )}

        {phase === 'summary' && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center px-6">
            <Confetti />
            <div className="v2-pop-in relative w-full max-w-[340px] rounded-[28px] bg-white shadow-2xl overflow-hidden text-center">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3">
                <h2 className="v2-display v2-outline-thin text-2xl text-white">{name('wealthClass', reached)}</h2>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 rounded-2xl bg-slate-100 px-2 py-2.5">
                    <img src={portraitOf('hero', 'worried') ?? ''} alt="" className="mx-auto mb-1 w-14 h-14 rounded-full object-cover border-2 border-white grayscale-[40%]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('ceremony.before')}</p>
                    <p className="text-sm font-black text-slate-500 mt-0.5">{before ? name('wealthClass', before) : ''}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 self-center text-slate-300 shrink-0" />
                  <div className="flex-1 rounded-2xl bg-amber-100 px-2 py-2.5">
                    <img src={portraitOf('hero', 'happy') ?? ''} alt="" className="mx-auto mb-1 w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{t('ceremony.now')}</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{name('wealthClass', reached)}</p>
                  </div>
                </div>

                {capNow !== capBefore && (
                  <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-[11px] font-black text-slate-500">{t('ceremony.offlineCap')}</span>
                    <span className="text-sm font-black text-slate-900">
                      {duration(capBefore * 3600)} → <span className="text-emerald-500">{duration(capNow * 3600)}</span>
                    </span>
                  </div>
                )}

                <p className="text-[11px] font-semibold text-slate-500 mt-3">
                  {next
                    ? t('ceremony.nextGoal', { name: name('wealthClass', next), amount: money(next.threshold) })
                    : t('ceremony.top')}
                </p>

                <GameButton
                  tone="buy"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDone(skipped);
                  }}
                  className="w-full mt-4 py-3 v2-display text-lg v2-shadow"
                >
                  {t('ceremony.done')}
                </GameButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** One spoken line: the speaker's portrait sits on the bubble's top edge, hero right, others left. */
function Dialogue({ line, delay }: { line: Extract<CeremonyLine, { speaker: CastId }>; delay: string }) {
  const { t } = useT();
  const portrait = portraitOf(line.speaker, line.face);
  const right = line.speaker === 'hero';
  const label = line.speaker === 'hero' || line.speaker === 'mom'
    ? t(`prologue.speaker.${line.speaker}`)
    : t(`ceremony.cast.${line.speaker}`);

  return (
    <div
      className="v2-line-in absolute inset-x-4 bottom-[calc(var(--safe-bottom)+24px)]"
      style={{ animationDelay: delay }}
    >
      {portrait && (
        <img
          src={portrait}
          alt=""
          draggable={false}
          className={`absolute -top-[104px] ${right ? 'right-3' : 'left-3'} w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl bg-slate-200`}
        />
      )}
      <div className="relative bg-white rounded-[22px] shadow-2xl px-4 pt-6 pb-2.5 min-h-[96px]">
        <span
          className={`absolute -top-3 ${right ? 'right-[136px]' : portrait ? 'left-[136px]' : 'left-4'} flex items-center gap-1 rounded-full bg-gradient-to-r ${TAG_STYLE[line.speaker]} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow`}
        >
          {line.phone && <Phone className="w-3 h-3" />}
          {label}
        </span>
        <p className="text-[16px] font-bold leading-snug text-slate-800">{t(line.text)}</p>
        <p className="mt-1 flex items-center justify-end text-[10px] font-black text-slate-400">
          {t('ceremony.next')}
          <ChevronRight className="w-3.5 h-3.5" />
        </p>
      </div>
    </div>
  );
}
