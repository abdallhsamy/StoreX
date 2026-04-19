import { computed, type ComputedRef } from "vue";
import type { DeepReadonly } from "vue";
import type { GenericStore } from "./storeInstance.js";

export function createSelector<S extends Record<string, unknown>, R>(
  store: GenericStore,
  projector: (state: DeepReadonly<S>) => R,
): ComputedRef<R> {
  return computed(() => projector(store.state as DeepReadonly<S>));
}
