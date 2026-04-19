# Persistence (`@storex/persist`)

`PersistEngine` subscribes to store changes, **debounces** writes, serializes a **slice** of state, and persists through a **`StorageAdapter`**. On startup it can **hydrate** via **`store.$hydrate`**.

## Core pieces

- **`PersistEngine`** — orchestrates hydrate, subscribe, debounce, merge, redact, optional encrypt/decrypt
- **`PersistPolicy`** — `key`, `paths`, `version`, `debounceMs`, `redactPaths`, optional `migrate`, optional `encrypt`/`decrypt`
- **`StorageAdapter`** — `getItem` / `setItem` / `removeItem` / `subscribe` (async-friendly)

## Typical usage

```ts
import { PersistEngine, memoryAdapter, localStorageAdapter, indexedDbAdapter, withBroadcastSync } from "@storex/persist";

const engine = new PersistEngine({
  store: myStore,
  adapter: withBroadcastSync(localStorageAdapter(), "my-app-sync"),
  policy: {
    key: "user",
    paths: ["profile", "preferences"],
    version: 1,
    debounceMs: 50,
    redactPaths: ["profile.token"],
    migrate: (fromVersion, raw) => {
      /* return JsonValue slice */
      return raw;
    },
    encrypt: async (blob) => blob,
    decrypt: async (blob) => blob,
  },
  merge: "lww", // or custom (ctx) => PersistEnvelope | null
  hooks: {
    onPersist: () => {},
    onHydrate: () => {},
  },
});

await engine.hydrate();
const stop = engine.start();
// …later
stop();
```

## Adapters

Bundled concepts (see package source for exact exports):

- **`memoryAdapter`** — in-memory for tests
- **`localStorageAdapter` / `sessionStorageAdapter`**
- **`indexedDbAdapter`**
- **`withBroadcastSync`** — cross-tab **`BroadcastChannel`** coordination (LWW-style merge by default; custom merge supported)

## Migrations

`policy.migrate(fromVersion, raw)` runs during **`hydrate()`** before **`$hydrate`** merges into the live store. Bump **`policy.version`** when the persisted shape changes.

## Redaction and encryption

- **`redactPaths`** — strip sensitive leaves before persistence (defaults layered in the engine)
- **`encrypt` / `decrypt`** — async hooks for at-rest protection (you supply crypto)

## Store requirements

The engine expects a **`GenericStore`** with **`$subscribe`**, **`$hydrate`**, and **`__unwrapState`** (all provided by core setup stores).
