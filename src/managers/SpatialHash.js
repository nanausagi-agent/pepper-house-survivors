export class SpatialHash {
  constructor(cellSize = 64) {
    this.cellSize = cellSize;
    this.cells = new Map();
    this._queryResult = [];
  }

  _key(cx, cy) {
    return (cx * 73856093) ^ (cy * 19349663); // fast spatial hash
  }

  clear() {
    this.cells.clear();
  }

  insert(entityId, x, y, radius = 8) {
    const cs = this.cellSize;
    const minCX = Math.floor((x - radius) / cs);
    const maxCX = Math.floor((x + radius) / cs);
    const minCY = Math.floor((y - radius) / cs);
    const maxCY = Math.floor((y + radius) / cs);

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const key = this._key(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
          cell = [];
          this.cells.set(key, cell);
        }
        cell.push(entityId);
      }
    }
  }

  query(x, y, w, h) {
    const cs = this.cellSize;
    const minCX = Math.floor((x - w * 0.5) / cs);
    const maxCX = Math.floor((x + w * 0.5) / cs);
    const minCY = Math.floor((y - h * 0.5) / cs);
    const maxCY = Math.floor((y + h * 0.5) / cs);

    this._queryResult.length = 0;
    const seen = new Set();

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = this.cells.get(this._key(cx, cy));
        if (!cell) continue;
        for (let i = 0; i < cell.length; i++) {
          const eid = cell[i];
          if (!seen.has(eid)) {
            seen.add(eid);
            this._queryResult.push(eid);
          }
        }
      }
    }
    return this._queryResult;
  }

  queryRadius(x, y, radius) {
    return this.query(x, y, radius * 2, radius * 2);
  }
}
