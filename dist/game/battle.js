import { bossRewardGold } from './economy';
export function createBattle(state, events) {
    function totalAttackDamage(heroes) {
        return heroes.reduce((sum, h) => sum + h.baseDamage, 0);
    }
    function clickBoss() {
        if (state.settings.paused)
            return;
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
    function nextBoss() {
        const lvl = state.boss.level + 1;
        const maxHp = Math.floor(50 * Math.pow(1.35, lvl));
        state.boss = { level: lvl, hp: maxHp, maxHp };
        events.onBossUpdate(state.boss.hp, state.boss.maxHp, state.boss.level);
    }
    function resetSelfResurrections() {
        Object.values(state.heroes).forEach((h) => (h.resurrectedThisFight = false));
    }
    return { clickBoss, nextBoss, resetSelfResurrections };
}
//# sourceMappingURL=battle.js.map