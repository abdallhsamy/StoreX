export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface StorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
  subscribe?(listener: (key: string, value: string | null) => void): () => void;
}

export interface Serializer<T = JsonValue> {
  serialize(value: T): string;
  deserialize(raw: string): T;
}

export type Redactor = (path: string[], value: unknown) => unknown;

export type MergeStrategy = "lww" | "custom";

export interface PersistEnvelope<T = JsonValue> {
  v: number;
  updatedAt: number;
  tabId: string;
  data: T;
}

export interface PersistPolicy<TState extends Record<string, unknown>> {
  key: string;
  paths: (keyof TState & string)[];
  version: number;
  debounceMs?: number;
  redactPaths?: string[];
  redactor?: Redactor;
  migrate?: (fromVersion: number, raw: unknown) => JsonValue;
  encrypt?: (blob: string) => Promise<string> | string;
  decrypt?: (blob: string) => Promise<string> | string;
}

export interface CustomMergeContext<T = JsonValue> {
  tabId: string;
  local: PersistEnvelope<T> | null;
  remote: PersistEnvelope<T>;
}

export type CustomMergeFn<T = JsonValue> = (
  ctx: CustomMergeContext<T>,
) => PersistEnvelope<T> | null;
