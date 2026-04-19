import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { createStoreRegistry, defineStore, setActiveRegistry } from "@storex/core";
import { hydrateStoreFromSsrPayload, readSsrPayloadFromDom } from "./hydrate.js";

describe("SSR hydrate helpers", () => {
  it("hydrates store from payload", () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useS = defineStore("ssr", () => ({ n: ref(0) }));
    const s = useS();
    hydrateStoreFromSsrPayload(s, { version: 1, persisted: { n: 42 } });
    expect(s.state.n).toBe(42);
    setActiveRegistry(undefined);
  });

  it("readSsrPayloadFromDom returns null without document", () => {
    expect(readSsrPayloadFromDom()).toBeNull();
  });
});
