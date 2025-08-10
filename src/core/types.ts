export type Language = 'ru' | 'en';

export enum Race {
  Human = 'Human',
  Dwarf = 'Dwarf',
  Elf = 'Elf',
  Goblin = 'Goblin',
  Orc = 'Orc',
}

export enum HeroClass {
  Warrior = 'Warrior',
  Thief = 'Thief',
  Mage = 'Mage',
  Archer = 'Archer',
  Healer = 'Healer',
}

export enum Rarity {
  Common = 'Common',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
}

export enum EquipmentSlot {
  Helmet = 'Helmet',
  Armor = 'Armor',
  Gloves = 'Gloves',
  Greaves = 'Greaves',
  Boots = 'Boots',
  Amulet = 'Amulet',
  Ring = 'Ring',
  Weapon = 'Weapon',
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  level: number;
  rarity: Rarity;
}

export interface Hero {
  id: string;
  name: string;
  race: Race;
  heroClass: HeroClass;
  level: number;
  maxHp: number;
  hp: number;
  baseDamage: number;
  isLegendary: boolean;
  canSelfResurrect: boolean;
  resurrectedThisFight: boolean;
  equipment: Partial<Record<EquipmentSlot, EquipmentItem>>;
  inventory: EquipmentItem[];
}

export interface Squad {
  id: string;
  name: string;
  heroIds: string[];
  isMain: boolean;
  task: 'Idle' | 'Gathering' | 'Mining';
}

export interface Boss {
  level: number;
  maxHp: number;
  hp: number;
}

export interface Settings {
  volume: number;
  language: Language;
  paused: boolean;
  hasBattlePass: boolean;
  lastResurrectionDate: string | null;
  dailyResurrectionUsed: boolean;
}

export interface GameState {
  heroes: Record<string, Hero>;
  squads: Squad[];
  mainSquadId: string | null;
  boss: Boss;
  gold: number;
  crystals: number;
  settings: Settings;
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}