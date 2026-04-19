# Architecture

## High-level diagram

```mermaid
flowchart TB
  subgraph vue [Vue app]
    App[App.vue]
    CX[createStoreX.install]
  end
  subgraph core [@storex/core]
    Reg[StoreRegistry]
    Sch[CommitScheduler]
    AR[activeRegistry / inject STOREX_REGISTRY_KEY]
  end
  App --> CX
  CX --> AR
  CX --> Reg
  Reg --> Sch
  Factory[defineStore factory] --> Reg
  Reg -->|getOrCreate id| Instance[GenericStore instance]
```

## Store registry

`createStoreRegistry()` owns:

- A **`Map<id, GenericStore>`** of live instances
- **`getOrCreate(id, factory)`** — lazy construction; detects **circular** `deps` chains via a `creating` set and throws **`CircularDependencyError`**
- **`scheduler`** — a **`CommitScheduler`** used to batch synchronous work (notably around store **function** calls)
- **`__hooks`** — merged **`StoreRuntimeHooks`** from registry-level plugins and options

`createStoreX` builds a registry and `install(app)`:

1. Sets **`activeRegistry`** for non-Vue callers
2. **`provide(STOREX_REGISTRY_KEY, registry)`**
3. Lets `resolveRegistry()` pick **explicit registry**, **Vue inject**, or **active registry**

## Store construction path

1. **`defineStore(id, setup, options?)`** returns a **factory** tagged with **`storeId`**
2. Calling **`useCart()`** (with optional explicit `registry` argument) resolves the registry and runs **`getOrCreate(id, () => instantiateFromDefinition(...))`**
3. **`instantiateFromDefinition`** resolves **`deps`**, then **`createSetupStore`**
4. **`createSetupStore`** runs **`setup()`**, builds the reactive **shell**, attaches helpers, starts **`watchEffect`** for ref tracking, wraps returned **functions**

## Scheduler and `batch`

`batch(registry, fn)` delegates to **`registry.scheduler.batch(fn)`**. Inside the store, returned functions are invoked through **`__runAction`**, which already runs the user function inside **`scheduler.batch`**.

## Events

`StoreEvent` values (actions, optional persist/hydrate, etc.) flow to **`StoreRuntimeHooks`** when registered — for example the devtools client merges its hooks as a plugin.

See [Plugins & hooks](plugins-and-hooks.md) for hook names and payload shape.
