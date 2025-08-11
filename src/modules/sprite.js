export class SpriteSheet {
  constructor(image, frameWidth, frameHeight, framesPerRow, totalFrames) {
    this.image = image;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.framesPerRow = framesPerRow;
    this.totalFrames = totalFrames;
  }

  static fromImageAuto(image) {
    const iw = image.width;
    const ih = image.height;
    // Heuristic: if iw is multiple of ih -> horizontal strip of square frames
    if (iw >= ih && iw % ih === 0) {
      const frame = ih;
      const frames = iw / ih;
      return new SpriteSheet(image, frame, frame, frames, frames);
    }
    // If ih is multiple of iw -> vertical strip
    if (ih > iw && ih % iw === 0) {
      const frame = iw;
      const frames = ih / iw;
      return new SpriteSheet(image, frame, frame, 1, frames);
    }
    // Fallback: single frame
    return new SpriteSheet(image, iw, ih, 1, 1);
  }

  drawFrame(ctx, frameIndex, x, y, scale = 1, alpha = 1) {
    const fi = Math.floor(frameIndex) % Math.max(1, this.totalFrames);
    const sx = (fi % this.framesPerRow) * this.frameWidth;
    const sy = Math.floor(fi / this.framesPerRow) * this.frameHeight;
    const dw = this.frameWidth * scale;
    const dh = this.frameHeight * scale;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.drawImage(this.image, sx, sy, this.frameWidth, this.frameHeight, x - dw / 2, y - dh / 2, dw, dh);
    ctx.restore();
  }
}