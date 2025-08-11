import { SpriteSheet } from './sprite.js';

const SLIME_SHEET_PATHS = [
  '/slimes_blue.png',
  '/slimes_dark.png',
  '/slimes_green.png',
  '/slimes_pink.png',
  '/slimes_white.png',
  '/slimes_yellow.png',
];

let slimeSheets = [];
let loadPromise = null;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function ensureLoadedSlimes() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    const images = await Promise.all(
      SLIME_SHEET_PATHS.map(async p => {
        try { return await loadImage(p); } catch { return null; }
      })
    );
    slimeSheets = images.filter(Boolean).map(img => SpriteSheet.fromImageAuto(img));
    return slimeSheets;
  })();
  return loadPromise;
}

function getRandomSlimeSheet() {
  if (!slimeSheets.length) return null;
  const idx = Math.floor(Math.random() * slimeSheets.length);
  return slimeSheets[idx];
}

export function getAssets() {
  return {
    ensureLoadedSlimes,
    getRandomSlimeSheet,
    get slimeSheets() { return slimeSheets; },
  };
}