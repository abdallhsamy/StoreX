import { computed, toRefs, type DeepReadonly } from "vue";
import type { GenericStore } from "./storeInstance.js";

/** Prefer `storeToRefs` over `const { x } = store.state` for reactive primitives at the top level. */
export function storeToRefs<S extends Record<string, unknown>>(store: GenericStore) {
  return toRefs(store.state as object) as {
    [K in keyof S]: import("vue").Ref<S[K]>;
  };
}

export function pickState<S extends Record<string, unknown>, const K extends readonly (keyof S & string)[]>(
  store: GenericStore,
  keys: K,
): { [P in K[number]]: import("vue").ComputedRef<S[P]> } {
  const out = {} as { [P in K[number]]: import("vue").ComputedRef<S[P]> };
  for (const key of keys) {
    const k = key as keyof S & string;
    out[key as K[number]] = computed(() => (store.state as S)[k] as S[K[number]]);
  }
  return out;
}

export function pluck<S extends Record<string, unknown>, R>(
  store: GenericStore,
  selector: (state: DeepReadonly<S>) => R,
): import("vue").ComputedRef<R> {
  return computed(() => selector(store.state as DeepReadonly<S>));
}
