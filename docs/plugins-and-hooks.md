# Plugins and hooks

## Registry-level plugins (`StoreXPlugin`)

Plugins install into a **`StoreXPluginContext`** (`registry`, optional `app`) and may contribute **`hooks`**:

```ts
import type { StoreXPlugin } from "@storex/core";

const myPlugin: StoreXPlugin = {
  id: "my.telemetry",
  install(ctx) {
    // ctx.registry, ctx.app
  },
  hooks: {
    onActionStart(e) {
      /* … */
    },
  },
};
```

Pass plugins to **`createStoreRegistry({ plugins })`** or **`createStoreX({ plugins })`**. Multiple plugins are merged so each hook invokes **all** implementations in registration order.

## Runtime hooks (`StoreRuntimeHooks`)

| Hook | When it fires |
|------|----------------|
| **`onActionStart`** | Before a **returned function** from setup runs (wrapped path) |
| **`onActionEnd`** | After that function completes (success or throw) |
| **`onMutation`** | Reserved for tooling / extensions; core setup stores do not emit Redux-style mutations |
| **`onPersist` / `onHydrate`** | Used by persistence layers when wired |

Hook payloads are **`StoreEvent`** objects (`id`, `ts`, `originStore`, `kind`, `name`, optional `payload`, `diff`, `parentActionId`).

## Per-store plugins (`StoreLocalPlugin`)

Pass **`plugins: [...]`** in the **third argument** to **`defineStore`** for code that needs **`extendStore`** during instance construction.

### `StorePluginApi`

Plugins receive a small surface:

- **`id`**
- **`state`** (unknown)
- **`$subscribe`**

There is **no** `commit` on this surface; core stores are setup-only.

## Merging

`mergePluginHooks(plugins)` flattens hook arrays on the registry path. Devtools uses this pattern internally (`createRegistryWithDevtools`).

See [Devtools](devtools.md) for wiring a timeline client.
