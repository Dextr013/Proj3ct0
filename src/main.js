import { Game } from './modules/game.js';
import { AudioManager } from './modules/audio.js';
import { AdManager } from './modules/ads.js';

const canvas = document.getElementById('game-canvas');
const hud = document.getElementById('hud');
const scoreLabel = document.getElementById('score-label');
const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const playBtn = document.getElementById('play-btn');

const audio = new AudioManager();
const ads = new AdManager({ provider: 'auto' });
let game = null;
let animationHandle = null;

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
}

async function startGame() {
  menu.style.display = 'none';
  hud.style.display = 'flex';
  await audio.unlock();
  await audio.startMusic();

  game = new Game({ canvas, audio, onScoreChange: updateScoreLabel });
  updateScoreLabel(0);
  game.start();

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

function updateScoreLabel(score) {
  scoreLabel.textContent = `Счёт: ${score}`;
}

// UI events
playBtn.addEventListener('click', async () => {
  await startGame();
});

menuBtn.addEventListener('click', async () => {
  // Pause and return to menu; show ad interstitial if available
  try {
    await ads.showInterstitial({ reason: 'pause' });
  } catch (_) { /* ignore */ }
  if (game) {
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

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.suspend();
  } else {
    audio.resume();
  }
});

// Initial canvas sizing
resizeCanvasToDisplaySize();