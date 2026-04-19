export class StoreXError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "StoreXError";
  }
}

export class CircularDependencyError extends StoreXError {
  constructor(public readonly chain: readonly string[]) {
    super(
      `Circular store dependency detected: ${chain.join(" -> ")}. Break the cycle via lazy access or restructuring deps().`,
      "E_CIRCULAR_DEPS",
    );
    this.name = "CircularDependencyError";
  }
}
