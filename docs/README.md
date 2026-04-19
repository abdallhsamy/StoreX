# StoreX documentation

StoreX is a **TypeScript-first**, **Vue 3–oriented** state toolkit shipped as a **pnpm monorepo** of small ESM packages. Stores are defined with a **setup function** (same idea as **Pinia setup stores**): `ref` / `computed` / plain functions, then `return { … }`.

## Browse the docs

| Guide | What you will learn |
|-------|---------------------|
| [Getting started](getting-started.md) | Install, app wiring, first store, requirements |
| [Core: `defineStore` & setup stores](core-define-store.md) | Setup return shape, `store.state`, `$hydrate`, deps, lifecycle |
| [Architecture](architecture.md) | Registry, scheduler, injection, store identity |
| [Reactivity & selectors](reactivity-and-selectors.md) | `storeToRefs`, `pickState`, `pluck`, `createSelector`, pitfalls |
| [Plugins & hooks](plugins-and-hooks.md) | `StoreXPlugin`, `StoreRuntimeHooks`, local plugins |
| [Persistence](persistence.md) | `PersistEngine`, adapters, policy, migrations, cross-tab |
| [SSR](ssr.md) | Payload types, DOM hydration, httpOnly cookie boundaries |
| [Devtools](devtools.md) | `DevtoolsClient`, timeline, `timeTravelHydrate` |
| [Testing](testing.md) | `createMockStore`, `replayStoreSteps`, snapshots |
| [Packages overview](packages-overview.md) | Every workspace package and when to use it |
| [Redux compatibility](redux-compat.md) | `@storex/redux-compat` (separate from core stores) |
| [CLI](cli.md) | `storex create`, migrate/doctor stubs |
| [Contributing](contributing.md) | Local dev, build order, Vitest, common footguns |
| [Publishing to npm](publishing.md) | Version bumps, `pnpm publish`, scoped access |

The repository [README](../README.md) stays the high-level entry; these pages go deeper and stay aligned with the **current** APIs in `packages/*/src`.
