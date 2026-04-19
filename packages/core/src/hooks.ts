import type { StoreEvent } from "./events.js";

export interface StoreRuntimeHooks {
  onActionStart?: (event: StoreEvent) => void;
  onActionEnd?: (event: StoreEvent) => void;
  onMutation?: (event: StoreEvent) => void;
  onPersist?: (event: StoreEvent) => void;
  onHydrate?: (event: StoreEvent) => void;
}

export type StoreHookName = keyof StoreRuntimeHooks;
