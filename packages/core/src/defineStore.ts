import type { StoreFactory, StoreRegistry } from "./registry.js";
import { instantiateFromDefinition } from "./registry.js";
import { resolveRegistry } from "./storeInstance.js";
import type { StoreLocalPlugin } from "./plugins.js";
import type { GenericStore } from "./storeInstance.js";

export function defineStore<const Id extends string>(
  id: Id,
  setup: () => Record<string, unknown>,
  options?: {
    deps?: () => ReadonlyArray<StoreFactory>;
    plugins?: readonly StoreLocalPlugin[];
  },
): StoreFactory & ((registry?: StoreRegistry) => GenericStore) {
  const def = {
    id,
    setup,
    deps: options?.deps,
    plugins: options?.plugins,
  };

  const useStore = ((registry?: StoreRegistry) => {
    const reg = resolveRegistry(registry);
    return reg.getOrCreate(id, () => instantiateFromDefinition(reg, def));
  }) as StoreFactory;

  Object.defineProperty(useStore, "storeId", { value: id, enumerable: false });

  return useStore as StoreFactory & ((registry?: StoreRegistry) => GenericStore);
}
