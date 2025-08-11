import { randRange, randInt, clamp } from './util.js';

const COLORS = [
  '#6EE7B7', // mint
  '#93C5FD', // sky
  '#C4B5FD', // purple
  '#FBCFE8', // pink
  '#FDE68A', // yellow
  '#A7F3D0', // green
];

export class Slime {
  constructor({ x, y, radius, color, driftAngle, driftSpeed }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.baseRadius = radius;
    this.color = color;

    this.driftAngle = driftAngle;
    this.driftSpeed = driftSpeed; // px/s

    this.pulseTime = randRange(0, Math.PI * 2);

    this.alpha = 0.95;
    this.isAlive = true;
    this.isPopping = false;
    this.hasScored = false;
  }

  static spawnRandom({ width, height }) {
    const margin = 40;
    const x = randRange(margin, width - margin);
    const y = randRange(margin, height - margin);
    const radius = randRange(22, 60) * (Math.min(width, height) / 900);
    const color = COLORS[randInt(0, COLORS.length - 1)];
    const driftAngle = randRange(0, Math.PI * 2);
    const driftSpeed = randRange(5, 28);
    return new Slime({ x, y, radius, color, driftAngle, driftSpeed });
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  pop() {
    if (this.isPopping || !this.isAlive) return;
    this.isPopping = true;
  }

  getScoreMultiplier() {
    // Smaller slimes give slightly higher score; vary 0.8..1.6
    const normalized = clamp(this.baseRadius / 60, 0.4, 1.2);
    return clamp(1.6 - normalized, 0.8, 1.6);
  }

  update(dt, width, height) {
    if (!this.isAlive) return;
    // Gentle pulsing
    this.pulseTime += dt * 2.2;
    const pulse = Math.sin(this.pulseTime) * 0.06;
    const targetRadius = this.baseRadius * (1 + pulse);
    this.radius += (targetRadius - this.radius) * Math.min(1, dt * 10);

    // Slow drifting with screen bounds bounce
    this.x += Math.cos(this.driftAngle) * this.driftSpeed * dt;
    this.y += Math.sin(this.driftAngle) * this.driftSpeed * dt;

    if (this.x - this.radius < 0 || this.x + this.radius > width) {
      this.driftAngle = Math.PI - this.driftAngle;
      this.x = clamp(this.x, this.radius, width - this.radius);
    }
    if (this.y - this.radius < 0 || this.y + this.radius > height) {
      this.driftAngle = -this.driftAngle;
      this.y = clamp(this.y, this.radius, height - this.radius);
    }
  }

  render(ctx) {
    if (!this.isAlive) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;

    // Soft blob with inner highlight
    const grd = ctx.createRadialGradient(this.x - this.radius * 0.4, this.y - this.radius * 0.5, this.radius * 0.2, this.x, this.y, this.radius);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.3, this.color);
    grd.addColorStop(1, shadeColor(this.color, -18));

    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(2, this.radius), 0, Math.PI * 2);
    ctx.fill();

    // Glossy highlight spot
    ctx.globalAlpha *= 0.6;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(this.x - this.radius * 0.35, this.y - this.radius * 0.5, this.radius * 0.3, this.radius * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function shadeColor(hex, percent) {
  const f = parseInt(hex.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  const newR = Math.round((t - R) * p) + R;
  const newG = Math.round((t - G) * p) + G;
  const newB = Math.round((t - B) * p) + B;
  return `#${(0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}