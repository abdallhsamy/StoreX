import type { StorageAdapter } from "../types.js";

export function memoryAdapter(): StorageAdapter {
  const map = new Map<string, string>();
  const listeners = new Set<(key: string, value: string | null) => void>();

  return {
    getItem(key) {
      return map.get(key) ?? null;
    },
    setItem(key, value) {
      map.set(key, value);
      for (const l of listeners) l(key, value);
    },
    removeItem(key) {
      map.delete(key);
      for (const l of listeners) l(key, null);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
