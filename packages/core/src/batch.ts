import type { StoreRegistry } from "./registry.js";

export function batch<T>(registry: StoreRegistry, fn: () => T): T {
  return registry.scheduler.batch(fn);
}
