import { getCurrentInstance, inject, type DeepReadonly } from "vue";
import { STOREX_REGISTRY_KEY, getActiveRegistry } from "./injection.js";
import type { StoreRegistry } from "./registry.js";

export interface GenericStore {
  readonly id: string;
  readonly state: DeepReadonly<Record<string, unknown>>;
  readonly $version: Readonly<{ value: number }>;
  /** Bootstrap / persistence: merges a partial snapshot into reactive state. */
  $hydrate(partial: Record<string, unknown>): void;
  $subscribe(cb: (payload: { state: unknown; mutation?: string }) => void): () => void;
  $dispose(): void;
  __unwrapState(): Record<string, unknown>;
  __runAction(name: string, fn: () => unknown): unknown;
}

export type StoreSubscriber<S extends Record<string, unknown> = Record<string, unknown>> = (payload: {
  state: DeepReadonly<S>;
  mutation?: string;
}) => void;

export function resolveRegistry(registry?: StoreRegistry): StoreRegistry {
  if (registry) return registry;
  const fromVue = tryInject();
  if (fromVue) return fromVue;
  return getActiveRegistry();
}

function tryInject(): StoreRegistry | undefined {
  if (!getCurrentInstance()) return undefined;
  try {
    return inject(STOREX_REGISTRY_KEY, undefined);
  } catch {
    return undefined;
  }
}
