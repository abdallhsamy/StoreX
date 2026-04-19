/**
 * Micro-benchmark: StoreX setup stores vs Pinia options stores (action hot loops).
 */
import { bench, describe } from "vitest";
import { ref } from "vue";
import { createPinia, defineStore as definePiniaStore, setActivePinia } from "pinia";
import { createStoreRegistry, defineStore, setActiveRegistry } from "./index.js";

describe("bench vs pinia", () => {
  const reg = createStoreRegistry();
  setActiveRegistry(reg);
  const useSx = defineStore("benchSx", () => {
    const n = ref(0);
    const inc = () => {
      n.value += 1;
    };
    const reset = () => {
      n.value = 0;
    };
    return { n, inc, reset };
  });
  const sx = useSx() as ReturnType<typeof useSx> & { n: number; inc: () => void; reset: () => void };

  const pinia = createPinia();
  setActivePinia(pinia);
  const useP = definePiniaStore("benchP", {
    state: () => ({ n: 0 }),
    actions: {
      inc() {
        this.n += 1;
      },
    },
  });
  const p = useP();

  bench("storex 1k function writes", () => {
    for (let i = 0; i < 1000; i += 1) {
      sx.inc();
    }
    sx.reset();
  });

  bench("pinia 1k actions", () => {
    for (let i = 0; i < 1000; i += 1) {
      p.inc();
    }
    p.$reset();
  });
});
