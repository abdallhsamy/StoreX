import {
  createStoreRegistry,
  instantiateFromDefinition,
  type GenericStore,
  type StoreRegistry,
} from "@storex/core";

export interface MockStoreOptions {
  initialState?: Record<string, unknown>;
  stubFunctions?: boolean;
  registry?: StoreRegistry;
}

export function createMockStore<Id extends string>(
  id: Id,
  setup: () => Record<string, unknown>,
  mock?: MockStoreOptions,
): GenericStore {
  const registry = mock?.registry ?? createStoreRegistry();

  const setupForInstance = (): Record<string, unknown> => {
    const r = setup();
    if (mock?.stubFunctions) {
      for (const k of Object.keys(r)) {
        if (typeof r[k] === "function") {
          (r as Record<string, unknown>)[k] = async () => {
            /* stubbed */
          };
        }
      }
    }
    return r;
  };

  const store = instantiateFromDefinition(registry, {
    id,
    setup: setupForInstance,
  });

  if (mock?.initialState) {
    store.$hydrate(mock.initialState);
  }

  return store;
}

export function dumpStoreForSnapshot(store: GenericStore, redactKeys: string[] = []): unknown {
  const raw = store.__unwrapState();
  const out = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
  for (const k of redactKeys) {
    if (k in out) out[k] = "[REDACTED]";
  }
  return out;
}
