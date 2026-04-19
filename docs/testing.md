# Testing (`@storex/testing`)

## `createMockStore`

Build an in-memory registry (or reuse yours) and instantiate a store from the **same setup function** you use in production:

```ts
import { ref } from "vue";
import { createMockStore, dumpStoreForSnapshot } from "@storex/testing";

const store = createMockStore(
  "cart",
  () => {
    const n = ref(0);
    const inc = () => {
      n.value += 1;
    };
    return { n, inc };
  },
  { initialState: { n: 5 }, stubFunctions: true },
);
```

Options:

- **`initialState`** — passed through **`$hydrate`** after construction
- **`stubFunctions`** — replaces returned **functions** with async no-ops (useful when you only care about state transitions)
- **`registry`** — inject a shared **`StoreRegistry`** when testing cross-store flows

## `replayStoreSteps`

Deterministic replays without a mutation log:

```ts
import { replayStoreSteps } from "@storex/testing";

replayStoreSteps(store, [
  { type: "action", name: "inc", args: [] },
  { type: "hydrate", partial: { n: 10 } },
]);
```

- **`action`** — looks up **`store[name]`** and invokes it with **`args`**
- **`hydrate`** — calls **`store.$hydrate(partial)`**

## `dumpStoreForSnapshot`

`dumpStoreForSnapshot(store, redactKeys?)` JSON-clones **`__unwrapState()`** and replaces listed keys with **`"[REDACTED]"`** — convenient for **`toMatchSnapshot()`** in Vitest.

## Vitest

The monorepo uses **Vitest** with workspace-wide config at `vitest.config.ts`. Prefer importing from **`@storex/core`** package entrypoints in tests so resolution matches consumers.
