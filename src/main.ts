import { applyTranslations } from './core/localization';
import { audioManager } from './core/audio';
import { detectPlatform } from './core/platform';
import { GameState, HeroClass, Race } from './core/types';
import { saveGame, loadGame, resetDailyIfNeeded } from './core/save';
import { startingWarrior, createBaseHero } from './game/heroes';
import { createBattle } from './game/battle';
import { renderPortraits } from './ui/inventory';
import { renderTavern } from './ui/tavern';
import { renderMerchant } from './ui/merchant';
import { ensureSquadsInitialized, startResourceLoop } from './ui/squads';

function defaultState(): GameState {
  return {
    heroes: {},
    squads: [],
    mainSquadId: null,
    boss: { level: 1, maxHp: 60, hp: 60 },
    gold: 0,
    crystals: 0,
    settings: {
      volume: 0.5,
      language: 'ru',
      paused: false,
      hasBattlePass: false,
      lastResurrectionDate: null,
      dailyResurrectionUsed: false,
    },
  };
}

const el = {
  menu: document.getElementById('menu') as HTMLDivElement,
  game: document.getElementById('game') as HTMLDivElement,
  postBossChoice: document.getElementById('postBossChoice') as HTMLDivElement,
  tavern: document.getElementById('tavern') as HTMLDivElement,
  merchant: document.getElementById('merchant') as HTMLDivElement,
  tavernList: document.getElementById('tavernList') as HTMLDivElement,
  merchantList: document.getElementById('merchantList') as HTMLDivElement,
  settingsModal: document.getElementById('settingsModal') as HTMLDivElement,
  volumeRange: document.getElementById('volumeRange') as HTMLInputElement,
  languageSelect: document.getElementById('languageSelect') as HTMLSelectElement,
  btnCloseSettings: document.getElementById('btnCloseSettings') as HTMLButtonElement,
  btnStart: document.getElementById('btnStart') as HTMLButtonElement,
  btnLoad: document.getElementById('btnLoad') as HTMLButtonElement,
  btnSave: document.getElementById('btnSave') as HTMLButtonElement,
  btnSettings: document.getElementById('btnSettings') as HTMLButtonElement,
  btnInGameSettings: document.getElementById('btnInGameSettings') as HTMLButtonElement,
  btnMenu: document.getElementById('btnMenu') as HTMLButtonElement,
  btnPause: document.getElementById('btnPause') as HTMLButtonElement,
  btnGoTavern: document.getElementById('btnGoTavern') as HTMLButtonElement,
  btnGoMerchant: document.getElementById('btnGoMerchant') as HTMLButtonElement,
  btnBackFromTavern: document.getElementById('btnBackFromTavern') as HTMLButtonElement,
  btnBackFromMerchant: document.getElementById('btnBackFromMerchant') as HTMLButtonElement,
  bossHpBar: document.getElementById('bossHpBar') as HTMLDivElement,
  bossLevel: document.getElementById('bossLevel') as HTMLSpanElement,
  bossSprite: document.getElementById('bossSprite') as HTMLDivElement,
  portraits: document.getElementById('portraits') as HTMLDivElement,
  gold: document.getElementById('gold') as HTMLSpanElement,
  crystals: document.getElementById('crystals') as HTMLSpanElement,
};

let state: GameState = defaultState();
let resourceTimer = 0;

function route(view: 'menu' | 'game' | 'post' | 'tavern' | 'merchant') {
  el.menu.classList.toggle('hidden', view !== 'menu');
  el.game.classList.toggle('hidden', view !== 'game');
  el.postBossChoice.classList.toggle('hidden', view !== 'post');
  el.tavern.classList.toggle('hidden', view !== 'tavern');
  el.merchant.classList.toggle('hidden', view !== 'merchant');
}

function updateCurrencies(): void {
  el.gold.textContent = Math.floor(state.gold).toString();
  el.crystals.textContent = Math.floor(state.crystals).toString();
}

