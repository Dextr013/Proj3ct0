export var Race;
(function (Race) {
    Race["Human"] = "Human";
    Race["Dwarf"] = "Dwarf";
    Race["Elf"] = "Elf";
    Race["Goblin"] = "Goblin";
    Race["Orc"] = "Orc";
})(Race || (Race = {}));
export var HeroClass;
(function (HeroClass) {
    HeroClass["Warrior"] = "Warrior";
    HeroClass["Thief"] = "Thief";
    HeroClass["Mage"] = "Mage";
    HeroClass["Archer"] = "Archer";
    HeroClass["Healer"] = "Healer";
})(HeroClass || (HeroClass = {}));
export var Rarity;
(function (Rarity) {
    Rarity["Common"] = "Common";
    Rarity["Rare"] = "Rare";
    Rarity["Epic"] = "Epic";
    Rarity["Legendary"] = "Legendary";
})(Rarity || (Rarity = {}));
export var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["Helmet"] = "Helmet";
    EquipmentSlot["Armor"] = "Armor";
    EquipmentSlot["Gloves"] = "Gloves";
    EquipmentSlot["Greaves"] = "Greaves";
    EquipmentSlot["Boots"] = "Boots";
    EquipmentSlot["Amulet"] = "Amulet";
    EquipmentSlot["Ring"] = "Ring";
    EquipmentSlot["Weapon"] = "Weapon";
})(EquipmentSlot || (EquipmentSlot = {}));
export function generateId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
//# sourceMappingURL=types.js.map