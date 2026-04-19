import { shallowRef, type DeepReadonly } from "vue";
import { composeMiddleware, type Dispatch, type ReduxMiddleware } from "./middleware.js";

export interface ReduxCompatOptions<S, A extends { type: string }> {
  id: string;
  initialState: S;
  reducer: (state: S, action: A) => S;
  middleware?: ReduxMiddleware<S, A>[];
}

export interface ReduxCompatStore<S, A extends { type: string }> {
  readonly id: string;
  dispatch: Dispatch<A>;
  getState: () => DeepReadonly<S>;
  $dispose(): void;
}

/**
 * Redux-style reducer store on `shallowRef` state with optional middleware chain.
 */
export function defineReduxStore<S, A extends { type: string }>(
  opts: ReduxCompatOptions<S, A>,
): ReduxCompatStore<S, A> {
  const state = shallowRef(structuredClone(opts.initialState) as S);

  const baseDispatch: Dispatch<A> = (action) => {
    state.value = opts.reducer(state.value, action);
    return action;
  };

  const api = {
    getState: () => state.value,
    dispatch: baseDispatch as Dispatch<A>,
  };

  const dispatch =
    opts.middleware && opts.middleware.length > 0
      ? composeMiddleware(opts.middleware)(api)(baseDispatch)
      : baseDispatch;

  api.dispatch = dispatch;

  return {
    id: opts.id,
    dispatch,
    getState: () => state.value as DeepReadonly<S>,
    $dispose() {
      /* no-op: shallowRef scope owned by caller */
    },
  };
}
