#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , cmd, ...rest] = process.argv;

function usage(): never {
  // eslint-disable-next-line no-console
  console.log(`storex — StoreX CLI

Commands:
  storex create store <name> [--persist] [--idb]
  storex migrate pinia --path <dir>   (prints guidance; AST codemod planned)
  storex migrate redux --path <dir>    (prints guidance)
  storex doctor --path <dir>           (prints guidance)
`);
  process.exit(cmd ? 1 : 0);
}

async function createStore(name: string, flags: Set<string>): Promise<void> {
  const persist = flags.has("--persist");
  const idb = flags.has("--idb");
  const file = `${name}.store.ts`;
  const body = `import { ref } from "vue";
import { defineStore } from "@storex/core";

export const use${capitalize(name)}Store = defineStore("${name}", () => {
  // const count = ref(0);

  return {
    // count,
  };
});
${
  persist
    ? `
// Suggested: import { PersistEngine, memoryAdapter } from "@storex/persist";
// const engine = new PersistEngine({ store: use${capitalize(name)}Store(), adapter: ${
        idb ? "indexedDbAdapter()" : "memoryAdapter()"
      }, policy: { key: "${name}", paths: [], version: 1 } });
`
    : ""
}
`;
  await writeFile(path.resolve(process.cwd(), file), body, "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${file}`);
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

async function main(): Promise<void> {
  if (!cmd) usage();
  if (cmd === "create" && rest[0] === "store" && rest[1]) {
    const name = rest[1];
    const flags = new Set(rest.slice(2));
    await createStore(name, flags);
    return;
  }
  if (cmd === "migrate" && rest[0] === "pinia") {
    // eslint-disable-next-line no-console
    console.log(
      "Pinia migration: use `@storex/pinia-compat` and `@storex/core` side-by-side. StoreX uses a setup function (`defineStore(id, () => { const x = ref(0); return { x }; })`) like Pinia setup stores. Codemod TBD.",
    );
    return;
  }
  if (cmd === "migrate" && rest[0] === "redux") {
    // eslint-disable-next-line no-console
    console.log(
      "Redux migration: use `@storex/redux-compat` `defineReduxStore`, or port logic into StoreX setup returns (refs + functions).",
    );
    return;
  }
  if (cmd === "doctor") {
    // eslint-disable-next-line no-console
    console.log(
      "Doctor: scan for unsafe destructuring from reactive state (planned). Prefer `storeToRefs` / `pickState` / `pluck` when pulling primitives out of stores.",
    );
    return;
  }
  usage();
}

void main().catch(async (e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  try {
    await mkdir(path.resolve(process.cwd(), "logs"), { recursive: true });
  } catch {
    /* ignore */
  }
  process.exit(1);
});
