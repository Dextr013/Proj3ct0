export function renderPortraits(container, heroes, maxSlots) {
    container.innerHTML = '';
    for (let i = 0; i < maxSlots; i++) {
        const hero = heroes[i];
        const div = document.createElement('div');
        div.className = 'portrait';
        if (hero) {
            div.innerHTML = `<div>${hero.name}</div><div class="small">${hero.heroClass}</div>`;
        }
        else {
            div.innerHTML = `<div class="small">Empty</div>`;
        }
        container.appendChild(div);
    }
}
export function attachDnD(container, hero) {
    // Placeholder; actual DnD to be implemented when assets/UI ready
    container.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
}
export function equipItem(hero, item) {
    hero.equipment[item.slot] = item;
}
export function unequipItem(hero, slot) {
    const item = hero.equipment[slot] ?? null;
    if (item)
        delete hero.equipment[slot];
    return item;
}
//# sourceMappingURL=inventory.js.map