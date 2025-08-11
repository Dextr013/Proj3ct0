import { randRange } from './util.js';

export class Spawner {
  constructor({ minIntervalMs = 400, maxIntervalMs = 1000 } = {}) {
    this.minIntervalMs = minIntervalMs;
    this.maxIntervalMs = maxIntervalMs;
    this.timerMs = 0;
    this.nextIntervalMs = randRange(this.minIntervalMs, this.maxIntervalMs);
  }

  shouldSpawn(dt) {
    this.timerMs += dt * 1000;
    if (this.timerMs >= this.nextIntervalMs) {
      this.timerMs = 0;
      this.nextIntervalMs = randRange(this.minIntervalMs, this.maxIntervalMs);
      return true;
    }
    return false;
  }
}