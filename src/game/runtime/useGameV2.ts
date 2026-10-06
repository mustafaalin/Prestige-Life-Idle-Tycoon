import { useContext, useEffect, useRef, useSyncExternalStore } from 'react';
import { GameStoreContext } from './context';
import type { GameEvent, GameStore } from './store';

function useGameStore(): GameStore {
  const store = useContext(GameStoreContext);
  if (!store) throw new Error('useGameV2 must be used inside <GameV2Provider>');
  return store;
}

/** Live v2 game state (re-renders every tick) plus player actions. */
export function useGameV2() {
  const store = useGameStore();
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return { state, game: state.game, actions: store.actions };
}

/** Subscribes to one-off game events (cycle payouts, class-ups) without re-rendering on ticks. */
export function useGameV2Events(listener: (event: GameEvent) => void) {
  const store = useGameStore();
  const latest = useRef(listener);

  useEffect(() => {
    latest.current = listener;
  });

  useEffect(() => store.onEvent((event) => latest.current(event)), [store]);
}
