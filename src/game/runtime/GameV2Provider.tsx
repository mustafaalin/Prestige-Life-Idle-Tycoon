import { useEffect, useState, type ReactNode } from 'react';
import { GameStoreContext } from './context';
import { createGameStore } from './store';

/** Creates the one live v2 game and runs its tick loop while mounted. */
export function GameV2Provider({ children }: { children: ReactNode }) {
  const [store] = useState(createGameStore);

  useEffect(() => store.start(), [store]);

  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>;
}
