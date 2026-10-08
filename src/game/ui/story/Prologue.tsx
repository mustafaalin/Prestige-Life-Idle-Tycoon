import { ChevronRight, Phone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../i18n/useT';
import { useCoverFit } from '../scene/coverFit';
import { PROLOGUE, type Speaker } from './prologueScript';

// The opening story (plan 1.18): full-screen comic panels with a slow camera push, one line at a time.
// The speech bubble sits above the speakers' heads with its tail pointing at whoever talks.
// Tap anywhere to continue; Skip ends it. Panels cross-fade; the end fades to black, then onDone.

const FADE_MS = 700;
/** Ignores a second tap right after a line changes, so a double tap does not skip a line unread. */
const TAP_GUARD_MS = 350;
const BUBBLE_MAX_WIDTH = 300;
const EDGE = 16;
const TAIL = 10;

const TAG_STYLE: Record<Speaker, string> = {
  hero: 'from-violet-500 to-indigo-500',
  mom: 'from-amber-400 to-orange-400',
  boss: 'from-rose-500 to-rose-600',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function Prologue({ onDone }: { onDone: () => void }) {
  const { t } = useT();
  const [panelIndex, setPanelIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [ending, setEnding] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const stage = useCoverFit(stageRef);
  const lastStep = useRef(0);

  useEffect(() => {
    for (const panel of PROLOGUE) new Image().src = panel.image;
  }, []);

  useEffect(() => {
    if (!ending) return;
    const timer = window.setTimeout(onDone, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [ending, onDone]);

  const panel = PROLOGUE[panelIndex];
  const line = panel.lines[lineIndex];

  const advance = () => {
    const now = Date.now();
    if (ending || now - lastStep.current < TAP_GUARD_MS) return;
    lastStep.current = now;
    if (lineIndex + 1 < panel.lines.length) {
      setLineIndex(lineIndex + 1);
    } else if (panelIndex + 1 < PROLOGUE.length) {
      setPanelIndex(panelIndex + 1);
      setLineIndex(0);
    } else {
      setEnding(true);
    }
  };

  const bubbleBottom = stage.y(panel.bubbleY);
  const bubbleWidth = Math.min(BUBBLE_MAX_WIDTH, stage.width - 2 * EDGE);
  const speakerX = line.speaker ? stage.x(panel.speakers[line.speaker] ?? 0.5) : stage.width / 2;
  const bubbleLeft = clamp(speakerX - bubbleWidth / 2, EDGE, stage.width - EDGE - bubbleWidth);
  const tailLeft = clamp(speakerX - bubbleLeft, 28, bubbleWidth - 28);
  // A new panel's first line waits for the cross-fade, so it never sits on the old picture.
  const lineDelay = lineIndex === 0 && panelIndex > 0 ? `${FADE_MS * 0.7}ms` : '0ms';

  return (
    <div className="fixed inset-0 z-[200] bg-black select-none" onClick={advance}>
      {/* Panels are 9:16; wider screens (tablets) get a centered column instead of cropped faces. */}
      <div ref={stageRef} className="relative h-full w-full max-w-[56.25dvh] mx-auto overflow-hidden">
        {PROLOGUE.map((item, index) => (
          <div
            key={item.image}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{ opacity: index === panelIndex ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
          >
            {/* The push starts when a panel is first shown and holds its end frame while it fades out. */}
            <img
              src={item.image}
              alt=""
              draggable={false}
              className={`w-full h-full object-cover ${index <= panelIndex ? 'v2-panel-zoom' : ''}`}
            />
          </div>
        ))}

        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[calc(var(--safe-top)+12px)]">
          <div className="flex gap-1.5">
            {PROLOGUE.map((item, index) => (
              <span
                key={item.image}
                className={`h-1.5 rounded-full transition-all ${index === panelIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/45'}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setEnding(true);
            }}
            className="rounded-full bg-black/35 px-4 py-1.5 text-[11px] font-black text-white transition-all active:scale-90"
          >
            {t('prologue.skip')}
          </button>
        </div>

        {stage.width > 0 &&
          (line.speaker ? (
            <div
              key={`${panelIndex}-${lineIndex}`}
              className="v2-line-in absolute bg-white rounded-[22px] shadow-2xl px-4 pt-5 pb-2.5"
              style={{
                left: bubbleLeft,
                width: bubbleWidth,
                bottom: stage.height - bubbleBottom + TAIL,
                animationDelay: lineDelay,
              }}
            >
              {/* Tail first, so the text paints over its inner half. */}
              <span className="absolute -bottom-2 w-4 h-4 bg-white rotate-45" style={{ left: tailLeft - 8 }} />
              <span
                className={`absolute -top-3 left-4 flex items-center gap-1 rounded-full bg-gradient-to-r ${TAG_STYLE[line.speaker]} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow`}
              >
                {line.phone && <Phone className="w-3 h-3" />}
                {t(`prologue.speaker.${line.speaker}`)}
              </span>
              <p className="text-[15px] font-bold leading-snug text-slate-800">{t(line.text)}</p>
              <p className="mt-0.5 flex items-center justify-end text-[10px] font-black text-slate-400">
                {t('prologue.next')}
                <ChevronRight className="w-3.5 h-3.5" />
              </p>
            </div>
          ) : (
            <p
              key={`${panelIndex}-${lineIndex}`}
              className="v2-line-in absolute inset-x-0 px-8 text-center text-lg font-black italic leading-snug text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
              style={{ bottom: stage.height - bubbleBottom, animationDelay: lineDelay }}
            >
              {t(line.text)}
            </p>
          ))}

        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity"
          style={{ opacity: ending ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
        />
      </div>
    </div>
  );
}
