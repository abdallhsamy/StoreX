import { computed, ref, toRaw } from "vue";
import type { StoreFactory } from "./registry.js";
import { describe, expect, it } from "vitest";
import { CircularDependencyError, createStoreRegistry, defineStore, setActiveRegistry } from "./index.js";

describe("defineStore", () => {
  it("mutates refs from returned functions", () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useCounter = defineStore("counter", () => {
      const n = ref(0);
      const inc = () => {
        n.value += 1;
      };
      const bump = () => {
        n.value += 2;
      };
      return { n, inc, bump };
    });
    const s = useCounter() as ReturnType<typeof useCounter> & { n: number; inc: () => void; bump: () => void };
    expect(s.n).toBe(0);
    s.inc();
    expect(s.n).toBe(1);
    s.bump();
    expect(s.n).toBe(3);
    setActiveRegistry(undefined);
  });

  it("detects circular deps", () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useB = defineStore(
      "b",
      () => ({ v: ref(2) }),
      { deps: (): ReadonlyArray<StoreFactory> => [useA] },
    );
    const useA = defineStore(
      "a",
      () => ({ v: ref(1) }),
      { deps: (): ReadonlyArray<StoreFactory> => [useB] },
    );
    expect(() => useA()).toThrow(CircularDependencyError);
    setActiveRegistry(undefined);
  });

  it("hydrates partial state", () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useS = defineStore("s", () => ({
      a: ref(1),
      b: ref(2),
    }));
    const s = useS() as ReturnType<typeof useS> & { a: number; b: number };
    s.$hydrate({ b: 9 });
    expect(s.a).toBe(1);
    expect(s.b).toBe(9);
    setActiveRegistry(undefined);
  });

  it("exposes computed and refs on the store instance", () => {
    const reg = createStoreRegistry();
    setActiveRegistry(reg);
    const useCart = defineStore("cart", () => {
      const items = ref(0);
      const tax = ref(0.1);
      const totalItems = computed(() => items.value);
      const add = (...args: unknown[]) => {
        const n = args[0] as number;
        items.value += n;
      };
      return { items, tax, totalItems, add };
    });
    const cart = useCart() as ReturnType<typeof useCart> & {
      items: number;
      tax: number;
      totalItems: number;
      add: (n: number) => void;
    };
    expect(Object.keys(toRaw(cart))).toContain("items");
    expect(cart.items).toBe(0);
    expect(cart.totalItems).toBe(0);
    cart.add(2);
    expect(cart.items).toBe(2);
    expect(cart.totalItems).toBe(2);
    setActiveRegistry(undefined);
  });
});
