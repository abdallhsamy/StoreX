<p align="center">
  <img src="assets/images/StoreX-logo.png" alt="StoreX" width="280" height="75" />
</p>

# StoreX

**StoreX** is a TypeScript-first state layer for **Vue 3** where each store is a **setup function**—the same idea as **Pinia setup stores**: create **`ref` / `computed` / plain functions** inside the function, **return** what should be public on the store instance, and read reactive fields without a separate **`state` / `getters` / `actions`** options object.

The instance still exposes **`store.state`** as an alias of the public reactive shell (so **`storeToRefs(store)`** and friends keep working). No **`mutations`** or **`commit`**.

It ships as a **tree-shakable** monorepo: use only the packages you need.

**Full documentation:** [docs/README.md](docs/README.md)

---

## Why StoreX?

| Goal | How StoreX helps |
|------|-------------------|
| Pinia-like DX | **`defineStore(id, () => { … return { … } })`** — same mental model as Pinia **setup stores**. |
| Vue-native reactivity | Built on Vue **`ref`**, **`computed`**, and **`reactive`** for the public store object. |
| Enterprise observability | **Runtime hooks** (`onMutation`, `onActionStart`, …) power devtools and custom audit pipelines. |
| Persistence & SSR | **`@storex/persist`** engines and adapters; **`@storex/ssr`** types and helpers for safe hydration and httpOnly cookie flows. |
| Gradual adoption | **`@storex/pinia-compat`** / **`@storex/redux-compat`**, plus a **`storex` CLI** for scaffolding and migration guidance. |

---

## Repository layout

This repo is a **pnpm workspace**. Packages are ESM-only, declare **`sideEffects: false`** where applicable, and publish **`dist/`** from TypeScript.

| Package | Description |
|---------|-------------|
| [`@storex/core`](packages/core) | Runtime: **`defineStore`** (setup function), registry, batching, plugins, selectors, reactivity helpers. |
| [`@storex/persist`](packages/persist) | `PersistEngine`, storage adapters (memory, local/session, IndexedDB), redaction, encryption hooks, cross-tab `BroadcastChannel` wrapper. |
| [`@storex/devtools`](packages/devtools) | `DevtoolsClient`, ring-buffer timeline, sanitization, registry factory with hooks wired. |
| [`@storex/ssr`](packages/ssr) | SSR payload types, DOM/window hydration helpers, httpOnly cookie **client** API contracts. |
| [`@storex/testing`](packages/testing) | `createMockStore`, `replayStoreSteps`, snapshot dump helper. |
| [`@storex/pinia-compat`](packages/pinia-compat) | `definePiniaCompatStore` (alias of `defineStore`), `piniaStoreToStoreXView`, `storeXToReadonlyState`. |
| [`@storex/redux-compat`](packages/redux-compat) | `defineReduxStore` + Redux-style `composeMiddleware`. |
| [`@storex/cli`](packages/cli) | `storex` binary: `create store`, migrate/doctor stubs. |
| [`storex`](packages/storex) | Umbrella package: re-exports core + optional entrypoints `storex/devtools`, `storex/persist`, `storex/ssr`. |

---

## Requirements

- **Node.js** 18+ (recommended 20+)
- **pnpm** 9+ (see `packageManager` in root `package.json`)
- **Vue** `^3.5.0` (peer dependency for runtime packages)

---

## Development

Clone the repo, install dependencies, build, then run tests or benchmarks.

```bash
pnpm install
pnpm run build
pnpm test
pnpm bench
```

### Build order

The root `build` script compiles packages in dependency order (`@storex/core` first, then persist/devtools/testing/compat/ssr, then `storex`, then `@storex/cli`). Use this when publishing or linking locally.

---

## Installation (consumers)

From the published registry (once published), install scoped packages or the umbrella meta-package:

```bash
pnpm add @storex/core vue
# optional
pnpm add @storex/persist @storex/devtools @storex/ssr @storex/testing
# or
pnpm add storex vue
```

For local development in another repo, use **`pnpm link`** or **`workspace:*`** from a monorepo that depends on this checkout.

---

## Quick start

### 1. Create a registry and install it on the Vue app

```ts
import { createApp } from "vue";
import { createStoreX } from "@storex/core";
import App from "./App.vue";

const { registry, install } = createStoreX({
  // optional: plugins: [myPlugin], hooks: { onActionStart(e) { … } }
});

const app = createApp(App);
install(app);
app.mount("#app");
```