function updateBossUI(): void {
  el.bossLevel.textContent = state.boss.level.toString();
  const pct = Math.max(0, Math.min(1, state.boss.hp / state.boss.maxHp));
  el.bossHpBar.style.width = `${pct * 100}%`;
}

function refreshPortraits(): void {
  const main = state.squads.find((s) => s.isMain);
  const heroIds = main ? main.heroIds : [];
  const heroes = heroIds.map((id) => state.heroes[id]);
  const maxSlots = state.settings.hasBattlePass ? 5 : 4;
  renderPortraits(el.portraits, heroes, maxSlots);
}

function startNewGame(): void {
  state = defaultState();
  ensureSquadsInitialized(state);
  const hero = startingWarrior();
  state.heroes[hero.id] = hero;
  const main = state.squads.find((s) => s.isMain)!;
  main.heroIds.push(hero.id);
  resetDailyIfNeeded(state);
  applyTranslations(state.settings.language);
  audioManager.volume = state.settings.volume;
  updateCurrencies();
  updateBossUI();
  refreshPortraits();
  if (resourceTimer) window.clearInterval(resourceTimer);
  resourceTimer = startResourceLoop(state, () => {
    updateCurrencies();
  });
  route('game');
}

function continueLoadedGame(loaded: GameState): void {
  state = loaded;
  ensureSquadsInitialized(state);
  resetDailyIfNeeded(state);
  applyTranslations(state.settings.language);
  (el.volumeRange as HTMLInputElement).value = state.settings.volume.toString();
  (el.languageSelect as HTMLSelectElement).value = state.settings.language;
  audioManager.volume = state.settings.volume;
  updateCurrencies();
  updateBossUI();
  refreshPortraits();
  if (resourceTimer) window.clearInterval(resourceTimer);
  resourceTimer = startResourceLoop(state, () => updateCurrencies());
  route('game');
}

function init(): void {
  detectPlatform();
  applyTranslations(state.settings.language);

  el.btnStart.onclick = () => startNewGame();
  el.btnLoad.onclick = () => {
    const saved = loadGame();
    if (saved) continueLoadedGame(saved);
  };
  el.btnSave.onclick = () => {
    saveGame(state);
  };
  el.btnSettings.onclick = () => el.settingsModal.classList.remove('hidden');
  el.btnInGameSettings.onclick = () => el.settingsModal.classList.remove('hidden');
  el.btnCloseSettings.onclick = () => el.settingsModal.classList.add('hidden');

  el.volumeRange.oninput = () => {
    const v = parseFloat(el.volumeRange.value);
    state.settings.volume = v;
    audioManager.volume = v;
  };
  el.languageSelect.onchange = () => {
    state.settings.language = el.languageSelect.value as any;
    applyTranslations(state.settings.language);
  };

  const battle = createBattle(state, {
    onBossUpdate: () => updateBossUI(),
    onBossDefeated: (gold) => {
      updateCurrencies();
      route('post');
    },
  });

  el.bossSprite.onclick = () => {
    battle.clickBoss();
  };

  el.btnPause.onclick = () => {
    state.settings.paused = !state.settings.paused;
    el.btnPause.textContent = state.settings.paused ? 'Resume' : 'Pause';
  };

  el.btnMenu.onclick = () => {
    route('menu');
  };

  el.btnGoTavern.onclick = () => {
    route('tavern');
    renderTavern(state, el.tavernList, () => {
      // After hire, start next boss
      battle.nextBoss();
      refreshPortraits();
      updateCurrencies();
      route('game');
    });
  };

  el.btnGoMerchant.onclick = () => {
    route('merchant');
    renderMerchant(state, el.merchantList, () => {
      battle.nextBoss();
      refreshPortraits();
      updateCurrencies();
      route('game');
    });
  };

  el.btnBackFromTavern.onclick = () => {
    battle.nextBoss();
    route('game');
  };
  el.btnBackFromMerchant.onclick = () => {
    battle.nextBoss();
    route('game');
  };
}

init();