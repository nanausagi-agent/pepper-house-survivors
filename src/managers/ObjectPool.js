export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = new Set();
    this.expand(initialSize);
  }

  expand(count) {
    for (let i = 0; i < count; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    if (this.pool.length === 0) {
      this.expand(Math.max(10, this.active.size >> 2));
    }
    const obj = this.pool.pop();
    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (!this.active.has(obj)) return;
    this.active.delete(obj);
    this.resetFn(obj);
    this.pool.push(obj);
  }

  releaseAll() {
    for (const obj of this.active) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  get activeCount() {
    return this.active.size;
  }

  get availableCount() {
    return this.pool.length;
  }
}
