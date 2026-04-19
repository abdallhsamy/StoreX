export type FlushListener = () => void;

export function createCommitScheduler() {
  let depth = 0;
  let dirty = false;
  const listeners = new Set<FlushListener>();

  function notify(): void {
    for (const l of listeners) l();
  }

  return {
    onFlush(listener: FlushListener): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    scheduleFlush(): void {
      if (listeners.size === 0) {
        return;
      }
      if (depth > 0) {
        dirty = true;
        return;
      }
      queueMicrotask(() => {
        dirty = false;
        notify();
      });
    },
    batch<T>(fn: () => T): T {
      depth += 1;
      try {
        return fn();
      } finally {
        depth -= 1;
        if (depth === 0 && dirty) {
          dirty = false;
          queueMicrotask(() => notify());
        }
      }
    },
    get isBatching(): boolean {
      return depth > 0;
    },
  };
}

export type CommitScheduler = ReturnType<typeof createCommitScheduler>;
