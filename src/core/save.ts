import { GameState } from './types';

const STORAGE_KEY = 'fantasy_boss_clicker_save_v1';

export function saveGame(state: GameState): void {
  const data = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, data);
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function resetDailyIfNeeded(state: GameState): void {
  const now = new Date();
  const last = state.settings.lastResurrectionDate ? new Date(state.settings.lastResurrectionDate) : null;
  if (!last || !isSameDay(now, last)) {
    state.settings.dailyResurrectionUsed = false;
    state.settings.lastResurrectionDate = now.toISOString();
  }
}