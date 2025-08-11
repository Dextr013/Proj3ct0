export function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}