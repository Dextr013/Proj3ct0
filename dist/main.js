import { applyTranslations } from './core/localization';
import { audioManager } from './core/audio';
import { detectPlatform } from './core/platform';
import { saveGame, loadGame, resetDailyIfNeeded } from './core/save';
import { startingWarrior } from './game/heroes';
import { createBattle } from './game/battle';
import { renderPortraits } from './ui/inventory';
import { renderTavern } from './ui/tavern';
import { renderMerchant } from './ui/merchant';
import { ensureSquadsInitialized, startResourceLoop } from './ui/squads';
function defaultState() {
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
    menu: document.getElementById('menu'),
    game: document.getElementById('game'),
    postBossChoice: document.getElementById('postBossChoice'),
    tavern: document.getElementById('tavern'),
    merchant: document.getElementById('merchant'),
    tavernList: document.getElementById('tavernList'),
    merchantList: document.getElementById('merchantList'),
    settingsModal: document.getElementById('settingsModal'),
    volumeRange: document.getElementById('volumeRange'),
    languageSelect: document.getElementById('languageSelect'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnStart: document.getElementById('btnStart'),
    btnLoad: document.getElementById('btnLoad'),
    btnSave: document.getElementById('btnSave'),
    btnSettings: document.getElementById('btnSettings'),
    btnInGameSettings: document.getElementById('btnInGameSettings'),
    btnMenu: document.getElementById('btnMenu'),
    btnPause: document.getElementById('btnPause'),
    btnGoTavern: document.getElementById('btnGoTavern'),
    btnGoMerchant: document.getElementById('btnGoMerchant'),
    btnBackFromTavern: document.getElementById('btnBackFromTavern'),
    btnBackFromMerchant: document.getElementById('btnBackFromMerchant'),
    bossHpBar: document.getElementById('bossHpBar'),
    bossLevel: document.getElementById('bossLevel'),
    bossSprite: document.getElementById('bossSprite'),
    portraits: document.getElementById('portraits'),
    gold: document.getElementById('gold'),
    crystals: document.getElementById('crystals'),
};
let state = defaultState();
let resourceTimer = 0;
function route(view) {
    el.menu.classList.toggle('hidden', view !== 'menu');
    el.game.classList.toggle('hidden', view !== 'game');
    el.postBossChoice.classList.toggle('hidden', view !== 'post');
    el.tavern.classList.toggle('hidden', view !== 'tavern');
    el.merchant.classList.toggle('hidden', view !== 'merchant');
}
function updateCurrencies() {
    el.gold.textContent = Math.floor(state.gold).toString();
    el.crystals.textContent = Math.floor(state.crystals).toString();
}
function updateBossUI() {
    el.bossLevel.textContent = state.boss.level.toString();
    const pct = Math.max(0, Math.min(1, state.boss.hp / state.boss.maxHp));
    el.bossHpBar.style.width = `${pct * 100}%`;
}
function refreshPortraits() {
    const main = state.squads.find((s) => s.isMain);
    const heroIds = main ? main.heroIds : [];
    const heroes = heroIds.map((id) => state.heroes[id]);
    const maxSlots = state.settings.hasBattlePass ? 5 : 4;
    renderPortraits(el.portraits, heroes, maxSlots);
}
function startNewGame() {
    state = defaultState();
    ensureSquadsInitialized(state);
    const hero = startingWarrior();
    state.heroes[hero.id] = hero;
    const main = state.squads.find((s) => s.isMain);
    main.heroIds.push(hero.id);
    resetDailyIfNeeded(state);
    applyTranslations(state.settings.language);
    audioManager.volume = state.settings.volume;
    updateCurrencies();
    updateBossUI();
    refreshPortraits();
    if (resourceTimer)
        window.clearInterval(resourceTimer);
    resourceTimer = startResourceLoop(state, () => {
        updateCurrencies();
    });
    route('game');
}
function continueLoadedGame(loaded) {
    state = loaded;
    ensureSquadsInitialized(state);
    resetDailyIfNeeded(state);
    applyTranslations(state.settings.language);
    el.volumeRange.value = state.settings.volume.toString();
    el.languageSelect.value = state.settings.language;
    audioManager.volume = state.settings.volume;
    updateCurrencies();
    updateBossUI();
    refreshPortraits();
    if (resourceTimer)
        window.clearInterval(resourceTimer);
    resourceTimer = startResourceLoop(state, () => updateCurrencies());
    route('game');
}
function init() {
    detectPlatform();
    applyTranslations(state.settings.language);
    el.btnStart.onclick = () => startNewGame();
    el.btnLoad.onclick = () => {
        const saved = loadGame();
        if (saved)
            continueLoadedGame(saved);
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
        state.settings.language = el.languageSelect.value;
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
//# sourceMappingURL=main.js.map