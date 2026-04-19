/** Optional deep-freeze helper for snapshots/tests (not applied to live store state). */
export function deepFreezeSnapshot<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreezeSnapshot(item);
    }
    return Object.freeze(value);
  }
  for (const v of Object.values(value as Record<string, unknown>)) {
    deepFreezeSnapshot(v);
  }
  return Object.freeze(value);
}
