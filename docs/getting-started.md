# Getting started

## Requirements

- **Node.js** 18+ (20+ recommended)
- **pnpm** 9+ (see root `package.json` → `packageManager`)
- **Vue** `^3.5.0` as a peer dependency wherever the runtime touches Vue reactivity

## Install

Scoped packages (once published), or the umbrella package:

```bash
pnpm add @storex/core vue
# optional slices
pnpm add @storex/persist @storex/devtools @storex/ssr @storex/testing
# or
pnpm add storex vue
```

Link from another repo: `pnpm link` against this workspace, or depend via `workspace:*` from a monorepo checkout.

## Monorepo development

From the repository root:

```bash
pnpm install
pnpm run build   # dependency order: core → … → cli
pnpm test        # Vitest
pnpm bench       # micro-benchmarks (optional)
```

## Wire StoreX into a Vue app

Use `createStoreX` so the active registry is set and Vue receives `STOREX_REGISTRY_KEY` via `provide`:

```ts
import { createApp } from "vue";
import { createStoreX } from "@storex/core";
import App from "./App.vue";

const { install } = createStoreX({
  // optional: plugins: [myPlugin], hooks: { onActionStart(e) { … } }
});

const app = createApp(App);
install(app);
app.mount("#app");
```

## Define your first store

Stores are **setup functions**. Return refs, computeds, and functions you want on the public instance:

```ts
import { computed, ref } from "vue";
import { defineStore } from "@storex/core";

export const useCounterStore = defineStore("counter", () => {
  const n = ref(0);
  const doubled = computed(() => n.value * 2);
  const inc = () => {
    n.value += 1;
  };
  return { n, doubled, inc };
});
```

Resolve the registry from context (after `install`) and call the factory:

```ts
const counter = useCounterStore();
counter.n;
counter.inc();
```

## Next steps

- [Core: `defineStore` & setup stores](core-define-store.md) — full semantics and options
- [Reactivity & selectors](reactivity-and-selectors.md) — safe patterns in components
- [Packages overview](packages-overview.md) — persist, devtools, SSR, testing