`install(app)` sets the active registry, **`provide`s** `STOREX_REGISTRY_KEY`, and lets `useXStore()` resolve the registry from Vue context (same idea as Pinia’s app plugin + `activePinia`).

### 2. Define a store

```ts
import { computed, ref } from "vue";
import { defineStore } from "@storex/core";

export const useCartStore = defineStore("cart", () => {
  const items = ref(0);
  const tax = ref(0.1);

  const totalWithTax = computed(() => items.value * (1 + tax.value));

  const add = (n: number) => {
    items.value += n;
  };

  const reset = () => {
    items.value = 0;
  };

  return { items, tax, totalWithTax, add, reset };
});
```

Optional third argument: **`{ deps: () => [useOtherStore], plugins: [...] }`**.

Pinia’s **options** API uses `state` / `getters` / `actions`; StoreX matches Pinia’s **setup store** shape instead (`ref` / `computed` / plain functions, then **`return { … }`**).

### 3. Use the store in a component

```ts
import { storeToRefs } from "@storex/core";
import { useCartStore } from "./cart.store";

const cart = useCartStore();

cart.items;
cart.totalWithTax;
cart.add(2);

// Prefer storeToRefs when destructuring reactive fields / computeds (same guidance as Pinia)
const { items, totalWithTax } = storeToRefs(cart);
```

---

## Core concepts

### Store anatomy

| Piece | Role |
|-------|------|
| **Setup return** | **`ref` / `computed` / `reactive` / plain values`** become store fields. Refs and computeds are **unwrapped** on the public instance (`store.items` reads the ref’s `.value`). |
| **Functions** | Any **`function`** you return is wrapped so **`onActionStart` / `onActionEnd`** still fire (same instrumentation hook as before). Prefer **closures** over **`this`** (`const add = () => { items.value += 1 }`). |

Shared with all stores: **`deps`**, **plugins**, one instance per id via **`getOrCreate`**, **`$hydrate`**, **`$subscribe`**, **`$dispose`**, **`$version`**.

### Explicit store dependencies

Declare **`deps: () => [useOtherStore]`** so initialization order and **cycles** are detected (`CircularDependencyError`) instead of failing mysteriously.

### Lazy stores

```ts
registry.registerLazy({
  id: "billing",
  load: () => import("./billing.store"), // module should initialize the billing store
});
registry.preloadStore("billing"); // await before first use in async contexts
```

### Batching

Use **`batch(registry, () => { … })`** so work scheduled on the registry **`CommitScheduler`** runs inside one batch (see **`CommitScheduler`**). Returned **functions** run inside **`scheduler.batch`** via **`__runAction`**.

### `$hydrate` (bootstrap / persistence)

`GenericStore.$hydrate(partial)` assigns into matching **refs** (or plain fields on the public shell). Use for **SSR**, **persistence rehydration**, or controlled merges alongside normal updates from your setup closures.

---

## Reactivity helpers

Same guidance as Pinia: destructuring primitives from reactive state can drop tracking. Prefer:

- **`storeToRefs(store)`** — `toRefs` on `store.state` (the same public reactive object as your returned refs / computeds).
- **`pickState(store, ['a', 'b'] as const)`** — computed refs per key.
- **`pluck(store, (s) => …)`** — selector as a `computed`.
- **`createSelector(store, projector)`** — same idea, explicit name.
- **`untracked(fn)`** — runs `fn` without dependency tracking (hot paths).

Utilities: **`warnDestructuringHint`**, **`deepFreezeSnapshot`** (immutable snapshots for tests).

---

## Persistence (`@storex/persist`)

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
    migrate: (fromVersion, raw) => { /* return JsonValue slice */ },
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

**Adapters:** `memoryAdapter`, `localStorageAdapter`, `sessionStorageAdapter`, `indexedDbAdapter`. **Cross-tab:** `withBroadcastSync` publishes writes and forwards remote updates to `subscribe` listeners.

---

## SSR and httpOnly cookies (`@storex/ssr`)

JavaScript **cannot read httpOnly cookies**. StoreX separates:

1. **Client-visible** hydration (e.g. non-sensitive bootstrap JSON in a `<script type="application/json">` tag or a guarded `window` global).
2. **Server-only** cookie read/write on your backend.

Helpers include **`readSsrPayloadFromDom`**, **`hydrateStoreFromSsrPayload`**, **`buildSsrScriptTag`**, **`createHttpCookiePersistClient`**, and **`pushStateToHttpOnlyCookie`**. You implement `save()` with your framework’s `fetch` to POST allowlisted state; the server sets **`Set-Cookie`** with **httpOnly**, **Secure**, **SameSite** as appropriate.

---

## Devtools (`@storex/devtools`)

```ts
import { createRegistryWithDevtools, DevtoolsClient, attachDevtoolsPostMessageBridge } from "@storex/devtools";

