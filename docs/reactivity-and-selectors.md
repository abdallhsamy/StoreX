# Reactivity and selectors

StoreX stores are built on **Vue reactivity**. The same rules as Pinia apply when you read reactive state in components.

## Prefer helpers over naive destructuring

Destructuring **primitive** values from reactive objects can **lose** fine-grained tracking:

```ts
// Risky: `count` is a plain number, not a ref
const { n } = counter;
```

Use the helpers from **`@storex/core`**:

### `storeToRefs(store)`

```ts
import { storeToRefs } from "@storex/core";

const { n, doubled } = storeToRefs(counter);
```

Implementation uses **`toRefs(store.state)`**. Because **`store.state`** aliases the same public reactive shell as your setup return, refs track correctly.

### `pickState(store, keys)`

Returns an object of **`computed`** refs for a fixed key subset — good for focused widgets.

### `pluck(store, selector)`

A single **`computed`** built from a **`(state) => …`** selector on **`store.state`**.

### `createSelector(store, projector)`

Same idea as `pluck`, with an explicit name for readability in larger codebases.

### `untracked(fn)`

Runs **`fn`** without establishing reactive dependencies — use sparingly for hot paths where tracking would be wrong or expensive.

## Utilities

- **`warnDestructuringHint(storeId, key)`** — dev-only console guidance
- **`deepFreezeSnapshot(obj)`** — immutable snapshots for tests or logging

## Type notes

`store.state` is typed as **`DeepReadonly<Record<string, unknown>>`** at the **`GenericStore`** boundary. Your setup return is still backed by writable refs internally.
