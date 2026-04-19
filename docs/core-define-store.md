# Core: `defineStore` and setup stores

## Signature

```ts
import { defineStore, type StoreFactory } from "@storex/core";

defineStore(
  id,
  setup: () => Record<string, unknown>,
  options?: {
    deps?: () => ReadonlyArray<StoreFactory>;
    plugins?: readonly StoreLocalPlugin[];
  },
);
```

- **`id`**: Stable string key. One store instance per id per registry (`getOrCreate`).
- **`setup`**: Runs **once** when the store is first created, inside an `effectScope`.
- **`options`**: Optional **`deps`** (other store factories) and **`plugins`** (per-store local plugins).

The factory return type is typed as **`GenericStore`** today; narrow in app code when you need stricter field types.

## What you return

| Kind | On the public store |
|------|---------------------|
| **`ref` / writable refs** | Unwrapped read/write property (`store.count` ↔ `count.value`) |
| **`computed` / readonly refs** | Read-only unwrapped property |
| **Plain values** | Mutable properties on the reactive shell (prefer `ref` for reactive primitives) |
| **Functions** | Wrapped so **`onActionStart` / `onActionEnd`** run and the registry **scheduler** batches the body |

Prefer **closures** (`const inc = () => { n.value++ }`) over **`this`**; the runtime does not re-bind `this` onto refs for you.

## `store.state`

`store.state` is a **getter** that returns the same **public reactive object** as the unwrapped shell. That keeps helpers working:

- **`storeToRefs(store)`** uses `toRefs(store.state)`
- **`pickState` / `pluck` / `createSelector`** read from `store.state`

## Store API (`GenericStore`)

Every instance includes:

- **`id`**
- **`state`** — alias of the reactive public object
- **`$version`** — `shallowRef` bumped when tracked state changes or after `$hydrate`
- **`$hydrate(partial)`** — For each key in `partial`, assigns into the matching **returned ref** if one exists, otherwise assigns on the shell
- **`$subscribe(cb)`** — Notified with `{ state, mutation?: string }` (the `mutation` string is a source label such as `__state__`, not a Redux mutation name)
- **`$dispose()`** — Stops the store `effectScope` and clears subscribers

There is **no** `commit` or mutation map on core stores.

## Store dependencies (`deps`)

Declare **`deps: () => [useOtherStore, …]`** so dependent stores are instantiated **before** the current store. Cycles throw **`CircularDependencyError`** with the chain.

## Plugins (per store)

Pass **`plugins`** in the third argument for **`StoreLocalPlugin`** instances (for example `extendStore` during construction). Global registry plugins use `createStoreRegistry({ plugins })` or `createStoreX({ plugins })`.

## Comparison with Pinia

| Pinia | StoreX (this repo) |
|-------|---------------------|
| Options store: `state` / `getters` / `actions` | Not used — use **setup** only |
| Setup store: `defineStore(id, () => { … return { … } })` | **Same shape** |
| `defineStore` from `pinia` | `defineStore` from `@storex/core` + **registry** |

See also [Architecture](architecture.md) for how the registry owns instances and scheduling.
