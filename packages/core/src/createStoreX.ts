import type { App } from "vue";
import { STOREX_REGISTRY_KEY, setActiveRegistry } from "./injection.js";
import { createStoreRegistry, type StoreRegistry, type StoreRegistryOptions } from "./registry.js";

export interface CreateStoreXResult {
  registry: StoreRegistry;
  install(app: App): void;
}

export function createStoreX(options: StoreRegistryOptions = {}): CreateStoreXResult {
  const registry = createStoreRegistry(options);

  return {
    registry,
    install(app: App) {
      setActiveRegistry(registry);
      app.provide(STOREX_REGISTRY_KEY, registry);
      registry.install(app);
    },
  };
}
