import type { StorageAdapter } from "../types.js";

const DB_NAME = "storex-persist";
const STORE = "kv";

export function indexedDbAdapter(dbName: string = DB_NAME): StorageAdapter {
  let dbp: Promise<IDBDatabase> | undefined;

  function open(): Promise<IDBDatabase> {
    if (dbp) return dbp;
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
    return dbp;
  }

  return {
    async getItem(key) {
      const db = await open();
      return await new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const os = tx.objectStore(STORE);
        const r = os.get(key);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => resolve((r.result as string | undefined) ?? null);
      });
    },
    async setItem(key, value) {
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const os = tx.objectStore(STORE);
        const r = os.put(value, key);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => resolve();
      });
    },
    async removeItem(key) {
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const os = tx.objectStore(STORE);
        const r = os.delete(key);
        r.onerror = () => reject(r.error);
        r.onsuccess = () => resolve();
      });
    },
  };
}
