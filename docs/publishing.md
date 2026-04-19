# Publishing to npm

This monorepo publishes **multiple packages** from `packages/*` using **pnpm**. The workspace root is **`private: true`** and is **not** published.

## Prerequisites

1. **npm account** with permission to publish the **`@storex`** scope (create the org/scope on npm if needed).

   **Check the registry first.** If names like **`storex`** or **`@storex/core`** already exist and you do **not** control that org, publishing will fail until you **rename** packages (e.g. a scope you own like **`@your-org/storex-core`**) and update all **`workspace:`** / import paths / docs accordingly. Run:

   ```bash
   npm view storex version
   npm view @storex/core version
   ```
2. **Login**: `npm login` (or `npm token create` for CI — use **Automation** token with publish rights).
3. **One-time**: scoped packages default to **private** on npm; every **`@storex/*`** package in this repo sets **`publishConfig.access: "public"`**.

## Before you publish

1. **Bump versions** (keep versions aligned across packages for simplicity, or use [Changesets](https://github.com/changesets/changesets) later).

   ```bash
   # Example: bump all package.json "version" fields consistently (manual or scripted)
   ```

2. **Build** so `dist/` is fresh:

   ```bash
   pnpm run build
   ```

3. **Dry run** (pack without uploading; **`--no-git-checks`** so you can validate locally with an uncommitted working tree):

   ```bash
   pnpm publish:npm:dry
   ```

   For a **real** publish, pnpm expects a **clean Git tree** (commit or stash first), unless you pass **`--no-git-checks`** yourself.

## Publish (recursive)

From the repository root:

```bash
pnpm publish:npm
```

This runs **`pnpm run build`**, then **`pnpm publish -r --access public --no-git-checks`**.

- **`-r`**: publish each non-private workspace package in dependency order.
- **`--no-git-checks`**: allows publish with an uncommitted working tree. Omit it (run `pnpm publish -r --access public` yourself) if you want pnpm to require a clean Git tree first.
- **`workspace:*`** dependencies are rewritten to the **published semver** of sibling packages in the tarball.

## Package names on npm

| Tarball name | Notes |
|--------------|--------|
| `@storex/core`, `@storex/persist`, … | Scoped; require `--access public` (already in `publishConfig`). |
| `storex` | **Unscoped** umbrella package — if the name is taken on npm, rename in `packages/storex/package.json` and update dependents’ docs. |

## CI (optional)

Use `NPM_TOKEN` with `npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN` then `pnpm publish -r --access public --no-git-checks` only from protected branches after tests pass.

## After publish

Smoke-install in a temp project:

```bash
npm init -y && npm install @storex/core vue@^3.5
```

See [Getting started](getting-started.md) for usage.
