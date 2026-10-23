import { useEffect, useRef, useState } from 'react';
import type { MessageKey } from '../../i18n/translate';
import type { RuntimeState } from '../../runtime/engine';
import { storyRuns } from '../../runtime/story';
import { useGameV2 } from '../../runtime/useGameV2';

// The hero says something at his firsts (2026-10-23, user, after Idle Guy, where the hero keeps talking
// about what just happened): the first paycheck, the first run of his own stand, the first manager, the
// first diploma. Each comes from the moment the game state crosses it in this session (from none to
// one), so it plays once in a life and an update never brings old firsts back; nothing is saved. Said
// over the hero on the scene, it waits while a sheet covers the scene.

/** How long the bubble stays. */
export const QUIP_MS = 3800;

interface QuipDef {
  id: string;
  /** i18n `quips.<id>`. */
  line: MessageKey;
  /** Crossed once in a life: false before, true after. */
  done: (state: RuntimeState) => boolean;
}

const QUIPS: QuipDef[] = [
  { id: 'salary', line: 'quips.salary', done: ({ game }) => game.careerId !== null },
  { id: 'stand', line: 'quips.stand', done: ({ story }) => story.guideDone.includes('run') },
  { id: 'manager', line: 'quips.manager', done: ({ game }) => Object.values(game.businesses).some((business) => business.managed) },
  { id: 'course', line: 'quips.course', done: ({ game }) => game.coursesDone.length > 0 },
];

/** The line the hero says now (or null), shown for QUIP_MS once the scene is not covered. */
export function useHeroQuip(covered: boolean): MessageKey | null {
  const { state } = useGameV2();
  const runs = storyRuns(state.game);
  const before = useRef<boolean[] | null>(null);
  const [queue, setQueue] = useState<MessageKey[]>([]);
  const [saying, setSaying] = useState<MessageKey | null>(null);

  const now = QUIPS.map((quip) => quip.done(state));
  const key = now.join();
  useEffect(() => {
    const previous = before.current;
    before.current = now;
    if (!previous || !runs) return;
    const crossed = QUIPS.filter((_quip, index) => now[index] && !previous[index]).map((quip) => quip.line);
    if (crossed.length > 0) setQueue((current) => [...current, ...crossed]);
    // `key` stands for `now`, which is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, runs]);

  useEffect(() => {
    if (covered || saying || queue.length === 0) return;
    setSaying(queue[0]);
    setQueue((current) => current.slice(1));
  }, [covered, saying, queue]);

  useEffect(() => {
    if (!saying) return;
    const timer = window.setTimeout(() => setSaying(null), QUIP_MS);
    return () => window.clearTimeout(timer);
  }, [saying]);

  return saying;
}
