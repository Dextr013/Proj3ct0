import { Game } from './modules/game.js';
import { AudioManager } from './modules/audio.js';
import { AdManager } from './modules/ads.js';
import { getAssets } from './modules/assets.js';

const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const scoreLabel = document.getElementById('score-label');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const playBtn = document.getElementById('play-btn');
const statsEl = document.getElementById('stats');
const musicToggle = document.getElementById('music-toggle');
const sfxToggle = document.getElementById('sfx-toggle');

const STORAGE_KEY = 'slimepop_meta_v1';
function loadMeta() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function saveMeta(obj) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {}
}

const audio = new AudioManager();
const ads = new AdManager({ provider: 'auto' });
let game = null;
let animationHandle = null;
let lastScore = 0;
let bestScore = 0;

const meta = loadMeta();
if (typeof meta.bestScore === 'number') bestScore = meta.bestScore;
if (typeof meta.lastScore === 'number') lastScore = meta.lastScore;

function updateStatsUI() {
  statsEl.textContent = `Последний счёт: ${lastScore} · Рекорд: ${bestScore}`;
}
updateStatsUI();

// Initialize toggles with persisted audio settings when available
musicToggle.checked = audio.getMusicEnabled();
sfxToggle.checked = audio.getSfxEnabled();

musicToggle.addEventListener('change', () => {
  audio.setMusicEnabled(musicToggle.checked);
});
sfxToggle.addEventListener('change', () => {
  audio.setSfxEnabled(sfxToggle.checked);
});

function resizeCanvasToDisplaySize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.floor(rect.width * dpr);
  const displayHeight = Math.floor(rect.height * dpr);
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function showMenu() {
  cancelAnimationFrame(animationHandle);
  hud.style.display = 'none';
  menu.style.display = 'grid';
  updateStatsUI();
}

async function startGame() {
  menu.style.display = 'none';
  hud.style.display = 'flex';
  await audio.unlock();
  await audio.startMusic();

  getAssets().ensureLoadedSlimes().catch(() => {});

  let combo = 0;
  let lastPopTime = 0;
  function onScoreChange(score) {
    scoreLabel.textContent = `Счёт: ${score}`;
  }

  game = new Game({ canvas, audio, onScoreChange });
  game.start();
  scoreLabel.textContent = 'Счёт: 0';

  let lastTime = performance.now();
  function loop(now) {
    animationHandle = requestAnimationFrame(loop);
    resizeCanvasToDisplaySize();
    const dt = Math.min(1 / 15, Math.max(0, (now - lastTime) / 1000));
    lastTime = now;
    game.update(dt, canvas.width, canvas.height);
    game.render();
  }
  animationHandle = requestAnimationFrame(loop);
}

// UI events
playBtn.addEventListener('click', async () => {
  await startGame();
});

menuBtn.addEventListener('click', async () => {
  try {
    await ads.showInterstitial({ reason: 'pause' });
  } catch (_) { /* ignore */ }
  if (game) {
    // capture final score from HUD text
    const current = Number((scoreLabel.textContent || '').replace(/\D+/g, '')) || 0;
    lastScore = current;
    if (current > bestScore) bestScore = current;
    saveMeta({ lastScore, bestScore });

    game.stop();
    game = null;
  }
  audio.stopMusic();
  showMenu();
});

muteBtn.addEventListener('click', () => {
  const nextMuted = !audio.isMuted();
  audio.setMuted(nextMuted);
  muteIcon.textContent = nextMuted ? '🔇' : '🔊';
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.suspend();
  } else {
    audio.resume();
  }
});

// Light vibration feedback on supported devices when user taps canvas
canvas.addEventListener('pointerdown', () => {
  if (navigator.vibrate) {
    try { navigator.vibrate(6); } catch {}
  }
}, { passive: true });

resizeCanvasToDisplaySize();