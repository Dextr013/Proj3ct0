import { GameState, Hero } from '../core/types';
import { bossRewardGold } from './economy';

export interface BattleEvents {
  onBossUpdate: (hp: number, maxHp: number, level: number) => void;
  onBossDefeated: (rewardGold: number) => void;
}

export function createBattle(state: GameState, events: BattleEvents) {
  function totalAttackDamage(heroes: Hero[]): number {
    return heroes.reduce((sum, h) => sum + h.baseDamage, 0);
  }

  function clickBoss(): void {
    if (state.settings.paused) return;
    const mainSquad = state.squads.find((s) => s.isMain);
    const heroes = mainSquad ? mainSquad.heroIds.map((id) => state.heroes[id]).filter(Boolean) : [];
    const damage = Math.max(1, Math.floor(totalAttackDamage(heroes) / 2));
    state.boss.hp = Math.max(0, state.boss.hp - damage);
    events.onBossUpdate(state.boss.hp, state.boss.maxHp, state.boss.level);
    if (state.boss.hp <= 0) {
      const gold = bossRewardGold(state.boss.level);
      state.gold += gold;
      events.onBossDefeated(gold);
    }
  }

  function nextBoss(): void {
    const lvl = state.boss.level + 1;
    const maxHp = Math.floor(50 * Math.pow(1.35, lvl));
    state.boss = { level: lvl, hp: maxHp, maxHp };
    events.onBossUpdate(state.boss.hp, state.boss.maxHp, state.boss.level);
  }

  function resetSelfResurrections(): void {
    Object.values(state.heroes).forEach((h) => (h.resurrectedThisFight = false));
  }

  return { clickBoss, nextBoss, resetSelfResurrections };
}