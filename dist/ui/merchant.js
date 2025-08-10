import { EquipmentSlot, Rarity } from '../core/types';
import { applyUpgrade, upgradeCostCrystals, upgradeCostGold } from '../game/economy';
function sampleItems() {
    return [
        { id: 'mhelm', name: 'Bronze Helm', slot: EquipmentSlot.Helmet, level: 1, rarity: Rarity.Common },
        { id: 'marmor', name: 'Bronze Armor', slot: EquipmentSlot.Armor, level: 1, rarity: Rarity.Common },
        { id: 'mweap', name: 'Short Sword', slot: EquipmentSlot.Weapon, level: 1, rarity: Rarity.Common },
    ];
}
export function renderMerchant(state, listEl, onClose) {
    listEl.innerHTML = '';
    const items = sampleItems();
    items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card';
        const info = document.createElement('div');
        info.innerHTML = `<div>${item.name}</div><div class="small">${item.slot} • +${item.level}</div>`;
        const actions = document.createElement('div');
        const buyGold = document.createElement('button');
        buyGold.textContent = 'Buy (50g)';
        buyGold.onclick = () => {
            if (state.gold >= 50) {
                state.gold -= 50;
                const main = state.squads.find((s) => s.isMain);
                if (!main)
                    return;
                const firstHeroId = main.heroIds[0];
                if (!firstHeroId)
                    return;
                state.heroes[firstHeroId].inventory.push({ ...item, id: `${item.id}_${Date.now()}` });
                onClose();
            }
        };
        const upgradeGold = document.createElement('button');
        upgradeGold.textContent = 'Upgrade (g)';
        upgradeGold.onclick = () => {
            const cost = upgradeCostGold(item);
            if (state.gold >= cost) {
                state.gold -= cost;
                applyUpgrade(item);
            }
        };
        const upgradeCr = document.createElement('button');
        upgradeCr.textContent = 'Upgrade (cr)';
        upgradeCr.onclick = () => {
            const cost = upgradeCostCrystals(item);
            if (state.crystals >= cost) {
                state.crystals -= cost;
                applyUpgrade(item);
            }
        };
        actions.appendChild(buyGold);
        actions.appendChild(upgradeGold);
        actions.appendChild(upgradeCr);
        card.appendChild(info);
        card.appendChild(actions);
        listEl.appendChild(card);
    });
}
//# sourceMappingURL=merchant.js.map