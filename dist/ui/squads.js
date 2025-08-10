export function ensureSquadsInitialized(state) {
    if (state.squads.length === 0) {
        state.squads.push({ id: 'squad_main', name: 'Main Squad', heroIds: [], isMain: true, task: 'Idle' });
        for (let i = 1; i <= 4; i++) {
            state.squads.push({ id: `squad_${i}`, name: `Squad ${i}`, heroIds: [], isMain: false, task: 'Idle' });
        }
        state.mainSquadId = 'squad_main';
    }
}
export function startResourceLoop(state, onTick) {
    const interval = window.setInterval(() => {
        if (state.settings.paused)
            return;
        state.squads.forEach((sq) => {
            if (!sq.isMain) {
                if (sq.task === 'Gathering')
                    state.gold += 1;
                if (sq.task === 'Mining')
                    state.crystals += 0.1;
            }
        });
        onTick();
    }, 1000);
    return interval;
}
//# sourceMappingURL=squads.js.map