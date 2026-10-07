import { useEffect, useState, type ReactNode } from 'react';
import { GameStoreContext } from './context';
import { createGameStore } from './store';

/** Creates the one live v2 game from the save read at boot and runs its tick loop while mounted. */
export function GameV2Provider({ saveText, children }: { saveText: string | null; children: ReactNode }) {
  const [store] = useState(() => createGameStore(saveText));

  useEffect(() => store.start(), [store]);

  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>;
}
