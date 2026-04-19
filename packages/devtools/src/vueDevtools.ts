import type { App } from "vue";
import type { DevtoolsClient } from "./client.js";

/**
 * Forwards devtools messages to `window.postMessage` (standalone panel / extension host).
 */
export function attachDevtoolsPostMessageBridge(
  client: DevtoolsClient,
  targetOrigin = "*",
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  return client.addSink((msg) => {
    window.postMessage(msg, targetOrigin);
  });
}

export function setupVueDevtoolsHook(_app: App, _client: DevtoolsClient): void {
  /* Placeholder for `@vue/devtools-api` integration when present in host app. */
}
