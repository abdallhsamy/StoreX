import type { JsonValue, Redactor } from "./types.js";

export function defaultRedactPaths(paths: string[]): Redactor {
  return (path, value) => {
    const dotted = path.join(".");
    if (paths.some((p) => dotted === p || dotted.startsWith(`${p}.`))) {
      return "[REDACTED]";
    }
    return value;
  };
}

export function walkRedact(value: unknown, redactor: Redactor, path: string[] = []): unknown {
  const replaced = redactor(path, value);
  if (replaced !== value) return replaced;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((v, i) => walkRedact(v, redactor, [...path, String(i)]));
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = walkRedact(v, redactor, [...path, k]);
  }
  return out as JsonValue;
}
