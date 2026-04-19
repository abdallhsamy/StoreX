# Devtools (`@storex/devtools`)

## `DevtoolsClient`

A ring-buffer timeline of **`StoreEvent`** values with optional **production sanitization** (`sanitizeEvent`).

```ts
import { createRegistryWithDevtools, DevtoolsClient, attachDevtoolsPostMessageBridge } from "@storex/devtools";

const { registry, client } = createRegistryWithDevtools({ production: false });
const detach = attachDevtoolsPostMessageBridge(client);
// client.getTimeline(), client.clear(), …
```

`createRegistryWithDevtools` registers a tiny **`StoreXPlugin`** that forwards **`client.hooks`** into the registry hook merge pipeline.

## Timeline contents

With default wiring you should see:

- **Action start/end** events for **functions returned** from setup stores
- Optional **persist/hydrate** events when those hooks are used

Core setup stores do **not** emit Redux-style mutation events.

## `timeTravelHydrate`

`DevtoolsClient.timeTravelHydrate(storeId, target, partial)` calls **`target.$hydrate(partial)`** — useful when replaying a snapshot slice onto a live store during debugging.

## Protocol

`DEVTOOLS_PROTOCOL_VERSION` guards **`postMessage`** payloads between panels and hosts.

## Vue DevTools bridge

`setupVueDevtoolsHook` / `attachDevtoolsPostMessageBridge` (see package exports) integrate with browser extension messaging patterns; deeper Vue DevTools API integration is roadmap work.
