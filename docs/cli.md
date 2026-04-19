# CLI (`storex`)

The **`@storex/cli`** package exposes a **`storex`** binary (run via **`pnpm exec storex`** from a project that depends on it, or from this monorepo after build).

## Commands (current)

### `storex create store <name> [--persist] [--idb]`

Writes **`<name>.store.ts`** next to the current working directory with:

- `import { ref } from "vue"` and **`defineStore`** from **`@storex/core`**
- A **setup function** skeleton returning an object (you fill in refs and functions)

Optional flags append commented **`PersistEngine`** hints (`--persist`, `--idb` for IndexedDB adapter).

### `storex migrate pinia --path <dir>`

Prints **guidance** for migrating from Pinia. AST codemods are planned.

### `storex migrate redux --path <dir>`

Prints **guidance** for migrating from Redux (often via **`@storex/redux-compat`**).

### `storex doctor --path <dir>`

Prints **guidance** for common footguns (unsafe destructuring, etc.). Automated scanning is planned.

## Building the CLI

The root **`pnpm run build`** script compiles **`@storex/cli`** last, after **`storex`** umbrella package builds.
