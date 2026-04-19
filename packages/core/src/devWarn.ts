export const isDev =
  typeof process !== "undefined" &&
  typeof process.env !== "undefined" &&
  process.env.NODE_ENV !== "production";

export function warnDestructuringHint(storeId: string, key: string): void {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.warn(
    `[StoreX][${storeId}] Reading reactive object field "${key}" via plain destructure can lose reactivity. Prefer storeToRefs(), pickState(), or pluck().`,
  );
}
