export function createBackgroundRenderer() {
  let cacheCanvas = null;
  let cacheCtx = null;
  let cacheW = 0;
  let cacheH = 0;

  function ensureCacheCell(size) {
    const s = Math.max(200, Math.min(600, Math.floor(size)));
    if (cacheCanvas && cacheW === s && cacheH === s) return;
    cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = s;
    cacheCanvas.height = s;
    cacheCtx = cacheCanvas.getContext('2d');
    cacheW = s;
    cacheH = s;

    // draw soft glow dots
    const ctx = cacheCtx;
    ctx.clearRect(0, 0, s, s);
    ctx.globalAlpha = 0.08;
    const step = Math.floor(s / 5);
    for (let y = step / 2; y < s; y += step) {
      for (let x = step / 2; x < s; x += step) {
        const r = 10 + ((x + y) % step) * 0.05;
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, '#ffffff');
        grd.addColorStop(1, '#8cd3ff');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw(ctx, w, h) {
    const cell = Math.min(w, h) / 2;
    ensureCacheCell(cell);
    for (let y = 0; y < h; y += cacheH) {
      for (let x = 0; x < w; x += cacheW) {
        ctx.drawImage(cacheCanvas, x, y);
      }
    }
  }

  return { draw };
}