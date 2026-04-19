# Redux compatibility (`@storex/redux-compat`)

`@storex/redux-compat` provides a **Redux-shaped** store (`defineReduxStore`, `composeMiddleware`) built on Vue primitives like **`shallowRef`** for snapshots.

It is **not** the same model as **`@storex/core`** setup stores:

- Core StoreX: **setup function**, **refs**, **`$hydrate`**, **no `dispatch` / `reducer` map** in the core API
- Redux-compat package: **`dispatch`**, **middleware chain**, reducer updates

Use Redux-compat when you are **migrating an existing Redux app** or need middleware semantics that do not map cleanly onto setup stores.

For Pinia-shaped incremental migration, prefer **`@storex/pinia-compat`** (which aliases **`defineStore`** from core) plus the guides in [Core: `defineStore`](core-define-store.md).
