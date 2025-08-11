import { createInput } from './input.js';
import { Slime } from './slime.js';
import { Spawner } from './spawner.js';
import { ParticleSystem } from './particles.js';
import { createBackgroundRenderer } from './render_background.js';
import { getAssets } from './assets.js';

const GAME_CONFIG = {
  maxActiveSlimes: 50,
  baseScorePerSlime: 10,
  spawn: {
    minIntervalMs: 400,
    maxIntervalMs: 1100,
  },
  pop: {
    radiusShrinkPerSecond: 220,
    fadePerSecond: 3.0,
  },
  stressModeMultiplier: Number(new URLSearchParams(location.search).get('stress') || 1),
};

export class Game {
  constructor({ canvas, audio, onScoreChange }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;
    this.onScoreChange = onScoreChange;

    this.input = createInput(canvas);

    this.slimes = [];
    this.particles = new ParticleSystem();
    this.spawner = new Spawner({
      minIntervalMs: GAME_CONFIG.spawn.minIntervalMs / GAME_CONFIG.stressModeMultiplier,
      maxIntervalMs: GAME_CONFIG.spawn.maxIntervalMs / GAME_CONFIG.stressModeMultiplier,
    });

    this.isRunning = false;
    this.score = 0;

    this._handlePointerDown = this._handlePointerDown.bind(this);

    this.bgRenderer = createBackgroundRenderer();

    // kick off assets load (non-blocking)
    getAssets().ensureLoadedSlimes();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.score = 0;
    this.slimes.length = 0;
    this.particles.clear();
    this.input.onPointerDown(this._handlePointerDown);
  }

  stop() {
    this.isRunning = false;
    this.input.offPointerDown(this._handlePointerDown);
  }

  _handlePointerDown(pt) {
    if (!this.isRunning) return;
    for (let i = this.slimes.length - 1; i >= 0; i -= 1) {
      const slime = this.slimes[i];
      if (!slime.isAlive) continue;
      if (slime.containsPoint(pt.x, pt.y)) {
        if (slime.hasScored) return;
        slime.hasScored = true;
        slime.pop();
        const awarded = Math.max(1, Math.round(GAME_CONFIG.baseScorePerSlime * slime.getScoreMultiplier()));
        this.score += awarded;
        this.onScoreChange?.(this.score);
        this.audio.playPop();
        this.particles.emitBurst({
          x: slime.x,
          y: slime.y,
          color: slime.color,
          count: 10,
          baseVelocity: 140,
        });
        return;
      }
    }
  }

  update(dt, width, height) {
    if (!this.isRunning) return;
    if (this.slimes.length < GAME_CONFIG.maxActiveSlimes && this.spawner.shouldSpawn(dt)) {
      const spriteSheet = getAssets().getRandomSlimeSheet();
      const slime = Slime.spawnRandom({ width, height, spriteSheet });
      this.slimes.push(slime);
    }

    for (let i = this.slimes.length - 1; i >= 0; i -= 1) {
      const slime = this.slimes[i];
      slime.update(dt, width, height);
      if (slime.isPopping) {
        slime.radius -= GAME_CONFIG.pop.radiusShrinkPerSecond * dt;
        slime.alpha -= GAME_CONFIG.pop.fadePerSecond * dt;
      }
      if (!slime.isAlive || slime.radius <= 2 || slime.alpha <= 0) {
        this.slimes.splice(i, 1);
      }
    }

    this.particles.update(dt, width, height);
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);
    this.bgRenderer.draw(ctx, w, h);

    for (let i = 0; i < this.slimes.length; i += 1) {
      this.slimes[i].render(ctx);
    }

    this.particles.render(ctx);
  }
}