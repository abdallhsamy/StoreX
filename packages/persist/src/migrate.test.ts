import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { createStoreRegistry, defineStore, setActiveRegistry } from "@storex/core";
import { memoryAdapter } from "./adapters/memory.js";
import { PersistEngine } from "./engine.js";

describe("PersistEngine migrations", () => {
  it("runs migrate on hydrate", async () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useS = defineStore("mig", () => ({ n: ref(0) }));
    const store = useS();
    const adapter = memoryAdapter();
    const env = {
      v: 0,
      updatedAt: 1,
      tabId: "t",
      data: { n: 5 },
    };
    adapter.setItem("m", JSON.stringify(env));

    const engine = new PersistEngine({
      store,
      adapter,
      policy: {
        key: "m",
        paths: ["n"],
        version: 2,
        migrate: (from, raw) => {
          expect(from).toBe(0);
          const r = raw as { n: number };
          return { n: r.n + 10 };
        },
      },
    });
    await engine.hydrate();
    expect(store.state.n).toBe(15);
    setActiveRegistry(undefined);
  });
});
