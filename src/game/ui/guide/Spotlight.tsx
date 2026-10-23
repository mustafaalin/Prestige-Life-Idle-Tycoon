import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { portalRoot } from '../stage';
import { SPOT_OUTSIDE_EVENT, type SpotMode } from './spotMode';

// The dim around what the hand points at (2026-10-23, user, after Idle Guy's onboarding): the screen
// darkens, the element under the hand (its parent, PointingHand `spot`) and the speaker's bubble
// (`data-spot-keep`) stay lit. Old Ray's steps (`block`) take a tap only on the lit element; a feature's
// first look (`soft`) closes with a tap on the dim. Nothing dims while the element is off screen or
// something covers it (a card, a ceremony), so the player is never held on a screen they cannot use;
// Android's back button is never held.

/** Room left around the lit element. */
const PAD = 6;
/** How dark the rest gets: darker than a card's backdrop (bg-black/35), so the lit element stands out on the night alley too. */
const DIM = 0.5;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Spot {
  mode: SpotMode;
  target: Element;
  /** The game's column (portalRoot), which the fixed dim is laid out in; boxes are relative to it. */
  stage: Box;
  hole: Box;
  keep: Box[];
}

/** The element's box with everything drawn out of it (the speaker's portrait sits above the bubble). */
function outerRect(element: Element) {
  let { left, top, right, bottom } = element.getBoundingClientRect();
  for (const child of element.querySelectorAll('*')) {
    const rect = child.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  }
  return { left, top, width: right - left, height: bottom - top };
}

const boxOf = (element: Element, stage: DOMRect): Box => {
  const rect = outerRect(element);
  return { x: rect.left - stage.left - PAD, y: rect.top - stage.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
};

/** The lit element, if one is on screen and nothing covers its middle. */
function findSpot(): Spot | null {
  const hand = document.querySelector<HTMLElement>('[data-spot]');
  const target = hand?.parentElement;
  if (!hand || !target) return null;
  const rect = target.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  if (rect.width === 0 || x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return null;
  const top = document.elementFromPoint(x, y);
  if (!top || !(target.contains(top) || hand.contains(top))) return null;
  // The column on tablets and desktops: a fixed element inside it is laid out against it, not the window.
  const stage = portalRoot().getBoundingClientRect();
  const keep = [...document.querySelectorAll('[data-spot-keep]')].map((element) => boxOf(element, stage));
  return {
    mode: hand.dataset.spot === 'soft' ? 'soft' : 'block',
    target,
    stage: { x: 0, y: 0, width: stage.width, height: stage.height },
    hole: boxOf(target, stage),
    keep,
  };
}

const sameBox = (a: Box, b: Box) => Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.width - b.width) < 1 && Math.abs(a.height - b.height) < 1;

const sameSpot = (a: Spot | null, b: Spot | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.mode === b.mode &&
    a.target === b.target &&
    sameBox(a.stage, b.stage) &&
    sameBox(a.hole, b.hole) &&
    a.keep.length === b.keep.length &&
    a.keep.every((box, index) => sameBox(box, b.keep[index])));

export function Spotlight() {
  const [spot, setSpot] = useState<Spot | null>(null);
  const live = useRef<Spot | null>(null);

  // Follows the lit element every frame: sheets slide in, lists scroll, bottles come and go.
  useEffect(() => {
    let frame = 0;
    const follow = () => {
      const next = findSpot();
      if (!sameSpot(live.current, next)) {
        live.current = next;
        setSpot(next);
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Taps outside the lit element and the bubbles: held for a step, close a soft spot. Caught on the
  // document before React's own handlers see them.
  useEffect(() => {
    const hold = (event: Event) => {
      const current = live.current;
      const at = event.target;
      if (!current || !(at instanceof Node)) return;
      if (current.target.contains(at)) return;
      if ([...document.querySelectorAll('[data-spot-keep]')].some((element) => element.contains(at))) return;
      event.preventDefault();
      event.stopPropagation();
      if (current.mode === 'soft' && event.type === 'click') window.dispatchEvent(new Event(SPOT_OUTSIDE_EVENT));
    };
    document.addEventListener('click', hold, true);
    return () => document.removeEventListener('click', hold, true);
  }, []);

  if (!spot) return null;
  const { width, height } = spot.stage;
  const cutouts = [spot.hole, ...spot.keep];
  return createPortal(
    <svg
      className="v2-spot-in pointer-events-none fixed inset-0 z-[65]"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <mask id="v2-spot-mask">
          <rect width={width} height={height} fill="white" />
          {cutouts.map((box, index) => (
            <rect key={index} x={box.x} y={box.y} width={box.width} height={box.height} rx={18} fill="black" />
          ))}
        </mask>
      </defs>
      <rect width={width} height={height} fill={`rgba(0,0,0,${DIM})`} mask="url(#v2-spot-mask)" />
    </svg>,
    portalRoot(),
  );
}
