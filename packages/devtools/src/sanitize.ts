import type { StoreEvent } from "@storex/core";

export interface SanitizeOptions {
  maxPayloadDepth?: number;
  maxStringLength?: number;
}

export function sanitizeEvent(
  event: StoreEvent,
  opts: SanitizeOptions = {},
): StoreEvent {
  const maxDepth = opts.maxPayloadDepth ?? 4;
  const maxStr = opts.maxStringLength ?? 200;
  return {
    ...event,
    payload: truncateDeep(event.payload, maxDepth, maxStr),
    diff: truncateDeep(event.diff, maxDepth, maxStr),
  };
}

function truncateDeep(value: unknown, depth: number, maxStr: number): unknown {
  if (depth <= 0) return "[MaxDepth]";
  if (value === null || typeof value !== "object") {
    if (typeof value === "string" && value.length > maxStr) {
      return `${value.slice(0, maxStr)}…`;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((v) => truncateDeep(v, depth - 1, maxStr));
  }
  const out: Record<string, unknown> = {};
  let i = 0;
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (i++ > 30) {
      out["__truncated"] = true;
      break;
    }
    out[k] = truncateDeep(v, depth - 1, maxStr);
  }
  return out;
}
