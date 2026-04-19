export function shallowDiff(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
  maxKeys = 50,
): Record<string, { before: unknown; after: unknown }> {
  const out: Record<string, { before: unknown; after: unknown }> = {};
  if (!before || !after) return out;
  let n = 0;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    if (n >= maxKeys) break;
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      out[k] = { before: before[k], after: after[k] };
      n += 1;
    }
  }
  return out;
}
