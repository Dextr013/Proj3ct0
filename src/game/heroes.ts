import { EquipmentSlot, Hero, HeroClass, Race, Rarity, generateId } from '../core/types';

export function createBaseHero(classType: HeroClass, race: Race, isLegendary = false): Hero {
  const baseHp = isLegendary ? 200 : 120;
  const baseDamage = isLegendary ? 8 : 4;
  return {
    id: generateId('hero'),
    name: generateHeroName(classType, race, isLegendary),
    race,
    heroClass: classType,
    level: 1,
    maxHp: baseHp,
    hp: baseHp,
    baseDamage,
    isLegendary,
    canSelfResurrect: isLegendary,
    resurrectedThisFight: false,
    equipment: {},
    inventory: [],
  };
}

export function startingWarrior(): Hero {
  return createBaseHero(HeroClass.Warrior, Race.Human, false);
}

export function generateHeroName(cls: HeroClass, race: Race, legendary: boolean): string {
  const raceShort = race.slice(0, 1).toUpperCase();
  const leg = legendary ? '★' : '';
  return `${leg}${raceShort}-${cls}-${Math.floor(Math.random() * 90 + 10)}`;
}

export function createRandomEquipment(slot: EquipmentSlot) {
  return {
    id: generateId('eq'),
    name: `${slot} +1`,
    slot,
    level: 1,
    rarity: Rarity.Common,
  } as const;
}