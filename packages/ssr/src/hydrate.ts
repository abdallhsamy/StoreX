import type { GenericStore } from "@storex/core";
import type { SsrPublicPayload } from "./types.js";

const DEFAULT_SCRIPT_ID = "storex-ssr";

export function readSsrPayloadFromDom(scriptId = DEFAULT_SCRIPT_ID): SsrPublicPayload | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(scriptId);
  if (!el || !el.textContent) return null;
  try {
    return JSON.parse(el.textContent) as SsrPublicPayload;
  } catch {
    return null;
  }
}

export function hydrateStoreFromSsrPayload(
  store: GenericStore,
  payload: SsrPublicPayload,
): void {
  store.$hydrate(payload.persisted as Record<string, unknown>);
}

export function hydrateFromWindowGlobal(globalKey = "__STOREX_SSR__"): SsrPublicPayload | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const v = w[globalKey];
  if (!v || typeof v !== "object") return null;
  return v as SsrPublicPayload;
}

export function buildSsrScriptTag(payload: SsrPublicPayload, scriptId = DEFAULT_SCRIPT_ID): string {
  const json = JSON.stringify(payload);
  return `<script type="application/json" id="${scriptId}">${json}</script>`;
}
