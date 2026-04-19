import type { StoreEvent, StoreRuntimeHooks } from "@storex/core";
import { RingBuffer } from "./ringBuffer.js";
import { shallowDiff } from "./diff.js";
import { sanitizeEvent } from "./sanitize.js";

export const DEVTOOLS_PROTOCOL_VERSION = 1 as const;

export type DevtoolsMessage =
  | { type: "storex/event"; version: typeof DEVTOOLS_PROTOCOL_VERSION; event: StoreEvent }
  | { type: "storex/snapshot"; version: typeof DEVTOOLS_PROTOCOL_VERSION; label: string; tree: unknown };

export interface DevtoolsClientOptions {
  maxEvents?: number;
  production?: boolean;
  sink?: (msg: DevtoolsMessage) => void;
}

export class DevtoolsClient {
  private readonly buffer: RingBuffer<StoreEvent>;
  private readonly sinks = new Set<(msg: DevtoolsMessage) => void>();
  private readonly production: boolean;

  constructor(opts: DevtoolsClientOptions = {}) {
    this.buffer = new RingBuffer(opts.maxEvents ?? 500);
    if (opts.sink) this.sinks.add(opts.sink);
    this.production = opts.production ?? false;
  }

  addSink(sink: (msg: DevtoolsMessage) => void): () => void {
    this.sinks.add(sink);
    return () => this.sinks.delete(sink);
  }

  private emit(msg: DevtoolsMessage): void {
    for (const s of this.sinks) {
      s(msg);
    }
  }

  readonly hooks: StoreRuntimeHooks = {
    onActionStart: (e) => this.push(e),
    onActionEnd: (e) => this.push(e),
    onMutation: (e) => this.push(e),
    onPersist: (e) => this.push(e),
    onHydrate: (e) => this.push(e),
  };

  private push(event: StoreEvent): void {
    const ev = this.production ? sanitizeEvent(event) : event;
    this.buffer.push(ev);
    this.emit({ type: "storex/event", version: DEVTOOLS_PROTOCOL_VERSION, event: ev });
  }

  getTimeline(): StoreEvent[] {
    return this.buffer.toArray();
  }

  clear(): void {
    this.buffer.clear();
  }

  /** Apply a persisted snapshot slice (e.g. rewinding UI state) via the store’s `$hydrate`. */
  timeTravelHydrate(
    storeId: string,
    target: { $hydrate: (partial: Record<string, unknown>) => void },
    partial: Record<string, unknown>,
  ): void {
    void storeId;
    target.$hydrate(partial);
  }

  buildSnapshot(label: string, tree: unknown): DevtoolsMessage {
    return { type: "storex/snapshot", version: DEVTOOLS_PROTOCOL_VERSION, label, tree };
  }

  diffSnapshots(
    before: Record<string, unknown>,
    after: Record<string, unknown>,
  ): Record<string, unknown> {
    return shallowDiff(before, after);
  }
}
