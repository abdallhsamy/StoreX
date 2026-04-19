import type { GenericStore } from "@storex/core";
import type {
  CustomMergeFn,
  JsonValue,
  PersistEnvelope,
  PersistPolicy,
  Serializer,
  StorageAdapter,
} from "./types.js";
import { pickPaths } from "./pick.js";
import { defaultRedactPaths, walkRedact } from "./redact.js";

const defaultSerializer: Serializer = {
  serialize: (v) => JSON.stringify(v),
  deserialize: (raw) => JSON.parse(raw) as JsonValue,
};

function tabId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab_${Math.random().toString(36).slice(2)}`;
}

export interface PersistEngineOptions<T extends Record<string, unknown>> {
  store: GenericStore;
  adapter: StorageAdapter;
  policy: PersistPolicy<T>;
  serializer?: Serializer;
  merge?: "lww" | CustomMergeFn<JsonValue>;
  hooks?: {
    onPersist?: (payload: unknown) => void;
    onHydrate?: (payload: unknown) => void;
  };
}

export class PersistEngine<T extends Record<string, unknown>> {
  private readonly store: GenericStore;
  private readonly adapter: StorageAdapter;
  private readonly policy: PersistPolicy<T>;
  private readonly serializer: Serializer;
  private readonly merge: "lww" | CustomMergeFn<JsonValue>;
  private readonly hooks: PersistEngineOptions<T>["hooks"];
  private readonly localTab = tabId();
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  private unsub: (() => void) | undefined;
  private unsubAdapter: (() => void) | undefined;

  constructor(opts: PersistEngineOptions<T>) {
    this.store = opts.store;
    this.adapter = opts.adapter;
    this.policy = opts.policy;
    this.serializer = opts.serializer ?? defaultSerializer;
    this.merge = opts.merge ?? "lww";
    this.hooks = opts.hooks;
  }

  async hydrate(): Promise<void> {
    const raw = await Promise.resolve(this.adapter.getItem(this.policy.key));
    if (!raw) return;

    let text = raw;
    if (this.policy.decrypt) {
      text = await Promise.resolve(this.policy.decrypt(text));
    }

    let env: PersistEnvelope<JsonValue>;
    try {
      env = this.serializer.deserialize(text) as unknown as PersistEnvelope<JsonValue>;
    } catch {
      return;
    }

    let data = env.data;
    if (this.policy.migrate) {
      data = this.policy.migrate(env.v, data) as JsonValue;
    }

    const partial = data as Partial<T>;
    this.store.$hydrate(partial as Record<string, unknown>);
    this.hooks?.onHydrate?.(partial);
  }

  private scheduleWrite(): void {
    const ms = this.policy.debounceMs ?? 50;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = undefined;
      void this.flush();
    }, ms);
  }

  private async flush(): Promise<void> {
    const inner = this.store.__unwrapState() as T;
    let slice = pickPaths(inner, this.policy.paths) as unknown as JsonValue;
    if (this.policy.redactor) {
      slice = walkRedact(slice, this.policy.redactor) as JsonValue;
    } else if (this.policy.redactPaths?.length) {
      slice = walkRedact(slice, defaultRedactPaths(this.policy.redactPaths)) as JsonValue;
    }

    const env: PersistEnvelope<JsonValue> = {
      v: this.policy.version,
      updatedAt: Date.now(),
      tabId: this.localTab,
      data: slice,
    };

    let blob = this.serializer.serialize(env as unknown as JsonValue);
    if (this.policy.encrypt) {
      blob = await Promise.resolve(this.policy.encrypt(blob));
    }
    await Promise.resolve(this.adapter.setItem(this.policy.key, blob));
    this.hooks?.onPersist?.(env);
  }

  private async mergeRemote(raw: string | null): Promise<void> {
    if (!raw) return;
    let text = raw;
    if (this.policy.decrypt) {
      text = await Promise.resolve(this.policy.decrypt(text));
    }
    let remote: PersistEnvelope<JsonValue>;
    try {
      remote = this.serializer.deserialize(text) as unknown as PersistEnvelope<JsonValue>;
    } catch {
      return;
    }

    const localRaw = await Promise.resolve(this.adapter.getItem(this.policy.key));
    let local: PersistEnvelope<JsonValue> | null = null;
    if (localRaw) {
      try {
        local = this.serializer.deserialize(localRaw) as unknown as PersistEnvelope<JsonValue>;
      } catch {
        local = null;
      }
    }

    let winner: PersistEnvelope<JsonValue> | null = null;
    if (this.merge === "lww") {
      winner =
        !local || remote.updatedAt >= local.updatedAt
          ? remote
          : local;
    } else {
      winner = this.merge({ tabId: this.localTab, local, remote });
    }
    if (!winner) return;

    this.store.$hydrate(winner.data as Record<string, unknown>);
    this.hooks?.onHydrate?.(winner.data);
  }

  start(): () => void {
    this.unsub = this.store.$subscribe(() => {
      this.scheduleWrite();
    });

    if (this.adapter.subscribe) {
      this.unsubAdapter = this.adapter.subscribe((key, value) => {
        if (key !== this.policy.key) return;
        void this.mergeRemote(value);
      });
    }

    return () => this.stop();
  }

  stop(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = undefined;
    this.unsub?.();
    this.unsub = undefined;
    this.unsubAdapter?.();
    this.unsubAdapter = undefined;
  }
}
