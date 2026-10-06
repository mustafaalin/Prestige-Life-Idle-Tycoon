import { createContext } from 'react';
import type { GameStore } from './store';

export const GameStoreContext = createContext<GameStore | null>(null);
