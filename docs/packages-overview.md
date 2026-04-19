# Packages overview

All packages are **ESM**, **`"type": "module"`**, and publish **`dist/`** from TypeScript. Where marked, they declare **`sideEffects: false`** for better tree-shaking.

| Package | NPM name | Role |
|---------|----------|------|
| Core | **`@storex/core`** | `defineStore`, registry, scheduler, setup stores, reactivity helpers, plugins/hooks types |
| Persist | **`@storex/persist`** | `PersistEngine`, adapters, migrations, redaction, encryption hooks, cross-tab sync helper |
| Devtools | **`@storex/devtools`** | `DevtoolsClient`, ring buffer, sanitization, registry factory with hooks wired |
| SSR | **`@storex/ssr`** | SSR payload + hydration helper types/functions, httpOnly cookie **client** contracts |
| Testing | **`@storex/testing`** | `createMockStore`, `replayStoreSteps`, `dumpStoreForSnapshot` |
| Pinia compat | **`@storex/pinia-compat`** | Thin bridge (`definePiniaCompatStore` aliases core `defineStore`), readonly interop helpers |
| Redux compat | **`@storex/redux-compat`** | Redux-shaped **`defineReduxStore`**, `composeMiddleware` (separate model from core setup stores) |
| CLI | **`@storex/cli`** | `storex` binary: `create store`, migrate/doctor guidance |
| Umbrella | **`storex`** | Re-exports **`@storex/core`** plus optional subpaths (`storex/persist`, `storex/devtools`, `storex/ssr`) |

## Dependency edges (conceptual)

```text
@storex/core  ←  @storex/persist, @storex/devtools, @storex/testing, @storex/pinia-compat, storex
@storex/persist, @storex/devtools, …  ←  apps
```

`@storex/redux-compat` does **not** replace core stores; it offers a parallel Redux-style surface for incremental migration.

## Source layout

Implementation lives under **`packages/<name>/src`**. Tests colocate as **`*.test.ts`**; benchmarks as **`*.bench.ts`**.
