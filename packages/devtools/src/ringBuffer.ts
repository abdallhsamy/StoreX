export class RingBuffer<T> {
  private readonly buf: T[];
  private head = 0;
  private size = 0;

  constructor(private readonly capacity: number) {
    this.buf = new Array(capacity);
  }

  push(item: T): void {
    const idx = (this.head + this.size) % this.capacity;
    if (this.size < this.capacity) {
      this.buf[idx] = item;
      this.size += 1;
    } else {
      this.buf[idx] = item;
      this.head = (this.head + 1) % this.capacity;
    }
  }

  toArray(): T[] {
    const out: T[] = [];
    for (let i = 0; i < this.size; i += 1) {
      out.push(this.buf[(this.head + i) % this.capacity] as T);
    }
    return out;
  }

  clear(): void {
    this.head = 0;
    this.size = 0;
  }
}
