import {
  effectScope,
  isReadonly,
  isRef,
  reactive,
  shallowRef,
  watchEffect,
  type Ref,
} from "vue";
import type { StoreRuntimeHooks } from "./hooks.js";
import { nextEventId, type StoreEvent } from "./events.js";
import type { StoreLocalPlugin, StorePluginApi } from "./plugins.js";
import type { StoreRegistry } from "./registry.js";
import type { CommitScheduler } from "./scheduler.js";
import type { GenericStore } from "./storeInstance.js";

export interface SetupStoreOptions<Id extends string> {
  id: Id;
  setup: () => Record<string, unknown>;
  registry: StoreRegistry;
  scheduler: CommitScheduler;
  hooks?: StoreRuntimeHooks;
  plugins?: readonly StoreLocalPlugin[];
}

/**
 * Pinia-style **setup store**: `setup()` returns refs, computeds, and plain functions;
 * the public store unwraps refs at the top level and wraps functions for action hooks.
 */
export function createSetupStore<Id extends string>(opts: SetupStoreOptions<Id>): GenericStore {
  const scope = effectScope(true);
  const version = shallowRef(0);
  const subscribers = new Set<(payload: { state: unknown; mutation?: string }) => void>();

  const setupResult = scope.run(() => opts.setup()) ?? {};

  const shell: Record<string, unknown> = {};

  for (const key of Object.keys(setupResult)) {
    const v = setupResult[key];
    if (v === undefined) continue;

    if (typeof v === "function") {
      continue;
    }

    if (isRef(v)) {
      const r = v as Ref<unknown>;
      const desc: PropertyDescriptor = {
        enumerable: true,
        configurable: true,
        get: () => r.value,
      };
      if (!isReadonly(r)) {
        desc.set = (x: unknown) => {
          (r as Ref<unknown>).value = x;
        };
      }
      Object.defineProperty(shell, key, desc);
    } else {
      Object.defineProperty(shell, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: v,
      });
    }
  }

  const raw = reactive(shell) as Record<string, unknown> & { id?: string };

  function bump(source: string): void {
    version.value += 1;
    if (subscribers.size > 0) {
      for (const cb of subscribers) {
        cb({ state: raw, mutation: source });
      }
    }
    opts.scheduler.scheduleFlush();
  }

  const storeHelpers: GenericStore = {
    id: opts.id,
    get state() {
      return raw as GenericStore["state"];
    },
    $version: version,
    $hydrate(partial: Record<string, unknown>) {
      for (const [k, val] of Object.entries(partial)) {
        const src = setupResult[k];
        if (isRef(src)) {
          (src as Ref<unknown>).value = val;
        } else if (k in raw) {
          (raw as Record<string, unknown>)[k] = val;
        }
      }
      bump("__hydrate__");
    },
    $subscribe(cb) {
      subscribers.add(cb);
      return () => subscribers.delete(cb);
    },
    $dispose() {
      subscribers.clear();
      scope.stop();
    },
    __unwrapState() {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(setupResult)) {
        const v = setupResult[key];
        if (typeof v === "function") continue;
        if (isRef(v)) out[key] = (v as Ref<unknown>).value;
        else out[key] = v as unknown;
      }
      return out;
    },
    __runAction(name, fn) {
      const actionId = nextEventId();
      const start: StoreEvent = {
        id: actionId,
        ts: Date.now(),
        originStore: opts.id,
        kind: "action",
        name,
      };
      opts.hooks?.onActionStart?.(start);
      try {
        return opts.scheduler.batch(() => fn());
      } finally {
        opts.hooks?.onActionEnd?.({
          id: nextEventId(),
          ts: Date.now(),
          originStore: opts.id,
          kind: "action",
          name,
          parentActionId: actionId,
        });
      }
    },
  };

  Object.defineProperty(raw, "id", { value: opts.id, enumerable: false, configurable: true });
  Object.defineProperty(raw, "state", {
    enumerable: false,
    configurable: true,
    get: () => raw,
  });

  for (const key of Object.keys(storeHelpers) as (keyof GenericStore)[]) {
    if (key === "id" || key === "state") continue;
    Object.defineProperty(raw, key, {
      enumerable: false,
      configurable: true,
      value: (storeHelpers as unknown as Record<string, unknown>)[key],
    });
  }

  for (const key of Object.keys(setupResult)) {
    const v = setupResult[key];
    if (typeof v !== "function") continue;
    const fn = v as (...args: unknown[]) => unknown;
    (raw as Record<string, unknown>)[key] = (...args: unknown[]) => {
      return storeHelpers.__runAction(key, () => fn(...args));
    };
  }

  scope.run(() => {
    watchEffect(() => {
      for (const v of Object.values(setupResult)) {
        if (isRef(v)) void (v as Ref<unknown>).value;
      }
      bump("__state__");
    });
  });

  for (const p of opts.plugins ?? []) {
    p.extendStore?.(storeHelpers as unknown as StorePluginApi);
  }

  return raw as unknown as GenericStore;
}
