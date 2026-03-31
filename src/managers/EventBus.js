class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    const idx = cbs.indexOf(callback);
    if (idx !== -1) cbs.splice(idx, 1);
  }

  emit(event, data) {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    for (let i = 0; i < cbs.length; i++) {
      cbs[i](data);
    }
  }

  clear() {
    this.listeners.clear();
  }
}

// Singleton
export const eventBus = new EventBus();
