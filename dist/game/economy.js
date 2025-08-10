export function bossRewardGold(bossLevel) {
    return 10 * bossLevel;
}
export function upgradeCostGold(item) {
    return Math.floor(5 * Math.pow(1.7, item.level));
}
export function upgradeCostCrystals(item) {
    return Math.max(1, Math.floor(item.level / 2));
}
export function applyUpgrade(item) {
    item.level += 1;
}
//# sourceMappingURL=economy.js.map