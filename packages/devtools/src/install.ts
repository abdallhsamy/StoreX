import {
  createStoreRegistry,
  type StoreRegistry,
  type StoreRegistryOptions,
  type StoreXPlugin,
} from "@storex/core";
import { DevtoolsClient } from "./client.js";

export interface DevtoolsInstallOptions extends StoreRegistryOptions {
  devtools?: DevtoolsClient;
  production?: boolean;
}

/**
 * Creates a registry whose hooks are wired to a `DevtoolsClient` timeline.
 */
export function createRegistryWithDevtools(opts: DevtoolsInstallOptions = {}): {
  registry: StoreRegistry;
  client: DevtoolsClient;
} {
  const client = opts.devtools ?? new DevtoolsClient({ production: opts.production });
  const devtoolsPlugin: StoreXPlugin = {
    id: "storex.devtools",
    install: () => {},
    hooks: client.hooks,
  };
  const registry = createStoreRegistry({
    ...opts,
    plugins: [...(opts.plugins ?? []), devtoolsPlugin],
  });
  return { registry, client };
}
