import type { JsonValue } from "@storex/persist";

/** Non-sensitive slice the server may embed for client bootstrap (never secrets). */
export interface SsrPublicPayload {
  version: number;
  persisted: JsonValue;
}

/** Client → server DTO for httpOnly cookie persistence (validated server-side). */
export interface PersistCookieRequestBody {
  key: string;
  version: number;
  payload: JsonValue;
}
