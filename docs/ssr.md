# SSR (`@storex/ssr`)

Server-side rendering and **httpOnly cookies** have different trust boundaries than client-only `localStorage`.

## httpOnly cookies

Browsers **do not** expose httpOnly cookies to JavaScript. StoreX documents a **client contract** for:

- Reading **non-sensitive** bootstrap payloads (for example JSON in a `<script type="application/json">` tag or a guarded `window.__STOREX__` blob)
- Posting **allowlisted** state back to your server, which then issues **`Set-Cookie`** with **httpOnly**, **Secure**, and **SameSite** as appropriate

## Helpers (package exports)

Exports from **`@storex/ssr`** (see `packages/ssr/src/index.ts`):

- **`readSsrPayloadFromDom`**
- **`hydrateStoreFromSsrPayload`**
- **`hydrateFromWindowGlobal`**
- **`buildSsrScriptTag`**
- **`createHttpCookiePersistClient`**, **`pushStateToHttpOnlyCookie`**
- Types: **`SsrPublicPayload`**, **`PersistCookieRequestBody`**, **`HttpCookiePersistClient`**

## Hydrating a StoreX store

Core stores support **`$hydrate(partial)`** which assigns into **refs** returned from setup when keys match. SSR flows usually:

1. Serialize a safe subset on the server into the HTML payload
2. On the client, parse the payload and call **`hydrateStoreFromSsrPayload`** (or manually `store.$hydrate`)

Pair with [Persistence](persistence.md) if you also persist across reloads on the client.
