const STORAGE_KEY = 'fantasy_boss_clicker_save_v1';
export function saveGame(state) {
    const data = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, data);
}
export function loadGame() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return null;
    try {
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
}
export function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function resetDailyIfNeeded(state) {
    const now = new Date();
    const last = state.settings.lastResurrectionDate ? new Date(state.settings.lastResurrectionDate) : null;
    if (!last || !isSameDay(now, last)) {
        state.settings.dailyResurrectionUsed = false;
        state.settings.lastResurrectionDate = now.toISOString();
    }
}
//# sourceMappingURL=save.js.map