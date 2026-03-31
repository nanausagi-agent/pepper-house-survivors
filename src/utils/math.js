export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSq(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function normalize(x, y) {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randomPointOnEdge(cx, cy, hw, hh, margin) {
  // Random point on rectangle edge surrounding viewport
  const side = Math.floor(Math.random() * 4);
  switch (side) {
    case 0: // top
      return { x: cx + randomInRange(-hw, hw), y: cy - hh - margin };
    case 1: // bottom
      return { x: cx + randomInRange(-hw, hw), y: cy + hh + margin };
    case 2: // left
      return { x: cx - hw - margin, y: cy + randomInRange(-hh, hh) };
    case 3: // right
      return { x: cx + hw + margin, y: cy + randomInRange(-hh, hh) };
  }
}
