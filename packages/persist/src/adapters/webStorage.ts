import type { StorageAdapter } from "../types.js";

export function localStorageAdapter(storage: Storage = globalThis.localStorage): StorageAdapter {
  return webStorageAdapter(storage);
}

export function sessionStorageAdapter(
  storage: Storage = globalThis.sessionStorage,
): StorageAdapter {
  return webStorageAdapter(storage);
}

function webStorageAdapter(storage: Storage): StorageAdapter {
  const listeners = new Set<(key: string, value: string | null) => void>();

  const onStorage = (e: StorageEvent) => {
    if (e.storageArea !== storage) return;
    if (e.key == null) return;
    for (const l of listeners) l(e.key, e.newValue);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return {
    getItem(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      storage.setItem(key, value);
      for (const l of listeners) l(key, value);
    },
    removeItem(key) {
      storage.removeItem(key);
      for (const l of listeners) l(key, null);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== "undefined") {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
  };
}
