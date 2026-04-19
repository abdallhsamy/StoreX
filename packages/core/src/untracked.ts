import { pauseTracking, resetTracking } from "@vue/reactivity";

/**
 * Runs a function without tracking reactive dependencies (Vue `pauseTracking` / `resetTracking`).
 */
export function untracked<T>(fn: () => T): T {
  pauseTracking();
  try {
    return fn();
  } finally {
    resetTracking();
  }
}
