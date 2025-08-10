import { HeroClass, Race } from '../core/types';
import { createBaseHero } from '../game/heroes';
import { purchase } from '../core/platform';
function canAddHeroToMain(state) {
    const main = state.squads.find((s) => s.isMain);
    if (!main)
        return false;
    const maxSlots = state.settings.hasBattlePass ? 5 : 4;
    return main.heroIds.length < maxSlots;
}
function addHeroToMain(state, hero) {
    const main = state.squads.find((s) => s.isMain);
    if (!main)
        return;
    state.heroes[hero.id] = hero;
    main.heroIds.push(hero.id);
}
export function renderTavern(state, listEl, onClose) {
    listEl.innerHTML = '';
    const offers = [
        createBaseHero(HeroClass.Archer, Race.Elf, false),
        createBaseHero(HeroClass.Healer, Race.Dwarf, false),
        createBaseHero(HeroClass.Warrior, Race.Orc, true), // legendary offer
    ];
    offers.forEach((hero) => {
        const card = document.createElement('div');
        card.className = 'card';
        const info = document.createElement('div');
        info.innerHTML = `<div>${hero.name}</div><div class="small">${hero.race} • ${hero.heroClass}${hero.isLegendary ? ' • ★Legendary' : ''}</div>`;
        const actions = document.createElement('div');
        if (hero.isLegendary) {
            const buyGold = document.createElement('button');
            buyGold.textContent = `${10000} gold`;
            buyGold.onclick = () => {
                if (state.gold >= 10000 && canAddHeroToMain(state)) {
                    state.gold -= 10000;
                    addHeroToMain(state, hero);
                    onClose();
                }
            };
            const buyRub = document.createElement('button');
            buyRub.setAttribute('data-i18n', 'buy_rub');
            buyRub.textContent = 'Купить за 499₽';
            buyRub.onclick = async () => {
                const res = await purchase('legendary_hero_499r');
                if (res.success && canAddHeroToMain(state)) {
                    addHeroToMain(state, hero);
                    onClose();
                }
            };
            actions.appendChild(buyGold);
            actions.appendChild(buyRub);
        }
        else {
            const hire = document.createElement('button');
            hire.textContent = '100 gold';
            hire.onclick = () => {
                if (state.gold >= 100 && canAddHeroToMain(state)) {
                    state.gold -= 100;
                    addHeroToMain(state, hero);
                    onClose();
                }
            };
            actions.appendChild(hire);
        }
        card.appendChild(info);
        card.appendChild(actions);
        listEl.appendChild(card);
    });
}
//# sourceMappingURL=tavern.js.map