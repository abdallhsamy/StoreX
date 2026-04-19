import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { createStoreRegistry, defineStore, setActiveRegistry } from "@storex/core";
import { memoryAdapter } from "./adapters/memory.js";
import { PersistEngine } from "./engine.js";

describe("PersistEngine", () => {
  it("persists and hydrates slices", async () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useS = defineStore("persisted", () => {
      const name = ref("x");
      const secret = ref("shh");
      const setName = (v: string) => {
        name.value = v;
      };
      return { name, secret, setName };
    });
    const store = useS();
    const adapter = memoryAdapter();
    const engine = new PersistEngine({
      store,
      adapter,
      policy: {
        key: "k1",
        paths: ["name"],
        version: 1,
        redactPaths: ["secret"],
        debounceMs: 0,
      },
    });
    await engine.hydrate();
    const stop = engine.start();
    (store as { setName: (v: string) => void }).setName("alice");
    await new Promise((r) => setTimeout(r, 5));
    const raw = await Promise.resolve(adapter.getItem("k1"));
    expect(raw).toBeTruthy();
    expect(String(raw)).toContain("alice");
    stop();
    engine.stop();
    setActiveRegistry(undefined);
  });
});
