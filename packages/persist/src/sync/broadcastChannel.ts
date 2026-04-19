import type { StorageAdapter } from "../types.js";

export interface BroadcastMessage {
  key: string;
  value: string | null;
}

/**
 * Wraps a storage adapter so writes are published to other tabs via `BroadcastChannel`,
 * and remote updates invoke `subscribe` listeners (for engines that merge cross-tab).
 */
export function withBroadcastSync(adapter: StorageAdapter, channelName: string): StorageAdapter {
  if (typeof BroadcastChannel === "undefined") {
    return adapter;
  }

  const ch = new BroadcastChannel(channelName);
  const listeners = new Set<(key: string, value: string | null) => void>();

  ch.onmessage = (ev: MessageEvent<BroadcastMessage>) => {
    if (!ev.data || typeof ev.data.key !== "string") return;
    for (const l of listeners) {
      l(ev.data.key, ev.data.value);
    }
  };

  return {
    getItem(key) {
      return adapter.getItem(key);
    },
    setItem(key, value) {
      adapter.setItem(key, value);
      ch.postMessage({ key, value } satisfies BroadcastMessage);
    },
    removeItem(key) {
      adapter.removeItem(key);
      ch.postMessage({ key, value: null } satisfies BroadcastMessage);
    },
    subscribe(listener) {
      listeners.add(listener);
      const offBase = adapter.subscribe?.((k, v) => listener(k, v));
      return () => {
        listeners.delete(listener);
        offBase?.();
      };
    },
  };
}
