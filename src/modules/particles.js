import { randRange } from './util.js';

class Particle {
  constructor() {
    this.alive = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 0;
    this.color = '#ffffff';
  }
}

export class ParticleSystem {
  constructor(maxParticles = 300) {
    this.pool = new Array(maxParticles).fill(0).map(() => new Particle());
  }

  clear() {
    for (const p of this.pool) p.alive = false;
  }

  emitBurst({ x, y, color = '#ffffff', count = 8, baseVelocity = 120 }) {
    for (let i = 0; i < count; i += 1) {
      const p = this.pool.find(pp => !pp.alive);
      if (!p) break;
      const angle = randRange(0, Math.PI * 2);
      const speed = baseVelocity * (0.4 + Math.random() * 0.8);
      p.alive = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = randRange(2, 5);
      p.color = color;
      p.life = 0;
      p.maxLife = randRange(0.3, 0.6);
    }
  }

  update(dt, width, height) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.alive = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // gentle drag
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
  }

  render(ctx) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      const t = p.life / p.maxLife;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}