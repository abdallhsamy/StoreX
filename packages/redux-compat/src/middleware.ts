export type ReduxMiddlewareAPI<S, A> = {
  getState: () => S;
  dispatch: Dispatch<A>;
};

export type Dispatch<A> = (action: A) => A;

export type ReduxMiddleware<S, A> = (api: ReduxMiddlewareAPI<S, A>) => (next: Dispatch<A>) => Dispatch<A>;

export function composeMiddleware<S, A>(
  middlewares: ReduxMiddleware<S, A>[],
): (api: ReduxMiddlewareAPI<S, A>) => (baseDispatch: Dispatch<A>) => Dispatch<A> {
  return (api) => (baseDispatch) =>
    middlewares.reduceRight<Dispatch<A>>((next, mw) => mw(api)(next), baseDispatch);
}
