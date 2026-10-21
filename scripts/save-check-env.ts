// Node has no browser storage: the save code's localStorage reads and writes (backups of unreadable
// saves) go to a map for the length of the check. Imported first by save-check.ts.

const memory = new Map<string, string>();
const storage = {
  getItem: (key: string) => memory.get(key) ?? null,
  setItem: (key: string, value: string) => void memory.set(key, value),
  removeItem: (key: string) => void memory.delete(key),
  clear: () => memory.clear(),
};
const scope = globalThis as Record<string, unknown>;
scope.localStorage ??= storage;
scope.window ??= globalThis;
