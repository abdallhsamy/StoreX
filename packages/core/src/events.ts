export type StoreEventKind =
  | "action"
  | "mutation"
  | "persist"
  | "hydrate"
  | "system";

export interface StoreEvent {
  id: string;
  ts: number;
  originStore: string;
  kind: StoreEventKind;
  name: string;
  payload?: unknown;
  diff?: unknown;
  parentActionId?: string;
}

let seq = 0;

export function nextEventId(): string {
  seq += 1;
  return `evt_${seq.toString(36)}`;
}
