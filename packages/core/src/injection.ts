import type { InjectionKey } from "vue";
import type { StoreRegistry } from "./registry.js";

export const STOREX_REGISTRY_KEY: InjectionKey<StoreRegistry> =
  Symbol("storex.registry");

export let activeRegistry: StoreRegistry | undefined;

export function setActiveRegistry(registry: StoreRegistry | undefined): void {
  activeRegistry = registry;
}

export function getActiveRegistry(): StoreRegistry {
  if (!activeRegistry) {
    throw new Error(
      "No active StoreX registry. Call createStoreX(app) or setActiveRegistry(registry) before using stores.",
    );
  }
  return activeRegistry;
}