const { registry, client } = createRegistryWithDevtools({ production: false });
const detach = attachDevtoolsPostMessageBridge(client);
// … timeline: client.getTimeline(), client.clear(), sanitizeEvent for prod-like trimming
```

`DevtoolsClient` implements **`StoreRuntimeHooks`** so store **function** calls (and optional **`onMutation`** from other layers) show up in a ring buffer; **`sanitizeEvent`** caps depth/string length for production-like logging.

---

## Testing (`@storex/testing`)

```ts
import { ref } from "vue";
import { createMockStore, replayStoreSteps, dumpStoreForSnapshot } from "@storex/testing";

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

replayStoreSteps(store, [{ type: "action", name: "inc", args: [] }]);
expect(dumpStoreForSnapshot(store, ["secret"])).toMatchSnapshot();
```

---

## Pinia and Redux compatibility

- **`@storex/pinia-compat`**: `definePiniaCompatStore` (= core `defineStore`), `piniaStoreToStoreXView`, `storeXToReadonlyState`.
- **`@storex/redux-compat`**: `defineReduxStore({ id, initialState, reducer, middleware })`, `composeMiddleware`.

Redux-compat stores use a **`shallowRef`** snapshot and a composed **`dispatch`** chain; they are intentionally smaller in scope than full Redux DevTools integration.

---

## CLI (`storex`)

```bash
pnpm exec storex create store user --persist --idb
pnpm exec storex migrate pinia --path src/stores
pnpm exec storex migrate redux --path src/redux
pnpm exec storex doctor --path src
```

`migrate` / `doctor` currently print **guidance**; AST codemods are planned.

---

## Umbrella package `storex`

```ts
import { defineStore, createStoreX } from "storex";
import { PersistEngine } from "storex/persist";
import { DevtoolsClient } from "storex/devtools";
import { readSsrPayloadFromDom } from "storex/ssr";
```

Subpath exports keep bundles tree-shakable: only imported entrypoints pull weight.

---

## TypeScript

`useXStore()` is typed as **`GenericStore`** today; annotate the return of your setup (`as const`, interfaces, or wrapper types) when you want stricter field typing. Extend plugin surfaces via **module augmentation** of **`StoreXPluginContext`** / hooks as you grow the ecosystem.

---

## Performance notes

- **`scheduleFlush`** on the registry scheduler is skipped when no flush listeners are registered.
- Benchmarks (`pnpm bench`) compare **StoreX** vs **Pinia** action hot loops. Treat benches as regression guards, not marketing scores.

---

## Roadmap (high level)

- Deeper **Vue DevTools** integration (`@vue/devtools-api`).
- **AST codemods** in `@storex/cli` for Pinia/Redux migrations.
- Optional **`@storex/immutable`** (Immer-style drafts) and richer **selector memoization** keyed by affected paths.
- **Standalone devtools panel** and extension packaging around the existing `postMessage` protocol (`DEVTOOLS_PROTOCOL_VERSION`).

---

## License

Add a `LICENSE` file to the repository root when you are ready to publish; until then, treat usage as **private / internal** unless you specify otherwise.

---

## Contributing

1. **`pnpm install`** at the repo root.  
2. **`pnpm run build`** before linking or publishing (TypeScript emits to each package’s **`dist/`** only).  
3. **`pnpm test`** for regression tests.  
4. Open issues or PRs with **clear reproductions** for bugs and **API sketches** for feature proposals.

**Do not emit `.js` / `.d.ts` into `packages/core/src/`.** Imports use the `*.js` extension for ESM; stray compiled files next to `*.ts` can be picked up by Vitest and shadow the real sources. Root `.gitignore` ignores those patterns for `@storex/core`.

Welcome to StoreX—**Pinia-shaped stores**, without a legacy mutation layer in core.
