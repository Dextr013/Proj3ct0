import { EquipmentItem } from '../core/types';

export function bossRewardGold(bossLevel: number): number {
  return 10 * bossLevel;
}

export function upgradeCostGold(item: EquipmentItem): number {
  return Math.floor(5 * Math.pow(1.7, item.level));
}

export function upgradeCostCrystals(item: EquipmentItem): number {
  return Math.max(1, Math.floor(item.level / 2));
}

export function applyUpgrade(item: EquipmentItem): void {
  item.level += 1;
}