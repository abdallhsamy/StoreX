import type { App } from "vue";
import { CircularDependencyError } from "./errors.js";
import { mergePluginHooks, type StoreLocalPlugin, type StoreXPlugin } from "./plugins.js";
import type { StoreRuntimeHooks } from "./hooks.js";
import { createCommitScheduler, type CommitScheduler } from "./scheduler.js";
import { createSetupStore } from "./setupStore.js";
import type { GenericStore } from "./storeInstance.js";

export type StoreFactory = ((registry?: StoreRegistry) => GenericStore) & {
  readonly storeId: string;
};

export interface LazyStoreEntry {
  id: string;
  load: () => Promise<unknown>;
}

export interface StoreRegistryOptions {
  plugins?: readonly StoreXPlugin[];
  hooks?: StoreRuntimeHooks;
}

export interface StoreRegistry {
  readonly id: string;
  readonly scheduler: CommitScheduler;
  install(app: App): void;
  dispose(): void;
  registerLazy(entry: LazyStoreEntry): void;
  preloadStore(id: string): Promise<void>;
  getStore(id: string): GenericStore | undefined;
  getOrCreate(id: string, factory: () => GenericStore): GenericStore;
  /** @internal */
  __hooks: StoreRuntimeHooks;
}

let regSeq = 0;

export function createStoreRegistry(options: StoreRegistryOptions = {}): StoreRegistry {
  regSeq += 1;
  const registryId = `reg_${regSeq.toString(36)}`;
  const stores = new Map<string, GenericStore>();
  const lazy = new Map<string, LazyStoreEntry>();
  const creating = new Set<string>();
  const chainStack: string[] = [];

  const pluginHooks = mergePluginHooks(options.plugins ?? []);
  const hooks: StoreRuntimeHooks = {
    ...pluginHooks,
    ...options.hooks,
  };

  const scheduler = createCommitScheduler();

  const registry: StoreRegistry = {
    id: registryId,
    scheduler,
    install(_app: App) {
      /* createStoreX wires app + provide */
    },
    dispose() {
      for (const s of stores.values()) {
        s.$dispose();
      }
      stores.clear();
      lazy.clear();
    },
    registerLazy(entry: LazyStoreEntry) {
      lazy.set(entry.id, entry);
    },
    async preloadStore(id) {
      const entry = lazy.get(id);
      if (!entry) return;
      await entry.load();
    },
    getStore(id) {
      return stores.get(id);
    },
    getOrCreate(id, factory) {
      const existing = stores.get(id);
      if (existing) return existing;

      if (creating.has(id)) {
        throw new CircularDependencyError([...chainStack, id]);
      }

      creating.add(id);
      chainStack.push(id);
      try {
        const instance = factory();
        stores.set(id, instance);
        return instance;
      } finally {
        chainStack.pop();
        creating.delete(id);
      }
    },
    __hooks: hooks,
  };

  return registry;
}

export function instantiateFromDefinition(
  registry: StoreRegistry,
  def: {
    id: string;
    setup: () => Record<string, unknown>;
    deps?: () => ReadonlyArray<StoreFactory>;
    plugins?: readonly StoreLocalPlugin[];
  },
): GenericStore {
  if (def.deps) {
    for (const dep of def.deps()) {
      dep(registry);
    }
  }

  return createSetupStore({
    id: def.id,
    setup: def.setup,
    registry,
    scheduler: registry.scheduler,
    hooks: registry.__hooks,
    plugins: def.plugins,
  });
}
