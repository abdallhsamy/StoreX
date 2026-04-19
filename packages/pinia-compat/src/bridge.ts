import type { Store as PiniaStore } from "pinia";
import type { GenericStore } from "@storex/core";

/** Read-only view of a Pinia store for incremental migration. */
export function piniaStoreToStoreXView<T extends object>(piniaStore: PiniaStore<string, T, unknown, unknown>): {
  readonly state: Readonly<T>;
} {
  return {
    get state() {
      return piniaStore.$state as Readonly<T>;
    },
  };
}

/** Wrap a StoreX store to look roughly like Pinia's `$state` reader (interop only). */
export function storeXToReadonlyState<T extends Record<string, unknown>>(store: GenericStore): Readonly<T> {
  return store.state as Readonly<T>;
}
