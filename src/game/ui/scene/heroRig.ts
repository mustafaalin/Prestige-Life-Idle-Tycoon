import { useEffect, useMemo, useState } from 'react';
import { HERO_POSE, MOOD, outfitSlot, type RigInputs } from './rigs';
import { QUIP_MS } from './heroQuips';
import type { Pose } from './stages';

// What the hero's rig does on the home scene (2026-10-28, user: "in which situation how he behaves").
// The rig only stands, talks and changes face; arms stay down (2026-10-27). In order of strength:
// - joy (a purchase, a promotion, a move, Şans' find collected): he laughs while the moment lasts;
// - his line at a first (heroQuips.ts): he smiles and talks for about as long as the line takes to say,
//   then keeps smiling until the bubble goes;
// - in the tent: a worried face, and every 12–20 s a cold spell of 2.5 s (shiver, head sunk, teeth
//   chattering); never while he talks or laughs, nor while a sheet covers the scene. Always shivering
//   would wear the player out and look like a fault (user, 2026-10-28);
// - otherwise his resting face.
// Collecting and petting are pictures (Scene.tsx), so the rig is out of sight then.

/** Seconds between cold spells in the tent (user, 2026-10-28). */
const COLD_EVERY_S: [number, number] = [12, 20];
const COLD_MS = 2500;
/** Talking time per character of the line, and its bounds. */
const TALK_MS_PER_CHAR = 55;
const TALK_MS: [number, number] = [1200, QUIP_MS - 600];

interface HeroRigState {
  outfitIndex: number;
  pose: Pose;
  /** He lives in the tent (the first home). */
  tent: boolean;
  /** The line he is saying now, if any. */
  line: string | null;
  /** A sheet covers the scene. */
  covered: boolean;
}

export function useHeroRig({ outfitIndex, pose, tent, line, covered }: HeroRigState): RigInputs {
  const joy = pose === 'joy';

  const [talking, setTalking] = useState(false);
  useEffect(() => {
    if (!line) return;
    setTalking(true);
    const talkMs = Math.min(Math.max(line.length * TALK_MS_PER_CHAR, TALK_MS[0]), TALK_MS[1]);
    const timer = window.setTimeout(() => setTalking(false), talkMs);
    return () => {
      window.clearTimeout(timer);
      setTalking(false);
    };
  }, [line]);

  // The next cold spell is planned only while nothing else holds him; anything that does cuts the
  // spell short, and a new wait starts after it.
  const coldAllowed = tent && pose === 'idle' && !line && !covered;
  const [cold, setCold] = useState(false);
  useEffect(() => {
    if (!coldAllowed) {
      setCold(false);
      return;
    }
    if (cold) {
      const timer = window.setTimeout(() => setCold(false), COLD_MS);
      return () => window.clearTimeout(timer);
    }
    const [min, max] = COLD_EVERY_S;
    const timer = window.setTimeout(() => setCold(true), (min + Math.random() * (max - min)) * 1000);
    return () => window.clearTimeout(timer);
  }, [coldAllowed, cold]);

  const mood = joy ? MOOD.laugh : line ? MOOD.smile : tent ? MOOD.worried : MOOD.neutral;
  const slot = outfitSlot(outfitIndex);
  return useMemo(
    () => ({
      numbers: { top: slot, bottom: slot, shoes: slot, mood, pose: cold ? HERO_POSE.cold : HERO_POSE.rest },
      booleans: { talking: talking && !joy },
    }),
    [slot, mood, cold, talking, joy],
  );
}
