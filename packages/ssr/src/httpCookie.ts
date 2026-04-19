import type { JsonValue } from "@storex/persist";
import type { PersistCookieRequestBody } from "./types.js";

export interface HttpCookiePersistClient {
  /** POST allowlisted state to backend; backend sets httpOnly cookie. */
  save(body: PersistCookieRequestBody): Promise<void>;
}

/**
 * Factory for a tiny client helper — implement `save` with your framework fetch layer.
 */
export function createHttpCookiePersistClient(
  impl: (body: PersistCookieRequestBody) => Promise<void>,
): HttpCookiePersistClient {
  return {
    save: impl,
  };
}

export async function pushStateToHttpOnlyCookie(
  client: HttpCookiePersistClient,
  input: { key: string; version: number; payload: JsonValue },
): Promise<void> {
  await client.save({
    key: input.key,
    version: input.version,
    payload: input.payload,
  });
}
