# Contributing

## Local workflow

```bash
pnpm install
pnpm run build   # required before pack/link; orders packages by dependency
pnpm test
pnpm bench       # optional
```

## Tests

**Vitest** discovers `packages/**/*.test.ts` (see `vitest.config.ts`). Prefer integration-style tests next to the package they cover.

## TypeScript

Packages use **project references** / **`composite`** where applicable. Run **`pnpm exec tsc -p packages/<pkg>/tsconfig.json --noEmit`** while iterating.

## Build artifact footgun (`@storex/core`)

Imports in source use **`.js` extensions** for native ESM. **Never emit** compiled **`*.js` / `*.d.ts` into `packages/core/src/`** — stray files can shadow **`*.ts`** during Vitest resolution and run **stale** code.

The repository **`.gitignore`** includes patterns to ignore accidental emits under **`packages/core/src/`**.

## Code style expectations

- Keep changes **focused** on the task; avoid drive-by refactors.
- Match existing naming, import style, and documentation density in each package.
- Prefer **complete sentences** in commit messages and PR descriptions.

## Licensing

The repository root **`LICENSE`** is **MIT**. Published npm tarballs inherit the **`license`** field from each `package.json`.
