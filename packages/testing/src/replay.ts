import type { GenericStore } from "@storex/core";

export type ReplayStep =
  | { type: "action"; name: string; args: unknown[] }
  | { type: "hydrate"; partial: Record<string, unknown> };

/**
 * Replays recorded steps against a store: invoke action methods or call `$hydrate`.
 * Prefer this over a removed `commit`-based replay API.
 */
export function replayStoreSteps(
  store: GenericStore & Record<string, unknown>,
  steps: readonly ReplayStep[],
): void {
  for (const step of steps) {
    if (step.type === "hydrate") {
      store.$hydrate(step.partial);
      continue;
    }
    const fn = store[step.name];
    if (typeof fn !== "function") {
      throw new Error(`[StoreX/testing] replayStoreSteps: missing action "${step.name}"`);
    }
    (fn as (...args: unknown[]) => unknown)(...step.args);
  }
}
