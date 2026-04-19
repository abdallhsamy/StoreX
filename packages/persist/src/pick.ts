export function pickPaths<T extends Record<string, unknown>>(
  state: T,
  paths: readonly (keyof T & string)[],
): Partial<T> {
  const out: Partial<T> = {};
  for (const p of paths) {
    if (p in state) {
      out[p] = structuredClone(state[p]) as T[typeof p];
    }
  }
  return out;
}

export function applyPaths<T extends Record<string, unknown>>(
  target: T,
  partial: Partial<T>,
  paths: readonly (keyof T & string)[],
): void {
  for (const p of paths) {
    if (p in partial && partial[p] !== undefined) {
      (target as Record<string, unknown>)[p] = structuredClone(partial[p]) as T[typeof p];
    }
  }
}
