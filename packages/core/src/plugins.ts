import type { App } from "vue";
import type { StoreRegistry } from "./registry.js";
import type { StoreRuntimeHooks } from "./hooks.js";

export interface StoreXPluginContext {
  registry: StoreRegistry;
  app?: App;
}

export interface StoreXPlugin {
  id: string;
  install: (ctx: StoreXPluginContext) => void | Promise<void>;
  hooks?: StoreRuntimeHooks;
}

export function mergePluginHooks(
  plugins: readonly StoreXPlugin[],
): StoreRuntimeHooks {
  const merged: StoreRuntimeHooks = {};
  for (const p of plugins) {
    if (!p.hooks) continue;
    for (const key of Object.keys(p.hooks) as (keyof StoreRuntimeHooks)[]) {
      const fn = p.hooks[key];
      if (!fn) continue;
      const prev = merged[key] as typeof fn | undefined;
      merged[key] = ((event: Parameters<typeof fn>[0]) => {
        prev?.(event);
        fn(event);
      }) as never;
    }
  }
  return merged;
}

export interface StorePluginApi {
  id: string;
  state: unknown;
  $subscribe: (cb: (payload: unknown) => void) => () => void;
}

export interface StoreLocalPlugin {
  id: string;
  extendStore?: (store: StorePluginApi) => void;
}
